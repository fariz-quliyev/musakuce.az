using FluentValidation;

namespace Musakuce.Application.Submissions;

public class CreateSubmissionRequestValidator : AbstractValidator<CreateSubmissionRequest>
{
    public CreateSubmissionRequestValidator()
    {
        RuleFor(x => x.SubmitterName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactInfo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.PermissionToPublish).Equal(true)
            .WithMessage("Permission to publish must be granted before a submission can be reviewed.");
        RuleFor(x => x.FileUrls).Must(x => x.Count <= 10)
            .WithMessage("A submission can have at most 10 files.");
    }
}

public class UpdateSubmissionStatusRequestValidator : AbstractValidator<UpdateSubmissionStatusRequest>
{
    public UpdateSubmissionStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
