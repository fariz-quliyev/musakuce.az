using FluentValidation;

namespace Musakuce.Application.LocalInfo;

public class CreateLocalInfoEntryRequestValidator : AbstractValidator<CreateLocalInfoEntryRequest>
{
    public CreateLocalInfoEntryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
    }
}

public class UpdateLocalInfoEntryRequestValidator : AbstractValidator<UpdateLocalInfoEntryRequest>
{
    public UpdateLocalInfoEntryRequestValidator()
    {
        Include(new CreateLocalInfoEntryRequestValidator());
    }
}

public class UpdateLocalInfoStatusRequestValidator : AbstractValidator<UpdateLocalInfoStatusRequest>
{
    public UpdateLocalInfoStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
