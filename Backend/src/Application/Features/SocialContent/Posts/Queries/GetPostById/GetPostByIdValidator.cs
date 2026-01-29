using FluentValidation;

public class GetPostByIdValidator : AbstractValidator<GetPostByIdQuery>
{
    public GetPostByIdValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}