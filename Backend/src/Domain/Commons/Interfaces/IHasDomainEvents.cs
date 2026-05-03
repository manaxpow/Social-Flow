public interface IHasDomainEvents
{
    IReadOnlyList<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
    IReadOnlyCollection<IDomainEvent> GetDomainEvents();
    void AddDomainEvent(IDomainEvent @event);
}