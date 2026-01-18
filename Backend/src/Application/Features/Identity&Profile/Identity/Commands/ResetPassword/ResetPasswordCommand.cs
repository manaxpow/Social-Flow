
using MediatR;

public record ResetPasswordCommand(
    string UserId,
    string Password,
    string Token
) : IRequest<Result<Unit>>;