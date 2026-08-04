namespace VacationOptimizer.Server.Hosting;

public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/blog", (IWebHostEnvironment environment) =>
        {
            var candidatePaths = new[]
            {
                Path.Combine(environment.ContentRootPath, "wwwroot", "dist", "blog", "index.json"),
                Path.Combine(environment.ContentRootPath, "wwwroot", "public", "blog", "index.json"),
            };

            var jsonPath = candidatePaths.FirstOrDefault(File.Exists);

            if (jsonPath is null)
            {
                return Results.NotFound(new { error = "Blog index is not available." });
            }

            return Results.File(jsonPath, "application/json");
        });

        return app;
    }
}
