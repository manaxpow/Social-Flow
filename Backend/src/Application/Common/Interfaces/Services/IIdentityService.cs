public interface IIdentityService
{
    string GenerateRefreshToken();
    Task<Result<User>> AuthenticateAsync(string email, string password);
}