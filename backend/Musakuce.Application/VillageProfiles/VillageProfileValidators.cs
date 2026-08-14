using FluentValidation;

namespace Musakuce.Application.VillageProfiles;

public class UpsertVillageProfileRequestValidator : AbstractValidator<UpsertVillageProfileRequest>
{
    public UpsertVillageProfileRequestValidator()
    {
        RuleFor(x => x.VillageName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Tagline).MaximumLength(200);
        RuleFor(x => x.ShortDescription).NotEmpty().MaximumLength(500);
        RuleFor(x => x.LongDescription).MaximumLength(8000);
        RuleFor(x => x.Population).GreaterThanOrEqualTo(0).When(x => x.Population.HasValue);
        RuleFor(x => x.AreaHectares).GreaterThanOrEqualTo(0).When(x => x.AreaHectares.HasValue);
        RuleFor(x => x.GeographicalDescription).MaximumLength(2000);
        RuleFor(x => x.MainOccupations).MaximumLength(500);
        RuleFor(x => x.NeighboringSettlements).MaximumLength(500);
        RuleFor(x => x.NameOriginNarrative).MaximumLength(4000);
        RuleFor(x => x.NameOriginSourceStatus).IsInEnum().When(x => x.NameOriginSourceStatus.HasValue);
        RuleFor(x => x.NameOriginSourceReference).MaximumLength(500);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
        RuleFor(x => x.ContactInfo).MaximumLength(500);
        RuleFor(x => x.SocialLinks).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        // The name-origin narrative is almost always oral tradition — if
        // one is entered, force an explicit source status rather than
        // letting it read as an unsourced claim by omission.
        RuleFor(x => x.NameOriginSourceStatus)
            .NotNull()
            .WithMessage("Ad mənşəyi rəvayəti daxil edildikdə mənbə statusu göstərilməlidir.")
            .When(x => !string.IsNullOrWhiteSpace(x.NameOriginNarrative));
    }
}

public class UpdateVillageProfileStatusRequestValidator : AbstractValidator<UpdateVillageProfileStatusRequest>
{
    public UpdateVillageProfileStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
