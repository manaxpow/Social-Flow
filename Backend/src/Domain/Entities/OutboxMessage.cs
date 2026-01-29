public class OutboxMessage : BaseEntity
{
    public string Type { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public DateTime OccurredAt { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? Error { get; private set; } = string.Empty;
    public int AttemptCount { get; private set; } = 0;
    public DateTime? LastAttemptAt { get; private set; }

    public OutboxMessage(string type, string content)
    {
        Id = Guid.NewGuid();
        Type = type;
        Content = content;
        OccurredAt = DateTime.UtcNow;
        AttemptCount = 0;
    }
}