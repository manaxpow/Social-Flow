using MediatR;
using SocialFlow.Domain.Enums;

public class RegisterCommand : IRequest<Result<RegisterResponse>>
{
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public DateTime DateOfBirth { get; init; }
    public Gender Gender { get; init; }
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string? Bio { get; init; }

    public RegisterCommand() { }
}