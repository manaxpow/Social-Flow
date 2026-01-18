
using MediatR;

public record ConfirmEmailCommand(string UserId, string Token) : IRequest<Result<Unit>>;
