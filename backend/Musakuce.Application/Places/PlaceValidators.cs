using FluentValidation;

namespace Musakuce.Application.Places;

public class CreatePlaceRequestValidator : AbstractValidator<CreatePlaceRequest>
{
    public CreatePlaceRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Category).NotNull().IsInEnum();
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.HistoricalBackground).MaximumLength(4000);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180);
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
        // A Historical place claims to document real village history —
        // require some indication of where that account comes from
        // rather than letting it default silently to "under research".
        RuleFor(x => x.SourceStatus)
            .NotNull()
            .When(x => x.Kind == Musakuce.Domain.Enums.PlaceKind.Historical);
    }
}

public class UpdatePlaceRequestValidator : AbstractValidator<UpdatePlaceRequest>
{
    public UpdatePlaceRequestValidator()
    {
        Include(new CreatePlaceRequestValidator());
    }
}

public class UpdatePlaceStatusRequestValidator : AbstractValidator<UpdatePlaceStatusRequest>
{
    public UpdatePlaceStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
