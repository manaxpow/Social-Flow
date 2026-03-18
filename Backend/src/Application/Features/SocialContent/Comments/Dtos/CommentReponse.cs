public record CommentResponse : IMapFrom<Comment>
{
    public Guid Id { get; init; }
    public Guid PostId { get; init; }
    public Guid AuthorId { get; init; }
    public Guid? ParentCommentId { get; init; }
    public string Content { get; init; } = string.Empty;
    public int ReactionsCount { get; init; }
    public int CommentsCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}