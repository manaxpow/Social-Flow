using SocialFlow.Infrastructure.Persistence.Repositories;

public class ReactionRepository : BaseRepository<Reaction>, IReactionRepository
{
    public ReactionRepository(ApplicationDbContext context) : base(context)
    {
    }
}