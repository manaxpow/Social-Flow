using Microsoft.AspNetCore.Identity;

public class User : IdentityUser<Guid>
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public Gender Gender { get; private set; }
    public CloudImage Avatar { get; private set; } = CloudImage.DefaultAvatar;
    public string? Bio { get; private set; } = string.Empty;
    public string Provider { get; private set; } = "Local";
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime LastLogin { get; private set; }

    public virtual ICollection<Post> Posts { get; private set; } = new List<Post>();
    public virtual ICollection<Reaction> Reactions { get; private set; } = new List<Reaction>();
    public virtual ICollection<ConversationMember> ConversationMembers { get; private set; } = new List<ConversationMember>();

    public User() { }

    public User(string email, string firstName, string lastName, DateTime dateOfBirth, Gender gender, string? bio) : base(email)
    {
        FirstName = firstName;
        LastName = lastName;
        DateOfBirth = dateOfBirth;
        Gender = gender;
        Bio = bio;
    }

    public void UpdateProfile(string? firstName, string? lastName, DateTime? dateOfBirth, Gender? gender, string? bio)
    {
        FirstName = firstName ?? FirstName;
        LastName = lastName ?? LastName;
        DateOfBirth = dateOfBirth ?? DateOfBirth;
        Gender = gender ?? Gender;
        Bio = bio ?? Bio;
    }

    public void UpdateAvatar(CloudImage newAvatar)
    {
        Avatar = newAvatar;
    }

    public void UpdateRefreshToken(string refreshToken, DateTime expiryDate)
     => (RefreshToken, RefreshTokenExpiryTime) = (refreshToken, expiryDate);
}