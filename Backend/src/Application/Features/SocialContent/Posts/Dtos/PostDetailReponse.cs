public sealed record PostDetailReponse()
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public string AuthorName { get; init; } = string.Empty;
    public string? AuthorAvatarUrl { get; init; }
    public int ReactionCount { get; init; }
    public int CommentCount { get; init; }
    public IReadOnlyCollection<string> MediaUrls { get; init; } = new List<string>();
    public IReadOnlyCollection<CommentResponse> TopComments { get; init; } = new List<CommentResponse>();
    public IReadOnlyCollection<ReactType> TopReactTypes { get; init; } = new List<ReactType>();
    public IReadOnlyCollection<MentionResponse> Mentions { get; init; } = new List<MentionResponse>();

    public ReactType? MyReaction { get; init; }
    public DateTime CreatedAt { get; init; }
};