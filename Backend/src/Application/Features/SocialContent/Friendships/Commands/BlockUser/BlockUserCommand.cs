
using MediatR;

public record BlockUserCommand(Guid BlockedUserId) : IRequest<Result<Unit>>;