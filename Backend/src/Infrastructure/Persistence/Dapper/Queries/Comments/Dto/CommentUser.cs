public record CommentUser
{
    public CommentUser() { }

    public Guid Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string AvatarUrl { get; set; }
    public ReactType UserReaction { get; set; }
}