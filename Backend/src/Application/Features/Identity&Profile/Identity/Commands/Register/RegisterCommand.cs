using MediatR;

public record RegisterCommand(
    string Email,
    string Password,
    DateTime DateOfBirth,
    Gender Gender,
    string FirstName,
    string LastName,
    string? Bio
) : IRequest<Result<RegisterResponse>>;