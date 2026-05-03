using System.Data;
using FluentValidation;

public class CloudAssetValidator : AbstractValidator<CloudAsset>
{
    public CloudAssetValidator()
    {
        RuleFor(x => x.Url).NotEmpty().WithMessage("Media URL is required.");
        RuleFor(x => x.PublicId).NotEmpty().WithMessage("Media PublicId is required.");
    }
}

public class UpdateCommentValidator : AbstractValidator<UpdateCommentCommand>
{
    public UpdateCommentValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Comment id is required.");
        RuleFor(x => x).Must(x => !string.IsNullOrWhiteSpace(x.Content) || x.Media != null)
        .WithMessage("Comment must have either content or media.");

        RuleFor(x => x.Content).MaximumLength(2000).WithMessage("Content cannot exceed 2000 characters.")
        .When(x => !string.IsNullOrWhiteSpace(x.Content));

        RuleFor(x => x.Media)
        .SetValidator(new CloudAssetValidator()!)
        .When(x => x.Media != null);

        RuleFor(x => x.MentionedUserIds).Must(ids => ids == null || ids.Count <= 10)
            .WithMessage("Cannot mention more than 10 users in a comment.")
            .When(x => x.MentionedUserIds != null);
    }
}