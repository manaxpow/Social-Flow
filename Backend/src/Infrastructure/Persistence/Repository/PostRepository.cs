using SocialFlow.Infrastructure.Persistence.Repositories;

public class PostRepository : BaseRepository<Post>, IPostRepository
{

    public PostRepository(ApplicationDbContext context) : base(context)
    {
    }
}