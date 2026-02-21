namespace VacationOptimizer.Server.Models;

public record CustomFreeDay(
    DateOnly Date,
    string? Title = null
)
{
    public string GetTitle() => Title ?? $"Custom free day ({Date:MMM dd})";
}
