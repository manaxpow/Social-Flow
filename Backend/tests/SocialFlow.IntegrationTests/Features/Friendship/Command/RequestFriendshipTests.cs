using Microsoft.EntityFrameworkCore;

[Collection("Shared Database")]
public class RequestFriendshipTests : CommandTestBase
{
    public RequestFriendshipTests(SocialFlowApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task RequestFriendship_SendsNotification()
    {
        // Arrange
        var sender = await CreateUserAsync();
        var receiver = await CreateUserAsync();
        AuthenticateAs(sender.Id);

        // Act
        var command = new RequestFriendshipCommand(receiver.Id);
        var response = await SendRequestAsync($"/api/friendship/{receiver.Id}/request", command);
        var url = $"/api/friendship/{receiver.Id}/request";
        Console.WriteLine($"Calling URL: {url}");

        // Assert
        response.EnsureSuccessStatusCode();
        await AssertOutboxMessageCreatedAsync("FriendshipRequestEvent");

        var friendship = await Context.Friendships
        .FirstOrDefaultAsync(f =>
            (f.UserId1 == sender.Id && f.UserId2 == receiver.Id) ||
            (f.UserId1 == receiver.Id && f.UserId2 == sender.Id));

        Assert.NotNull(friendship);
        Assert.Equal(FriendshipStatus.Pending, friendship.Status);
    }
}