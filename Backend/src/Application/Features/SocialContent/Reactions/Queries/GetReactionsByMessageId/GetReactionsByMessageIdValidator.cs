using FluentValidation;

public class GetReactionsByMessageIdValidator : AbstractValidator<GetReactionsByMessageIdQuery>
{
    public GetReactionsByMessageIdValidator()
    {
        RuleFor(x => x.MessageId).NotEmpty().WithMessage("Message ID is required.");
    }
}