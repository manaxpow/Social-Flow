using MediatR;

public record RegisterCommand(
    string Email,
    string Password,
    DateTime DateOfBirth,
    Gender Gender,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string? Bio
) : IRequest<Result<RegisterResponse>>;