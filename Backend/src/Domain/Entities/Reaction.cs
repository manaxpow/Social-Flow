public class Reaction : AggregateRoot
{
    public Guid TargetId { get; private set; }
    public TargetType TargetType { get; private set; }
    public Guid UserId { get; private set; }
    public ReactType ReactType { get; private set; }

    public User User { get; private set; } = null!;

    public Reaction() { }

    public Reaction(Guid targetId, TargetType targetType, Guid userId, ReactType reactType)
    {
        TargetId = targetId;
        TargetType = targetType;
        UserId = userId;
        ReactType = reactType;
    }

    public void UpdateReactType(ReactType reactType) => ReactType = reactType;
}