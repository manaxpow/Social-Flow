using FluentValidation;

public class GetReactionsByCommentIdValidator : AbstractValidator<GetReactionsByCommentIdQuery>
{
    public GetReactionsByCommentIdValidator()
    {
        RuleFor(x => x.CommentId).NotEmpty().WithMessage("Comment ID is required.");
    }
}