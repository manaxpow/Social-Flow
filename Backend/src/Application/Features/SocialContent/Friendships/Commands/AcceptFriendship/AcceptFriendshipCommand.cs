
using MediatR;

public record AcceptFriendshipCommand(
    Guid FriendId
) : IRequest<Result<Unit>>;