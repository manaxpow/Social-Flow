using FluentValidation;

public class GetCommentsByPostIdValidator : AbstractValidator<GetCommentsByPostIdQuery>
{
    public GetCommentsByPostIdValidator()
    {
        RuleFor(x => x.PostId).NotEmpty().WithMessage("Post id is required.");
        RuleFor(x => x.PageNumber).NotEmpty().WithMessage("Page number is required.");
        RuleFor(x => x.PageSize).NotEmpty().WithMessage("Page size is required.");
    }
}