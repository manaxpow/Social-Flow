public class Reaction : BaseEntity
{
    public Guid TargetId { get; set; }
    public TargetType TargetType { get; set; }
    public Guid UserId { get; set; }
    public ReactType ReactType { get; set; }

    public User User { get; set; } = null!;

    public Reaction() { }
}