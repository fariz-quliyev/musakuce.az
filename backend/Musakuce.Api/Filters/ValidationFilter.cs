using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Musakuce.Api.Filters;

/// <summary>
/// Runs FluentValidation against every action argument that has a
/// registered validator, before the action executes. Short-circuits
/// with a 400 ValidationProblem on failure so controllers never need to
/// call validators manually.
/// </summary>
public class ValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
                continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (serviceProvider.GetService(validatorType) is not IValidator validator)
                continue;

            var validationContext = new ValidationContext<object>(argument);
            var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);
            if (!result.IsValid)
            {
                foreach (var error in result.Errors)
                    context.ModelState.AddModelError(error.PropertyName, error.ErrorMessage);

                var problemDetails = new ValidationProblemDetails(context.ModelState)
                {
                    Title = "One or more validation errors occurred.",
                    Status = StatusCodes.Status400BadRequest,
                };
                context.Result = new BadRequestObjectResult(problemDetails);
                return;
            }
        }

        await next();
    }
}
