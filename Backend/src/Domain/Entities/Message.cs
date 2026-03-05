public class Message : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; } = null!;
    public Guid SenderId { get; private set; }
    public User Sender { get; private set; } = null!;
    public string Content { get; private set; } = string.Empty;
    public MessageType Type { get; private set; } = MessageType.Text;

    public virtual ICollection<CloudImage> Images { get; private set; } = new List<CloudImage>();
    public Message() { }

    public Message(Guid conversationId, Guid senderId, string content, MessageType type)
    {
        ConversationId = conversationId;
        SenderId = senderId;
        Content = content;
        Type = type;
    }

    public void AddImage(CloudImage image)
    {
        Images.Add(image);
    }

    public void AddImages(IEnumerable<CloudImage> newImages)
    {
        foreach (var img in newImages)
        {
            Images.Add(img);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearImages()
    {
        Images.Clear();
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateContent(string newContent)
    {
        if (string.IsNullOrWhiteSpace(newContent))
        {
            throw new ArgumentException("Nội dung tin nhắn không được để trống.");
        }

        if (Content != newContent)
        {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}