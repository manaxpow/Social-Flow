public class Post : BaseEntity
{
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public string Content
    { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public Post()
    {

    }
}