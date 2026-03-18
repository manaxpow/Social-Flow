using MediatR;

public record GetReactionsByCommentIdQuery(Guid CommentId) : IRequest<Result<ReactionResponse>>;