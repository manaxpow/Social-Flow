public class Notification : BaseEntity
{
    public Guid? SenderId { get; private set; }
    public User? Sender { get; private set; }
    public Guid ReceiverId { get; private set; }
    public User Receiver { get; private set; } = null!;
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; } = false;
    public DateTime? ReadAt { get; private set; }

    public NotificationType Type { get; private set; }
    public TargetType? TargetType { get; private set; }
    public Guid? TargetId { get; private set; }

    public Notification()
    {

    }

    public Notification(Guid senderId, Guid receiverId, string message, NotificationType type, TargetType targetType, Guid targetId)
    {
        SenderId = senderId;
        ReceiverId = receiverId;
        Message = message;
        Type = type;
        TargetType = targetType;
        TargetId = targetId;
    }

    public Notification(Guid senderId, Guid receiverId, string message, NotificationType type)
    {
        SenderId = senderId;
        ReceiverId = receiverId;
        Message = message;
        Type = type;
    }

    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }
}