using System.Data;
using FluentValidation;

public class UpdatePostValidator : AbstractValidator<UpdatePostCommand>
{
    public UpdatePostValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.Content)
            .MaximumLength(10000)
            .WithMessage("Content cannot exceed 10000 characters")
            .When(x => x.Content != null);

        RuleFor(x => x.Media)
            .Must(media => media == null || media.Any())
            .WithMessage("Media cannot be empty.")
            .When(x => x.Media != null);

        RuleFor(x => x.MentionedUserIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithMessage("Duplicate mentions are not allowed.")
            .When(x => x.MentionedUserIds != null);

        RuleForEach(x => x.Media).ChildRules(media =>
        {
            media.RuleFor(m => m.Url).NotEmpty().WithMessage("Media URL is required.");
            media.RuleFor(m => m.PublicId).NotEmpty().WithMessage("Media PublicId is required.");
            media.RuleFor(m => m.SortOrder).GreaterThanOrEqualTo(0).WithMessage("SortOrder must be non-negative.");
        }).When(x => x.Media != null);
    }
}