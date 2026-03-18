public sealed record PostDetailReponse()
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public string? MediaUrl { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    public string? AuthorAvatarUrl { get; init; }
    public int ReactionCount { get; init; }
    public int CommentCount { get; init; }
    public IReadOnlyCollection<CommentResponse> TopComments { get; init; } = new List<CommentResponse>();
    public IReadOnlyCollection<ReactType> TopReactTypes { get; init; } = new List<ReactType>();
    public ReactType? MyReaction { get; init; }
    public DateTime CreatedAt { get; init; }
};