public class OutboxMessage : Entity
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
    public void UpdateContent(string content)
    {
        Content = content;
    }

    public void UpdateError(string error)
    {
        Error = error;
    }

    public void MarkAsProcessed(DateTime processedAt, string? error = null, int attemptCount = 0, DateTime? lastAttemptAt = null)
    {
        ProcessedAt = processedAt.Kind == DateTimeKind.Utc ? processedAt : processedAt.ToUniversalTime();
        Error = error;
        AttemptCount = attemptCount;
        LastAttemptAt = lastAttemptAt;
    }

    public void MarkAsFailed(DateTime failedAt, int attemptCount = 0, DateTime? lastAttemptAt = null)
    {
        ProcessedAt = failedAt;
        AttemptCount = attemptCount;
        LastAttemptAt = lastAttemptAt;
    }

    public void IncrementAttemptCount()
    {
        AttemptCount += 1;
        LastAttemptAt = DateTime.UtcNow;
    }

}