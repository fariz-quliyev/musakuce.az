using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Api.Authorization;
using Musakuce.Application.Search;

namespace Musakuce.Api.Controllers;

/// <summary>Unified site search — Phase 12 §13.</summary>
[ApiController]
[Route("api/search")]
public class SearchController(ISearchService service, IAuthorizationService authorizationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Search([FromQuery] string q, CancellationToken ct)
    {
        var visibility = await ResolveVisibilityAsync();
        return Ok(await service.SearchAsync(q, visibility, ct));
    }

    /// <summary>
    /// Phase 14 §4 fix: Draft/Archived visibility is now resolved per
    /// module against the caller's actual view permissions, not a single
    /// "any authenticated staff member" flag — a Moderator (who holds none
    /// of these view permissions) must not see unpublished People/History/
    /// etc. title+snippet text just for being logged in.
    /// </summary>
    private async Task<SearchVisibility> ResolveVisibilityAsync()
    {
        if (User.Identity?.IsAuthenticated != true)
            return SearchVisibility.PublicOnly;

        async Task<bool> Can(string permission) => (await authorizationService.AuthorizeAsync(User, permission)).Succeeded;

        var results = await Task.WhenAll(
            Can(Permissions.PeopleView),
            Can(Permissions.HistoryView),
            Can(Permissions.PhotosView),
            Can(Permissions.VideosView),
            Can(Permissions.PlacesView),
            Can(Permissions.EventsView),
            Can(Permissions.LocalInfoView),
            Can(Permissions.MemorialView),
            Can(Permissions.CulturalHeritageView),
            Can(Permissions.InterviewsView),
            Can(Permissions.EducationView));

        return new SearchVisibility(
            People: results[0],
            History: results[1],
            Photos: results[2],
            Videos: results[3],
            Places: results[4],
            Events: results[5],
            LocalInfo: results[6],
            Memorial: results[7],
            CulturalHeritage: results[8],
            Interviews: results[9],
            Education: results[10]);
    }
}
