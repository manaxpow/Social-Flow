using FluentValidation;

public static class ValidatorExtensions
{
    public static IRuleBuilderOptions<T, string> IsValidUrl<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty().WithMessage("URL is required.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid URL format.");
    }

    public static void ApplyMediaRules<T>(this AbstractValidator<T> validator,
        System.Linq.Expressions.Expression<Func<T, string>> urlPath,
        System.Linq.Expressions.Expression<Func<T, MediaType>> typePath,
        System.Linq.Expressions.Expression<Func<T, string>> publicIdPath)
    {
        validator.RuleFor(urlPath).IsValidUrl();
        validator.RuleFor(typePath).IsInEnum().WithMessage("Invalid media type.");
        validator.RuleFor(publicIdPath).NotEmpty().WithMessage("Storage PublicId is required.");
    }
}