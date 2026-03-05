using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.Property(m => m.Content)
        .IsRequired()
        .HasMaxLength(1000);

        builder.OwnsMany(p => p.Images, img =>
        {
            img.ToTable("MessageImages"); // Tên bảng lưu ảnh
            img.WithOwner().HasForeignKey("MessageId");
            img.Property<Guid>("Id");
            img.HasKey("Id");

            img.Property(x => x.Url).IsRequired();
            img.Property(x => x.PublicId).IsRequired();
        });

        builder.Property(m => m.Type)
        .IsRequired();

        builder.HasOne(m => m.Conversation)
        .WithMany()
        .HasForeignKey(m => m.ConversationId)
        .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.Sender)
        .WithMany()
        .HasForeignKey(m => m.SenderId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}