using AutoMapper;

public record CommentResponse : IMapFrom<Comment>
{
    public Guid Id { get; init; }
    public Guid PostId { get; init; }
    public AuthorDto Author { get; init; } = null!;
    public Guid? ParentCommentId { get; init; }
    public string Content { get; init; } = string.Empty;
    public CloudAsset? Media { get; init; }
    public ReactType? UserReaction { get; init; }

    // Flags
    public bool IsPostAuthor { get; init; }
    public bool IsCommentAuthor { get; init; }
    public bool HasMoreReplies { get; init; }
    public bool IsEdited => UpdatedAt.HasValue;
    public bool IsParentDeleted { get; init; }

    // Counters
    public int ReactionsCount { get; init; }
    public int ReplyCount { get; init; }


    public IReadOnlyCollection<ReactType> TopReactions { get; init; } = Array.Empty<ReactType>();
    public IReadOnlyCollection<MentionDto> Mentions
    { get; init; } = Array.Empty<MentionDto>();
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}