using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        builder.ToTable("Comments");

        builder.Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.OwnsMany(p => p.Images, img =>
        {
            img.ToTable("CommentImages"); // Tên bảng lưu ảnh
            img.WithOwner().HasForeignKey("CommentId");
            img.Property<Guid>("Id");
            img.HasKey("Id");

            img.Property(x => x.Url).IsRequired();
            img.Property(x => x.PublicId).IsRequired();
        });
    }
}