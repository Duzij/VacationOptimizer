namespace VacationOptimizer.Server.Services;

public sealed class OptimizationResultUnavailableException : Exception
{
    public OptimizationResultUnavailableException(string message) : base(message)
    {
    }
}
