using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Musakuce.Application.Audit;
using Musakuce.Application.CulturalHeritage;
using Musakuce.Application.Education;
using Musakuce.Application.Events;
using Musakuce.Application.History;
using Musakuce.Application.Interviews;
using Musakuce.Application.Listings;
using Musakuce.Application.LocalInfo;
using Musakuce.Application.Media;
using Musakuce.Application.Memorial;
using Musakuce.Application.People;
using Musakuce.Application.Photos;
using Musakuce.Application.Places;
using Musakuce.Application.Search;
using Musakuce.Application.Submissions;
using Musakuce.Application.Timeline;
using Musakuce.Application.Videos;
using Musakuce.Application.VillageProfiles;

namespace Musakuce.Application;

public static class DependencyInjection
{
    /// <summary>
    /// Validators are registered explicitly (not via assembly-scanning
    /// reflection) — some hosting environments apply an application
    /// control policy that blocks `Assembly.GetExportedTypes()` on
    /// freshly-built local DLLs, which breaks `AddValidatorsFromAssembly`.
    /// Explicit registration sidesteps that entirely.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IValidator<Listings.CreateListingRequest>, Listings.CreateListingRequestValidator>();
        services.AddScoped<IValidator<Listings.UpdateListingRequest>, Listings.UpdateListingRequestValidator>();
        services.AddScoped<IValidator<Listings.UpdateListingStatusRequest>, Listings.UpdateListingStatusRequestValidator>();
        services.AddScoped<IValidator<Events.CreateEventRequest>, Events.CreateEventRequestValidator>();
        services.AddScoped<IValidator<Events.UpdateEventRequest>, Events.UpdateEventRequestValidator>();
        services.AddScoped<IValidator<Events.UpdateEventStatusRequest>, Events.UpdateEventStatusRequestValidator>();
        services.AddScoped<IValidator<LocalInfo.CreateLocalInfoEntryRequest>, LocalInfo.CreateLocalInfoEntryRequestValidator>();
        services.AddScoped<IValidator<LocalInfo.UpdateLocalInfoEntryRequest>, LocalInfo.UpdateLocalInfoEntryRequestValidator>();
        services.AddScoped<IValidator<LocalInfo.UpdateLocalInfoStatusRequest>, LocalInfo.UpdateLocalInfoStatusRequestValidator>();
        services.AddScoped<IValidator<Places.CreatePlaceRequest>, Places.CreatePlaceRequestValidator>();
        services.AddScoped<IValidator<Places.UpdatePlaceRequest>, Places.UpdatePlaceRequestValidator>();
        services.AddScoped<IValidator<Places.UpdatePlaceStatusRequest>, Places.UpdatePlaceStatusRequestValidator>();
        services.AddScoped<IValidator<People.CreatePersonRequest>, People.CreatePersonRequestValidator>();
        services.AddScoped<IValidator<People.UpdatePersonRequest>, People.UpdatePersonRequestValidator>();
        services.AddScoped<IValidator<People.UpdatePersonStatusRequest>, People.UpdatePersonStatusRequestValidator>();
        services.AddScoped<IValidator<History.CreateHistoricalEventRequest>, History.CreateHistoricalEventRequestValidator>();
        services.AddScoped<IValidator<History.UpdateHistoricalEventRequest>, History.UpdateHistoricalEventRequestValidator>();
        services.AddScoped<IValidator<History.UpdateHistoricalEventStatusRequest>, History.UpdateHistoricalEventStatusRequestValidator>();
        services.AddScoped<IValidator<Photos.CreatePhotoRequest>, Photos.CreatePhotoRequestValidator>();
        services.AddScoped<IValidator<Photos.UpdatePhotoRequest>, Photos.UpdatePhotoRequestValidator>();
        services.AddScoped<IValidator<Photos.UpdatePhotoStatusRequest>, Photos.UpdatePhotoStatusRequestValidator>();
        services.AddScoped<IValidator<Videos.CreateVideoRequest>, Videos.CreateVideoRequestValidator>();
        services.AddScoped<IValidator<Videos.UpdateVideoRequest>, Videos.UpdateVideoRequestValidator>();
        services.AddScoped<IValidator<Videos.UpdateVideoStatusRequest>, Videos.UpdateVideoStatusRequestValidator>();
        services.AddScoped<IValidator<Submissions.CreateSubmissionRequest>, Submissions.CreateSubmissionRequestValidator>();
        services.AddScoped<IValidator<Submissions.UpdateSubmissionStatusRequest>, Submissions.UpdateSubmissionStatusRequestValidator>();
        services.AddScoped<IValidator<UpsertVillageProfileRequest>, UpsertVillageProfileRequestValidator>();
        services.AddScoped<IValidator<UpdateVillageProfileStatusRequest>, UpdateVillageProfileStatusRequestValidator>();
        services.AddScoped<IValidator<UpsertTimelineSettingsRequest>, UpsertTimelineSettingsRequestValidator>();
        services.AddScoped<IValidator<CreateMemorialRecordRequest>, CreateMemorialRecordRequestValidator>();
        services.AddScoped<IValidator<UpdateMemorialRecordRequest>, UpdateMemorialRecordRequestValidator>();
        services.AddScoped<IValidator<UpdateMemorialRecordStatusRequest>, UpdateMemorialRecordStatusRequestValidator>();
        services.AddScoped<IValidator<CreateCulturalHeritageItemRequest>, CreateCulturalHeritageItemRequestValidator>();
        services.AddScoped<IValidator<UpdateCulturalHeritageItemRequest>, UpdateCulturalHeritageItemRequestValidator>();
        services.AddScoped<IValidator<UpdateCulturalHeritageItemStatusRequest>, UpdateCulturalHeritageItemStatusRequestValidator>();
        services.AddScoped<IValidator<CreateInterviewRequest>, CreateInterviewRequestValidator>();
        services.AddScoped<IValidator<UpdateInterviewRequest>, UpdateInterviewRequestValidator>();
        services.AddScoped<IValidator<UpdateInterviewStatusRequest>, UpdateInterviewStatusRequestValidator>();
        services.AddScoped<IValidator<CreateEducationEntryRequest>, CreateEducationEntryRequestValidator>();
        services.AddScoped<IValidator<UpdateEducationEntryRequest>, UpdateEducationEntryRequestValidator>();
        services.AddScoped<IValidator<UpdateEducationEntryStatusRequest>, UpdateEducationEntryStatusRequestValidator>();

        services.AddScoped<IListingService, ListingService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<ILocalInfoService, LocalInfoService>();
        services.AddScoped<IPlaceService, PlaceService>();
        services.AddScoped<IPersonService, PersonService>();
        services.AddScoped<IHistoricalEventService, HistoricalEventService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IVideoService, VideoService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<IMediaUploadService, MediaUploadService>();
        services.AddScoped<IVillageProfileService, VillageProfileService>();
        services.AddScoped<ITimelineSettingsService, TimelineSettingsService>();
        services.AddScoped<IMemorialRecordService, MemorialRecordService>();
        services.AddScoped<ICulturalHeritageItemService, CulturalHeritageItemService>();
        services.AddScoped<IInterviewService, InterviewService>();
        services.AddScoped<IEducationEntryService, EducationEntryService>();

        return services;
    }
}
