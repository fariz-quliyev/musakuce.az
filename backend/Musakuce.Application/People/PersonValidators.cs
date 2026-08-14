using FluentValidation;

namespace Musakuce.Application.People;

public class CreatePersonRequestValidator : AbstractValidator<CreatePersonRequest>
{
    public CreatePersonRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.Biography).NotEmpty().MaximumLength(8000);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
        RuleFor(x => x.DeathDate)
            .GreaterThanOrEqualTo(x => x.BirthDate!.Value)
            .When(x => x.BirthDate.HasValue && x.DeathDate.HasValue)
            .WithMessage("DeathDate must be on or after BirthDate.");
    }
}

public class UpdatePersonRequestValidator : AbstractValidator<UpdatePersonRequest>
{
    public UpdatePersonRequestValidator()
    {
        Include(new CreatePersonRequestValidator());
    }
}

public class UpdatePersonStatusRequestValidator : AbstractValidator<UpdatePersonStatusRequest>
{
    public UpdatePersonStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
