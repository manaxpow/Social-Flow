public sealed class ConversationMember : Entity
{
    public Guid ConversationId { get; private set; }
    public Guid UserId { get; private set; }
    public string Nickname { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; } = string.Empty;
    public Conversation Conversation { get; private set; } = null!;
    public User User { get; private set; } = null!;
    public ConversationMember()
    { }
}