using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CommentTreeConfiguration : IEntityTypeConfiguration<CommentTree>
{
    public void Configure(EntityTypeBuilder<CommentTree> builder)
    {
        builder.HasKey(ct => new { ct.AncestorId, ct.DescendantId });
        builder.HasIndex(ct => ct.DescendantId);
        builder.Property(ct => ct.Depth)
               .IsRequired()
               .HasColumnType("smallint");
    }
}