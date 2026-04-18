using VacationOptimizer.Server.Services;

public class DetectCountryResponse
{
    public bool HasGeoHeaders { get; set; }
    public string CountryCode { get; set; } = string.Empty;
}

public interface IDetectCountryService
{
   public DetectCountryResponse DetectCountry();
}

public class DetectedCountryService : IDetectCountryService 
{
    private readonly IPublicHolidayService holidayService;
    private readonly IHttpContextAccessor httpContextAccessor;

    public DetectedCountryService(IPublicHolidayService holidayService, IHttpContextAccessor httpContextAccessor)
    {
        this.holidayService = holidayService;
        this.httpContextAccessor = httpContextAccessor;
    }

    public DetectCountryResponse DetectCountry()
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return new DetectCountryResponse { HasGeoHeaders = false, CountryCode = string.Empty };
        }

        var rawHeaderValues = new[]
        {
            httpContext.Request.Headers["X-Country-Code"].FirstOrDefault(),
            httpContext.Request.Headers["CF-IPCountry"].FirstOrDefault(),
            httpContext.Request.Headers["x-vercel-ip-country"].FirstOrDefault(),
            httpContext.Request.Headers["Fastly-Client-Country"].FirstOrDefault(),
        }
        .Where(value => !string.IsNullOrWhiteSpace(value))
        .Select(value => value!.Trim().ToUpperInvariant())
        .Where(value => value.Length == 2) // Only accept 2-character ISO country codes
        .ToArray();

        var hasGeoHeaders = rawHeaderValues.Length > 0;
        var countries = holidayService.GetCountries().ToList();
        var detectedCountryCode = rawHeaderValues.FirstOrDefault(code => 
            countries.Any(c => string.Equals(c.Code, code, StringComparison.Ordinal)));

        return new DetectCountryResponse 
        { 
            HasGeoHeaders = hasGeoHeaders,
            CountryCode = detectedCountryCode ?? string.Empty
        };
    }
}