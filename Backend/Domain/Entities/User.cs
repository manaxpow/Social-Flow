public class User : BaseEntity
{
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; } = string.Empty;
    public string? Bio { get; set; } = string.Empty;

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    public virtual ICollection<ConversationMember> ConversationMembers { get; set; } = new List<ConversationMember>();

    public User() { }
}