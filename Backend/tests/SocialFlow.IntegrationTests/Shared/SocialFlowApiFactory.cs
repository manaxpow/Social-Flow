using DotNet.Testcontainers.Builders;
using Hangfire;
using Hangfire.Redis.StackExchange;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Testcontainers.PostgreSql;
using Testcontainers.Redis;

public class SocialFlowApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder("postgres:latest")
        .WithDatabase("SocialFlow")
        .WithUsername("postgres")
        .WithPassword("2552004nam")
        .WithWaitStrategy(Wait.ForUnixContainer().UntilInternalTcpPortIsAvailable(5432))
        .Build();

    private readonly RedisContainer _redisContainer = new RedisBuilder("redis:latest")
        .WithWaitStrategy(Wait.ForUnixContainer().UntilInternalTcpPortIsAvailable(6379))
        .Build();

    public string RedisConnectionString => _redisContainer.GetConnectionString();
    public string DbConnectionString => _dbContainer.GetConnectionString();

    public async Task InitializeAsync()
    {
        // 1. Phải Start Container TRƯỚC
        await _dbContainer.StartAsync();
        await _redisContainer.StartAsync();

        // 2. Chạy Migration bằng một DbContext "tạm" hoàn toàn độc lập với WebHost
        // Điều này đảm bảo bảng OutboxMessages có sẵn TRƯỚC KHI WebHost Start
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(_dbContainer.GetConnectionString());

        optionsBuilder.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

        using var context = new ApplicationDbContext(optionsBuilder.Options);
        await context.Database.MigrateAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Redis"] = RedisConnectionString
            });
        });
        builder.ConfigureTestServices(services =>
        {
            // Tắt Hangfire Server tự động để tránh quét bảng Outbox khi chưa sẵn sàng
            var hangfireServer = services.FirstOrDefault(d => d.ImplementationType?.Name.Contains("BackgroundJobServer") == true);
            if (hangfireServer != null) services.Remove(hangfireServer);

            // Thay thế DB Connection
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddSingleton<ConvertDomainEventsToOutboxMessagesInterceptor>();
            services.AddDbContext<ApplicationDbContext>((sp, options) =>
            {
                var interceptor = sp.GetRequiredService<ConvertDomainEventsToOutboxMessagesInterceptor>();

                options.UseNpgsql(_dbContainer.GetConnectionString());
                options.AddInterceptors(interceptor);

                options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
            });

            services.AddAuthentication(options =>
            {
                // Ép scheme mặc định là TestScheme
                options.DefaultAuthenticateScheme = TestAuthHandler.AuthenticationScheme;
                options.DefaultChallengeScheme = TestAuthHandler.AuthenticationScheme;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                TestAuthHandler.AuthenticationScheme, options => { });

            // Cấu hình Redis cho Hangfire
            services.AddHangfire(config => config.UseRedisStorage(RedisConnectionString));
        });
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await Task.WhenAll(_dbContainer.StopAsync(), _redisContainer.StopAsync());
    }
}