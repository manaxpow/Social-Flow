
using MediatR;

public record UnBlockUserCommand(
    Guid BlockedUserId
) : IRequest<Result<Unit>>;