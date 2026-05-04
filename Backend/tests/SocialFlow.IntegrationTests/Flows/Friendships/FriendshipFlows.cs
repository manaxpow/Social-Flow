using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

[Collection("Shared Database")]
public class FriendshipFlows : CommandTestBase
{
    public FriendshipFlows(SocialFlowApiFactory factory) : base(factory) { }

    [Fact]
    public async Task RequestToNotification_ShouldCompleteSuccessfully()
    {
        // 1. Arrange & Act
        var senderId = Guid.NewGuid();
        var receiverId = Guid.NewGuid();

        var sender = await CreateUserAsync(senderId);
        var receiver = await CreateUserAsync(receiverId);
        AuthenticateAs(sender.Id);

        // Setup Redis to simulate the receiver being online
        // var redis = _factory.Services.GetRequiredService<IConnectionMultiplexer>();
        // var dbRedis = redis.GetDatabase();
        // var key = $"online_users:{receiver.Id}";
        // await dbRedis.SetAddAsync(key, "dummy-connection-id");
        // await dbRedis.KeyExpireAsync(key, TimeSpan.FromMinutes(10));

        var response = await SendRequestAsync($"/api/friendship/{receiver.Id}/request", new RequestFriendshipCommand(receiver.Id));

        response.EnsureSuccessStatusCode();

        await Task.Delay(1000);
        await TriggerOutboxProcessingAsync();

        await WaitForConditionAsync(async () =>
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var hasNotification = await db.Notifications.AsNoTracking().ToListAsync();
            return await db.Notifications
                .AsNoTracking()
                .AnyAsync(n => n.ReceiverId == receiver.Id);
        });

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var hasNotification = await db.Notifications
                .AsNoTracking()
                .AnyAsync(n => n.ReceiverId == receiver.Id);

            var notifications = await db.Notifications
                .AsNoTracking()
                .Where(n => n.ReceiverId == receiver.Id)
                .ToListAsync();

            Assert.True(hasNotification, "Notification was never found in the database after processing.");
            Assert.Single(notifications); // Đảm bảo không bị tạo lặp (race condition)
        }
    }

    [Fact]
    public async Task AcceptRequest_ShouldCompleteSuccessfully()
    {
        // Arrange
        var senderId = Guid.NewGuid();
        var receiverId = Guid.NewGuid();
        var sender = await CreateUserAsync(senderId);
        var receiver = await CreateUserAsync(receiverId);
        AuthenticateAs(senderId);

        // Act
        var requestResponse1 = await SendRequestAsync($"/api/friendship/{receiver.Id}/request", new RequestFriendshipCommand(receiver.Id));
        requestResponse1.EnsureSuccessStatusCode();

        var requestResponse2 = await SendPatchAsync<object>($"/api/friendship/{receiver.Id}/accept", null);
        requestResponse2.EnsureSuccessStatusCode();

        // Trigger Outbox (Giả lập Cronjob)
        await TriggerOutboxProcessingAsync();

        // Wait for the notification to be created
        await WaitForConditionAsync(async () =>
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.Notifications.AsNoTracking().AnyAsync(n => n.ReceiverId == receiver.Id);
        });

        // Assert
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var notification = await db.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.ReceiverId == receiver.Id);

            Assert.NotNull(notification);
        }
    }
}