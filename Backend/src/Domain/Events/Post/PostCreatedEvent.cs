namespace SocialFlow.Domain.Events;

public record PostCreatedEvent(
    Guid PostId,
    Guid AuthorId,
    List<Guid>? MentionedUserIds,
    Guid? SharedPostId) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}