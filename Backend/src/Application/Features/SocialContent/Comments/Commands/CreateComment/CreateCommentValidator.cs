using FluentValidation;

public class CommentContentValidator : AbstractValidator<string>
{
    public CommentContentValidator()
    {
        RuleFor(x => x).NotEmpty().WithMessage("Comment content is required.")
        .MaximumLength(500).WithMessage("Comment content must not exceed 500 characters."); ;
    }
}

public class CreateCommentValidator : AbstractValidator<CreateCommentCommand>
{
    public CreateCommentValidator()
    {
        RuleFor(x => x.PostId).NotEmpty().WithMessage("Post id is required.");
        RuleFor(x => x.AuthorId).NotEmpty().WithMessage("User id is required.");
        RuleFor(x => x.Content).SetValidator(new CommentContentValidator());
    }
}