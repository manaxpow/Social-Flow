using StackExchange.Redis;

public class RedisUserTracker : IUserTracker
{
    private readonly IConnectionMultiplexer _redis;
    private const string KeyPrefix = "online_users:";

    public RedisUserTracker(IConnectionMultiplexer connectionMultiplexer)
    {
        _redis = connectionMultiplexer;
    }
    private IDatabase Db => _redis.GetDatabase();

    public async Task AddConnection(Guid userId, string connectionId)
    {
        var key = $"{KeyPrefix}{userId}";
        await Db.SetAddAsync(key, connectionId);
        await Db.KeyExpireAsync(key, TimeSpan.FromDays(1));
    }

    public async Task RemoveConnection(Guid userId, string connectionId)
    {
        var key = $"{KeyPrefix}{userId}";
        await Db.SetRemoveAsync(key, connectionId);

        if (await Db.SetLengthAsync(key) == 0)
        {
            await Db.KeyDeleteAsync(key);
        }
    }

    public async Task<IEnumerable<string>> GetConnectionsForUser(Guid userId)
    {
        var key = $"{KeyPrefix}{userId}";
        var connectionIds = await Db.SetMembersAsync(key);
        return connectionIds.Select(c => c.ToString());
    }

    public async Task<bool> IsUserOnline(Guid userId)
    {
        var key = $"{KeyPrefix}{userId}";
        return await Db.KeyExistsAsync(key);
    }
}