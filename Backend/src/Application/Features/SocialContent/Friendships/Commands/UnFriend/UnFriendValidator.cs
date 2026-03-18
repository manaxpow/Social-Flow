using FluentValidation;

public class UnFriendValidator : AbstractValidator<UnFriendCommand>
{
    public UnFriendValidator()
    {
        RuleFor(v => v.FriendId).NotEmpty();
    }
}