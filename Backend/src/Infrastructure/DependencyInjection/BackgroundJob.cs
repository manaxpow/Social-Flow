using Hangfire;
using Hangfire.Redis.StackExchange;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class HangfireConfiguration
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
                InvisibilityTimeout = TimeSpan.FromMinutes(5)
            }));

        services.AddHangfireServer();

        services.AddScoped<IOutboxProcessor, ProcessOutboxMessagesJob>();

        return services;
    }

    public static void UseBackgroundJobs(this IServiceProvider services)
    {
        var recurringJobManager = services.GetRequiredService<IRecurringJobManager>();

        recurringJobManager.AddOrUpdate<IOutboxProcessor>(
            "outbox-processor",
            job => job.Process(),
            "*/10 * * * * *" // Cron: 10 giây một lần
        );
    }
}