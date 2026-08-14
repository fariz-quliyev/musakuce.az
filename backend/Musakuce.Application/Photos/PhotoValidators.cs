using FluentValidation;

namespace Musakuce.Application.Photos;

public class CreatePhotoRequestValidator : AbstractValidator<CreatePhotoRequest>
{
    public CreatePhotoRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.MediaAssetId).NotEmpty();
        RuleFor(x => x.AltText).MaximumLength(300);
    }
}

public class UpdatePhotoRequestValidator : AbstractValidator<UpdatePhotoRequest>
{
    public UpdatePhotoRequestValidator()
    {
        Include(new CreatePhotoRequestValidator());
    }
}

public class UpdatePhotoStatusRequestValidator : AbstractValidator<UpdatePhotoStatusRequest>
{
    public UpdatePhotoStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
