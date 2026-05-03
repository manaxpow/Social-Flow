public record CommentCreatedEvent(Guid Id, Guid PostId, Guid AuthorId, Guid? ParentCommentId, Guid? AuthorParentCommentId, List<Guid>? MentionedUserIds) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
};