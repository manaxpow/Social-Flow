public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<User?> GetByEmailAsync(string email);
    Task UpdateRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiryDate);
}