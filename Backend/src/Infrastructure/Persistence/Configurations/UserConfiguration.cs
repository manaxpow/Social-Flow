using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

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

            // Nếu bạn muốn Avatar có thể null (User không có ảnh)
            // a.Property(p => p.Url).IsRequired(false);
        });

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.DateOfBirth)
            .IsRequired();

        builder.Property(u => u.Gender)
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();
    }
}