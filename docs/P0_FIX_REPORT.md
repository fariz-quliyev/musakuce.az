# P0 Fix Report — Musaküçə.az

**Date**: 2026-08-14. **Scope**: the two P0 findings from
[`docs/FINAL_PRE_DEPLOYMENT_AUDIT.md`](FINAL_PRE_DEPLOYMENT_AUDIT.md) only
(P0-1, P0-2). No P1/P2/P3 items were touched. No infrastructure, database
schema, or backend code was modified. Nothing was committed or deployed as
part of this work — see [`git diff`](#8-scope-confirmation) confirmation at
the end of this report.

---

## 1. P0-1 — Stored XSS via unescaped JSON-LD

### Root cause

Every `<script type="application/ld+json">` block in the app rendered its
payload via `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`.
`<script>` content is parsed by the HTML tokenizer as raw text up to the
first literal `</script` sequence (case-insensitive), independent of JSON
syntax. `JSON.stringify` does not escape `<`, so any DB-sourced string
reaching one of these payloads (a listing title, a memorial name, a
breadcrumb label, …) containing `</script><script>alert(1)</script>`
closes the legitimate tag early and injects real, executing markup.
`POST /api/listings` is `[AllowAnonymous]` and `ListingValidators.cs` only
enforces length limits — no HTML/script sanitization — so this was
reachable by an anonymous, unauthenticated submitter.

### Affected files (all 7 JSON-LD call sites in the app — not only the 6
the audit named; `app/layout.tsx`'s site-wide `websiteJsonLd()` block was
included too, per the instruction to fix every block consistently)

- `frontend/lib/structuredData.ts` — fix lives here (new `jsonLdScript` helper)
- `frontend/app/layout.tsx`
- `frontend/app/elanlar/[id]/page.tsx`
- `frontend/app/xatire/[id]/page.tsx`
- `frontend/app/medeniyyet/[id]/page.tsx`
- `frontend/app/teqvim/[id]/page.tsx`
- `frontend/app/tehsil/[id]/page.tsx`
- `frontend/app/kendimizin-sesi/[id]/page.tsx`

A repo-wide search for `application/ld+json` and `JSON.stringify(` confirmed
these are the only 7 script tags in the codebase — the only other
`JSON.stringify` calls in the app are unrelated `fetch` request bodies
(`lib/api/client.ts`, `app/api/auth/login/route.ts`, `app/admin/login/page.tsx`),
which are not `<script>` content and were correctly left untouched.

### Exact fix

Added one shared serialization helper to `frontend/lib/structuredData.ts`
— the module every JSON-LD call site already imports from — and pointed
every call site at it instead of raw `JSON.stringify`:

```ts
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
```

This escapes `<`, `>`, and `&` to their `\uXXXX` JSON-string-escape form.
Since `<script>` content is never HTML-entity-decoded, the emitted markup
contains zero literal angle brackets — `</script>` cannot appear in the
DOM output, no matter what the underlying string contains. Because these
are ordinary JSON string escapes (not stripped or altered characters),
`JSON.parse` (and every real schema.org/JSON-LD consumer, including
crawlers) decodes `<` back to `<` losslessly — the JSON-LD payload's
semantics and structure are completely unchanged. Each of the 7 call sites
was changed from `JSON.stringify(x)` to `jsonLdScript(x)`; no other logic
in those files was touched, and no stored data or database content was
altered. This is a serialization/output-boundary fix only — legitimate
user text (Azerbaijani names, quoted phrases, `&`) is preserved verbatim
after the round-trip, not globally sanitized or stripped anywhere else in
the app.

### Regression tests

New file: `frontend/lib/structuredData.test.ts` (Node's built-in
`node:test` runner — see §7 for why no new test framework dependency was
added). 8 tests, all passing:

1. `jsonLdScript` output contains no literal `<` or `>` for the payload
   `</script><script>alert(1)</script>`.
2. The exact attack is simulated end-to-end: the escaped output is
   embedded in a real `<script type="application/ld+json">…</script>`
   fragment, then scanned the way an HTML tokenizer would (first
   case-insensitive `</script` match). Asserts that match is the genuine
   closing tag, never anything from the payload.
3. `JSON.parse(jsonLdScript(x))` round-trips back to the exact original
   (unescaped) string — proves semantics are preserved, not corrupted.
4. Ordinary Azerbaijani text with punctuation and `&` survives the
   round-trip unchanged — proves this is not a global sanitizer.
5–6. The same breakout-sequence check run against real `breadcrumbJsonLd`
   and `articleJsonLd` payloads (not just a bare object), mirroring actual
   page usage.
7. A real, unmodified `websiteJsonLd()` payload still produces valid,
   parseable JSON — no false-positive breakage on ordinary data.
8. A control test using the **old**, unfixed `JSON.stringify` directly on
   the same payload — asserts the attacker's `</script>` *is* reachable
   before the real closing tag, documenting the exact vulnerability this
   fix closes.

---

## 2. P0-2 — Mock/fallback content integrity

### Root cause

`withFallback()` (`frontend/lib/api/withFallback.ts`) returns
`{ data, isLive }`, but a majority of consumers discarded `isLive` and
never rendered `<DataSourceNote>`. Two distinct failure patterns were
found across the 24 `withFallback()` call sites audited (every one was
read in full, not just the 6 pages the original audit named):

1. **Fabricated content shown with no indicator.** Several homepage
   sections fetch data with a *non-empty* fallback (real-looking mock
   population/area figures, a mock village bulletin) but never rendered
   `DataSourceNote`, so a backend outage silently produced a fully
   populated, plausible-looking homepage with zero indication anything
   was fake.
2. **A live-but-genuinely-empty result was miscategorized as a failure.**
   `TodayInVillage.tsx` explicitly `throw`s when a *successful* API call
   returns zero recent items, which `withFallback`'s `catch` then treats
   identically to a real network/API failure — swapping in the mock
   bulletin with `isLive: false`, but the component never used that flag
   for anything. A real "nothing happened today yet" result and a real
   backend outage were indistinguishable to the reader.

Components whose fallback arrays are empty (`FALLBACK_X: T[] = []`) and
that already `return null`/hide when empty (`OurHistory`, `OurPeople`,
`TodayPhotos`, `VillageVoices`, `ThisWeek`, `MapPreview`, `VillageSquare`)
were verified and are **not** bugs: on failure they render nothing at all,
so there is no fabricated content on screen to mislabel — this matches the
stated rule exactly ("if fallback/mock data is displayed, DataSourceNote
must be visible"; nothing displayed needs no note). `videolar`,
`fotoalbom`, `insanlarimiz`, `tariximiz`, `faydali-melumatlar`, and
`kendimiz` were also verified already-correct (each already renders
`<DataSourceNote isLive={isLive} />`). `kendimizden/page.tsx` was verified
as already-honest: it hardcodes `isLive={false}` because it has no backing
entity yet (a documented P2 content gap, not a P0 mislabeling bug — it
never claims to be live).

### Affected files

**Homepage sections** (`frontend/components/home/`):

| File | Problem | Fix |
|---|---|---|
| `TodayInVillage.tsx` | Threw on a live-but-empty result, masking it as an outage; never rendered `DataSourceNote` even when the mock bulletin was shown | Stopped throwing on empty (now returns `[]` as genuine live data, which hides the section — matching every other homepage section's established empty-state pattern); added `<DataSourceNote isLive={isLive} />` |
| `VillageFacts.tsx` | Renders real-looking population/area figures from `VILLAGE_PROFILE_FALLBACK` with no indicator on failure | Destructured `isLive`; added `<DataSourceNote isLive={isLive} />` |
| `VillageIntro.tsx` | Same fallback profile, renders description text unindicated | Same fix |
| `VillageTodayStrip.tsx` | 3 independent `withFallback` calls (listings/events/photos totals), each discarded `isLive`; the strip always renders, merging all three into one line | Combined `isLive = listingsLive && eventsLive && photosLive`; added `<DataSourceNote isLive={isLive} />` |

**List pages using a client "Browser" subcomponent** — the audit's 4 named
pages. `elanlar`, `teqvim`, and `xerite` were checked and found **already
correct** (their `ListingsBrowser`/`EventsBrowser`/`XeriteMapView` client
components already thread `initialIsLive` through and render
`DataSourceNote`); `xatire` and `medeniyyet` were missing the same wiring
their sibling pages already had:

| File | Fix |
|---|---|
| `components/memorial/MemorialBrowser.tsx` | Added `initialIsLive` prop, `isLive` state (mirrors `ListingsBrowser`'s existing pattern exactly), `<DataSourceNote isLive={isLive} />` |
| `app/xatire/page.tsx` | Destructured `isLive`; passed `initialIsLive={isLive}` to `MemorialBrowser` |
| `components/culturalHeritage/CulturalHeritageBrowser.tsx` | Same pattern as `MemorialBrowser` |
| `app/medeniyyet/page.tsx` | Same pattern as `xatire/page.tsx` |

**Plain server-rendered list pages** (no client subcomponent):

| File | Fix |
|---|---|
| `app/kendimizin-sesi/page.tsx` | Destructured `isLive`; added `<DataSourceNote isLive={isLive} />` |
| `app/tehsil/page.tsx` | 3 independent sources (education entries, related photos, related videos) each discarded `isLive`; combined `isLive = entriesLive && photosLive && videosLive`; added `<DataSourceNote isLive={isLive} />` |

### Multi-source pages and nested-section verification

Per the instruction to check pages with multiple API sources and verify
nested sections can't independently show fallback content while a parent
stays unaware: `VillageTodayStrip` (3 sources) and `tehsil` (3 sources)
both now compute one combined `isLive` (logical AND across every source
feeding what's rendered) rather than reporting only one source's status.

On "nested homepage sections": this app's homepage (`app/page.tsx`) is a
list of independently-rendered async Server Components — there is no
shared parent state for the page to read each section's fetch result
from, and introducing one would be an architectural change (a shared
data-fetching boundary for the whole homepage) well beyond a P0 fix's
scope. The verification performed instead was exhaustive per-section
review: every one of the 11 homepage sections that calls `withFallback`
was read in full and confirmed to now either (a) render `DataSourceNote`
itself whenever it shows fallback-derived content, or (b) render nothing
at all when its fallback is empty — so no section can show fabricated
content to the reader without a note appearing at that section's own
position on the page.

### Testing performed

Verified by code review for all 24 `withFallback()` consumers (not just
those where a fix was needed) against the 5 required scenarios:

1. **API live + real data** — unaffected by any change; `isLive: true`,
   `DataSourceNote` renders nothing (`components/layout/DataSourceNote.tsx`
   returns `null` when `isLive`).
2. **API live + zero records** — `TodayInVillage` no longer misclassifies
   this as scenario 3; every list page's existing `EmptyState` continues
   to render with no note (correct — a real empty result needs none).
3. **API unavailable** — every consumer identified as broken now shows
   `DataSourceNote` alongside whatever fallback content it renders.
4. **Multiple API sources, one fails** — `VillageTodayStrip` and `tehsil`
   now use a combined `isLive`; a single failed source among several
   correctly marks the whole merged view as non-live.
5. **Homepage with API unavailable** — every homepage section that can
   show non-empty fallback content (`VillageIntro`, `VillageFacts`,
   `VillageTodayStrip`, `TodayInVillage`) now surfaces its own
   `DataSourceNote`; sections with empty fallbacks correctly render
   nothing, as before.

No dedicated automated test was added for P0-2 (unlike P0-1, which had an
explicit "add regression tests" instruction with a concrete payload to
verify). The fix is prop-threading and conditional-rendering across
Next.js Server/Client Components with no existing component-test harness
in this repo (see §7) — each change was verified by full manual code
review of the resulting render logic against all 5 scenarios above, and by
`npm run build`, which exercises every route's server-side render path at
build time and would fail on a type/reference error in any of the changed
files (it did, twice, during this work — see §6).

---

## 3. Files changed (complete list)

```
frontend/lib/structuredData.ts                             (P0-1 fix + helper)
frontend/lib/structuredData.test.ts                         (P0-1 regression tests, new file)
frontend/app/layout.tsx                                     (P0-1)
frontend/app/elanlar/[id]/page.tsx                          (P0-1)
frontend/app/xatire/[id]/page.tsx                           (P0-1)
frontend/app/medeniyyet/[id]/page.tsx                       (P0-1)
frontend/app/teqvim/[id]/page.tsx                           (P0-1)
frontend/app/tehsil/[id]/page.tsx                           (P0-1)
frontend/app/kendimizin-sesi/[id]/page.tsx                  (P0-1)
frontend/components/home/TodayInVillage.tsx                 (P0-2)
frontend/components/home/VillageFacts.tsx                   (P0-2)
frontend/components/home/VillageIntro.tsx                   (P0-2)
frontend/components/home/VillageTodayStrip.tsx              (P0-2)
frontend/components/memorial/MemorialBrowser.tsx            (P0-2)
frontend/app/xatire/page.tsx                                (P0-2)
frontend/components/culturalHeritage/CulturalHeritageBrowser.tsx (P0-2)
frontend/app/medeniyyet/page.tsx                             (P0-2)
frontend/app/kendimizin-sesi/page.tsx                        (P0-2)
frontend/app/tehsil/page.tsx                                 (P0-2)
frontend/package.json                                        (test infra only — see §7)
frontend/tsconfig.json                                       (test infra only — see §7)
```

20 modified files, 1 new file. No file outside `frontend/` was touched.

---

## 4. Verification results

| Command | Result |
|---|---|
| `dotnet build` (backend) | ✅ Build succeeded, 0 errors. Same pre-existing `AWSSDK.Core` low-severity advisory warning as before (unrelated, not introduced by this work) |
| `dotnet test` (backend) | ✅ 43/43 passed, 0 failed — backend was not touched, run as a safety net |
| `npm run lint` (frontend) | ✅ 0 errors. Same single pre-existing warning as before (`lib/api/client.ts`, `window.location.href` navigation — unrelated, pre-existing) |
| `npm run build` (frontend) | ✅ Compiled successfully, TypeScript check passed, all 56 routes generated |
| `npm test` / `node --test` (new) | ✅ 8/8 passed — the P0-1 regression suite |

Two build errors surfaced and were fixed *during* this work (not
pre-existing, introduced by an incomplete first pass on my part): `
VillageFacts.tsx` and `VillageIntro.tsx` initially referenced `isLive`
in JSX before it was destructured from their `withFallback()` calls.
`npm run build`'s TypeScript check caught both immediately; both were
corrected before the final verification run above.

---

## 5. Test-infrastructure note (`package.json` / `tsconfig.json`)

This repo had no frontend test runner at all (no Jest/Vitest, no
`*.test.*` files) before this work, and adding regression tests for P0-1
was an explicit, non-optional requirement. Rather than introduce a new
dependency (Vitest/Jest) — a heavier footprint than a P0 fix warrants —
this used Node 24's built-in `node:test` runner with its native TypeScript
support (confirmed working: Node executes `.ts` files with type-stripping
without any flag or new dependency). Two small, test-only additions were
needed to make this work cleanly:

- `frontend/package.json`: added a `"test": "node --test --experimental-strip-types \"**/*.test.ts\""` script — no new dependency, just makes the new tests discoverable/runnable the normal way.
- `frontend/tsconfig.json`: added `**/*.test.ts` to `"exclude"` — Node's
  ESM loader requires the explicit `.ts` extension in the test file's
  relative import (`from "./structuredData.ts"`), which TypeScript's
  `tsc`/Next's build-time type-checker rejects by default
  (`allowImportingTsExtensions` is off). Excluding test files from the
  app's type-check surface is the standard way to resolve this without
  loosening any compiler option for real application code — confirmed
  `npx tsc --noEmit` is clean both with the test file present and without
  it, and `npm run build` (which runs the same check) passes.

Neither change affects application behavior, runtime, or the production
bundle — both are build/test-tooling only.

---

## 6. Confirmation: no P1/P2/P3 changes were made

Explicitly **not** touched, despite being visible while reading the
audit/codebase for this work:

- P1-1 (Archivist RBAC on Memorial) — backend permission table, untouched.
- P1-2 (no confirm step on destructive admin actions) — untouched.
- P1-3 (backend validation errors not surfaced) — untouched.
- P1-4 (Editor sees non-functional listing edit form) — untouched.
- P1-5 (Events/Videos/LocalInfo bypass media pipeline) — untouched.
- P1-6 (no EXIF stripping) — untouched.
- P1-7 (missing Nginx security headers) — untouched (infra, explicitly out of scope).
- P1-8 (missing canonical/OG on 9 pages) — untouched.
- P1-9 (`VillageEvent.PlaceId` delete behavior) — untouched (schema, explicitly out of scope).
- P1-10 (admin session previews unpublished content) — untouched.
- All 15 P2 items and all 3 P3 items — untouched.

No database migration was created or modified. No `docker-compose*.yml`,
Nginx config, or Dockerfile was touched. No backend (`.cs`) file was
touched — `dotnet build`/`dotnet test` were run only as a safety net to
confirm the backend is genuinely unaffected, which it is.

---

## 7. Scope confirmation

`git diff --stat` against the Phase 15 checkpoint commit (`4fa1fa8`) shows
exactly 20 modified files and 1 new file, all under `frontend/`, totaling
104 insertions and 31 deletions — consistent with the fix descriptions
above and nothing else. Full file list reproduced in §3.

**Not committed. Not deployed.** Per instruction, the working tree is left
as-is for review; the checkpoint commit `4fa1fa8` ("Phase 15:
production-ready baseline") remains the last commit on `main`.
