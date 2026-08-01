using Microsoft.EntityFrameworkCore;

namespace VacationOptimizer.Server.Data;

public static class AppDbContextSeedingExtensions
{
    public static DbContextOptionsBuilder UseVacationOptimizerSeeding(this DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSeeding((context, _) =>
        {
            if (context is AppDbContext appDbContext)
            {
                ReferenceDataSeeder.SeedCountryReferenceData(appDbContext);
            }
        });

        optionsBuilder.UseAsyncSeeding(async (context, _, cancellationToken) =>
        {
            if (context is AppDbContext appDbContext)
            {
                await ReferenceDataSeeder.SeedCountryReferenceDataAsync(appDbContext, cancellationToken);
            }
        });

        return optionsBuilder;
    }
}
