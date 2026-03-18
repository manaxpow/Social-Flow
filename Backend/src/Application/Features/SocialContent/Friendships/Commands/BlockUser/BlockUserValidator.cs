using FluentValidation;

public class BlockUserValidator : AbstractValidator<BlockUserCommand>
{
    public BlockUserValidator()
    {
        RuleFor(v => v.BlockedUserId).NotEmpty();
    }
}