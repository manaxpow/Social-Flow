using FluentValidation;

public class DeleteCommentValidator : AbstractValidator<DeleteCommentCommand>
{
    public DeleteCommentValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Comment id is required.");
    }
}