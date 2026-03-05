using Microsoft.Extensions.DependencyInjection;

public abstract class IntegrationTestBase : IClassFixture<SocialFlowApiFactory>, IDisposable
{

    private readonly IServiceScope _scope;
    protected readonly HttpClient Client;
    protected readonly ApplicationDbContext Context;

    protected IntegrationTestBase(SocialFlowApiFactory factory)
    {
        Client = factory.CreateClient();
        _scope = factory.Services.CreateScope();
        Context = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Context.Database.EnsureDeleted();
        Context.Database.EnsureCreated();
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
        return user;
    }

    public void Dispose()
    {
        _scope.Dispose();
        Context.Dispose();
    }
}