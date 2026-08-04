using Microsoft.AspNetCore.HttpOverrides;

namespace VacationOptimizer.Server.Hosting;

public static class WebApplicationBuilderExtensions
{
    public static WebApplicationBuilder AddVacationOptimizerHosting(
        this WebApplicationBuilder builder,
        bool isRunningInContainer)
    {
        builder.Services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            // Docker Compose assigns services an address from one of these private ranges. Restricting
            // forwarded-header trust to them prevents direct callers from choosing their own client IP.
            options.KnownIPNetworks.Add(new System.Net.IPNetwork(System.Net.IPAddress.Parse("10.0.0.0"), 8));
            options.KnownIPNetworks.Add(new System.Net.IPNetwork(System.Net.IPAddress.Parse("172.16.0.0"), 12));
        });

        if (builder.Environment.IsDevelopment() && !isRunningInContainer)
        {
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.ListenLocalhost(8080, listenOptions =>
                {
                    listenOptions.UseHttps();
                });
            });
        }
        else
        {
            builder.Services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "wwwroot/dist";
            });
        }

        return builder;
    }
}
