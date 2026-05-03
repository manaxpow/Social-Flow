using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PostMediaConfiguration : IEntityTypeConfiguration<PostMedia>
{
    public void Configure(EntityTypeBuilder<PostMedia> builder)
    {
        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.Id)
            .ValueGeneratedOnAdd();

        builder.OwnsOne(pm => pm.Media, a =>
        {
            a.Property(p => p.Url).HasColumnName("url").IsRequired();
            a.Property(p => p.PublicId).HasColumnName("public_id").IsRequired();
            a.Property(p => p.Type).HasColumnName("type").IsRequired();
        });
    }
}