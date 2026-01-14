
using MediatR;
using SocialFlow.Domain.Common;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? AvatarUrl,
    string? Bio
) : IRequest<Result<Guid>>;