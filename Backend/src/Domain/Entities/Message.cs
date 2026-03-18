public class Message : Entity
{
    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; } = null!;
    public Guid SenderId { get; private set; }
    public User Sender { get; private set; } = null!;
    public string Content { get; private set; } = string.Empty;
    public MessageType Type { get; private set; } = MessageType.Text;

    public Message() { }
}