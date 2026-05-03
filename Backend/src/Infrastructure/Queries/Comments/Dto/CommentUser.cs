public record CommentUser
{
    public CommentUser() { }

    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string AvatarUrl { get; set; }
    public ReactType UserReaction { get; set; }
}