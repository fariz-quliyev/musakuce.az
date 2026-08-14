using FluentValidation;
using Musakuce.Api.Authorization;

namespace Musakuce.Api.Users;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Role).NotEmpty().Must(r => Roles.All.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", Roles.All)}.");
        RuleFor(x => x.TemporaryPassword).NotEmpty().MinimumLength(10);
    }
}

public class AssignRoleRequestValidator : AbstractValidator<AssignRoleRequest>
{
    public AssignRoleRequestValidator()
    {
        RuleFor(x => x.Role).NotEmpty().Must(r => Roles.All.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", Roles.All)}.");
    }
}

public class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(10);
    }
}
