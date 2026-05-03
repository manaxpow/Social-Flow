using FluentValidation;

public class CreateCommentValidator : AbstractValidator<CreateCommentCommand>
{
    public CreateCommentValidator()
    {
        RuleFor(x => x.PostId).NotEmpty().WithMessage("Post id is required.");

        RuleFor(x => x.Content).NotEmpty().When(x => x.Media == null).WithMessage("Content is required when media is not provided.")
        .MaximumLength(2000).WithMessage("Content cannot exceed 2000 characters.");

        RuleFor(x => x.Media).ChildRules(media =>
       {
           media.RuleFor(m => m.Url).NotEmpty().WithMessage("Media URL is required.");
           media.RuleFor(m => m.PublicId).NotEmpty().WithMessage("Media PublicId is required.");
       }).When(x => x.Media != null);

        RuleFor(x => x).Must(x => !string.IsNullOrWhiteSpace(x.Content) || x.Media != null)
            .WithMessage("Comment must have either content or media.");

        RuleFor(x => x.MentionedUserIds).Must(ids => ids == null || ids.Count <= 10)
            .WithMessage("Cannot mention more than 10 users in a comment.")
            .When(x => x.MentionedUserIds != null);
    }
}