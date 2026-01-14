using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class MessageReceiptConfiguration : IEntityTypeConfiguration<MessageReceipt>
{
    public void Configure(EntityTypeBuilder<MessageReceipt> builder)
    {
        // Composite key
        builder.HasKey(mr => new { mr.MessageId, mr.UserId });

        builder.HasOne(mr => mr.Message)
               .WithMany()
               .HasForeignKey(mr => mr.MessageId);

        builder.HasOne(mr => mr.User)
               .WithMany()
               .HasForeignKey(mr => mr.UserId);
    }
}