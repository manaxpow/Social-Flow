public record AvatarUpdatedEvent(Guid UserId, string AvatarUrl, string PublicId) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}