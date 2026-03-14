using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<Holiday> Holidays { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed some initial data based on the supported countries
        modelBuilder.Entity<Country>().HasData(
            new Country { Id = 1, Name = "Austria", IsoCode = "AT" },
            new Country { Id = 2, Name = "Germany", IsoCode = "DE" },
            new Country { Id = 3, Name = "United States", IsoCode = "US" }
        );

        modelBuilder.Entity<State>().HasData(
            new State { Id = 1, Name = "Vienna", CountryId = 1 },
            new State { Id = 2, Name = "Bavaria", CountryId = 2 },
            new State { Id = 3, Name = "California", CountryId = 3 }
        );

        // Create some generic dummy holidays
        modelBuilder.Entity<Holiday>().HasData(
            new Holiday { Id = 1, StateId = 1, Date = new DateOnly(DateTime.Now.Year, 1, 1), Name = "New Year's Day" },
            new Holiday { Id = 2, StateId = 2, Date = new DateOnly(DateTime.Now.Year, 1, 1), Name = "New Year's Day" },
            new Holiday { Id = 3, StateId = 3, Date = new DateOnly(DateTime.Now.Year, 1, 1), Name = "New Year's Day" }
        );
    }
}
