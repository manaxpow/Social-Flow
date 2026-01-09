public class Account : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Provider { get; set; } = "Local";
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime LastLogin { get; set; }

    public virtual User User { get; set; } = null!;
    public Account() { }
}