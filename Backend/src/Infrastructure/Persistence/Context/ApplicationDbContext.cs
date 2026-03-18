using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        var utcConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
          v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
          v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var nullableUtcConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v.Value : DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

        // Áp dụng trực tiếp cho Entity Friendship (Nơi đang gây lỗi 500)
        modelBuilder.Entity<Friendship>(entity =>
        {
            // Giả sử Friendship kế thừa BaseEntity có các trường này
            entity.Property(e => e.CreatedAt).HasConversion(utcConverter);

            // Nếu UpdatedAt là nullable
            entity.Property(e => e.UpdatedAt).HasConversion(nullableUtcConverter);

            // Thêm bất kỳ trường DateTime nào khác của Friendship ở đây
        });

        // Áp dụng cho OutboxMessage (Quan trọng để Test Flow chạy được)
        modelBuilder.Entity<OutboxMessage>(entity =>
        {
            entity.Property(e => e.OccurredAt).HasConversion(utcConverter);
            entity.Property(e => e.ProcessedAt).HasConversion(nullableUtcConverter);
        });
    }
}