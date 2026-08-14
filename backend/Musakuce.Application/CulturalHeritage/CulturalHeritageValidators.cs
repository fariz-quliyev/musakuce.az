using FluentValidation;

namespace Musakuce.Application.CulturalHeritage;

public class CreateCulturalHeritageItemRequestValidator : AbstractValidator<CreateCulturalHeritageItemRequest>
{
    public CreateCulturalHeritageItemRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
    }
}

public class UpdateCulturalHeritageItemRequestValidator : AbstractValidator<UpdateCulturalHeritageItemRequest>
{
    public UpdateCulturalHeritageItemRequestValidator()
    {
        Include(new CreateCulturalHeritageItemRequestValidator());
    }
}

public class UpdateCulturalHeritageItemStatusRequestValidator : AbstractValidator<UpdateCulturalHeritageItemStatusRequest>
{
    public UpdateCulturalHeritageItemStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
