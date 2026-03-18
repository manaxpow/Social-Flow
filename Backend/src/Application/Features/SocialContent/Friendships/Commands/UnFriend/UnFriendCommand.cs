
using MediatR;

public record UnFriendCommand(
    Guid FriendId
) : IRequest<Result<Unit>>;
