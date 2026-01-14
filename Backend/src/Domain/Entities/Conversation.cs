public class Conversation : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public bool IsGroup { get; set; } = false;
    public Conversation()
    { }
}