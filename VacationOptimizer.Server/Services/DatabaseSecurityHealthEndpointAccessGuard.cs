using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace VacationOptimizer.Server.Services;

public enum DatabaseSecurityHealthEndpointAccessResult
{
    Granted,
    Rejected,
    CoolingDown,
    Disabled
}

public sealed record DatabaseSecurityHealthEndpointAccessDecision(
    DatabaseSecurityHealthEndpointAccessResult Result,
    TimeSpan? RetryAfter = null);

public sealed class DatabaseSecurityHealthEndpointAccessGuard
{
    private const int MaxTrackedClients = 4_096;
    private static readonly TimeSpan StaleClientRetention = TimeSpan.FromHours(1);

    private readonly ConcurrentDictionary<string, ClientAttemptState> _clientAttempts = new();
    private readonly byte[]? _accessToken;
    private readonly int _maximumInvalidAttempts;
    private readonly TimeSpan _cooldown;

    public DatabaseSecurityHealthEndpointAccessGuard(IOptions<DatabaseSecurityHealthCheckOptions> options)
    {
        var configuredOptions = options.Value;
        _accessToken = NormalizeAccessToken(configuredOptions.AccessToken) is { } accessToken
            ? Encoding.UTF8.GetBytes(accessToken)
            : null;
        _maximumInvalidAttempts = Math.Max(1, configuredOptions.MaximumInvalidAttempts);
        _cooldown = TimeSpan.FromMinutes(Math.Max(1, configuredOptions.AccessCooldownMinutes));
    }

    public DatabaseSecurityHealthEndpointAccessDecision Authorize(HttpContext context, string? suppliedToken)
    {
        if (_accessToken is null)
        {
            return new(DatabaseSecurityHealthEndpointAccessResult.Disabled);
        }

        var now = DateTimeOffset.UtcNow;
        var isValidToken = IsValidToken(suppliedToken);
        var clientKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        if (!_clientAttempts.TryGetValue(clientKey, out var state))
        {
            // Correct-token requests do not need to consume a tracked-client slot.
            if (isValidToken)
            {
                return new(DatabaseSecurityHealthEndpointAccessResult.Granted);
            }

            RemoveStaleClientEntries(now);
            if (_clientAttempts.Count >= MaxTrackedClients)
            {
                return new(DatabaseSecurityHealthEndpointAccessResult.Rejected);
            }

            state = _clientAttempts.GetOrAdd(clientKey, _ => new ClientAttemptState());
        }

        lock (state)
        {
            state.LastAttemptUtc = now;

            if (state.CooldownUntilUtc is { } cooldownUntil && cooldownUntil > now)
            {
                // Keep invalid callers indistinguishable from a route that does not exist.
                return isValidToken
                    ? new(DatabaseSecurityHealthEndpointAccessResult.CoolingDown, cooldownUntil - now)
                    : new(DatabaseSecurityHealthEndpointAccessResult.Rejected);
            }

            if (isValidToken)
            {
                state.FailedAttempts = 0;
                state.CooldownUntilUtc = null;
                return new(DatabaseSecurityHealthEndpointAccessResult.Granted);
            }

            state.FailedAttempts++;
            if (state.FailedAttempts >= _maximumInvalidAttempts)
            {
                state.FailedAttempts = 0;
                state.CooldownUntilUtc = now.Add(_cooldown);
            }

            return new(DatabaseSecurityHealthEndpointAccessResult.Rejected);
        }
    }

    private bool IsValidToken(string? suppliedToken)
    {
        var normalizedToken = NormalizeAccessToken(suppliedToken);
        return normalizedToken is not null && _accessToken is not null &&
            CryptographicOperations.FixedTimeEquals(_accessToken, Encoding.UTF8.GetBytes(normalizedToken));
    }

    private void RemoveStaleClientEntries(DateTimeOffset now)
    {
        if (_clientAttempts.Count < MaxTrackedClients)
        {
            return;
        }

        foreach (var (clientKey, state) in _clientAttempts)
        {
            if (now - state.LastAttemptUtc > StaleClientRetention)
            {
                _clientAttempts.TryRemove(clientKey, out _);
            }
        }
    }

    private static string? NormalizeAccessToken(string? token)
    {
        return Guid.TryParse(token, out var parsedToken)
            ? parsedToken.ToString("D")
            : null;
    }

    private sealed class ClientAttemptState
    {
        public int FailedAttempts { get; set; }

        public DateTimeOffset? CooldownUntilUtc { get; set; }

        public DateTimeOffset LastAttemptUtc { get; set; }
    }
}
