using FluentValidation;

public class GetReactionsByPostIdValidator : AbstractValidator<GetReactionsByPostIdQuery>
{
    public GetReactionsByPostIdValidator()
    {
        RuleFor(x => x.PostId).NotEmpty().WithMessage("Post ID is required.");
    }
}