using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.OwnsOne(u => u.Avatar, a =>
        {
            a.Property(p => p.Url).HasColumnName("avatar_url").IsRequired();
            a.Property(p => p.PublicId).HasColumnName("avatar_public_id").IsRequired();
            a.Property(p => p.Type).HasColumnName("avatar_type").IsRequired();
        });

        builder.OwnsOne(u => u.Cover, a =>
       {
           a.Property(p => p.Url).HasColumnName("cover_url").IsRequired();
           a.Property(p => p.PublicId).HasColumnName("cover_public_id").IsRequired();
           a.Property(p => p.Type).HasColumnName("cover_type").IsRequired();
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

        builder.HasMany(u => u.Posts)
            .WithOne(p => p.Author)
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}