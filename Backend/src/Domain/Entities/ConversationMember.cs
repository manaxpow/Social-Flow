public class ConversationMember : BaseEntity
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; } = string.Empty;
    public Conversation Conversation { get; set; } = null!;
    public User User { get; set; } = null!;
    public ConversationMember()
    { }
}