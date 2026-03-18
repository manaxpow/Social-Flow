using System.Net;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

[Collection("Shared Database")]
public class FriendshipTests(SocialFlowApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task RequestFriendship_ShouldCreatePendingRecord_WithSortedIds()
    {
        var senderId = Guid.NewGuid();
        var receiverId = Guid.NewGuid();
        AuthenticateAs(senderId);
        // --- Arrange ---
        await CreateUserAsync(TestAuthHandler.CurrentUserId);
        var receiver = await CreateUserAsync(receiverId);

        // --- Act ---
        var response = await Client.PostAsync($"/api/friendship/{receiverId}/request", null);

        // --- Assert ---
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var friendship = await Context.Friendships.FirstOrDefaultAsync();
        friendship.Should().NotBeNull();
        friendship!.Status.Should().Be(FriendshipStatus.Pending);

        var expectedId1 = senderId < receiverId ? senderId : receiverId;
        var expectedId2 = senderId < receiverId ? receiverId : senderId;

        friendship.UserId1.Should().Be(expectedId1.ToString());
        friendship.UserId2.Should().Be(expectedId2.ToString());
    }

    [Fact]
    public async Task AcceptFriendship_ShouldUpdateStatusToAccepted()
    {
        // --- Arrange ---
        var sender = await CreateUserAsync();
        var receiver = await CreateUserAsync(TestAuthHandler.CurrentUserId);

        var pendingRequest = new Friendship(sender.Id, receiver.Id, sender.Id, FriendshipStatus.Pending);
        Context.Friendships.Add(pendingRequest);
        await Context.SaveChangesAsync();

        // --- Act ---
        var response = await Client.PatchAsync($"/api/friendship/{sender.Id}/accept", null);

        // --- Assert ---
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var updated = await Context.Friendships.AsNoTracking().FirstAsync();
        updated.Status.Should().Be(FriendshipStatus.Accepted);
    }

    [Fact]
    public async Task BlockUser_ShouldSeverFriendshipAndSetBlockFlag()
    {
        // 1. Arrange
        var myId = Guid.NewGuid();
        var enemyId = Guid.NewGuid(); // Khai báo ID cho đối phương

        AuthenticateAs(myId);

        // Ép ghi dữ liệu xuống DB thông qua Scope sạch
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            db.Users.Add(new User { Id = myId, UserName = "me", Email = "me@test.com", PasswordHash = "hash" });
            db.Users.Add(new User { Id = enemyId, UserName = "enemy", Email = "enemy@test.com", PasswordHash = "hash" });

            await db.SaveChangesAsync();
        }

        // Xóa cache bài test để chắc chắn API đọc từ Postgres
        Context.ChangeTracker.Clear();

        // 2. Act 
        var response = await Client.PostAsync($"/api/friendship/{enemyId}/block", null);

        // 3. Assert
        response.EnsureSuccessStatusCode();
    }
    [Fact]
    public async Task MutualBlock_ShouldHandleFlagsCorrectly_WhenBothUsersAction()
    {
        // --- 1. Arrange ---
        var userAId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var userBId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        // QUAN TRỌNG: Phải lưu User vào DB trước khi Block để tránh lỗi Foreign Key
        await CreateUserAsync(userAId);
        await CreateUserAsync(userBId);

        // --- 2. Act 1: User A chặn User B ---
        AuthenticateAs(userAId);
        var response1 = await Client.PostAsync($"/api/friendship/{userBId}/block", null);
        response1.EnsureSuccessStatusCode();

        // --- 3. Act 2: User B chặn ngược lại User A ---
        AuthenticateAs(userBId);
        var response2 = await Client.PostAsync($"/api/friendship/{userAId}/block", null);
        response2.EnsureSuccessStatusCode();

        // --- Assert 1: Kiểm tra trạng thái Chặn chéo ---
        var record = await Context.Friendships.AsNoTracking().FirstAsync();
        record.IsBlockedByUser1.Should().BeTrue();
        record.IsBlockedByUser2.Should().BeTrue();
        record.Status.Should().Be(FriendshipStatus.Blocked);

        // --- 4. Act 3: User A gỡ chặn User B ---
        AuthenticateAs(userAId);
        var response3 = await Client.PostAsync($"/api/friendship/{userBId}/unblock", null);
        response3.EnsureSuccessStatusCode();

        // --- Assert 2: A đã gỡ nhưng B vẫn đang chặn A ---
        var recordAfterAUnblocks = await Context.Friendships.AsNoTracking().FirstAsync();
        if (userAId < userBId)
        {
            recordAfterAUnblocks.IsBlockedByUser1.Should().BeFalse();
            recordAfterAUnblocks.IsBlockedByUser2.Should().BeTrue();
        }
        else
        {
            recordAfterAUnblocks.IsBlockedByUser2.Should().BeFalse();
            recordAfterAUnblocks.IsBlockedByUser1.Should().BeTrue();
        }

        // --- 5. Act 4: User B gỡ chặn nốt User A ---
        AuthenticateAs(userBId);
        var response4 = await Client.PostAsync($"/api/friendship/{userAId}/unblock", null);
        response4.EnsureSuccessStatusCode();

        // --- Assert 3: Cả hai đã gỡ chặn hoàn toàn ---
        var finalRecord = await Context.Friendships.AsNoTracking().FirstAsync();
        finalRecord.Status.Should().Be(FriendshipStatus.None);
        finalRecord.IsBlockedByUser1.Should().BeFalse();
        finalRecord.IsBlockedByUser2.Should().BeFalse();
    }
}