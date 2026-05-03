public interface IUserQuries
{
    Task<UserResponse?> GetMe(Guid Id, CancellationToken cancellationToken);
}