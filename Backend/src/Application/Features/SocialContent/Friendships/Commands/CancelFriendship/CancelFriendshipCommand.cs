
using MediatR;

public record CancelFriendshipCommand(
    Guid FriendId
) : IRequest<Result<Unit>>;