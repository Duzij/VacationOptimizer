using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Test;

public class DatabaseSecurityHealthEndpointAccessGuardTests
{
    private const string AccessToken = "719efd30-87ef-4e18-8b14-99a8b7ac9e4a";

    [Fact]
    public void Authorize_StartsCooldownAfterConfiguredInvalidAttemptLimit()
    {
        var guard = new DatabaseSecurityHealthEndpointAccessGuard(Options.Create(new DatabaseSecurityHealthCheckOptions
        {
            AccessToken = AccessToken,
            MaximumInvalidAttempts = 3,
            AccessCooldownMinutes = 15
        }));
        var context = CreateContext("203.0.113.12");

        Assert.Equal(DatabaseSecurityHealthEndpointAccessResult.Rejected, guard.Authorize(context, Guid.Empty.ToString()).Result);
        Assert.Equal(DatabaseSecurityHealthEndpointAccessResult.Rejected, guard.Authorize(context, Guid.Empty.ToString()).Result);
        Assert.Equal(DatabaseSecurityHealthEndpointAccessResult.Rejected, guard.Authorize(context, Guid.Empty.ToString()).Result);

        var cooldown = guard.Authorize(context, AccessToken);

        Assert.Equal(DatabaseSecurityHealthEndpointAccessResult.CoolingDown, cooldown.Result);
        Assert.NotNull(cooldown.RetryAfter);
        Assert.InRange(cooldown.RetryAfter!.Value, TimeSpan.FromMinutes(14), TimeSpan.FromMinutes(15));
    }

    [Fact]
    public void Authorize_DisablesTheEndpointWhenNoUuidIsConfigured()
    {
        var guard = new DatabaseSecurityHealthEndpointAccessGuard(Options.Create(new DatabaseSecurityHealthCheckOptions()));

        var decision = guard.Authorize(CreateContext("203.0.113.13"), AccessToken);

        Assert.Equal(DatabaseSecurityHealthEndpointAccessResult.Disabled, decision.Result);
    }

    private static DefaultHttpContext CreateContext(string remoteAddress)
    {
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = IPAddress.Parse(remoteAddress);
        return context;
    }
}
