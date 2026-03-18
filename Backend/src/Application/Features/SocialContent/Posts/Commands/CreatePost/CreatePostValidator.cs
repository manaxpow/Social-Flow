using FluentValidation;

public class CreatePostValidator : AbstractValidator<CreatePostCommand>
{
    public CreatePostValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Content) ||
                       !string.IsNullOrWhiteSpace(x.MediaUrl) ||
                       x.SharedPostId.HasValue)
            .WithMessage("A post must have content, media, or be a shared post.")
            .WithName("Post");

        RuleFor(x => x.MediaUrl)
            .MaximumLength(500)
            .WithMessage("Media URL must be less than 500 characters")
            .When(x => !string.IsNullOrEmpty(x.MediaUrl));

        RuleFor(x => x.Content)
            .MaximumLength(2000)
            .WithMessage("Content cannot exceed 2000 characters");

        RuleFor(x => x.MentionedUserIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("Duplicate mentions are not allowed.");
    }
}