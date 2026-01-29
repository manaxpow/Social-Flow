public class ReactionQueries(IDbConnectionFactory dbConnectionFactory) : IReactionQueries
{
    private readonly IDbConnectionFactory _dbConnectionFactory = dbConnectionFactory;

    public Task<List<Reaction>> GetReactionsByCommentIdAsync(Guid commentId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<Reaction> GetReactionsByMessageIdAsync(Guid messageId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<List<Reaction>> GetReactionsByPostIdAsync(Guid postId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}