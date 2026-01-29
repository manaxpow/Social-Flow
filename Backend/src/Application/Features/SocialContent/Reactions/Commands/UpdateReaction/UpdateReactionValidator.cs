using FluentValidation;

public class UpdateReactionValidator : AbstractValidator<UpdateReactionCommand>
{
    public UpdateReactionValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required.");
        RuleFor(x => x.ReactType).SetValidator(new ReactionTypeValidator());
    }
}