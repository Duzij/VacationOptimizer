using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data.SeedData;
using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data;

public static class ReferenceDataSeeder
{
    public static void SeedCountryReferenceData(AppDbContext dbContext)
    {
        SeedCountry(dbContext, IndiaSeedData.Country, IndiaSeedData.States, IndiaSeedData.Holidays);
        SeedCountry(dbContext, SpainSeedData.Country, SpainSeedData.States, SpainSeedData.Holidays);
        SeedCountry(dbContext, IndonesiaSeedData.Country, IndonesiaSeedData.States, IndonesiaSeedData.Holidays);
        dbContext.SaveChanges();
    }

    public static Task SeedCountryReferenceDataAsync(AppDbContext dbContext, CancellationToken cancellationToken = default)
    {
        SeedCountryReferenceData(dbContext);
        return Task.CompletedTask;
    }

    private static void SeedCountry(
        AppDbContext dbContext,
        Country seedCountry,
        IReadOnlyList<State> seedStates,
        IReadOnlyList<Holiday> seedHolidays)
    {
        var country = dbContext.Countries.SingleOrDefault(country => country.IsoCode == seedCountry.IsoCode);
        if (country is null)
        {
            country = new Country
            {
                Name = seedCountry.Name,
                IsoCode = seedCountry.IsoCode,
            };
            dbContext.Countries.Add(country);
            dbContext.SaveChanges();
        }

        var existingStatesByCode = dbContext.States
            .Where(state => state.CountryId == country.Id)
            .ToDictionary(state => state.Code, StringComparer.OrdinalIgnoreCase);
        var seedStateCodesByLocalId = seedStates.ToDictionary(state => state.Id, state => state.Code);

        foreach (var seedState in seedStates)
        {
            if (existingStatesByCode.ContainsKey(seedState.Code))
            {
                continue;
            }

            var newState = new State
            {
                CountryId = country.Id,
                Name = seedState.Name,
                Code = seedState.Code,
            };

            dbContext.States.Add(newState);
            existingStatesByCode[seedState.Code] = newState;
        }

        dbContext.SaveChanges();

        existingStatesByCode = dbContext.States
            .Where(state => state.CountryId == country.Id)
            .ToDictionary(state => state.Code, StringComparer.OrdinalIgnoreCase);

        var existingHolidayKeys = dbContext.Holidays
            .Where(holiday => holiday.CountryId == country.Id)
            .Include(holiday => holiday.State)
            .AsEnumerable()
            .Select(holiday => new HolidaySeedKey(holiday.Date, holiday.State?.Code))
            .ToHashSet();

        foreach (var seedHoliday in seedHolidays)
        {
            var stateCode = seedHoliday.StateId is int localStateId
                ? seedStateCodesByLocalId[localStateId]
                : null;
            var holidayKey = new HolidaySeedKey(seedHoliday.Date, stateCode);

            if (existingHolidayKeys.Contains(holidayKey))
            {
                continue;
            }

            dbContext.Holidays.Add(new Holiday
            {
                CountryId = country.Id,
                StateId = stateCode is null ? null : existingStatesByCode[stateCode].Id,
                Date = seedHoliday.Date,
                Name = seedHoliday.Name,
            });

            existingHolidayKeys.Add(holidayKey);
        }
    }

    private readonly record struct HolidaySeedKey(DateOnly Date, string? StateCode);
}
