namespace Musakuce.Api.Authorization;

/// <summary>
/// Every privileged capability in the admin/CMS system. Each constant
/// doubles as the name of its ASP.NET Core authorization policy (see
/// Program.cs) and is checked via [Authorize(Policy = Permissions.X)] or,
/// for the elevated-view GET endpoints, via AdminAwareController's
/// manual AuthorizeElevatedViewAsync check.
/// </summary>
public static class Permissions
{
    public const string ListingsView = "listings.view";
    public const string ListingsWrite = "listings.write";
    public const string ListingsModerate = "listings.moderate";

    public const string EventsView = "events.view";
    public const string EventsWrite = "events.write";
    public const string EventsModerate = "events.moderate";

    public const string LocalInfoView = "localinfo.view";
    public const string LocalInfoWrite = "localinfo.write";
    public const string LocalInfoModerate = "localinfo.moderate";

    public const string PeopleView = "people.view";
    public const string PeopleWrite = "people.write";
    public const string PeopleModerate = "people.moderate";

    public const string HistoryView = "history.view";
    public const string HistoryWrite = "history.write";
    public const string HistoryModerate = "history.moderate";

    public const string PhotosView = "photos.view";
    public const string PhotosWrite = "photos.write";
    public const string PhotosModerate = "photos.moderate";

    public const string VideosView = "videos.view";
    public const string VideosWrite = "videos.write";
    public const string VideosModerate = "videos.moderate";

    public const string SubmissionsView = "submissions.view";
    public const string SubmissionsModerate = "submissions.moderate";

    /// <summary>Phase 11 — Places CMS (/admin/yerler). Assigned to Editor
    /// and Archivist alongside the other archive/village-content
    /// permissions (see Roles.Permissions below).</summary>
    public const string PlacesView = "places.view";
    public const string PlacesWrite = "places.write";
    public const string PlacesModerate = "places.moderate";

    /// <summary>Phase 12 §2 — the singleton "Kəndimiz" village profile
    /// (/admin/kendimiz). Editor-territory like Events/Listings, not
    /// Archivist (which stays scoped to archival-only content).</summary>
    public const string VillageProfileView = "villageprofile.view";
    public const string VillageProfileWrite = "villageprofile.write";
    public const string VillageProfileModerate = "villageprofile.moderate";

    /// <summary>Phase 12 §E — "Xatirə" (/admin/xatire). Archival/
    /// biographical content, same role split as People/History/Places.</summary>
    public const string MemorialView = "memorial.view";
    public const string MemorialWrite = "memorial.write";
    public const string MemorialModerate = "memorial.moderate";

    /// <summary>Phase 12 §F — "Mədəni irs" (/admin/medeni-iras).</summary>
    public const string CulturalHeritageView = "culturalheritage.view";
    public const string CulturalHeritageWrite = "culturalheritage.write";
    public const string CulturalHeritageModerate = "culturalheritage.moderate";

    /// <summary>Phase 12 §G — "Kəndimizin səsi" (/admin/kendimizin-sesi).</summary>
    public const string InterviewsView = "interviews.view";
    public const string InterviewsWrite = "interviews.write";
    public const string InterviewsModerate = "interviews.moderate";

    /// <summary>Phase 13 Part 1/2 — "Təhsil" (/admin/tehsil). Archival
    /// content, same role split as People/History/Places/Memorial.</summary>
    public const string EducationView = "education.view";
    public const string EducationWrite = "education.write";
    public const string EducationModerate = "education.moderate";

    public const string UsersManage = "users.manage";
    public const string AuditLogView = "auditlog.view";

    /// <summary>Phase 8 — uploading a file is a prerequisite for using
    /// any *.write permission that carries an image (Photos, People,
    /// Events, LocalInfo), so every admin role gets it; the resource
    /// *.write policy still gates whether the resulting MediaAsset can
    /// actually be attached to something.</summary>
    public const string MediaUpload = "media.upload";

    public static readonly IReadOnlyList<string> All =
    [
        ListingsView, ListingsWrite, ListingsModerate,
        EventsView, EventsWrite, EventsModerate,
        LocalInfoView, LocalInfoWrite, LocalInfoModerate,
        PeopleView, PeopleWrite, PeopleModerate,
        HistoryView, HistoryWrite, HistoryModerate,
        PhotosView, PhotosWrite, PhotosModerate,
        VideosView, VideosWrite, VideosModerate,
        SubmissionsView, SubmissionsModerate,
        PlacesView, PlacesWrite, PlacesModerate,
        VillageProfileView, VillageProfileWrite, VillageProfileModerate,
        MemorialView, MemorialWrite, MemorialModerate,
        CulturalHeritageView, CulturalHeritageWrite, CulturalHeritageModerate,
        InterviewsView, InterviewsWrite, InterviewsModerate,
        EducationView, EducationWrite, EducationModerate,
        UsersManage, AuditLogView, MediaUpload,
    ];
}

/// <summary>
/// The four admin roles (spec Phase 7 §2) and exactly what each may do.
/// Administrator: everything. Editor: village content (events, people,
/// history, photos, videos, submissions) + listings moderation (not
/// full listing edit). Archivist: archival content only (people,
/// history, photos, videos, submissions) — no events/listings/local-info.
/// Moderator: the "village square" moderation surface (listings, local
/// info, submissions) — no archive content editing.
/// </summary>
public static class Roles
{
    public const string Administrator = "Administrator";
    public const string Editor = "Editor";
    public const string Archivist = "Archivist";
    public const string Moderator = "Moderator";

    public static readonly IReadOnlyList<string> All = [Administrator, Editor, Archivist, Moderator];

    public static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> Permissions = new Dictionary<string, IReadOnlyList<string>>
    {
        [Administrator] = Authorization.Permissions.All,

        [Editor] =
        [
            Authorization.Permissions.EventsView, Authorization.Permissions.EventsWrite, Authorization.Permissions.EventsModerate,
            Authorization.Permissions.ListingsView, Authorization.Permissions.ListingsModerate,
            Authorization.Permissions.PeopleView, Authorization.Permissions.PeopleWrite, Authorization.Permissions.PeopleModerate,
            Authorization.Permissions.HistoryView, Authorization.Permissions.HistoryWrite, Authorization.Permissions.HistoryModerate,
            Authorization.Permissions.PhotosView, Authorization.Permissions.PhotosWrite, Authorization.Permissions.PhotosModerate,
            Authorization.Permissions.VideosView, Authorization.Permissions.VideosWrite, Authorization.Permissions.VideosModerate,
            Authorization.Permissions.PlacesView, Authorization.Permissions.PlacesWrite, Authorization.Permissions.PlacesModerate,
            Authorization.Permissions.VillageProfileView, Authorization.Permissions.VillageProfileWrite, Authorization.Permissions.VillageProfileModerate,
            Authorization.Permissions.MemorialView, Authorization.Permissions.MemorialWrite, Authorization.Permissions.MemorialModerate,
            Authorization.Permissions.CulturalHeritageView, Authorization.Permissions.CulturalHeritageWrite, Authorization.Permissions.CulturalHeritageModerate,
            Authorization.Permissions.InterviewsView, Authorization.Permissions.InterviewsWrite, Authorization.Permissions.InterviewsModerate,
            Authorization.Permissions.EducationView, Authorization.Permissions.EducationWrite, Authorization.Permissions.EducationModerate,
            Authorization.Permissions.SubmissionsView, Authorization.Permissions.SubmissionsModerate,
            Authorization.Permissions.MediaUpload,
        ],

        [Archivist] =
        [
            Authorization.Permissions.PeopleView, Authorization.Permissions.PeopleWrite, Authorization.Permissions.PeopleModerate,
            Authorization.Permissions.HistoryView, Authorization.Permissions.HistoryWrite, Authorization.Permissions.HistoryModerate,
            Authorization.Permissions.PhotosView, Authorization.Permissions.PhotosWrite, Authorization.Permissions.PhotosModerate,
            Authorization.Permissions.VideosView, Authorization.Permissions.VideosWrite, Authorization.Permissions.VideosModerate,
            Authorization.Permissions.PlacesView, Authorization.Permissions.PlacesWrite, Authorization.Permissions.PlacesModerate,
            Authorization.Permissions.MemorialView, Authorization.Permissions.MemorialWrite, Authorization.Permissions.MemorialModerate,
            Authorization.Permissions.CulturalHeritageView, Authorization.Permissions.CulturalHeritageWrite, Authorization.Permissions.CulturalHeritageModerate,
            Authorization.Permissions.InterviewsView, Authorization.Permissions.InterviewsWrite, Authorization.Permissions.InterviewsModerate,
            Authorization.Permissions.EducationView, Authorization.Permissions.EducationWrite, Authorization.Permissions.EducationModerate,
            Authorization.Permissions.SubmissionsView, Authorization.Permissions.SubmissionsModerate,
            Authorization.Permissions.MediaUpload,
        ],

        [Moderator] =
        [
            Authorization.Permissions.ListingsView, Authorization.Permissions.ListingsWrite, Authorization.Permissions.ListingsModerate,
            Authorization.Permissions.LocalInfoView, Authorization.Permissions.LocalInfoWrite, Authorization.Permissions.LocalInfoModerate,
            Authorization.Permissions.SubmissionsView, Authorization.Permissions.SubmissionsModerate,
            Authorization.Permissions.MediaUpload,
        ],
    };
}
