using MediatR;

public interface IDomainEvent : INotification
{
    public DateTime OccurredOnUtc { get; }
}