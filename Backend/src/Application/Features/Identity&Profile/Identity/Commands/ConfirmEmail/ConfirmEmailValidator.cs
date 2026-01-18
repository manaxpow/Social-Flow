using FluentValidation;

public class ConfirmPasswordValidator : AbstractValidator<ConfirmEmailCommand>
{
    public ConfirmPasswordValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token is required.");
    }
}