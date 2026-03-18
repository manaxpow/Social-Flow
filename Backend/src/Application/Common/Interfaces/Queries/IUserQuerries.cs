public interface IUserQuries
{
    Task<User?> GetMe(Guid Id, CancellationToken cancellationToken);
}