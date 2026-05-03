using FluentValidation;

public class UpdateAvatarValidator : AbstractValidator<UpdateAvatarCommand>
{
    public UpdateAvatarValidator()
    {
        this.ApplyMediaRules(
            x => x.AvatarUrl,
            x => x.MediaType,
            x => x.PublicId
        );
    }
}

