# P1 Fix Report — Unify All Media Uploads With the Secure Media Pipeline

**Date**: 2026-08-14. **Scope**: the media-upload P1 finding from
[`docs/FINAL_PRE_DEPLOYMENT_AUDIT.md`](FINAL_PRE_DEPLOYMENT_AUDIT.md)
(P1-5) only. No P2/P3 item, no EXIF/GPS work, no confirmation dialogs, no
Nginx headers, no SEO, no VillageUpdate/Qəhrəmanlarımız/Əlaqə work. Nothing
was committed or deployed as part of this work — see
[`git diff --stat`](#8-scope-confirmation) at the end.

---

## 1. Every upload path audited

Every entity with an image/cover/thumbnail field was traced end-to-end
(domain entity → EF configuration → DTO → service → controller → admin
form), not just the three the audit named. Full inventory:

| Entity | Field | Backend (before this fix) | Frontend (before this fix) |
|---|---|---|---|
| **VillageEvent** | `CoverMediaAssetId` | ❌ Bypassed — DTO took `CoverImageUrl` (string), service did `new MediaAsset { Url = ... }` | ❌ Raw `<Input type="url">` |
| **Video** | `ThumbnailMediaAssetId` | ❌ Bypassed — same pattern (`ThumbnailUrl` string) | ❌ Raw `<Input type="url">` |
| **LocalInfoEntry** | `PhotoMediaAssetId` | ❌ Bypassed — same pattern (`PhotoUrl` string) | ❌ Raw `<Input type="url">` |
| **Person** | `CoverMediaAssetId` | ✅ Already correct (`CoverMediaAssetId` end-to-end) | ❌ Sent a `coverImageUrl` string the backend DTO doesn't even have a property for — **silently no-op**, not a security bypass, but a broken/dead field |
| Place | `CoverMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| Photo | `MediaAssetId` (required) | ✅ Already correct (upload is mandatory to create a Photo at all) | ✅ Already `ImageUploadField` |
| MemorialRecord | `CoverMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| EducationEntry | `CoverMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| CulturalHeritageItem | `CoverMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| Interview | `ThumbnailMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| VillageProfile | `HeroMediaAssetId` / `LogoMediaAssetId` | ✅ Already correct | ✅ Already `ImageUploadField` |
| CommunitySubmission | `SubmissionFile.MediaAssetId` (required) | ✅ Already correct — the community upload endpoint | N/A (file input direct) |
| ClassifiedListing | `ListingImage.MediaAssetId` (required, multi-image) | ⚠️ **Also bypassed** — see §7, deliberately not touched this pass |

`MediaUploadService.IsReferencedAsync` (the safety check every
`DeleteIfUnreferencedAsync` call relies on before deleting a MediaAsset's
storage objects and DB row) was also audited directly, since it's the
shared mechanism this whole pipeline depends on for safe cleanup — see §5.

## 2. Which paths were vulnerable

### Events, Videos, LocalInfo (the audit's named P1-5 entities)

All three followed the identical broken pattern in their `CreateAsync`/
`UpdateAsync` service methods:

```csharp
// Before — backend/Musakuce.Application/Events/EventService.cs (representative of all three)
if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
{
    var media = new MediaAsset { Url = request.CoverImageUrl };  // arbitrary caller-supplied string
    db.MediaAssets.Add(media);                                    // written straight to the DB
    ev.CoverMediaAsset = media;                                   // no upload, no MIME check, no
}                                                                  // ImageSharp decode, no size limit,
                                                                    // no storage key, no thumbnail/
                                                                    // display variant — completely
                                                                    // independent of POST /api/media/upload
```

Every one of these three `Create`/`Update` endpoints requires
authentication (`[Authorize(Policy = Permissions.EventsWrite)]` etc.), so
this was an **admin-authenticated** bypass, not an anonymous one — but it
meant any authenticated role with write access to these three modules
(Administrator, Editor for all three; Moderator additionally for
LocalInfo, per its "village square" permission set) could plant an
arbitrary string as an "uploaded image" URL with none of the pipeline's
protections. It also permanently orphaned the previous `MediaAsset` row
on every edit — confirmed still true from the original audit's exact
wording (`docs/FINAL_PRE_DEPLOYMENT_AUDIT.md` P1-5): none of the three
called `DeleteIfUnreferencedAsync`.

### Person (discovered during this audit, not named in P1-5)

`PersonForm.tsx` still submitted a `coverImageUrl` string, but
`CreatePersonRequest`/`UpdatePersonRequest` (backend) and
`CreatePersonRequest` (frontend TS type) only ever had
`CoverMediaAssetId: Guid?`/`string | null` — there is no
`CoverImageUrl` property on the request type at all. ASP.NET Core's
model binder silently drops unmapped JSON properties, so this field did
**nothing** — not a live bypass (the backend never accepted it), but a
non-functional cover-image upload for every Person profile in the admin
panel. Fixed as a pure frontend change (§4).

### `MediaUploadService.IsReferencedAsync` gap (discovered during this audit)

`MemorialRecordService`, `EducationEntryService`,
`CulturalHeritageItemService`, and `InterviewService` already called
`DeleteIfUnreferencedAsync` correctly when replacing an image — but
`IsReferencedAsync`'s OR-chain never checked `MemorialRecords`,
`EducationEntries`, `CulturalHeritageItems`, `Interviews`, or
`VillageProfiles` (Hero/Logo). In the extremely unlikely event a
`MediaAssetId` were ever genuinely shared between one of those four
entity types and anything else, the safety check would have missed it
and let the asset be deleted while still in use elsewhere. Not
independently reachable through normal admin usage (every upload mints a
fresh, unique `MediaAssetId`), but it's a real gap in the shared safety
net that the three newly-fixed services (Event/Video/LocalInfo) now also
rely on — fixed alongside them (§5) and covered by a dedicated test that
manufactures the shared-reference condition directly (§6).

## 3. Backend changes

No new abstraction, no second upload implementation, no schema change —
each of the three broken services was brought in line with the existing,
correct pattern already used by `PersonService`/`PlaceService`/
`EducationEntryService` etc.

| File | Change |
|---|---|
| `backend/Musakuce.Application/Events/EventDtos.cs` | `CreateEventRequest.CoverImageUrl` (string?) → `CoverMediaAssetId` (Guid?); `EventDto` gained `CoverMediaAssetId` alongside the existing resolved `CoverImageUrl` |
| `backend/Musakuce.Application/Events/EventService.cs` | Injected `IMediaUploadService`; `CreateAsync`/`UpdateAsync` now look up the `MediaAsset` by id (404 if it doesn't exist) instead of constructing one from a URL; `UpdateAsync` calls `DeleteIfUnreferencedAsync` on the old asset after a successful replace |
| `backend/Musakuce.Application/Videos/VideoDtos.cs` | Same pattern: `ThumbnailUrl` → `ThumbnailMediaAssetId`. `EmbedProvider`/`EmbedUrlOrKey` (the actual video, YouTube/Vimeo/etc.) were **not touched** — only the thumbnail image field |
| `backend/Musakuce.Application/Videos/VideoService.cs` | Same service-level fix as Events |
| `backend/Musakuce.Application/LocalInfo/LocalInfoDtos.cs` | Same pattern: `PhotoUrl` → `PhotoMediaAssetId` |
| `backend/Musakuce.Application/LocalInfo/LocalInfoService.cs` | Same service-level fix |
| `backend/Musakuce.Application/Media/MediaUploadService.cs` | `IsReferencedAsync` extended to also check `MemorialRecords`, `EducationEntries`, `CulturalHeritageItems`, `Interviews`, `VillageProfiles` (Hero+Logo) — see §2 |
| `backend/Musakuce.Application/Media/IMediaUploadService.cs` | Doc comment on `IsReferencedAsync` updated to list the now-complete set of checked entities |

Controllers (`EventsController`, `VideosController`, `LocalInfoController`)
needed **no changes** — they already just pass the DTO through to the
service; the `[Authorize(Policy = ...)]` attributes gating
Create/Update/UpdateStatus were already correct and untouched.
`MediaController.cs` (the actual `POST /api/media/upload` /
`community-upload` endpoints — MIME allowlist, size limits, ImageSharp
decode, rate limiting) was **not touched at all** — this fix routes more
callers *into* that existing, correct pipeline, it doesn't change it.

Validators (`EventValidators.cs`, `VideoValidators.cs`,
`LocalInfoValidators.cs`) needed no changes — none of them had a rule on
the old URL fields to remove, and a `Guid?` needs no format validation
beyond what model binding already enforces.

## 4. Frontend changes

Every changed form now uses the same `ImageUploadField` component
already used by `PlaceForm.tsx`, `PhotoForm.tsx`, `EducationForm.tsx`,
`CulturalHeritageForm.tsx`, `InterviewForm.tsx`, `MemorialForm.tsx`, and
`VillageProfileForm.tsx` — no new upload widget, no new component.

| File | Change |
|---|---|
| `frontend/components/admin/events/EventForm.tsx` | Raw `<Input type="url">` → `<ImageUploadField>`; payload now sends `coverMediaAssetId` |
| `frontend/components/admin/videos/VideoForm.tsx` | Same, for the thumbnail field only — the "Video URL / açar" (`embedUrlOrKey`) input is untouched, still a plain URL/key field, exactly as it should be (§7) |
| `frontend/components/admin/localInfo/LocalInfoForm.tsx` | Same, `photoMediaAssetId` |
| `frontend/components/admin/people/PersonForm.tsx` | Same — pure frontend fix, since the backend already only accepted `coverMediaAssetId` (§2) |
| `frontend/lib/api/types.ts` | `EventDto`/`CreateEventRequest`, `VideoDto`/`CreateVideoRequest`, `LocalInfoEntryDto`/`CreateLocalInfoEntryRequest` updated to match the new backend shapes (mirrors the existing `PersonDto` pattern: keep both the id and the resolved display URL on the read DTO) |
| `frontend/app/teqvim/page.tsx`, `frontend/app/videolar/page.tsx`, `frontend/app/faydali-melumatlar/page.tsx`, `frontend/app/kendimiz/page.tsx` | Mechanical: their hardcoded mock/fallback `EventDto`/`VideoDto`/`LocalInfoEntryDto` literals (used by `withFallback()` when the API is unreachable) needed the new `coverMediaAssetId`/`thumbnailMediaAssetId`/`photoMediaAssetId: null` field added to satisfy the updated TypeScript type — no behavior change |

No form was redesigned — each change is the same one-field swap already
established elsewhere in this codebase. Mobile admin UX was not touched.

## 5. Media replacement / orphan cleanup

All three newly-fixed services now follow the exact
`oldMediaAssetId` → save → `try { DeleteIfUnreferencedAsync(oldId) } catch { /* ignore */ }`
sequence already used by Person/Place/Memorial/Education/
CulturalHeritage/Interview:

- Replacing an image deletes the old `MediaAsset` (storage objects +
  DB row) **only if nothing else references it**.
- An asset still referenced by another entity — including, now
  correctly, `MemorialRecords`/`EducationEntries`/
  `CulturalHeritageItems`/`Interviews`/`VillageProfiles` — is never
  deleted (§2, §6).
- `DeleteIfUnreferencedAsync` throwing (e.g. a race) is caught and
  ignored, same as everywhere else — a failed best-effort cleanup must
  never fail the actual edit the user was performing.

## 6. Tests

New file: `backend/Musakuce.Tests/MediaPipelineUnificationTests.cs`, 10
tests (all passing). Existing `MediaUploadTests.cs` (unchanged, still
passing) already covers the generic upload-endpoint validation that
every entity now shares by construction — cited below rather than
duplicated, since Events/Videos/LocalInfo no longer touch file bytes at
all; they only ever consume an already-validated `MediaAssetId`.

| # | Required scenario | Covered by |
|---|---|---|
| 1 | Event cover image uses MediaAsset | `Event_cover_image_uses_a_real_MediaAsset_from_the_upload_pipeline` (new) — also asserts the resolved URL genuinely comes from the stored `MediaAsset` row, not an echo |
| 2 | Video cover image uses MediaAsset | `Video_thumbnail_uses_a_real_MediaAsset_while_the_embed_URL_stays_a_plain_field` (new) |
| 3 | LocalInfo cover image uses MediaAsset | `LocalInfo_photo_uses_a_real_MediaAsset_from_the_upload_pipeline` (new) |
| 4 | Invalid MIME is rejected | `MediaUploadTests.Invalid_MIME_type_is_rejected` (existing, unchanged — applies to every entity identically now, since none of them handle raw bytes anymore) |
| 5 | Spoofed content type is rejected | `MediaUploadTests.File_claiming_to_be_an_image_but_with_invalid_content_is_rejected` (existing) |
| 6 | Oversized image is rejected | `MediaUploadTests.Oversized_file_is_rejected` / `Community_upload_enforces_its_own_smaller_size_cap` (existing) |
| 7 | Valid image passes through ImageSharp/media storage | `MediaUploadTests.Authenticated_admin_can_upload_a_valid_image` (existing, asserts real decoded width/height) + new tests 1–3 above (asserting the resulting entity resolves a real stored URL) |
| 8 | Unauthorized role cannot upload where permission is required | `Moderator_cannot_create_events_or_videos_even_with_a_valid_MediaAssetId` (new — Moderator legitimately holds `media.upload` and `localinfo.write`, per its documented "village square" permission set, but correctly lacks `events.write`/`videos.write`; LocalInfo's own permission gate is separately covered by the pre-existing `RoleAuthorizationTests.Moderator_can_moderate_listings_and_write_local_info`) + `Create_with_a_nonexistent_MediaAssetId_is_rejected_for_all_three_entities` (new — proves the create/update path validates against real `MediaAsset` rows, closing the actual bypass) |
| 9 | Replacing an image cleans up the old asset safely | `Replacing_an_event_cover_image_cleans_up_the_old_asset`, `Replacing_a_video_thumbnail_cleans_up_the_old_asset`, `Replacing_a_localinfo_photo_cleans_up_the_old_asset` (new, one per entity) + `An_asset_still_referenced_by_a_different_entity_type_is_never_deleted` (new — directly exercises the §2/§5 `IsReferencedAsync` fix by manufacturing a genuinely shared `MediaAssetId` between a MemorialRecord and an EducationEntry) |
| 10 | Existing legitimate video/embed URLs continue working | `Video_thumbnail_uses_a_real_MediaAsset_while_the_embed_URL_stays_a_plain_field` asserts the YouTube `embedUrlOrKey` is preserved verbatim alongside the fixed thumbnail field |
| 11 | Public pages still render images correctly | `Anonymous_public_reads_see_the_correct_resolved_image_url_once_published` (new — publishes an Event, confirms the anonymous public list returns the same resolved `coverImageUrl`) |
| 12 | Existing MediaAsset behavior for Photos/People/Places remains intact | No source line in `PersonService.cs`, `PlaceService.cs`, or `PhotoService.cs` was touched (confirmed by this change's diff, §8) — and the full pre-existing suite (`RoleAuthorizationTests`, `PublicDataBoundaryTests`, `MediaUploadTests`'s own Photo-replacement test) still passes unchanged, which is the regression proof for "unaffected" |

## 7. Deliberately not touched

- **Video/Interview embed URLs** (`EmbedProvider`, `EmbedUrlOrKey`,
  YouTube/Vimeo/audio keys) — these are explicitly part of the content
  model (spec's video/interview design has never involved uploading
  video files), not an image-upload bypass. Confirmed unchanged in both
  services; covered by test #10 above.
- **`ClassifiedListing`/`ListingImage`** (`Elanlar`) — audited and found
  to have the **identical** bypass pattern (`CreateListingRequest`/
  `UpdateListingRequest.ImageUrls: List<string>`, both used by the
  anonymous public submission endpoint `POST /api/listings` and the
  admin `ListingEditForm.tsx`'s "Şəkil URL-ləri" textarea). This is a
  real, structurally identical instance of the same vulnerability class
  — but the original audit categorized it separately as **P2-2**
  ("`ListingEditForm.tsx` ... still use[s] raw URL-paste"), distinct
  from the **P1-5** finding this task scopes to, and fixing it properly
  requires a materially different UI (multi-image upload/reorder, not a
  single-field swap — `ListingImage` is a collection, unlike every other
  entity's single nullable cover field) that would go beyond "do not
  redesign the forms in this task." Per the explicit instruction to fix
  only this P1 and not any P2/P3 item, **this was found, documented, and
  deliberately left unfixed** — flagged here for a future, dedicated
  pass rather than folded into this one.
- **EXIF/GPS metadata, destructive-action confirmation, Nginx security
  headers, SEO, VillageUpdate, Qəhrəmanlarımız, Əlaqə** — explicitly out
  of scope per the task instructions; not touched.

## 8. Scope confirmation

```
 M backend/Musakuce.Application/Events/EventDtos.cs
 M backend/Musakuce.Application/Events/EventService.cs
 M backend/Musakuce.Application/LocalInfo/LocalInfoDtos.cs
 M backend/Musakuce.Application/LocalInfo/LocalInfoService.cs
 M backend/Musakuce.Application/Media/IMediaUploadService.cs
 M backend/Musakuce.Application/Media/MediaUploadService.cs
 M backend/Musakuce.Application/Videos/VideoDtos.cs
 M backend/Musakuce.Application/Videos/VideoService.cs
 M frontend/app/faydali-melumatlar/page.tsx
 M frontend/app/kendimiz/page.tsx
 M frontend/app/teqvim/page.tsx
 M frontend/app/videolar/page.tsx
 M frontend/components/admin/events/EventForm.tsx
 M frontend/components/admin/localInfo/LocalInfoForm.tsx
 M frontend/components/admin/people/PersonForm.tsx
 M frontend/components/admin/videos/VideoForm.tsx
 M frontend/lib/api/types.ts
?? backend/Musakuce.Tests/MediaPipelineUnificationTests.cs
```

18 files touched (8 backend Application-layer files, 8 frontend files, 1
new backend test file — plus 4 of the frontend files are one-line mock-data
fixes forced by the type change). No controller, no EF configuration, no
entity, no migration, no infra file was touched.

## 9. Schema changes

**None.** All three entities (`VillageEvent.CoverMediaAssetId`,
`Video.ThumbnailMediaAssetId`, `LocalInfoEntry.PhotoMediaAssetId`)
already had the nullable `Guid` FK column and a fully-configured EF
relationship (`HasOne(...).OnDelete(DeleteBehavior.SetNull)` in
`VillageEventConfiguration.cs`/`VideoConfiguration.cs`/
`LocalInfoEntryConfiguration.cs`) — the database was always ready; only
the Application-layer DTOs/services were wrong. Confirmed directly via
tooling, not just by inspection:

```
$ dotnet ef migrations has-pending-model-changes --project Musakuce.Infrastructure --startup-project Musakuce.Api
No changes have been made to the model since the last migration.
```

## 10. Verification results

| Command | Result |
|---|---|
| `dotnet build` | ✅ Build succeeded, 0 errors. Same pre-existing `AWSSDK.Core` low-severity advisory warning as before (unrelated) |
| `dotnet test` | ✅ **63/63 passed** (53 pre-existing + 10 new), 0 failed |
| `npm run lint` | ✅ 0 errors. Same single pre-existing warning as before (`lib/api/client.ts`, unrelated) |
| `npm run build` | ✅ Compiled successfully, TypeScript check passed, all 56 routes generated |
| `dotnet ef migrations has-pending-model-changes` | ✅ "No changes have been made to the model since the last migration." |

One test failure surfaced and was fixed *during* this work (not
pre-existing): the first draft of
`Moderator_cannot_create_events_videos_or_localinfo_even_with_a_valid_MediaAssetId`
incorrectly assumed Moderator lacks `localinfo.write` — it doesn't;
Moderator's documented permission set (`Roles.cs`) deliberately includes
LocalInfo as part of the "village square" moderation surface. Corrected
to test only Events/Videos (which Moderator genuinely lacks) and to cite
the existing test that already covers Moderator's legitimate LocalInfo
access, rather than asserting an incorrect denial.

Not run: a live browser/manual admin-panel check of the four changed
forms. This was verified by `npm run build`'s full static-generation
pass (which touches every route, including the admin forms, at build
time) and by the backend integration tests exercising the exact
request/response shapes the forms now send — but no interactive browser
session was used, consistent with this being a backend-and-types-level
audit fix rather than a UI redesign.

---

**Not committed. Not deployed.** The working tree is left as-is for
review; the checkpoint commit `2cb7fca` ("Security: fix Memorial RBAC for
Archivist") remains the last commit on `main`.
