using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

public class FriendshipTests(SocialFlowApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task RequestFriendship_ShouldCreatePendingRecord_WithSortedIds()
    {
        // --- Arrange ---
        await CreateUserAsync(TestAuthHandler.CurrentUserId);
        var receiver = await CreateUserAsync();
        var senderId = TestAuthHandler.CurrentUserId;
        var receiverId = receiver.Id;

        // --- Act ---
        var response = await Client.PostAsync($"/api/friendship/{receiverId}/request", null);

        // --- Assert ---
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Kiểm tra dữ liệu thực tế trong Postgres Container
        var friendship = await Context.Friendships.FirstOrDefaultAsync();
        friendship.Should().NotBeNull();
        friendship!.Status.Should().Be(FriendshipStatus.Pending);

        // Xác minh logic ID Sorting (UserId1 < UserId2)
        var expectedId1 = senderId < receiverId ? senderId : receiverId;
        var expectedId2 = senderId < receiverId ? receiverId : senderId;

        friendship.UserId1.Should().Be(expectedId1);
        friendship.UserId2.Should().Be(expectedId2);
    }

    [Fact]
    public async Task AcceptFriendship_ShouldUpdateStatusToAccepted()
    {
        // --- Arrange ---
        var sender = await CreateUserAsync();
        var receiver = await CreateUserAsync(TestAuthHandler.CurrentUserId);

        // Tạo một bản ghi 'Pending' sẵn trong database
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
        // --- Arrange ---
        var me = await CreateUserAsync(TestAuthHandler.CurrentUserId);
        var enemy = await CreateUserAsync();

        // Thiết lập trạng thái ban đầu là bạn bè (Accepted)
        Context.Friendships.Add(new Friendship(me.Id, enemy.Id, me.Id, FriendshipStatus.Accepted));
        await Context.SaveChangesAsync();

        // --- Act ---
        var response = await Client.PostAsync($"/api/friendship/{enemy.Id}/block", null);

        // --- Assert ---
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var record = await Context.Friendships.AsNoTracking().FirstAsync();
        record.Status.Should().Be(FriendshipStatus.Blocked);

        // Kiểm tra xem cờ chặn (Block Flag) có được đặt đúng cột dựa trên ID Sorting không
        if (me.Id < enemy.Id)
            record.IsBlockedByUser1.Should().BeTrue();
        else
            record.IsBlockedByUser2.Should().BeTrue();
    }

    [Fact]
    public async Task MutualBlock_ShouldHandleFlagsCorrectly_WhenBothUsersAction()
    {
        // --- 1. Arrange ---
        var userAId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var userBId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        await CreateUserAsync(userAId);
        await CreateUserAsync(userBId);

        // --- 2. Act 1: User A chặn User B ---
        AuthenticateAs(userAId);
        var response1 = await Client.PostAsync($"/api/friendship/{userBId}/block", null);
        response1.StatusCode.Should().Be(HttpStatusCode.OK);

        // --- 3. Act 2: User B chặn ngược lại User A ---
        AuthenticateAs(userBId);
        var response2 = await Client.PostAsync($"/api/friendship/{userAId}/block", null);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        // --- Assert 1: Kiểm tra trạng thái Chặn chéo ---
        var record = await Context.Friendships.AsNoTracking().FirstAsync();
        record.IsBlockedByUser1.Should().BeTrue();
        record.IsBlockedByUser2.Should().BeTrue();
        record.Status.Should().Be(FriendshipStatus.Blocked);

        // --- 4. Act 3: User A gỡ chặn User B ---
        AuthenticateAs(userAId);
        var response3 = await Client.PostAsync($"/api/friendship/{userBId}/unblock", null);
        response3.StatusCode.Should().Be(HttpStatusCode.OK);

        // --- Assert 2: A đã gỡ nhưng B vẫn đang chặn A ---
        var recordAfterAUnblocks = await Context.Friendships.AsNoTracking().FirstAsync();
        if (userAId < userBId)
        {
            recordAfterAUnblocks.IsBlockedByUser1.Should().BeFalse(); // A (User1) đã gỡ
            recordAfterAUnblocks.IsBlockedByUser2.Should().BeTrue();  // B (User2) vẫn chặn
        }
        else
        {
            recordAfterAUnblocks.IsBlockedByUser2.Should().BeFalse();
            recordAfterAUnblocks.IsBlockedByUser1.Should().BeTrue();
        }

        // --- 5. Act 4: User B gỡ chặn nốt User A ---
        AuthenticateAs(userBId);
        var response4 = await Client.PostAsync($"/api/friendship/{userAId}/unblock", null);
        response4.StatusCode.Should().Be(HttpStatusCode.OK);

        // --- Assert 3: Cả hai đã gỡ chặn hoàn toàn ---
        var finalRecord = await Context.Friendships.AsNoTracking().FirstAsync();
        finalRecord.Status.Should().Be(FriendshipStatus.None);
        finalRecord.IsBlockedByUser1.Should().BeFalse();
        finalRecord.IsBlockedByUser2.Should().BeFalse();
    }


}