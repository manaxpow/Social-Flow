using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class CachingExtensions
{
    public static IServiceCollection AddCaching(this IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("Redis");
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = connectionString;
            options.InstanceName = "SocialFlow_Cache:"; // Tất cả key cache sẽ có tiền tố này
        });

        return services;
    }
}