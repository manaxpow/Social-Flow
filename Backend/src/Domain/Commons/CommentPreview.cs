public record CommentPreview(
    Guid Id,
    string Content,
    int ReactionCount,
    string AuthorName,
    string? AuthorAvatarUrl,
    DateTime CreatedAt
    );