using SocialFlow.Infrastructure.Persistence.Repositories;

public class MentionRepository(ApplicationDbContext context) : BaseRepository<Mention>(context), IMentionRepository
{

}