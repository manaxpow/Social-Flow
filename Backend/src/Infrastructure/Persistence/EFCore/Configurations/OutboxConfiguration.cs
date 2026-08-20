using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OutboxConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type).IsRequired();

        builder.Property(x => x.Content).IsRequired();

        builder.HasIndex(x => x.ProcessedAt)
            .HasFilter("\"processed_at\" IS NULL");
    }
}