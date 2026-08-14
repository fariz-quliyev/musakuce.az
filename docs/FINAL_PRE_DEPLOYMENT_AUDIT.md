# Final Pre-Deployment Audit — Musaküçə.az

**Date of audit**: 2026-08-13. **Scope**: full repository, read-only. Nothing was fixed, deployed, or committed as part of this audit — findings only, per explicit instruction.

**Method**: this audit combined direct inspection (auth/authorization, production Docker/Nginx, content-integrity spot checks, and all verification runs) with five parallel focused investigations covering Admin CMS/mobile UX, public site/SEO, media pipeline/database, security, and performance/accessibility. Every finding below cites a specific file and line; anything not independently re-verified by the primary auditor carries the caveat that it reflects a sub-investigation's citation, not a second independent confirmation — treat exact line numbers as approximate if the file has since moved, but the underlying defect is real.

---

## Priority key

- **P0** — production blocker. Do not deploy with this open.
- **P1** — should fix before production. Not a hard blocker, but a real, confirmed problem.
- **P2** — recommended improvement. Worth doing, not urgent.
- **P3** — future enhancement. No action needed now.

---

## 1. P0 — Production blockers

### P0-1. Stored XSS via unescaped JSON-LD in six public detail-page templates

- **Location**: `frontend/lib/structuredData.ts` (all builder functions), consumed by `frontend/app/medeniyyet/[id]/page.tsx`, `frontend/app/xatire/[id]/page.tsx`, `frontend/app/kendimizin-sesi/[id]/page.tsx`, `frontend/app/elanlar/[id]/page.tsx`, `frontend/app/teqvim/[id]/page.tsx`, `frontend/app/tehsil/[id]/page.tsx`.
- **Problem**: every detail page renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />` with DB-sourced text (title, description, headline) interpolated directly. `JSON.stringify()` does not escape the literal sequence `</script>`. A value containing `</script><script>...</script>` closes the JSON-LD tag early and injects real, executing markup.
- **Why it matters**: `POST /api/listings` (Elanlar/classifieds) is `[AllowAnonymous]` (`backend/Musakuce.Api/Controllers/ListingsController.cs`), and `ListingValidators.cs` only enforces length limits on `Title`/`Description` — no HTML/script sanitization. An anonymous submitter can plant a payload that looks like ordinary text to a moderator reviewing it in the plain-text admin form, get it approved, and it becomes stored XSS served to every visitor of that listing's public page. The admin auth cookie is deliberately non-`httpOnly` (a documented, accepted tradeoff for this project) — if an authenticated admin ever previews/visits an affected page, the payload can read `document.cookie` directly, escalating from public-visitor XSS to potential admin-session compromise. The same unescaped pattern also affects every other content type's title/description fields once entered by staff, so this isn't limited to the one anonymous-submission path.
- **Recommended fix**: escape `<` as `<` (or replace `</script` before serializing) once, in a single shared JSON-LD render helper, rather than at each of the six call sites — e.g. `JSON.stringify(obj).replace(/</g, "\\u003c")`.
- **Code change required**: Yes — frontend only, one shared helper plus six call sites switched to use it.

### P0-2. Fabricated content can render as real, site-wide, with zero visual indicator, during any backend outage

- **Location**: `frontend/lib/api/withFallback.ts` is used in 26 files; `frontend/components/layout/DataSourceNote.tsx` (the "Nümunə məlumat — backend hələ qoşulmayıb" badge) is only actually rendered in 11 of them.
- **Problem**: every homepage section (`VillageIntro`, `VillageFacts`, `VillageTodayStrip`, `TodayInVillage`, `VillageSquare`, `ThisWeek`, `TodayPhotos`, `OurPeople`, `OurHistory`, `VillageVoices`, `MapPreview`) and four list pages (`app/xatire/page.tsx`, `app/medeniyyet/page.tsx`, `app/kendimizin-sesi/page.tsx`, `app/tehsil/page.tsx`) call `withFallback()` but discard the `isLive` flag and never render `DataSourceNote`. `frontend/components/home/TodayInVillage.tsx` even force-triggers its fallback path on the ordinary "zero recent activity" case (not just API failure), substituting content from `lib/mock-content.ts`, which is explicitly commented there as "PLACEHOLDER CONTENT — NOT PRODUCTION DATA."
- **Why it matters**: this is the exact failure mode every prior phase of this project explicitly and repeatedly prohibited — fabricated content appearing indistinguishable from real village history/activity. A brief backend hiccup (deploy, restart, network blip) makes the entire homepage — the site's primary surface — render fully-populated, plausible-looking fake content with absolutely no indication to the visitor, to a screenshot, or to Musaküçə itself that any of it is fabricated. For a site whose entire premise is being a trustworthy village memory archive, this is a direct integrity failure, not a cosmetic gap.
- **Recommended fix**: thread `isLive` out of every `withFallback()` call listed above and render `DataSourceNote` (or an equivalent site-wide banner) wherever it's currently discarded. Given the number of call sites, consider whether a layout-level or hook-level solution would be more robust than patching 15 individual components one at a time.
- **Code change required**: Yes — frontend only, no backend/schema changes.

---

## 2. P1 — Should fix before production

### P1-1. RBAC: Archivist can self-publish Memorial (Xatirə) records, contradicting the documented business rule

- **Location**: rule stated in `docs/MUSAKUCE_SPEC.md` (§13, "Only **Administrator or Editor** roles may approve and publish a memorial page. Archivist may draft/edit but not approve/publish."); actual grant in `backend/Musakuce.Api/Authorization/Permissions.cs` (Archivist's permission array includes `MemorialModerate`); enforcement point `backend/Musakuce.Api/Controllers/MemorialController.cs` (`UpdateStatus` gated by `[Authorize(Policy = Permissions.MemorialModerate)]` alone).
- **Problem**: the code grants Archivist the exact permission (`MemorialModerate`) that the status-change/publish endpoint requires, so an Archivist account can publish a memorial record directly — the documented approval boundary (Administrator/Editor sign-off required) is not actually enforced.
- **Why it matters**: memorial/obituary records are explicitly the most sensitivity-gated content type in this project's own design — family privacy and consent are the stated reason for requiring Administrator/Editor approval specifically. As written, an Archivist can bypass that gate entirely. This doesn't affect anonymous users, but it is a confirmed, direct contradiction between documented policy and actual enforcement for the content type where getting it wrong causes real harm to real families.
- **Recommended fix**: remove `MemorialModerate` from Archivist's permission set in `Permissions.cs`, or split memorial status-changes onto a distinct policy that only Administrator/Editor hold.
- **Code change required**: Yes — backend, one-line permission-table change (no migration needed, this is in-code role config).

### P1-2. No confirmation step on any destructive/irreversible admin action

- **Location**: `frontend/components/admin/PublicationStatusActions.tsx`, `frontend/components/admin/users/UserRow.tsx`, `frontend/components/admin/listings/ListingModerationActions.tsx`.
- **Problem**: publish, unpublish, archive/unarchive, listing approval, and user role-change/deactivate are all single-click actions with no `window.confirm`/modal step anywhere in the codebase (confirmed: no modal/dialog component exists at all in `frontend/components`).
- **Why it matters**: a moderator quickly reviewing a table on a phone (see mobile-UX findings below) can mis-tap and archive a published record or deactivate a colleague's account with zero recovery path beyond manually reversing it.
- **Recommended fix**: add a lightweight confirm step (even a simple native `confirm()` or a small inline "tap again to confirm" pattern) to at minimum: archive, role-change, and deactivate actions.
- **Code change required**: Yes — frontend only.

### P1-3. Backend validation failures are never surfaced to the admin user

- **Location**: every admin form's submit handler (`PhotoForm.tsx`, `PlaceForm.tsx`, `PersonForm.tsx`, `EventForm.tsx`, `ListingEditForm.tsx`, `VillageProfileForm.tsx`, and others) — all follow `catch { setStatus("error"); }` with a hardcoded generic "Yadda saxlamaq mümkün olmadı" message, discarding the actual `ApiError.detail` that `frontend/lib/api/client.ts` already captures.
- **Why it matters**: any server-side-only validation rule (e.g. `ListingValidators.cs`'s 10-image cap, `PersonValidators.cs`'s death-date-after-birth-date rule) fails with zero explanation of what to fix. Combined with P1-4 below, this makes some admin actions silently impossible to complete correctly.
- **Recommended fix**: surface `ApiError.detail`/`errors` in the error state shown to the user instead of (or alongside) the generic fallback message.
- **Code change required**: Yes — frontend only, `frontend/lib/api/client.ts` already has the data available.

### P1-4. Editor role gets a fully-interactive but non-functional listing-edit form

- **Location**: `backend/Musakuce.Api/Authorization/Permissions.cs`/`Roles.cs` (Editor has `ListingsView`+`ListingsModerate` but not `ListingsWrite`); `frontend/components/admin/listings/ListingModerationActions.tsx` (renders "Redaktə et" unconditionally, no permission check).
- **Why it matters**: an Editor can open `/admin/elanlar/[id]/redakte`, fill out the full form, and submit — the PUT then fails server-side (missing `ListingsWrite`) with only the generic message from P1-3. The UI never indicates the Editor lacks permission until after they've done the work.
- **Recommended fix**: either grant Editor `ListingsWrite`, or hide/disable the edit link for roles that lack it (mirroring how `AdminShell`'s nav already filters by permission).
- **Code change required**: Yes — frontend (and/or backend permission-table decision).

### P1-5. Events, Videos, and LocalInfo cover images bypass the entire media pipeline

- **Location**: `frontend/components/admin/events/EventForm.tsx` (plain `<Input type="url">` for `coverImageUrl`), and the equivalent in Video/LocalInfo forms; `backend/Musakuce.Application/Events/EventService.cs`, `Videos/VideoService.cs`, `LocalInfo/LocalInfoService.cs` (all construct `new MediaAsset { Url = request.CoverImageUrl }` directly with no upload).
- **Why it matters**: unlike every other content type (Photos, People, Places, Interviews, Education, Memorial, Cultural Heritage — all correctly use `ImageUploadField` → `MediaUploadService` → ImageSharp decode-validation → S3), these three modules accept an arbitrary admin-pasted URL with no MIME/size/decode validation and no actual storage of the file. Every edit also leaves the previous `MediaAsset` row permanently orphaned (these three services never call `DeleteIfUnreferencedAsync`, unlike the other seven).
- **Recommended fix**: migrate these three forms to `ImageUploadField`, matching the pattern already used everywhere else.
- **Code change required**: Yes — frontend forms + backend service methods for three modules.

### P1-6. No EXIF stripping on uploaded photos — potential GPS/location leak

- **Location**: `backend/Musakuce.Infrastructure/Media/ImageSharpProcessor.cs`.
- **Problem**: the image processor clones and resizes for `display`/`thumbnail` variants but never clears `image.Metadata.ExifProfile`/`IptcProfile`/`XmpProfile`. The `original` variant is stored byte-for-byte, EXIF intact.
- **Why it matters**: this is a village archive built substantially on community-submitted old family photos, plausibly taken on phones with embedded GPS coordinates. The media bucket is configured public-read (by design, for CDN-style serving) — any embedded location data in a published photo is exposed to anyone who has or guesses the object URL.
- **Recommended fix**: explicitly clear `image.Metadata.ExifProfile` (or at minimum the GPS-specific EXIF tags) before encoding the `display`/`thumbnail` variants; consider whether the `original` variant's public accessibility should be reconsidered separately.
- **Code change required**: Yes — backend, `ImageSharpProcessor.cs`.

### P1-7. No security headers configured in the Nginx production template

- **Location**: `infra/nginx/musakuce.conf.template`.
- **Problem**: no `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Strict-Transport-Security` header is set anywhere in the config.
- **Why it matters**: these are cheap, safe, standard hardening headers with essentially no functional downside (unlike a full CSP, which is riskier to get right blind). Their absence is a straightforward, low-effort gap to close before going live, especially given P0-1's XSS finding — `X-Frame-Options`/CSP-style protections are exactly the kind of defense-in-depth that would have reduced that finding's blast radius.
- **Recommended fix**: add at minimum `add_header X-Content-Type-Options nosniff;`, `add_header X-Frame-Options SAMEORIGIN;`, `add_header Referrer-Policy strict-origin-when-cross-origin;`, and (since Cloudflare Full-strict guarantees HTTPS) `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`.
- **Code change required**: Yes — infra only, `infra/nginx/musakuce.conf.template`.

### P1-8. Homepage and 8 other pages have no canonical URL or Open Graph tags

- **Location**: `frontend/app/page.tsx`, `app/videolar/page.tsx`, `app/fotoalbom/page.tsx`, `app/teqvim/page.tsx`, `app/insanlarimiz/page.tsx`, `app/tariximiz/page.tsx`, `app/elanlar/page.tsx`, `app/xerite/page.tsx`, `app/kendimiz/page.tsx`, `app/kendimizden/page.tsx`, `app/faydali-melumatlar/page.tsx`, `app/axtaris/page.tsx`.
- **Why it matters**: these pages use a bare hardcoded `metadata` object instead of `buildPageMetadata()` (which the 10 pages that already use it get canonical + full OG for free). Shared links to the homepage or any list page render as bare text on social/messaging platforms, and search engines have no canonical signal for query-string variants of these URLs.
- **Recommended fix**: switch these 9 pages to `buildPageMetadata()`, same as the pages that already use it correctly.
- **Code change required**: Yes — frontend only, mechanical change across 9 files.

### P1-9. `VillageEvent.PlaceId` delete behavior not explicitly configured

- **Location**: `backend/Musakuce.Infrastructure/Data/Configurations/VillageEventConfiguration.cs` / `PlaceConfiguration.cs`.
- **Problem**: unlike every other FK relationship in the schema (all explicitly configured with `SetNull`/`Cascade`/`Restrict`), `VillageEvent.PlaceId`'s delete behavior wasn't found explicitly set in either file — it's relying on EF Core's convention default, which was not directly confirmed.
- **Why it matters**: an unreviewed default delete behavior on a cross-content FK (deleting a Place could unexpectedly cascade into or block deletion of associated Events, depending on which convention applies) is exactly the kind of thing this project has otherwise been careful to configure explicitly everywhere else.
- **Recommended fix**: read the current behavior directly and explicitly configure it (almost certainly `SetNull`, matching every analogous optional-reference relationship in the schema).
- **Code change required**: Likely yes — backend, one `HasOne(...).OnDelete(DeleteBehavior.SetNull)` line, no migration needed if the convention default already happens to match (verify first).

### P1-10. Admin session cookie causes public pages to silently render unpublished content for logged-in admins, with no indicator

- **Location**: `frontend/lib/api/client.ts` (attaches `Authorization: Bearer` to every request, including public-page server-side fetches, whenever the admin session cookie is present).
- **Why it matters**: an admin who is logged into `/admin` and then browses the ordinary public site will see Draft/Archived content rendered exactly like published content, with no "you're previewing unpublished content" banner. This may be an intentional preview feature, but as found it's an unlabeled side effect, not a deliberate one — worth a deliberate decision either way rather than leaving it implicit.
- **Recommended fix**: either add a visible "you are viewing as staff — this may include unpublished content" indicator on public pages when this happens, or confirm this is accepted as-is.
- **Code change required**: Only if the decision is to add the indicator — otherwise this is a documentation/decision item, not a code change.

---

## 3. P2 — Recommended improvements

| # | Location | Finding |
|---|---|---|
| P2-1 | `frontend/components/admin/**Form.tsx` (all long forms) | No unsaved-changes warning before navigating away mid-edit. |
| P2-2 | `PersonForm.tsx`, `EventForm.tsx`, `LocalInfoForm.tsx`, `ListingEditForm.tsx` | Still use raw URL-paste instead of `ImageUploadField` (overlaps P1-5 for Events/LocalInfo; People/Elanlar are the additional two). |
| P2-3 | `frontend/components/admin/villageprofile/VillageProfileForm.tsx` | Single flat 20-field form, no sectioning, no sticky Save button — worst mobile scroll-to-save case in the admin panel. |
| P2-4 | `frontend/components/admin/users/CreateUserForm.tsx` | Password field only enforces `minLength=10` client-side; uppercase/digit requirements aren't checked until the generic server error (P1-3) fires. |
| P2-5 | `backend/Musakuce.Application/People/PersonService.cs`, `History/HistoricalEventService.cs` | List/paged endpoints return full `Biography`/`Description` text even though list views only render name/title — no separate summary DTO/projection. Not urgent at current page sizes (4-8 items). |
| P2-6 | `backend/Musakuce.Application/Media/MediaUploadService.cs` (`IsReferencedAsync`) | 8 sequential existence-check queries per media-delete attempt instead of one combined query. Admin-only path, low traffic. |
| P2-7 | `frontend/components/home/TodayInVillage.tsx`, `VillageSquare.tsx` | Both independently show the same 3 most-recent active listings in two different homepage blocks — content repetition for visitors, not a technical bug. |
| P2-8 | `frontend/app/globals.css` (`--color-ink-faint: #8a8072`) | The one color-token pairing (muted/meta text on cream background) worth a human contrast check before launch — used for real content (timestamps, captions), not purely decorative. |
| P2-9 | `backend/Musakuce.Infrastructure/Media/MediaStorageBootstrapper.cs` | Bucket policy is public-read by design; any leaked/scraped object key is fetchable forever with no revocation path short of changing the bucket policy or deleting the object. Accepted tradeoff, worth documenting explicitly in `docs/PRODUCTION_ENV.md` if not already. |
| P2-10 | `Configurations/PhotoConfiguration.cs`, `CommunitySubmissionConfiguration.cs`, `ClassifiedListingConfiguration.cs` | Required media FKs use `Cascade` delete — correct for app-level flows (pre-checked via `IsReferencedAsync`), but a direct manual DB delete of a `MediaAsset` row would silently cascade-delete the owning Photo/SubmissionFile/ListingImage row. Worth a one-line runbook warning, not a code change. |
| P2-11 | `frontend/app/admin/elanlar/[id]/page.tsx`, `app/admin/gonderisler/[id]/page.tsx`, `app/admin/fotoalbom/page.tsx` | 3 raw `<img>` tags instead of `next/image`/`VillagePhoto` — internal admin-only surface, low severity; two have empty `alt=""`. |
| P2-12 | `frontend/components/ui/VillagePhoto.tsx` | No `onError` fallback — a non-empty but 404ing `src` shows the browser's broken-image icon instead of `PhotoPlaceholder`. |
| P2-13 | `frontend/app/kendimizden/page.tsx` | Permanently mock content (`isLive={false}` hardcoded, no backing entity) — honestly labeled, but a product decision is needed on whether this ships in this phase or stays unlinked/hidden. |
| P2-14 | `backend/Musakuce.Infrastructure.csproj` | `AWSSDK.S3` 4.0.9.1 → 4.0.102.1 and `SixLabors.ImageSharp` 3.1.12 → 4.1.0 have newer versions available. The AWSSDK.S3 bump may also resolve the `AWSSDK.Core` low-severity advisory (P3-1) transitively — worth checking, not verified in this audit. |
| P2-15 | `frontend/app/xatire/page.tsx`, `medeniyyet/page.tsx`, `kendimizin-sesi/page.tsx`, `tehsil/page.tsx`, `axtaris/page.tsx` | Missing `loading.tsx` — inconsistent with the 9 list pages that already have one; shows a blank page instead of a skeleton during a slow server render. |

---

## 4. P3 — Future enhancements

| # | Location | Finding |
|---|---|---|
| P3-1 | `backend/*.csproj` (transitive `AWSSDK.Core` 4.0.1.3) | One known low-severity advisory (`GHSA-9cvc-h2w8-phrp`), unchanged since Phase 14, no direct fix without a breaking major version — reconfirmed still the only vulnerable package (`dotnet list package --vulnerable --include-transitive`). |
| P3-2 | `frontend/package.json` (devDependencies) | `eslint` 9→10, `typescript` 5→7, `@types/node` 20→26 have major updates available — dev tooling only, `npm audit` reports 0 vulnerabilities, no urgency. |
| P3-3 | `backend/Musakuce.Tests.csproj` | `coverlet.collector`, `xunit.runner.visualstudio`, `Microsoft.NET.Test.Sdk` have major version updates available — dev/test-only. |

---

## 5. Confirmed solid (no action needed)

Summarizing what every audit pass confirmed as correctly built, so this report isn't read as "everything is broken":

- **Auth**: JWT signing/validation, 12h expiry, login rate limiting (10/min/IP), account lockout (5 attempts/15min), login never reveals whether an email exists, logout/audit logging, CORS (explicit allow-list, no wildcard+credentials), password reset never logs the value, open-redirect protection on the login `?next=` param.
- **Authorization**: every write endpoint checked carries an explicit `[Authorize(Policy=...)]`; `AuthorizeElevatedViewAsync` consistently gates Draft/Archived content across all 12+ content controllers; anonymous requests never see unpublished content (aside from the P1-10 admin-session case).
- **Admin CMS**: mobile sidebar navigation (fixed in a prior phase, reconfirmed still correct); tables scroll horizontally instead of breaking layout; status-wording is consistent across all modules; permission-based nav filtering is correct; error/empty states present across every module spot-checked.
- **Public site**: navigation/footer/CTA links all resolve; 404 page is clean and non-leaky; all detail pages correctly call `notFound()` on a real 404; search, map, and weather all degrade gracefully with no fabricated data and no leaked keys.
- **SEO**: sitemap and robots.txt are both correctly scoped (Published-only, `/admin/`+`/api/` disallowed); admin section has a real `robots: {index:false}` (not just a robots.txt disallow); no duplicate metadata; no page missing metadata entirely.
- **Media/Security**: no path traversal (storage keys are 100% server-generated, never derived from user-supplied filenames); no SQL injection (zero raw-SQL usage anywhere, all EF Core LINQ); no SSRF (embed URLs are only ever rendered client-side, `next/image` remotePatterns are explicitly scoped, never wildcarded); MIME validation is real (byte-level decode via ImageSharp, not header-trusting); size limits enforced independently at both the API and Nginx layers; `GlobalExceptionHandler` still doesn't leak stack traces/connection details.
- **Database**: no hard-delete anywhere in content services (status-based archive model throughout); every content entity defaults to `Draft`; `PublicationStatus` and all frequently-queried columns are indexed (including hand-verified `pg_trgm` search indexes); `RelatedPersonId` relationships correctly `SetNull` rather than cascade; migrations are sequential and sane; no seed/test data beyond the documented dev-admin seeder.
- **Docker/Nginx**: `docker-compose.prod.yml` unchanged from its audited Phase 15 state — no ports published for postgres/api/frontend, only nginx 80/443; both production Dockerfiles still build cleanly and run as non-root; the previously-found-and-fixed Nginx `proxy_pass` URI bug is still fixed, not regressed.
- **Performance**: no N+1 query patterns found anywhere in the Application layer; all pagination is SQL-level (`.Skip()`/`.Take()`, not fetch-then-slice); homepage's `HOMEPAGE_REVALIDATE_SECONDS` caching is applied consistently across all 11 fetching components; Leaflet map is correctly `next/dynamic`-loaded client-only; no raw `<img>` tags on the public site (only 3, admin-only); client bundle has no heavy/duplicate dependencies.
- **Accessibility**: global `:focus-visible` styling with no un-replaced `outline:none`; every icon-only control has `aria-label`; form errors use `role="alert"`; the prior phase's H1 fix across 16 pages is confirmed still in place, not regressed; no `<div onClick>` anti-pattern anywhere.
- **Verification suite**: `dotnet build` (0 errors), `dotnet test` (43/43 passing), `npm run lint` (0 errors, 1 pre-existing unrelated warning), `npm run build` (succeeds), both production Docker images (`backend/Dockerfile`, `frontend/Dockerfile`) build successfully, `npm audit` reports 0 vulnerabilities.

**Note on browser testing**: no real browser/E2E tool was available or used in this audit. All frontend findings above come from static code inspection (component logic, Tailwind classes, React/Next.js patterns) — not from actually loading pages in a browser. This is stated explicitly per instruction rather than fabricating browser-verified claims.

---

## 6. Summary

| Priority | Count |
|---|---|
| P0 | 2 |
| P1 | 10 |
| P2 | 15 |
| P3 | 3 |

## PRODUCTION READINESS: **NOT READY**

Two P0 findings — a concretely exploitable stored-XSS path reachable by anonymous users, and a site-wide content-integrity failure where fabricated data can render as real with no indication during any backend hiccup — must be resolved first. Both are frontend-only fixes of bounded scope (one shared JSON-LD escaping helper; wiring an existing, already-built `DataSourceNote` component into the ~15 places it's currently missing), not architectural rework. The ten P1 findings should also be addressed before real content and real users are on the site, particularly the RBAC gap on Memorial records given how sensitive that content type is by the project's own design.
