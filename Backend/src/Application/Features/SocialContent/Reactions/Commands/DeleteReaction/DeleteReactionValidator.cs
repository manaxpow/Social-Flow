using FluentValidation;

public class DeleteReactionValidator : AbstractValidator<DeleteReactionCommand>
{
    public DeleteReactionValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required.");
    }
}