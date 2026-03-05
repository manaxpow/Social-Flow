using FluentValidation;

public class UnBlockUserValidator : AbstractValidator<UnBlockUserCommand>
{
    public UnBlockUserValidator()
    {
        RuleFor(v => v.BlockedUserId).NotEmpty();
    }
}