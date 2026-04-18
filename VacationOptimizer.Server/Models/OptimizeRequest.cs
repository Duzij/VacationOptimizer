namespace VacationOptimizer.Server.Models;

public record OptimizeRequest(
    string Country,
    int Year,
    int VacationDays,
    int MinimumDaysPerRange = 1,
    int MaximumDaysPerRange = 365,
    Dictionary<Month, int>? MaxNumberOfVacationsPerMonth = null,
    List<CustomFreeDay>? CustomFreeDays = null,
    string? State = null,
    List<DateOnly>? IgnoredHolidayDates = null,
    int? Seed = null,
    List<string>? UsedResultHashes = null
);

public enum Month
{
    January = 1,
    February = 2,
    March = 3,
    April = 4,
    May = 5,
    June = 6,
    July = 7,
    August = 8,
    September = 9,
    October = 10,
    November = 11,
    December = 12
}
