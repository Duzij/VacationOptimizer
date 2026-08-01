using System.Data.Common;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VacationOptimizer.Server.Data;

namespace VacationOptimizer.Server.Services;

public enum DatabaseSecurityHealthStatus
{
    Healthy,
    Warning,
    Unhealthy
}

public enum DatabaseSecurityHealthFindingSeverity
{
    Warning,
    Critical
}

public sealed record DatabaseSecurityHealthReport(
    DateTimeOffset CheckedAtUtc,
    long DurationMilliseconds,
    DatabaseSecurityHealthStatus Status,
    IReadOnlyList<DatabaseSecurityHealthFinding> Findings,
    IReadOnlyList<DatabaseLoginRole> LoginRoles,
    IReadOnlyList<DatabaseRoleMembership> LoginRoleMemberships,
    IReadOnlyList<DatabaseClientConnection> ClientConnections);

public sealed record DatabaseSecurityHealthFinding(
    DatabaseSecurityHealthFindingSeverity Severity,
    string Code,
    string Message);

public sealed record DatabaseLoginRole(
    string Name,
    bool IsSuperuser,
    bool CanCreateRole,
    bool CanCreateDatabase,
    bool CanLogin,
    bool CanReplicate,
    bool CanBypassRowLevelSecurity);

public sealed record DatabaseRoleMembership(string Member, string GrantedRole);

public sealed record DatabaseClientConnection(
    string Username,
    string Database,
    string ClientAddress,
    string? ApplicationName,
    string State,
    DateTimeOffset BackendStartedAtUtc);

public interface IDatabaseSecurityHealthCheck
{
    Task<DatabaseSecurityHealthReport> RunAsync(CancellationToken cancellationToken);
}

public sealed class DatabaseSecurityHealthCheck : IDatabaseSecurityHealthCheck
{
    private static readonly HashSet<string> SensitiveGrantedRoles = new(StringComparer.Ordinal)
    {
        "pg_execute_server_program",
        "pg_read_all_data",
        "pg_read_server_files",
        "pg_signal_backend",
        "pg_write_all_data",
        "pg_write_server_files"
    };

    private readonly AppDbContext _dbContext;
    private readonly DatabaseSecurityHealthCheckOptions _options;
    private readonly ILogger<DatabaseSecurityHealthCheck> _logger;

    public DatabaseSecurityHealthCheck(
        AppDbContext dbContext,
        IOptions<DatabaseSecurityHealthCheckOptions> options,
        ILogger<DatabaseSecurityHealthCheck> logger)
    {
        _dbContext = dbContext;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<DatabaseSecurityHealthReport> RunAsync(CancellationToken cancellationToken)
    {
        var startedAtUtc = DateTimeOffset.UtcNow;
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _dbContext.Database.OpenConnectionAsync(cancellationToken);
            var connection = _dbContext.Database.GetDbConnection();
            var currentDatabaseUser = await GetCurrentDatabaseUserAsync(connection, cancellationToken);
            var loginRoles = await GetLoginRolesAsync(connection, cancellationToken);
            var memberships = await GetLoginRoleMembershipsAsync(connection, cancellationToken);
            var clientConnections = await GetClientConnectionsAsync(connection, cancellationToken);
            var findings = CreateFindings(currentDatabaseUser, loginRoles, memberships);
            var status = findings.Any(finding => finding.Severity == DatabaseSecurityHealthFindingSeverity.Critical)
                ? DatabaseSecurityHealthStatus.Unhealthy
                : findings.Count > 0
                    ? DatabaseSecurityHealthStatus.Warning
                    : DatabaseSecurityHealthStatus.Healthy;

            return new(
                startedAtUtc,
                stopwatch.ElapsedMilliseconds,
                status,
                findings,
                loginRoles,
                memberships,
                clientConnections);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Database security health check failed.");
            return new(
                startedAtUtc,
                stopwatch.ElapsedMilliseconds,
                DatabaseSecurityHealthStatus.Unhealthy,
                [new(
                    DatabaseSecurityHealthFindingSeverity.Critical,
                    "database_check_failed",
                    "The database security check could not complete. Inspect the application logs for details.")],
                [],
                [],
                []);
        }
        finally
        {
            await _dbContext.Database.CloseConnectionAsync();
        }
    }

    private List<DatabaseSecurityHealthFinding> CreateFindings(
        string currentDatabaseUser,
        IReadOnlyList<DatabaseLoginRole> loginRoles,
        IReadOnlyList<DatabaseRoleMembership> memberships)
    {
        var expectedLoginRoles = new HashSet<string>(
            _options.ExpectedLoginRoles.Where(role => !string.IsNullOrWhiteSpace(role)),
            StringComparer.Ordinal);
        expectedLoginRoles.Add(currentDatabaseUser);

        var findings = new List<DatabaseSecurityHealthFinding>();
        foreach (var role in loginRoles.Where(role => role.CanLogin))
        {
            if (!expectedLoginRoles.Contains(role.Name))
            {
                findings.Add(new(
                    DatabaseSecurityHealthFindingSeverity.Critical,
                    "unexpected_login_role",
                    $"Login role '{role.Name}' is not listed in ExpectedLoginRoles."));
            }

            if (role.IsSuperuser)
            {
                findings.Add(new(
                    DatabaseSecurityHealthFindingSeverity.Warning,
                    "superuser_login_role",
                    $"Login role '{role.Name}' is a superuser."));
            }

            if (role.CanCreateRole || role.CanCreateDatabase || role.CanReplicate || role.CanBypassRowLevelSecurity)
            {
                findings.Add(new(
                    DatabaseSecurityHealthFindingSeverity.Warning,
                    "privileged_login_role",
                    $"Login role '{role.Name}' has elevated role, database, replication, or row-level-security privileges."));
            }
        }

        foreach (var membership in memberships.Where(membership => SensitiveGrantedRoles.Contains(membership.GrantedRole)))
        {
            findings.Add(new(
                DatabaseSecurityHealthFindingSeverity.Warning,
                "sensitive_role_membership",
                $"Login role '{membership.Member}' is a member of sensitive PostgreSQL role '{membership.GrantedRole}'."));
        }

        return findings;
    }

    private static async Task<string> GetCurrentDatabaseUserAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT current_user;";
        return (string)(await command.ExecuteScalarAsync(cancellationToken))!;
    }

    private static async Task<IReadOnlyList<DatabaseLoginRole>> GetLoginRolesAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        const string query = """
            SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls
            FROM pg_roles
            WHERE rolcanlogin OR rolsuper OR rolcreaterole OR rolcreatedb OR rolreplication OR rolbypassrls
            ORDER BY rolname;
            """;

        var roles = new List<DatabaseLoginRole>();
        await using var command = connection.CreateCommand();
        command.CommandText = query;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            roles.Add(new(
                reader.GetString(0),
                reader.GetBoolean(1),
                reader.GetBoolean(2),
                reader.GetBoolean(3),
                reader.GetBoolean(4),
                reader.GetBoolean(5),
                reader.GetBoolean(6)));
        }

        return roles;
    }

    private static async Task<IReadOnlyList<DatabaseRoleMembership>> GetLoginRoleMembershipsAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        const string query = """
            SELECT member.rolname, granted_role.rolname
            FROM pg_auth_members membership
            INNER JOIN pg_roles member ON member.oid = membership.member
            INNER JOIN pg_roles granted_role ON granted_role.oid = membership.roleid
            WHERE member.rolcanlogin
            ORDER BY member.rolname, granted_role.rolname;
            """;

        var memberships = new List<DatabaseRoleMembership>();
        await using var command = connection.CreateCommand();
        command.CommandText = query;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            memberships.Add(new(reader.GetString(0), reader.GetString(1)));
        }

        return memberships;
    }

    private static async Task<IReadOnlyList<DatabaseClientConnection>> GetClientConnectionsAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        const string query = """
            SELECT usename, datname, client_addr::text, NULLIF(application_name, ''), state, backend_start
            FROM pg_stat_activity
            WHERE backend_type = 'client backend' AND client_addr IS NOT NULL
            ORDER BY backend_start DESC;
            """;

        var clientConnections = new List<DatabaseClientConnection>();
        await using var command = connection.CreateCommand();
        command.CommandText = query;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            clientConnections.Add(new(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.IsDBNull(3) ? null : reader.GetString(3),
                reader.GetString(4),
                reader.GetFieldValue<DateTimeOffset>(5)));
        }

        return clientConnections;
    }
}
