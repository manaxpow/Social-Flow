
using MediatR;
using SocialFlow.Domain.Common;

public record RefreshTokenCommand(
    string RefreshToken
) : IRequest<Result<LoginResponse>>;