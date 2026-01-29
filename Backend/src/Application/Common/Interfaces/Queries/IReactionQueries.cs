public interface IReactionQueries
{
    Task<List<Reaction>> GetReactionsByPostIdAsync(Guid postId, CancellationToken cancellationToken);
    Task<List<Reaction>> GetReactionsByCommentIdAsync(Guid commentId, CancellationToken cancellationToken);
    Task<Reaction> GetReactionsByMessageIdAsync(Guid messageId, CancellationToken cancellationToken);
}