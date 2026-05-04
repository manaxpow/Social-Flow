using Microsoft.AspNetCore.Identity;
using SocialFlow.Domain.Enums;

public class User : IdentityUser<Guid>, IHasDomainEvents
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public DateTime DateOfBirth { get; private set; }
    public Gender Gender { get; private set; }
    public CloudAsset? Avatar { get; private set; } = CloudAsset.DefaultAvatar;
    public CloudAsset? Cover { get; private set; } = CloudAsset.DefaultCover;
    public string? Bio { get; private set; } = string.Empty;
    public string Provider { get; private set; } = "Local";
    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiryTime { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime LastLogin { get; private set; }


    public virtual ICollection<Post> Posts { get; private set; } = new List<Post>();
    public virtual ICollection<Reaction> Reactions { get; private set; } = new List<Reaction>();
    public virtual ICollection<ConversationMember> ConversationMembers { get; private set; } = new List<ConversationMember>();

    // Domain Events
    private readonly List<IDomainEvent> _domainEvents = new List<IDomainEvent>();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    public IReadOnlyCollection<IDomainEvent> GetDomainEvents() => _domainEvents.AsReadOnly();
    public void AddDomainEvent(IDomainEvent @event) => _domainEvents.Add(@event);
    public void ClearDomainEvents() => _domainEvents.Clear();

    public User()
    {
        LastLogin = DateTime.UtcNow;
    }

    public User(string email, string firstName, string lastName, DateTime dateOfBirth, Gender gender, string? bio) : base(email)
    {
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        DateOfBirth = dateOfBirth;
        Gender = gender;
        Bio = bio;

        NormalizedEmail = email.ToUpper();
        NormalizedUserName = email.ToUpper();
    }

    public void UpdateProfile(string? firstName, string? lastName, DateTime? dateOfBirth, Gender? gender, string? bio)
    {
        FirstName = firstName ?? FirstName;
        LastName = lastName ?? LastName;
        DateOfBirth = dateOfBirth ?? DateOfBirth;
        Gender = gender ?? Gender;
        Bio = bio ?? Bio;
    }

    public void UpdateAvatar(CloudAsset avatar)
    {
        if (avatar.Type != MediaType.Image)
            throw new ArgumentException("Avatar must be an image");
        Avatar = avatar;

        AddDomainEvent(new AvatarUpdatedEvent(Id, avatar.Url, avatar.PublicId));
    }

    public void UpdateCover(CloudAsset cover)
    {
        if (cover.Type != MediaType.Image)
            throw new ArgumentException("Cover must be an image");
        Cover = cover;

        AddDomainEvent(new CoverUpdatedEvent(Id, cover.Url, cover.PublicId));
    }

    public void UpdateRefreshToken(string refreshToken, DateTime expiryDate)
     => (RefreshToken, RefreshTokenExpiryTime) = (refreshToken, expiryDate);


}