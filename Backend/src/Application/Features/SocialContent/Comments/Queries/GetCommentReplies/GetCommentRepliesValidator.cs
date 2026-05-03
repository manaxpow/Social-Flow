using FluentValidation;

public class GetCommentsRepliseValidator : AbstractValidator<GetCommentRepliesQuery>
{
    public GetCommentsRepliseValidator()
    {
        RuleFor(x => x.PostId).NotEmpty().WithMessage("Post id is required.");
        RuleFor(x => x.CommentId).NotEmpty().WithMessage("Comment id is required.");
        RuleFor(x => x.PageNumber).NotEmpty().WithMessage("Page number is required.");
        RuleFor(x => x.PageSize).NotEmpty().WithMessage("Page size is required.");
    }
}