public class Comment : BaseEntity
{
    public Guid PostId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Description { get; set; } = string.Empty;

    public Post Post { get; set; } = null!;
    public User Author { get; set; } = null!;
    public Comment? ParentComment { get; set; } = null!;

    public Comment() { }
}