using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        return _dbSet.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
    }
    public Task<User?> GetByEmailAsync(string email)
    {
        return _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task UpdateRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiryDate)
    {
        var user = await _dbSet.FindAsync(userId);
        if (user is not null)
        {
            user.UpdateRefreshToken(refreshToken, expiryDate);
        }
    }
}