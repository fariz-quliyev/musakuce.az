# Musaküçə Content Inventory (Phase 16)

**Status: editorial planning document only.** Nothing described here has
been entered into PostgreSQL, published, or seeded. This is a mapping
exercise: every concrete fact found in the two source documents currently
in this repository, matched against the existing Admin CMS modules and
their real fields (verified by reading the actual entity/enum
definitions in `backend/Musakuce.Domain`, not guessed from the spec
prose).

## Source material actually available

Two documents exist in `docs/`, and **only these two** were used:

1. `docs/Musakuce.az_Yenilenmis_Icra_Plani_ve_Texniki_Tapsiriq.docx` — the
   original Azerbaijani project brief. Mostly describes *what the
   website should do* (sections, design philosophy, tech stack), not
   village history — but does contain a handful of real facts (§5 of
   that document).
2. `docs/MUSAKUCE_SPEC.md` — the living product specification. Mostly
   elaborates the same brief into feature/schema requirements, and
   repeats the same handful of real facts (§7, §14 "example timeline",
   §17, §18) without adding new ones.

**No other source document exists in this repository or was provided in
this conversation.** A user clarification confirmed this explicitly this
phase: proceed with only what's in these two files, and mark everything
else `"Source not yet provided"` rather than inventing content. This is
the single most important fact about this inventory: **the two source
documents describe the *shape* of Musaküçə's content (what categories of
people, what kinds of historical events, what memorial types) far more
than they supply actual instances of that content.** There are, for
example, zero named individuals anywhere in either document — not one
teacher, martyr, scientist, or graduate is named. `Fayəddin Xancanov`
appears exactly once, as the name the village secondary school carries,
with no biographical information attached.

Every concrete factual claim found is listed below, in full — this
inventory does not summarize or select from a larger pool; what's below
**is** the complete set of real facts available.

---

## A. Kəndimiz (VillageProfile)

One singleton record. Field-by-field mapping against every source fact
found:

| VillageProfile field | Source value | SourceStatus | Notes |
|---|---|---|---|
| `VillageName` | Musaküçə | — (not applicable, it's the identifier) | |
| `ShortDescription` | Not supplied verbatim — both documents describe the *kind* of tone this text should have ("warm, modern, accessible digital home...") but no ready-to-publish 1–2 sentence description exists in the source | — | **Source not yet provided** as publishable copy — needs to be drafted by an editor from the facts here, not invented as if it were sourced |
| `Population` | 3 922 | `LocalResearch` | Numerical value not to be altered (per instruction) |
| `PopulationAsOfYear` | Not given | — | **Source not yet provided** — the source states the figure but not the year it was measured |
| `AreaHectares` | 905.23 (905,23 ha) | `LocalResearch` | Numerical value not to be altered |
| `GeographicalDescription` | Düzənlik, Talış dağlarının ətəyi (plain, foothills of the Talish mountains) | `LocalResearch` | |
| `MainOccupations` | Heyvandarlıq, əkinçilik, qismən həsirçilik (animal husbandry, farming, partially reed/mat-weaving) | `LocalResearch` | Matches F1 (həsirçilik) |
| `NeighboringSettlements` | Lürən, Gəyəçöl, Öncəqala kəndləri və Masallı şəhəri | `LocalResearch` | |
| `NameOriginNarrative` | The Musa/Molla Musa legend — see B1 | `TraditionalStory` | Both source documents explicitly instruct that this must be labeled a rəvayət (legend), never presented as settled fact |
| `NameOriginSourceStatus` | `TraditionalStory` | — | Set to match the narrative's actual status |
| `NameOriginSourceReference` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | — | |
| `LongDescription` | Not supplied | — | **Source not yet provided** |
| `Latitude` / `Longitude` (village-level, optional on this entity) | Not given | — | **Source not yet provided** — not required to save VillageProfile (nullable on this entity, unlike `Place`), but not available either way |
| `ContactInfo` / `SocialLinks` | Not given | — | **Source not yet provided** |

7 of the entity's fields have real source data (`VillageName`,
`Population`, `AreaHectares`, `GeographicalDescription`,
`MainOccupations`, `NeighboringSettlements`, `NameOriginNarrative` +
its status/reference pair counted together); the rest are either
editorial copy to be drafted from these facts (`ShortDescription`) or
genuinely unavailable in the source (`PopulationAsOfYear`,
`LongDescription`, contact/social info, village-level coordinates).

## B. Tariximiz (HistoricalEvent)

| # | Proposed title | Content type | Short description | SourceStatus | SourceReference | Photo needed? | Verification needed? |
|---|---|---|---|---|---|---|---|
| B1 | Musaküçənin adının mənşəyi (rəvayət) | HistoricalEvent | Village name origin — Musa/Molla Musa legend. The source explicitly calls this a **rəvayət** (legend/tradition) itself — never to be presented as fact (both source docs state this explicitly). | `TraditionalStory` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | Yes — no actual narrative text exists yet, only the instruction that this legend exists and must be clearly labeled as such |
| B2 | Musaküçənin tarixi — 800+ il | HistoricalEvent (or a VillageProfile fact) | MUSAKUCE_SPEC.md §7 states "Tarixi — 800+ il" as a village statistic | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | No | **Yes** — no basis/date range given for this figure anywhere in either source; must not be published as a firm claim without knowing what it's based on |
| B3 | Viləş çayı | HistoricalEvent or Place note | Both documents mention "Viləş River historical information" is relevant to village history, but neither document contains any actual historical content about the river — only that a section about it should exist | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | **Yes** — no actual content exists to enter yet, only a topic placeholder |
| B4 | Molla Musa ocağı | HistoricalEvent (+ Place, see G2) | A shrine/pilgrimage site tied to the name-origin legend | `TraditionalStory` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | Yes — same caveat as B1, no detailed narrative given |
| B5 | Musaküçə məscidinin tikintisi (1902–1903) | HistoricalEvent | Mosque construction began 1902, completed 1903 | `LocalResearch` (not `Verified` — no document/archive cited, just stated in the brief) | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | No — the date itself is stated plainly and consistently across both documents |
| B6 | İlk məktəbin açılması (1928) | HistoricalEvent | First school opened in 1928 | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | No |
| B7 | Yeddiillik məktəbin tikilməsi (1936) | HistoricalEvent | Seven-year school built | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| B8 | Yeni məktəb binası (1962) | HistoricalEvent | New school building put into use | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| B9 | Orta məktəbə çevrilmə (1970) | HistoricalEvent | School became a full secondary school | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| B10 | Kolxoz dövrü | HistoricalEvent | Collective-farm (kolkhoz) period — mentioned as a period name only, no dates, no details, no collective's name | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | **Yes** — period only, no substantive content yet |
| B11 | Çapayev sovxozu | HistoricalEvent | A named state farm (sovkhoz) that operated in/around the village during the Soviet period — name only, no dates or further detail | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | **Yes** — name only |
| B12 | Toxumçuluq dövrü | HistoricalEvent | A "seed production" economic period — named only, no dates or detail | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | **Yes** — name only |

Notes:
- Every date above (1902/1903, 1928, 1936, 1962, 1970) is consistent
  across *both* source documents, which is why it's classified
  `LocalResearch` rather than `UnderResearch` — it's not a single
  unverified mention, but it is also not sourced to an official document
  or archive, so `Verified`/`OfficialSource` would overstate it.
- B10–B12 (kolkhoz/sovkhoz/seed-production periods) are named as topics
  that *should* have entries, per the source, but the source supplies no
  actual narrative content for them — only the period names themselves.
  They're listed here as placeholders to fill in once real detail is
  available, not as ready-to-publish entries.

## C. İnsanlarımız (Person)

**Zero named individuals exist in either source document.** Both
documents describe the *categories* the "İnsanlarımız" archive should
support (scientists, teachers, lawyers, public officials, religious
figures, writers/poets, athletes, agricultural workers/labor heroes,
entrepreneurs, other) — this is feature/schema guidance, not a roster of
actual people to enter.

| # | Proposed title | Content type | Short description | SourceStatus | Verification needed? |
|---|---|---|---|---|---|
| — | *(none)* | Person | No named individual appears anywhere in the available source material | — | **Source not yet provided** for every category: alimlər, hüquqşünaslar, müəllimlər, dövlət xadimləri, din xadimləri, şair/yazıçı, idmançılar, xaricdə təhsil alanlar, digər tanınmış şəxslər |

The one near-miss: `Fayəddin Xancanov` is named as the person the
village secondary school is dedicated to (`MUSAKUCE_SPEC.md` §17,
`docs/Musakuce.az_...docx` §13). No birth/death dates, occupation,
biography, or achievements are given — only that a school carries his
name. **This is not enough to create a Person record** (the entity
requires a non-empty `Biography` field, and inventing one would violate
this phase's explicit rule against fabricating biographical content). It
is listed under Education (D1) instead, as a fact *about the school*,
not about the person.

## D. Təhsil (EducationEntry)

| # | Proposed title | Content type (`EducationKind`) | Short description | SourceStatus | SourceReference | Photo needed? | Verification needed? |
|---|---|---|---|---|---|---|---|
| D1 | Fayəddin Xancanov adına Musaküçə kənd tam orta məktəbi | `Institution` | The village's full secondary school is named after Fayəddin Xancanov | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | **Yes** — who Fayəddin Xancanov was is not stated anywhere in the source; do not infer or invent this |
| D2 | İlk məktəb (1928) | `FirstSchool` | Duplicate of B6 from the education angle — EF Core relation, not a separate fact | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | No |
| D3 | Yeddiillik məktəb (1936) | `ImportantDate` | Duplicate of B7 | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| D4 | Yeni məktəb binası (1962) | `ImportantDate` | Duplicate of B8 | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| D5 | Orta məktəbə çevrilmə (1970) | `ImportantDate` | Duplicate of B9 | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Optional | No |
| D6 | Kənd kitabxanası | `Institution` | Village library — mentioned as needing its own info page; no history, founding date, or description given | `UnderResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | **Yes** — name only |

**First teacher, first female teacher, first university-educated person,
first university-educated woman, notable teachers, notable graduates**
(all explicitly requested in the Phase 16 instructions as categories to
map): **source not yet provided** for every one of these. Neither
document names a single teacher or graduate. `EducationKind` already has
dedicated values for all of these (`FirstTeacher`, `NotableTeacher`,
`NotableGraduate`) — the CMS is ready; the content is not.

Where a notable teacher/graduate is eventually named with a real
biography substantial enough to warrant its own İnsanlarımız profile,
that Education entry should use `RelatedPersonId` to link to it rather
than duplicating the biography — per the existing schema design. Until
then there is nothing to link.

## E. Xatirə (MemorialRecord)

**Zero named individuals exist in either source document** for any of
the requested categories: WWII participants, WWII fallen, Qarabağ
şəhidləri, Qarabağ war participants, war-disabled, Chernobyl-disabled,
Labor Heroes, Socialist Labor Heroes.

| # | Category (`MemorialCategory`) | Entries available |
|---|---|---|
| — | `WWIIParticipant` | **Source not yet provided** |
| — | `WWIIFallen` | **Source not yet provided** |
| — | `KarabakhMartyr` | **Source not yet provided** |
| — | `KarabakhParticipant` | **Source not yet provided** |
| — | `WarDisabled` | **Source not yet provided** |
| — | `ChernobylDisabled` | **Source not yet provided** |
| — | `LaborHero` | **Source not yet provided** |
| — | `SocialistLaborHero` | **Source not yet provided** |

The CMS's `MemorialCategory` enum already has a dedicated value for
every one of these eight categories — no schema gap here at all, purely
a content gap. Per the Phase 16 instruction, these categories are
**not** merged with each other just because they're discussed in the
same paragraph of the source brief — each remains a distinct category
in this inventory, ready for real names and records whenever they're
provided, with no dates, ranks, units, or causes of death invented in
the meantime.

## F. Mədəni irs (CulturalHeritageItem)

| # | Proposed title | Content type (`CulturalHeritageKind`) | Short description | SourceStatus | SourceReference | Photo needed? | Verification needed? |
|---|---|---|---|---|---|---|---|
| F1 | Həsirçilik | `Craft` | Reed/mat-weaving — named twice in the source as a real, specific local craft/occupation (also listed under Village Profile's "main occupations", §9 below) | `LocalResearch` | Musaküçə üzrə təqdim edilmiş yerli mənbə materialı | Yes | **Yes** — named as a real local tradition, but no description of the craft's actual practice, materials, or history is given; the entry needs real detail before it can be more than a title |

Village traditions, folklore, local expressions, food, weddings,
mourning traditions, seasonal agricultural work, and general village
lifestyle are all listed in the source as **topics the archive should
eventually cover** (`MUSAKUCE_SPEC.md` §18) — none of them come with
actual descriptive content in either document. **Source not yet
provided** for all of these beyond the single named topic (həsirçilik)
above. Per the Phase 16 instruction, these are not expanded with
generic Azerbaijani village-tradition content not specifically
attributed to Musaküçə in the source.

"Kəndimizin səsi" (Interview entity) — the source describes this as a
feature (elderly interviews, oral histories) to build, not as a set of
actual interviews that already exist. No Interview records are proposed
from source content; this remains an empty, ready-to-use module.

## G. Məkanlar (Place)

| # | Name | Kind/Category | Description | Historical background | Coordinates | SourceStatus | Verification needed? |
|---|---|---|---|---|---|---|---|
| G1 | Musaküçə kənd məscidi | `Historical` / `Mosque` | The village mosque | Built 1902–1903 (see B5) | **Missing — "Koordinat daxil edilməlidir"** | `LocalResearch` | No, beyond coordinates |
| G2 | Molla Musa ocağı | `Historical` / `Shrine` | Shrine tied to the village name-origin legend | Legend only — see B4 | **Missing — "Koordinat daxil edilməlidir"** | `TraditionalStory` | Yes — narrative content, plus coordinates |
| G3 | Qəbiristanlıq (kənd qəbiristanlığı) | `Historical` / `Cemetery` | Village cemetery, mentioned as a map-worthy location | None given | **Missing — "Koordinat daxil edilməlidir"** | `UnderResearch` | Yes — no further description exists |
| G4 | Musaküçə kənd məktəbi (Fayəddin Xancanov adına) | `Historical` or `Useful` / `School` | The village's secondary school building — see D1 | See D1 | **Missing — "Koordinat daxil edilməlidir"** | `LocalResearch` | No, beyond coordinates |
| G5 | Kənd kitabxanası | `Useful` / `Library` | Village library — see D6 | None given | **Missing — "Koordinat daxil edilməlidir"** | `UnderResearch` | Yes — name only |

**Important schema-level finding** (see §14 gap analysis below): `Place`
requires `Latitude`/`Longitude` as **non-nullable** fields — the CMS
cannot currently save a Place record at all without a real coordinate
value, draft or otherwise. This is stronger than "the public page will
show a blank map marker" — it means **none of G1–G5 can be entered into
the Admin CMS today**, even as an unpublished Draft, until real
coordinates are obtained (e.g. a resident walking the village with a
phone GPS, or plotting the locations against a known reference point).
No coordinate was guessed or approximated to work around this.

## H. Foto/Video

No photographs or videos are described, attached, or referenced as
files anywhere in either source document — both documents only specify
that a Fotoalbom/Videolar *feature* should exist, with example category
names (Köhnə Musaküçə, Məktəb və Məzunlar, Toylar, Sovxoz və Təsərrüfat,
etc., per `MUSAKUCE_SPEC.md` §19–20). **Source not yet provided**: no
Photo, PhotoAlbum, or Video records are proposed from source content.
Every historical entry above (B5–B9, D1, D6, F1, G1–G5) is flagged as
needing a photograph once one becomes available.

## I. Other

- **Faydalı məlumatlar (LocalInfoEntry) / Elanlar (ClassifiedListing) /
  Təqvim (VillageEvent)**: these three modules hold current,
  transactional, time-bound information (services, contacts, listings,
  upcoming events) by design — not historical content. Neither source
  document contains any actual current service listing, contact, or
  event to enter. **Not applicable to this historical-content
  inventory** — these modules are already fully built (Phase 12/15) and
  will be populated through ordinary day-to-day admin use once the site
  is live, not through this content-population exercise.
- **Kəndimizdən (VillageUpdate)** — same reasoning: current village-life
  bulletin content, not historical archive content; nothing in the
  source is dated/current enough to populate it.

---

## 14. Admin CMS gap analysis

| Category | Finding |
|---|---|
| **1. Can be entered directly** | B5–B9 (mosque/school dates), D2–D5 (same, education angle), F1 (həsirçilik, title-only) — all fit existing fields exactly, once photographs are optionally attached later. |
| **2. Requires a related Person** | None — no Person records exist yet to relate anything to (D1/D6 would use `RelatedPersonId` if Fayəddin Xancanov's biography or the library's namesake were ever documented). |
| **3. Requires a Place** | G1–G5, per above — but see the coordinate blocker: these cannot actually be *saved* yet, not just linked. |
| **4. Requires a Photo** | Every entry in B, D, F, G above is marked "photo needed" — none currently has one. |
| **5. Requires a Video** | None proposed — no video-worthy source content exists yet (Kəndimizin səsi interviews are a feature to build, not content to enter). |
| **6. Requires additional verification** | B1–B4 (legend content), B10–B12 (period names with no detail), D6 (library), F1 (craft detail), G2/G3/G5 (place descriptions) — all flagged individually above with the specific missing piece named. |
| **7. Cannot currently be represented** | **Place records without known coordinates** — a genuine schema constraint (`Latitude`/`Longitude` are non-nullable `decimal`, not `decimal?`), not a missing feature. Until real coordinates are known for G1–G5, they cannot be saved as Draft rows at all. This is the only true "cannot represent" finding — everything else in this inventory is a content gap, not a CMS gap. Not fixed this phase (no code changes were made — Phase 16 is planning-only), flagged here for a future, deliberate decision (e.g., making the fields nullable and treating a missing coordinate as "not yet mapped" in the public map view, vs. simply requiring coordinates be obtained before draft-entry — a product decision, not something to default into silently). |

No new entity, module, or schema type is proposed anywhere in this
document — every source item maps onto an existing CMS module and
field, confirming the CMS built in Phases 12–15 is structurally
sufficient for all the content categories the source material describes.
The gap is entirely in available content, with the single coordinate-
nullability exception noted above.

---

## 15. Final report

| Metric | Count |
|---|---|
| Proposed Person records | **0** (zero named individuals in source) |
| Proposed HistoricalEvent records | **12** (B1–B12), of which 5 are ready-to-enter dates (B5–B9) and 7 need more detail before publishing |
| Proposed EducationEntry records | **6** (D1–D6), of which 4 are ready-to-enter dates (D2–D5) |
| Proposed MemorialRecord records | **0** (zero named individuals in source, across all 8 categories) |
| Proposed CulturalHeritageItem records | **1** (F1 — həsirçilik, title only) |
| Proposed Place records | **5** (G1–G5) — **none currently saveable** due to missing coordinates |
| VillageProfile fields with real source data | **7** of the entity's ~20 fields (see §9 mapping: VillageName, ShortDescription-worthy population/area stats, GeographicalDescription, MainOccupations, NeighboringSettlements, NameOriginNarrative + NameOriginSourceStatus) |
| Items requiring verification | 11 (B1–B4, B10–B12, D6, F1, G2, G3, G5) |
| Missing photographs | Every proposed item above — 24 of 24 |
| Missing dates | B10–B12 (period names with no dates), B1–B4 (legend content, inherently undated) |
| Missing coordinates | G1–G5 — all 5 proposed Place records |
| Missing source references | None of the above are missing a reference *category* (all use the one available source, correctly labeled) — but essentially all lack a *specific* archival/document source beyond "the provided local source material" itself |
| CMS gaps | 1 genuine gap: Place requires non-nullable coordinates, so records without known coordinates cannot be saved even as Draft. Everything else the source describes has a ready home in the existing schema. |

### Concise summary: available vs. still needed

**Available now, ready to enter as Draft once photos/detail are optionally added**: 9 dated historical/education facts (mosque 1902–1903, school 1928/1936/1962/1970), plus the core VillageProfile facts (population 3,922, area 905.23 ha, geography, main occupations, neighboring settlements).

**Available but explicitly requiring careful, non-factual framing**: the Musa/Molla Musa name-origin legend (must stay `TraditionalStory`, never presented as fact) and the "800+ years" history claim (must stay `UnderResearch` — no supporting detail given).

**Named but undocumented** (real names exist, but zero biographical/historical detail): Fayəddin Xancanov (school namesake), Çapayev sovkhoz, the kolkhoz period, the seed-production period, həsirçilik as a craft, Viləş river, the village cemetery and library.

**Entirely absent — source not yet provided**: every named person in every İnsanlarımız category (scientists, lawyers, teachers, officials, religious figures, writers/poets, athletes, those educated abroad); every named individual in every Xatirə/memorial category (WWII, Qarabağ, war-disabled, Chernobyl-disabled, Labor Heroes); first/notable teachers and graduates; any actual photograph or video file; any coordinate for any of the five identified historical places.

**Genuine CMS gap** (not a content gap): Place records cannot be saved without real coordinates — this blocks entering G1–G5 even as unpublished drafts until real coordinates are obtained.

No content has been entered into the database. No content has been published. Nothing has been deployed or committed.
