using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Data.SeedData;

namespace VacationOptimizer.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions options) : base(options) { }

    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<Holiday> Holidays { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Country>()
            .HasIndex(c => c.IsoCode)
            .IsUnique();

        modelBuilder.Entity<Country>()
            .HasData(
                AustriaSeedData.Country,
                GermanySeedData.Country,
                IndiaSeedData.Country,
                IndonesiaSeedData.Country,
                SpainSeedData.Country,
                UnitedStatesSeedData.Country);

        modelBuilder.Entity<State>()
            .HasIndex(s => new { s.CountryId, s.Code })
            .IsUnique();

        modelBuilder.Entity<Holiday>()
            .HasIndex(h => new { h.CountryId, h.Date, h.StateId })
            .IsUnique()
            .AreNullsDistinct(false);

        modelBuilder.Entity<Holiday>()
            .HasOne(h => h.Country)
            .WithMany(c => c.Holidays)
            .HasForeignKey(h => h.CountryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Holiday>()
            .HasOne(h => h.State)
            .WithMany(s => s.Holidays)
            .HasForeignKey(h => h.StateId)
            .OnDelete(DeleteBehavior.SetNull);

    }
}
