public sealed class Conversation : Entity
{
    public string Title { get; private set; } = string.Empty;
    public bool IsGroup { get; private set; } = false;
    public Conversation()
    { }
}