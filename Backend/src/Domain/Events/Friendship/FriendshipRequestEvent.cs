public record FriendshipRequestEvent(
    Guid FriendshipId,
    Guid SenderId,
    Guid ReceiverId,
    string SenderName,
    string SenderAvatar
    ) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}