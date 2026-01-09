using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasIndex(a => a.Email).IsUnique();

        builder.HasOne(a => a.User)
        .WithOne(u => u.Account)
        .HasForeignKey<User>(a => a.AccountId)
        .OnDelete(DeleteBehavior.Cascade);
    }
}