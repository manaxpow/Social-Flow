public record PostResponse() : IMapFrom<Post>
{
    public Guid Id { get; init; }
    public string Content { get; init; } = null!;
    public string? MediaUrl { get; init; }
    public Guid AuthorId { get; init; }
    public DateTime CreatedAt { get; init; }
};