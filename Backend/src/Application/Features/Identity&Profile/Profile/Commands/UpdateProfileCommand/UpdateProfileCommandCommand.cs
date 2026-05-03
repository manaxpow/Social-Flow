
using MediatR;

public record UpdateProfileCommand(
    string? FirstName,
    string? LastName,
    DateTime? DateOfBirth,
    string? Bio,
    Gender? Gender
) : IRequest<Result<UserResponse>>;