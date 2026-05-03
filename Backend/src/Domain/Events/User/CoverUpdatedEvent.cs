public record CoverUpdatedEvent(Guid UserId, string CoverUrl, string CoverPublicId) : IDomainEvent
{
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}