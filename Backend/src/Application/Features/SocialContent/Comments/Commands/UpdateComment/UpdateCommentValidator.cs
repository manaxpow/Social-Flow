using FluentValidation;

public class UpdateCommentValidator : AbstractValidator<UpdateCommentCommand>
{
    public UpdateCommentValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Comment id is required.");
        RuleFor(x => x.Content).SetValidator(new CommentContentValidator());
    }
}