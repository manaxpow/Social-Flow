public sealed class MessageReceipt
{
    public Guid MessageId { get; private set; }
    public Message Message { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public bool IsRead { get; private set; }
    public DateTime ReadAt { get; private set; } = DateTime.UtcNow;

    public MessageReceipt() { }
}