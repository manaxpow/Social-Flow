
using MediatR;

public record RequestFriendshipCommand(
    Guid FriendId
) : IRequest<Result<Unit>>;