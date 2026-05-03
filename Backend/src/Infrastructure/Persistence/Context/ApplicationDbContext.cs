using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
: IdentityDbContext<User, IdentityRole<Guid>, Guid>(options), IAppDbContext
{
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Reaction> Reactions => Set<Reaction>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageReceipt> MessageReceipts => Set<MessageReceipt>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<CommentTree> CommentTrees => Set<CommentTree>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<User>(b => b.ToTable("users"));
        modelBuilder.Entity<IdentityRole>(b => b.ToTable("roles"));
        modelBuilder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("user_roles"));
        modelBuilder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("user_claims"));
        modelBuilder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("user_logins"));
        modelBuilder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("role_claims"));
        modelBuilder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("user_tokens"));

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entityType.FindProperty("Id");
            if (idProperty != null && idProperty.ClrType == typeof(Guid))
            {
                idProperty.ValueGenerated = Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.OnAdd;

                idProperty.SetDefaultValueSql("gen_random_uuid()");
            }
        }

        // Apply global query filter for all ISoftDeletable entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                var filter = Expression.Lambda(Expression.Not(property), parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ConvertSoftDeletes();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ConvertSoftDeletes();
        return base.SaveChanges();
    }

    private void ConvertSoftDeletes()
    {
        var entries = ChangeTracker.Entries<ISoftDeletable>()
            .Where(e => e.State == EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            entry.State = EntityState.Modified;
            entry.Entity.SoftDelete();

            // Ensure owned entities (e.g., CloudAsset in PostMedia) are also set to Modified
            // so EF Core generates correct UPDATE instead of DELETE for the shared row
            foreach (var ownedEntry in entry.References)
            {
                if (ownedEntry.TargetEntry != null && ownedEntry.TargetEntry.State == EntityState.Deleted)
                {
                    ownedEntry.TargetEntry.State = EntityState.Modified;
                }
            }
        }
    }
}
