using FluentValidation;

public class ResendConfirmationValidator : AbstractValidator<ResendConfirmationCommand>
{
    public ResendConfirmationValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.");
    }
}
