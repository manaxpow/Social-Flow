using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Respawn;
using Respawn.Graph;
using StackExchange.Redis;

public abstract class IntegrationTestBase : IClassFixture<SocialFlowApiFactory>, IDisposable, IAsyncLifetime
{

    private readonly IServiceScope _scope;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext Context;
    protected readonly SocialFlowApiFactory _factory;

    protected IntegrationTestBase(SocialFlowApiFactory factory)
    {
        _factory = factory;
        Client = factory.CreateClient();
        _scope = factory.Services.CreateScope();
        Context = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    }
    public async Task InitializeAsync()
    {
        using var connection = new NpgsqlConnection(_factory.DbConnectionString);
        await connection.OpenAsync();

        var respawner = await Respawner.CreateAsync(connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = new[] { "public" },
            TablesToIgnore = new Table[]
            {
                "__EFMigrationsHistory",
                "OutboxMessages" // Hãy thử bỏ qua cả bảng này nếu nó gây lỗi tranh chấp
            }
        });

        await respawner.ResetAsync(connection);

        // Reset Redis một cách an toàn
        try
        {
            var redis = await ConnectionMultiplexer.ConnectAsync(_factory.RedisConnectionString + ",allowAdmin=true");
            var server = redis.GetServer(redis.GetEndPoints().First());
            if (server.IsConnected)
            {
                await server.FlushDatabaseAsync();
            }
        }
        catch (Exception ex)
        {
            // Log lỗi Redis nhưng không làm bài test thất bại (Silent fail)
            Console.WriteLine($"Redis Reset Warning: {ex.Message}");
        }

        // TestAuthHandler.CurrentUserId = null;
    }

    protected void AuthenticateAs(Guid userId)
    {
        TestAuthHandler.CurrentUserId = userId;
    }

    protected async Task<User> CreateUserAsync(Guid? id = null)
    {
        var user = new User
        {
            Id = id ?? Guid.NewGuid(),
            UserName = $"user_{Guid.NewGuid().ToString()[..8]}",
            Email = $"test_{Guid.NewGuid()}@flow.com",
            PasswordHash = "MockPasswordHash_12345",
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        Context.ChangeTracker.Clear(); // Clear the change tracker to avoid stale data issues in tests
        return user;
    }

    public void Dispose()
    {
        _scope.Dispose();
    }

    public Task DisposeAsync() => Task.CompletedTask;
}