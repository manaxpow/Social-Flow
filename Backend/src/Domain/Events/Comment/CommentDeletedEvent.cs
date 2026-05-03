public record CommentDeletedEvent(
    Guid Id,
    Guid PostId,
    Guid? ParentCommentId
) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
};