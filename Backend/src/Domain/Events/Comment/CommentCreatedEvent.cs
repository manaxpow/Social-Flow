public record CommentCreatedEvent(Guid Id, Guid PostId, Guid AuthorId) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
};