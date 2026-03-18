public record FriendshipRequestEvent(
    Guid FriendshipId,
    Guid SenderId,
    Guid ReceiverId,
    NotificationType Type,
    string SenderName,
    string SenderAvatar
    ) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}