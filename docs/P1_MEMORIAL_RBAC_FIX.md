# P1 Fix Report — Memorial (Xatirə) Moderation Permission

**Date**: 2026-08-14. **Scope**: the single P1-1 finding from
[`docs/FINAL_PRE_DEPLOYMENT_AUDIT.md`](FINAL_PRE_DEPLOYMENT_AUDIT.md)
only. No other P1 item, no P2/P3 item, no database schema change, no
infrastructure change. Nothing was committed or deployed as part of this
work — see [`git diff --stat`](#6-scope-confirmation) at the end.

---

## 1. Root cause

`docs/MUSAKUCE_SPEC.md` §13 states the editorial rule explicitly:

> Only **Administrator or Editor** roles may approve and publish a
> memorial page. Archivist may draft/edit but not approve/publish.

The code did not enforce this. `backend/Musakuce.Api/Authorization/Permissions.cs`
grants each role a flat list of permission strings, resolved purely from
JWT role claims with no per-record ownership/state check
(`PermissionAuthorizationHandler.cs`). The Archivist role's list included
`Permissions.MemorialModerate` — the exact permission
`MemorialController.UpdateStatus` (`PATCH /api/memorial/{id}/status`,
publish/unpublish/archive) requires via
`[Authorize(Policy = Permissions.MemorialModerate)]`. An Archivist account
could therefore call that endpoint directly and publish, unpublish, or
archive a memorial record on their own — bypassing the Administrator/Editor
approval step the spec requires for this content type specifically (memorial
records are singled out in the spec for tighter control than every other
archival content type, because of family privacy/consent).

This was a genuine authorization-policy misconfiguration, not a missing
feature — every plumbing piece (the `MemorialModerate` permission
constant, its policy registration, the controller's `[Authorize]`
attribute) already existed and worked correctly; the role→permission
*mapping* was simply wrong for one role on one permission.

## 2. Previous permission mapping

| Role | `memorial.view` | `memorial.write` | `memorial.moderate` |
|---|---|---|---|
| Administrator | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ |
| **Archivist** | ✅ | ✅ | **✅ (incorrect)** |
| Moderator | ❌ | ❌ | ❌ |
| Anonymous | published-only (via `AuthorizeElevatedViewAsync`) | ❌ | ❌ |

## 3. Corrected permission mapping

| Role | `memorial.view` | `memorial.write` | `memorial.moderate` |
|---|---|---|---|
| Administrator | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ |
| **Archivist** | ✅ | ✅ | **❌ (removed)** |
| Moderator | ❌ | ❌ | ❌ |
| Anonymous | published-only | ❌ | ❌ |

Only `MemorialModerate` was removed from Archivist's permission list.
`MemorialView` and `MemorialWrite` were deliberately kept — the spec
explicitly says Archivist "may draft/edit," and `MemorialWrite` is what
gates both `POST /api/memorial` (create) and `PUT /api/memorial/{id}`
(full edit, per `MemorialController.cs`'s own doc comment: "ADMIN-PRIVILEGED
— full field edit"). Removing it would have taken away a legitimate,
spec-granted capability, which the task explicitly required preserving.

Every other role's permission set, and every other content module's
permissions for Archivist (People, History, Photos, Videos, Places,
Cultural Heritage, Interviews, Education, Submissions, MediaUpload), are
byte-for-byte unchanged.

## 4. Backend authorization changes

**File**: `backend/Musakuce.Api/Authorization/Permissions.cs`

One line removed from the `Archivist` entry in `Roles.Permissions`:
`Authorization.Permissions.MemorialModerate` is no longer in the array
(a comment was added explaining why, citing spec §13 and this audit
finding). No other file needed a code change to enforce this:

- `Program.cs` registers one ASP.NET Core authorization policy per
  `Permissions.All` constant automatically (`foreach (var permission in
  Permissions.All) options.AddPolicy(...)`) — the policy itself, and
  `MemorialController`'s `[Authorize(Policy = Permissions.MemorialModerate)]`
  attribute on `UpdateStatus`, were already correct; only the role→permission
  *mapping* was wrong.
- `PermissionAuthorizationHandler` resolves permissions purely from
  `Roles.Permissions` at request time (no caching beyond the JWT's role
  claims), so this single-line change takes effect for every new login
  immediately — no migration, no cache to bust.

**Verified there is no bypass through the `PUT`/update endpoint** (an
explicit requirement of this task): `UpdateMemorialRecordRequest`
(`backend/Musakuce.Application/Memorial/MemorialDtos.cs`) is declared as
`public class UpdateMemorialRecordRequest : CreateMemorialRecordRequest;`
— it has **no `PublicationStatus` property at all**. `MemorialRecordService.UpdateAsync`
never touches `record.PublicationStatus`; only `UpdateStatusAsync` (gated
separately by `MemorialModerate`) does. This means an Archivist sending a
`PUT` body that includes an extra `"publicationStatus": "Published"` field
has that field silently ignored by model binding (the property doesn't
exist on the target type) — this is a schema-level guarantee, not just a
policy one, and is covered by a dedicated regression test (see §5).

**No database schema change was made or needed** — this is purely an
in-code role/permission table entry, exactly as the task required
("prefer using the existing permission system").

## 5. Frontend changes

Two files, UX only — **the backend independently re-enforces this rule
regardless of what the admin UI renders**; nothing here is a security
boundary.

- **`frontend/components/admin/memorial/MemorialRowActions.tsx`** — now
  takes a `canModerate: boolean` prop and renders nothing (no
  publish/unpublish/archive buttons) when `false`, instead of always
  rendering `PublicationStatusActions`. A doc comment states explicitly
  that this is UX only and cites where the real enforcement lives.
- **`frontend/app/admin/xatire/page.tsx`** — the one place `MemorialRowActions`
  is rendered (the Xatirə admin list table). Now calls `authApi.me()`
  once per page load (server-side, using the existing cookie/bearer
  forwarding already in `lib/api/client.ts` — the same mechanism
  `AdminShell.tsx`'s nav filtering already relies on client-side) and
  computes `canModerate = user?.permissions.includes("memorial.moderate") ?? false`,
  passed down as a prop.

The "Redaktə" (edit) link on that same page was **not** touched — it
stays visible to Archivist, correctly, since `MemorialWrite` (edit
access) was not removed. `MemorialForm.tsx` (the create/edit form) has no
publish control of its own to gate — publish/unpublish/archive only ever
happens through `MemorialRowActions`, so no other frontend file needed a
change.

## 6. Tests

New file: `backend/Musakuce.Tests/MemorialRbacTests.cs`, 10 tests, all
covering the 8 required scenarios:

| # | Scenario | Test(s) |
|---|---|---|
| 1 | Anonymous → denied write | `Anonymous_cannot_create_edit_or_moderate_memorial_records` (POST/PUT/PATCH-status all `401`) |
| 2 | Moderator → denied Memorial write/moderation | `Moderator_cannot_create_edit_or_moderate_memorial_records` (POST/PUT/PATCH-status all `403`) |
| 3 | Archivist → denied moderation/publish | `Archivist_cannot_change_memorial_publication_status`, `Archivist_cannot_unpublish_or_archive_a_published_memorial_record` (`403` on publish/unpublish/archive, **and** the record is re-fetched afterward to prove its status genuinely didn't change), `Archivist_cannot_bypass_the_moderation_gate_through_the_update_endpoint` (the PUT-with-extra-field bypass attempt from §4, proven ineffective) |
| 4 | Archivist → allowed operations remain allowed | `Archivist_can_still_create_edit_and_view_draft_memorial_records` (create `201`, edit `200`, view-own-draft `200`, appears in own Draft list) |
| 5 | Editor → allowed create/edit/publish | `Editor_can_create_edit_and_publish_memorial_records` (create/edit/publish/unpublish all succeed) |
| 6 | Administrator → allowed all | `Administrator_can_create_edit_publish_and_archive_memorial_records` |
| 7 | Public anonymous GET → published only | `Anonymous_can_read_only_published_memorial_records` (absent from public list pre-publish, present after) |
| 8 | Draft/Archived → protected from unauthorized elevated access | `Draft_memorial_records_are_protected_from_unauthorized_elevated_access` (anonymous elevated request → `401`; safe-default `GetById` on a Draft → `404`, not a leak; authenticated-but-unpermitted Moderator → `403` for both Draft and Archived; Administrator retains legitimate access) |

**Test-infrastructure note**: the first draft of this file logged in via
`_factory.AsRoleAsync(...)` once per assertion (as `RoleAuthorizationTests.cs`
does), which caused every test to fail with `429 Too Many Requests` —
`Program.cs` rate-limits `/api/auth/login` to 10/min, and every
`WebApplicationFactory` TestServer request shares one `"unknown"` IP
partition, so ~13–32 logins across this file's facts exceeded it. Fixed
by introducing `MemorialRbacFixture` (`IAsyncLifetime`, used via
`IClassFixture<MemorialRbacFixture>`), which logs in all four roles
**exactly once for the whole test class** — xUnit constructs a class
fixture once regardless of fact count, unlike `IAsyncLifetime` on the
test class itself (which runs per test instance, i.e. per `[Fact]`). This
reduced the file to exactly 4 logins total. This is test-infrastructure
only; no application/authorization behavior was affected by this fix.

**Existing tests re-verified, none needed changes**: `RoleAuthorizationTests.cs`'s
`Editor_can_create_events_people_and_places` (POST memorial → `201`) and
`Moderator_cannot_write_people_places_or_phase12_content_types` (POST
memorial → `403`) both still pass unchanged, since neither exercises
Archivist against the moderate endpoint.
`PublicDataBoundaryTests.cs`'s `A_newly_created_memorial_record_defaults_to_draft_and_is_invisible_to_the_public`
(uses Administrator to publish) also still passes unchanged — it already
covered scenarios 7/8 at a general level; `MemorialRbacTests.cs` adds the
role-specific depth (Archivist/Moderator denial, Editor/Administrator
permitted) that file didn't have.

## 7. Verification results

| Command | Result |
|---|---|
| `dotnet build` | ✅ Build succeeded, 0 errors. Same pre-existing `AWSSDK.Core` low-severity advisory warning as before (unrelated) |
| `dotnet test` | ✅ **53/53 passed** (43 pre-existing + 10 new `MemorialRbacTests`), 0 failed |
| `npm run lint` | ✅ 0 errors. Same single pre-existing warning as before (`lib/api/client.ts`, unrelated) |
| `npm run build` | ✅ Compiled successfully, TypeScript check passed, all routes generated including `/admin/xatire` |

## 8. Confirmation: no other P1/P2/P3 item was touched

Explicitly **not** touched: P0-1, P0-2 (already fixed and committed in a
prior checkpoint), and every other P1 (P1-2 through P1-10), all 15 P2
items, all 3 P3 items from the audit. No `.cs` file outside
`Permissions.cs` (and the new test file) was modified. No migration was
created. No `docker-compose*.yml`, Nginx config, or Dockerfile was
touched.

## 9. Scope confirmation

```
 M backend/Musakuce.Api/Authorization/Permissions.cs
 M frontend/app/admin/xatire/page.tsx
 M frontend/components/admin/memorial/MemorialRowActions.tsx
?? backend/Musakuce.Tests/MemorialRbacTests.cs
```

4 files touched (1 backend permission table, 2 frontend admin-UI files,
1 new backend test file) — exactly the surface this fix required. Full
`git diff --stat` output reproduced in the final chat message for this
task, per instruction.

**Not committed. Not deployed.** The working tree is left as-is for
review; the checkpoint commit `ed431b0` ("Security: fix P0 XSS and
fallback integrity") remains the last commit on `main`.
