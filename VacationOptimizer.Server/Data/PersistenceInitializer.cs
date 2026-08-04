using System.Net.Sockets;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace VacationOptimizer.Server.Data;

public static class PersistenceInitializer
{
    public static void Initialize(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        const int maxAttempts = 10;
        var delay = TimeSpan.FromSeconds(3);

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                if (db.Database.IsRelational())
                {
                    db.Database.EnsureCreated();
                }

                break;
            }
            catch (Exception ex) when (attempt < maxAttempts && IsTransientDbStartupException(ex))
            {
                logger.LogWarning(
                    ex,
                    "Database is not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in {DelaySeconds}s.",
                    attempt,
                    maxAttempts,
                    delay.TotalSeconds);
                Thread.Sleep(delay);
            }
        }
    }

    private static bool IsTransientDbStartupException(Exception ex)
    {
        if (ex is NpgsqlException)
        {
            return true;
        }

        var current = ex;
        while (current != null)
        {
            if (current is SocketException)
            {
                return true;
            }

            current = current.InnerException;
        }

        return false;
    }
}
