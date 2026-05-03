public sealed class CommentTree
{
    public Guid AncestorId { get; private set; }
    public Guid DescendantId { get; private set; }
    public int Depth { get; private set; }

    public CommentTree(Guid ancestorId, Guid descendantId, int depth)
    {
        AncestorId = ancestorId;
        DescendantId = descendantId;
        Depth = depth;
    }
}