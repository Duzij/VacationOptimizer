using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace VacationOptimizer.Server.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DayType
{
    WorkDay,
    Weekend,
    PublicHoliday,
    CustomFreeDay,
    Vacation,
    Today,
    PassedDay,
    NeverHoliday,
    CollectiveLeave
}
