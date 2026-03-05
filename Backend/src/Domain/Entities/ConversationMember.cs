public class ConversationMember : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public Guid UserId { get; private set; }
    public string Nickname { get; private set; } = string.Empty;
    public CloudImage Avatar { get; private set; } = CloudImage.DefaultAvatar;

    public Conversation Conversation
    { get; private set; } = null!;
    public User User { get; private set; } = null!;
    public ConversationMember()
    { }

    public ConversationMember(Guid conversationId, Guid userId, string nickname, CloudImage avatar)
    {
        ConversationId = conversationId;
        UserId = userId;
        Nickname = nickname;
        Avatar = avatar;
    }

    public void UpdateNickname(string newNickname)
    {
        if (!string.IsNullOrWhiteSpace(newNickname) && Nickname != newNickname)
        {
            Nickname = newNickname;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void UpdateAvatar(CloudImage newAvatar)
    {
        Avatar = newAvatar;
        UpdatedAt = DateTime.UtcNow;
    }
}