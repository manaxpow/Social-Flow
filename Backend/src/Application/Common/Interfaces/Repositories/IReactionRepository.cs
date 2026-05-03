public interface IReactionRepository : IGenericRepository<Reaction>
{
    Task<Reaction?> GetByUserAndTargetAsync(Guid userId, Guid targetId, CancellationToken cancellationToken = default);
}
