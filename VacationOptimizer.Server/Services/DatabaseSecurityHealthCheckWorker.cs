using Microsoft.Extensions.DependencyInjection;

namespace VacationOptimizer.Server.Services;

public sealed class DatabaseSecurityHealthReportStore
{
    private DatabaseSecurityHealthReport? _latestReport;

    public DatabaseSecurityHealthReport? LatestReport => Volatile.Read(ref _latestReport);

    public void Save(DatabaseSecurityHealthReport report)
    {
        Interlocked.Exchange(ref _latestReport, report);
    }
}

public sealed class DatabaseSecurityHealthCheckWorker : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(15);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly DatabaseSecurityHealthReportStore _reportStore;
    private readonly ILogger<DatabaseSecurityHealthCheckWorker> _logger;

    public DatabaseSecurityHealthCheckWorker(
        IServiceScopeFactory scopeFactory,
        DatabaseSecurityHealthReportStore reportStore,
        ILogger<DatabaseSecurityHealthCheckWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _reportStore = reportStore;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunCheckAsync(stoppingToken);

        using var timer = new PeriodicTimer(CheckInterval);
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await RunCheckAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Normal shutdown.
        }
    }

    private async Task RunCheckAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var healthCheck = scope.ServiceProvider.GetRequiredService<IDatabaseSecurityHealthCheck>();
        var report = await healthCheck.RunAsync(cancellationToken);
        _reportStore.Save(report);

        if (report.Status == DatabaseSecurityHealthStatus.Unhealthy)
        {
            _logger.LogWarning(
                "Database security health check completed with status {Status} and {FindingCount} findings.",
                report.Status,
                report.Findings.Count);
        }
        else
        {
            _logger.LogInformation(
                "Database security health check completed with status {Status} and {FindingCount} findings.",
                report.Status,
                report.Findings.Count);
        }
    }
}
