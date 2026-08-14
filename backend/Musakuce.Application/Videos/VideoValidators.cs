using FluentValidation;

namespace Musakuce.Application.Videos;

public class CreateVideoRequestValidator : AbstractValidator<CreateVideoRequest>
{
    public CreateVideoRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.EmbedProvider).IsInEnum();
        RuleFor(x => x.EmbedUrlOrKey).NotEmpty();
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.Category).MaximumLength(100);
    }
}

public class UpdateVideoRequestValidator : AbstractValidator<UpdateVideoRequest>
{
    public UpdateVideoRequestValidator()
    {
        Include(new CreateVideoRequestValidator());
    }
}

public class UpdateVideoStatusRequestValidator : AbstractValidator<UpdateVideoStatusRequest>
{
    public UpdateVideoStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
