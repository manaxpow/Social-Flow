public record MentionResponse
{
    public Guid UserId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
}