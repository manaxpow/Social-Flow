using Microsoft.EntityFrameworkCore;

public interface IAppDbContext
{
    DbSet<User> Users { get; }

    // Domain Sets
    DbSet<Post> Posts { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Reaction> Reactions { get; }
    DbSet<Friendship> Friendships { get; }
    DbSet<Conversation> Conversations { get; }
    DbSet<ConversationMember> ConversationMembers { get; }
    DbSet<Message> Messages { get; }
    DbSet<MessageReceipt> MessageReceipts { get; }

    // Core EF Core method
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}