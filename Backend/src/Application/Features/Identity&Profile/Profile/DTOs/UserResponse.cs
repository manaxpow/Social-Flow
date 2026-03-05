public record UserResponse() : IMapFrom<User>
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public DateTime DateOfBirth { get; init; }
    public Gender Gender { get; init; }
    public string? AvatarUrl { get; init; }
    public string? Bio { get; init; }
}
