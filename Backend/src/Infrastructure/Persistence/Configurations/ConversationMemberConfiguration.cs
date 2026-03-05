using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ConversationMemberConfiguration : IEntityTypeConfiguration<ConversationMember>
{
    public void Configure(EntityTypeBuilder<ConversationMember> builder)
    {
        builder.HasIndex(c => new { c.ConversationId, c.UserId }).IsUnique();

        builder.Property(cm => cm.Nickname)
            .IsRequired();

        builder.OwnsOne(u => u.Avatar, a =>
        {
            // Ánh xạ thuộc tính Url của CloudImage thành cột AvatarUrl trong bảng Users
            a.Property(p => p.Url)
                .HasColumnName("AvatarUrl")
                .HasMaxLength(500);

            // Ánh xạ thuộc tính PublicId thành cột AvatarPublicId
            a.Property(p => p.PublicId)
                .HasColumnName("AvatarPublicId")
                .HasMaxLength(200);
        });

    }
}