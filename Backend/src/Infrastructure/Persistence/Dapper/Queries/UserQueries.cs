using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dapper;
using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class UserQueries : BaseRepository<User>, IUserQuries
{
    private readonly IMapper _mapper;
    public UserQueries(ApplicationDbContext context, IMapper mapper) : base(context)
    {
        _mapper = mapper;
    }

    public async Task<UserResponse?> GetMe(Guid Id, CancellationToken cancellationToken)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(u => u.Id == Id)
            .ProjectTo<UserResponse>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}