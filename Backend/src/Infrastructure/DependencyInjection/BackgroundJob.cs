using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class BackgroundJob
{
    public static IServiceCollection AddBackgroundJobConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHangfire(config => config
         .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
         .UseSimpleAssemblyNameTypeSerializer()
         .UseRecommendedSerializerSettings()
         .UsePostgreSqlStorage(options =>
         {
             options.UseNpgsqlConnection(configuration.GetConnectionString("DefaultConnection"));
         }));

        services.AddHangfireServer();
        return services;
    }
}