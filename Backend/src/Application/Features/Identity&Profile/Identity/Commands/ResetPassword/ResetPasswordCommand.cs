
using MediatR;

public record ResetPasswordCommand(
    string Email,
    string Password,
    string Token
) : IRequest<Result<Unit>>;