using FluentValidation;

public class ReactionTypeValidator : AbstractValidator<ReactType>
{
    public ReactionTypeValidator()
    {
        RuleFor(x => x)
            .IsInEnum()
            .WithMessage("Invalid reaction type provided.");
    }
}

public class ReactionTargetTypeValidator : AbstractValidator<TargetType>
{
    public ReactionTargetTypeValidator()
    {
        RuleFor(x => x)
            .IsInEnum()
            .WithMessage("Invalid target type provided.");
    }
}

public class CreateReactionValidator : AbstractValidator<CreateReactionCommand>
{
    public CreateReactionValidator()
    {
        RuleFor(x => x.TargetId)
            .NotEmpty().WithMessage("Target ID is required.");

        RuleFor(x => x.ReactType).SetValidator(new ReactionTypeValidator());

        RuleFor(x => x.TargetType).SetValidator(new ReactionTargetTypeValidator());
    }
}