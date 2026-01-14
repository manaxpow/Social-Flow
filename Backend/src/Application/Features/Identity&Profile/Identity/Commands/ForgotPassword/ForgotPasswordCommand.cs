
using MediatR;
using SocialFlow.Domain.Common;

public record ForgotPasswordCommand(
    string Email
) : IRequest<Result<Unit>>;