using Dapper;

public class UserQueries : IUserQuries
{

    private readonly IDbConnectionFactory _dbConnectionFactory;

    public UserQueries(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<User?> GetMe(Guid Id, CancellationToken cancellationToken)
    {
        const string sql = @"
        SELECT 
            ""Id"", 
            ""UserName"", 
            ""Email"", 
            ""FirstName"", 
            ""LastName"", 
            ""DateOfBirth"", 
            ""Gender"", 
            ""AvatarUrl"", 
            ""Bio"", 
            ""LastLogin""
        FROM ""Users""
        WHERE ""Id"" = @Id AND ""IsActive"" = true 
        LIMIT 1;";

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<User>(
            new CommandDefinition(sql, new { Id = Id }, cancellationToken: cancellationToken)
        );
    }
}