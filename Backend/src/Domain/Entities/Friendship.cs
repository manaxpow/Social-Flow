public class Friendship : BaseEntity
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

    public Friendship(Guid initiatorId,
    Guid targetId,
    Guid userActionId,
    string senderName,
    string senderAvatar,
    FriendshipStatus status = FriendshipStatus.Pending
    )
    {
        if (initiatorId.CompareTo(targetId) < 0)
        {
            UserId1 = initiatorId;
            UserId2 = targetId;
        }
        else
        {
            UserId1 = targetId;
            UserId2 = initiatorId;
        }
        UserActionId = userActionId;
        Status = status;

        AddDomainEvent(new FriendshipRequestEvent(Id, initiatorId, targetId, senderName, senderAvatar));
    }


    public Friendship(Guid initiatorId,
    Guid targetId,
    Guid userActionId,
    FriendshipStatus status = FriendshipStatus.Pending
    )
    {
        if (initiatorId.CompareTo(targetId) < 0)
        {
            UserId1 = initiatorId;
            UserId2 = targetId;
        }
        else
        {
            UserId1 = targetId;
            UserId2 = initiatorId;
        }
        UserActionId = userActionId;
        Status = status;
    }

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
            throw new InvalidOperationException("Chỉ có thể chấp nhận lời mời đang ở trạng thái chờ.");

        Status = FriendshipStatus.Accepted;
        UserActionId = acceptorId;

        var receiverId = (acceptorId == UserId1) ? UserId2 : UserId1;

        AddDomainEvent(new FriendshipAcceptedEvent(Id, acceptorId, receiverId, acceptorName, acceptorAvatar));
    }
    public void UpdateStatus(FriendshipStatus status) => Status = status;

    public bool CanDeleted() => !IsBlockedByUser1 && !IsBlockedByUser2;
}