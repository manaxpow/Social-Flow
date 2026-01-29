using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.Redis.StackExchange;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class BackgroundJob
{
    public static IServiceCollection AddBackgroundJobConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Redis");
        services.AddHangfire(config => config
         .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
         .UseSimpleAssemblyNameTypeSerializer()
         .UseRecommendedSerializerSettings()
        .UseRedisStorage(connectionString, new RedisStorageOptions
        {
            Prefix = "socialflow-hangfire:",
            Db = 1,
            InvisibilityTimeout = TimeSpan.FromMinutes(5) // Thời gian job ẩn đi khi đang xử lý
        }));

        services.AddHangfireServer();
        return services;
    }
}