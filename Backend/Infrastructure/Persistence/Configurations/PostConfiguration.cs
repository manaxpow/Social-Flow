using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.Property(p => p.Content)
        .IsRequired()
        .HasMaxLength(1000);

        builder.HasOne(p => p.Author)
        .WithMany(a => a.Posts)
        .HasForeignKey(p => p.AuthorId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}