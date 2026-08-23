using Serilog;

public static class LoggingConfiguration
{
    public static IHostBuilder AddLoggingConfiguration(
        this IHostBuilder host)
    {
        return host.UseSerilog(
            (context, services, logger) =>
            {
                logger
                    .ReadFrom.Configuration(
                        context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext()
                    .Enrich.WithProperty(
                        "Application",
                        context.HostingEnvironment.ApplicationName)
                    .Enrich.WithProperty(
                        "Environment",
                        context.HostingEnvironment.EnvironmentName);
            },
            writeToProviders: true);
    }
}
