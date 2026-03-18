public class Friendship : AggregateRoot
{
    public Guid UserId1 { get; private set; }
    public Guid UserId2 { get; private set; }
    public Guid UserActionId { get; private set; }
    public bool IsBlockedByUser1 { get; private set; } = false;
    public bool IsBlockedByUser2 { get; private set; } = false;
    public User User1 { get; private set; } = null!;
    public User User2 { get; private set; } = null!;
    public FriendshipStatus Status { get; private set; }
    public Friendship() { }

    public Friendship(Guid senderId,
    Guid receiverId,
    Guid userActionId,
    string senderName,
    string senderAvatar,
    FriendshipStatus status = FriendshipStatus.Pending
    )
    {
        if (senderId < receiverId)
        {
            UserId1 = senderId;
            UserId2 = receiverId;
        }
        else
        {
            UserId1 = receiverId;
            UserId2 = senderId;
        }

        UserActionId = userActionId;
        Status = status;

        AddDomainEvent(new FriendshipRequestEvent(Id, senderId, receiverId, NotificationType.FriendRequestReceived, senderName, senderAvatar));
    }


    public Friendship(Guid senderId,
    Guid receiverId,
    Guid userActionId,
    FriendshipStatus status = FriendshipStatus.Pending
    )
    {
        if (senderId < receiverId)
        {
            UserId1 = senderId;
            UserId2 = receiverId;
        }
        else
        {
            UserId1 = receiverId;
            UserId2 = senderId;
        }
        UserActionId = userActionId;
        Status = status;
    }

    public bool WasInitiatedBy(Guid userId) => UserActionId == userId && Status == FriendshipStatus.Pending;

    public Guid GetOtherUserId(Guid currentUserId)
        => currentUserId == UserId1 ? UserId2 : UserId1;
    public void UpdateBlock(Guid blockerId, bool isBlocking)
    {
        if (UserId1 == blockerId)
        {
            IsBlockedByUser1 = isBlocking;
        }
        else if (UserId2 == blockerId)
        {
            IsBlockedByUser2 = isBlocking;
        }
        else
        {
            throw new InvalidOperationException("User is not part of this friendship.");
        }

        Status = (IsBlockedByUser1 || IsBlockedByUser2)
            ? FriendshipStatus.Blocked
            : FriendshipStatus.None;
    }

    public void AcceptRequest(Guid acceptorId, string acceptorName, string acceptorAvatar)
    {
        if (Status != FriendshipStatus.Pending)
            throw new InvalidOperationException("Only pending requests can be accepted.");

        Status = FriendshipStatus.Accepted;
        UserActionId = acceptorId;

        var receiverId = (acceptorId == UserId1) ? UserId2 : UserId1;

        AddDomainEvent(new FriendshipAcceptedEvent(Id, acceptorId, receiverId, NotificationType.FriendRequestAccepted, acceptorName, acceptorAvatar));
    }
    public void UpdateStatus(FriendshipStatus status) => Status = status;

    public bool CanDeleted() => !IsBlockedByUser1 && !IsBlockedByUser2;
}