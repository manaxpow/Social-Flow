public record ReactionResponse : IMapFrom<Reaction>
{
    public Guid Id { get; init; }
    public Guid TargetId { get; init; }
    public Guid UserId { get; init; }
    public TargetType TargetType { get; init; }
    public ReactType ReactType { get; init; }
}