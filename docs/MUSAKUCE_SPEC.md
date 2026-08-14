# MUSAKÜÇƏ — BİZİM KƏND — PROJECT SPECIFICATION

**Revision 2** — combines the original *Musaküçə Digital Memory* concept with the
*Musaküçə Digital Village Square* concept into a single product.

---

## 1. PROJECT VISION

Musakuce.az is the digital home of Musaküçə village.

The primary purpose of the website is NOT to operate as a news website.

The product combines two ideas into one:

1. **MUSAKÜÇƏ DIGITAL MEMORY** — collect and preserve the village's history,
   people, memories, photographs, videos, historical places, education,
   culture and memorial information in one central, accessible, visually
   engaging archive.
2. **MUSAKÜÇƏ DIGITAL VILLAGE SQUARE** — serve the everyday, present-day life
   of the village: local announcements, classifieds, services, events, and
   practical community information, so residents have a reason to open the
   site every day, not only when researching the past.

Together these form the final concept:

> **"MUSAKÜÇƏ — BİZİM KƏND"** — a digital home for Musaküçə.

Core formula:

> **Kəndimizin yaddaşı + kəndimizin gündəlik həyatı**
> (Our village's memory + our village's everyday life)

The website should become both the long-term digital archive of Musaküçə
**and** the place villagers check for what's happening today.

---

# 2. CORE PRINCIPLE

The website should feel like:

**"Bu, bizim kəndimizdir."** ("This is our village.")

It must feel:

- warm
- local
- human
- authentic
- modern
- interesting
- emotional
- visually rich
- easy to use
- community-oriented
- slightly playful
- interactive
- useful every single day

It must NOT feel like or become:

- a news website
- a government website
- a municipality website
- a newspaper
- a corporate website
- a generic classifieds website (Tap.az-style)
- a social network / open forum

The community (Village Square) functions must **complement** the archive.
They must never dominate it or redefine the site as a marketplace or a feed.

---

# 3. DESIGN DIRECTION

Visual language:

## MODERN HERITAGE + DIGITAL VILLAGE SQUARE

Combine modern web design with the atmosphere of:

- old village photo albums
- family archives
- historical documents
- village landscapes
- local memories
- natural materials
- traditional culture
- everyday, present-day village life

The visual identity should be based on real Musaküçə photography whenever
possible.

Use:

- large editorial-quality photographs
- elegant typography, large expressive type for section openers
- warm neutral backgrounds
- natural green / earth tones and a subtle accent color
- subtle borders, soft rounded cards
- image overlays
- tasteful, lightweight animations
- asymmetric, editorial layouts (not a uniform card grid everywhere)
- horizontal scrolling galleries where appropriate
- interactive timelines
- interactive map
- community widgets (announcement board, calendar) styled to match the
  archive, not styled like a classifieds/news site
- visual storytelling
- generous whitespace
- mobile-first, friendly, slightly playful touches (without becoming
  unserious for memorial content)

Avoid:

- excessive blue corporate UI
- news-site style red labels
- dense grids / dashboard-like layouts
- excessive repetitive rectangular cards
- overly formal government design
- excessive gradients

The site should feel like: **"our village has its own digital home."**

---

# 4. MAIN USER EXPERIENCE

The user should be able to discover both facets of the village. Recommended
emphasis order for first-time visitors:

Village (today) → Village (memory) → People → History → Memories → Photos →
Videos → Culture → Places → Community

In practice this means the homepage opens with the village itself (hero,
introduction, today's life), then moves into the archive (history, people,
photos, culture), then into practical/community tools, ending with
contribution and footer. See §5.

News-style content and classifieds are always secondary, supporting content —
never the site's dominant visual identity.

---

# 5. HOMEPAGE

The homepage should feel like **entering Musaküçə digitally**. The first
emotional reaction should be: **"Bu, bizim kəndimizdir."**

Recommended structure:

1. Header (nav + persistent search)
2. Hero — large authentic Musaküçə photograph
3. Village introduction (a few warm sentences)
4. Village statistics ("village facts", not a corporate dashboard)
5. **"Bu gün kənddə"** — window into current village life
6. **"Kəndin elanlar taxtası"** — a few featured/recent classifieds
7. **"Bu həftə kənddə"** — upcoming events this week
8. **"Bu gün Musaküçə"** — current photo stream (editorial, asymmetric gallery)
9. **"Bir foto — bir hekayə"** — a featured historical photo + story
10. **"İnsanlarımız"** — featured people profiles
11. **"Kəndimizin tarixi"** — history/timeline teaser
12. **"Kəndimizin səsi"** — oral history / interviews teaser
13. **"Musaküçə xəritədə"** — interactive map preview
14. **"Xatirə"** — quiet, minimal memorial mention/link (never prominent or
    card-like — see §17)
15. **"Musaküçənin yaddaşına sən də əlavə et"** — community contribution CTA
16. Useful local information (quick links: services, useful contacts,
    calendar)
17. Footer

Layout rules for the homepage (and, where relevant, section pages):

- Do NOT make every section a repetitive grid of rectangular cards.
- Use large photography, asymmetric layouts, editorial composition,
  timelines, horizontal scroll, image overlays, visual storytelling, large
  typography, subtle animation, the interactive map, and community widgets
  to keep sections visually distinct from one another.
- Sections 5–7 (today/classifieds/events) must read as a **village square**,
  not a news homepage or a marketplace homepage.
- Section 14 (Xatirə) must stay small, calm and clearly separated in tone
  from the surrounding lively sections.

---

# 6. HOMEPAGE HERO

Use an authentic Musaküçə village panorama as the main visual.

Text:

**MUSAKÜÇƏ**

> "Kəndimizin yaddaşı, insanları və həyatı."

Supporting text:

> "Musaküçə haqqında tarix, insanlar, xatirələr və bu gün kənddə baş
> verənlər — bir yerdə."

Buttons:

- **Kəndimizi tanı**
- **Bu gün kənddə**

The hero should be emotional and visual, not corporate.

---

# 7. VILLAGE STATISTICS ("Village Snapshot")

Display as village facts, not corporate dashboard statistics:

- Əhali — 3 922
- Ərazi — 905,23 ha
- Tarixi — 800+ il
- Məscid — 1903
- İlk məktəb — 1928

Historical dates must be presented with appropriate source/status
information (see §29).

---

# 8. "BU GÜN KƏNDDƏ" / "KƏNDİMİZDƏN"

This replaces the traditional "News Portal" concept. It represents current
village life and is modeled as a single content type (`VillageUpdate`, see
§28) presented in two views:

- **"Bu gün kənddə"** — the homepage's rolling window into current life (most
  recent items, presented as a warm bulletin, not a headline list).
- **"Kəndimizdən"** — the full section/page (primary nav item) where all
  village-life updates live, browsable and filterable by category.

Examples of content:

- village improvement work
- construction and renovation
- school activities
- community events
- village meetings
- sports achievements
- educational achievements
- cultural events
- important announcements
- achievements of villagers
- new photos from the village

This content must NOT visually resemble a newspaper or a news feed. It
should feel like: **"What's happening in our village?"**

---

# 9. DIGITAL VILLAGE SQUARE

A new, explicit product pillar alongside the archive. It exists to make the
site useful every day, and includes:

- Kəndimizdən / Bu gün kənddə (§8)
- Elanlar — classifieds (§10)
- Yerli faydalı məlumatlar — unified local services, contacts and
  recommendations directory (§11)
- İş elanları — job postings (a category within Elanlar, §10)
- İtirilmiş-tapılmış — lost & found (a category within Elanlar, §10)
- Kənd təqvimi / Tədbirlər — village calendar and events (§12)
- Interactive village map (§25, shared with the archive's historical places)

Resident questions ("kömək lazımdır") are not a standalone open Q&A board
for MVP — they route through the existing moderated contribution/contact
flow (§22) and, where a pattern is genuinely recurring, become a
curated entry in Yerli Faydalı Məlumatlar rather than a live forum thread.

**Hard boundary:** these community functions must complement the village
archive. They must NOT turn the website into Tap.az, Facebook, or a news
portal. Concretely this means:

- No public user profiles/timelines/feeds, no likes/follows/comment threads.
- No infinite-scroll marketplace browsing experience as the site's center of
  gravity — classifieds and services stay a supporting section, visually and
  structurally subordinate to the archive.
- Every village-square submission is moderated before publication, exactly
  like archive submissions (§26).
- Listings expire automatically (see §10) rather than accumulating forever
  like a classifieds site.

---

# 10. CLASSIFIEDS — "KƏNDİN ELANLAR TAXTASI"

Categories:

- Alqı-satqı
- Mal-qara
- Kənd təsərrüfatı məhsulları
- Texnika
- Avtomobil
- Xidmətlər (cross-links to Yerli Faydalı Məlumatlar, §11)
- İş (job postings)
- Axtarılır
- İtirilmiş-tapılmış (lost & found)

Each listing includes:

- photo
- title
- description
- price (where applicable)
- location
- date
- contact
- status (Active / Fulfilled-Sold / Expired / Removed)

Rules:

- All listings require moderation before publication.
- Listings auto-expire after a fixed window (default: 30 days) and are
  archived, not deleted, so the moderation/audit trail is preserved.
- Contact details are protected from scraping (revealed on click / rate
  limited), not printed as plain crawlable text.

---

# 11. YERLİ FAYDALI MƏLUMATLAR (UNIFIED LOCAL INFORMATION)

A single, unified directory — **not** three separate systems. It replaces
what earlier drafts treated as three things (a services directory, a
contacts list, and a recommendations feature) with one content type shown
in one place, filterable by kind:

- local service providers (traktor, kombayn, sürücü, yük maşını,
  elektrikçi, santexnik, usta, tikiş, dayə, other agricultural/local
  services)
- useful phone numbers and important contacts
- shops
- craftsmen
- transport
- community recommendations (tövsiyələr)

Each entry: name, kind/category, description, contact info, area served,
optional photo. A **recommendation** is not a separate free-floating post —
where it concerns an existing entry (e.g. "bu ustaya güvənə bilərsiniz"), it
attaches to that entry rather than creating a duplicate record; only
free-standing tips with no matching entry become their own entry.

Rules:

- **Curated/editorial by default:** Administrator/Editor/Archivist maintain
  this directory directly in the admin panel.
- Residents may suggest additions or corrections through the existing
  moderated contribution flow (§22) — there is no open public posting form
  for this directory in MVP.
- All publicly visible entries and attached recommendations are moderated;
  nothing resident-suggested appears without Editor/Archivist/Administrator
  review.
- Shown on the homepage as "Useful local information" (§5, item 16) and
  reachable from primary/secondary navigation (§27).

---

# 12. EVENTS — "KƏND TƏQVİMİ" / "BU HƏFTƏ KƏNDDƏ"

A simple village calendar/events list:

- school events
- sports
- meetings
- celebrations
- community events
- other local events

Homepage shows **"Bu həftə kənddə"** (this week's upcoming events); the full
section shows the calendar (**"Kənd təqvimi"**). Each event: title,
description, date/time, location (optionally linked to a map Place),
organizer, photo.

---

# 13. NEKROLOQLAR / XATİRƏ (MEMORIAL)

The platform must support respectful obituary/memorial pages for villagers
who have passed away, presented under the calm heading **"Xatirə"**.

Content may include:

- full name (and father's name)
- photograph
- birth date
- death date
- short biography
- family-approved memorial text
- funeral information, only if the family chooses to publish it
- memories
- photographs

**Editorial workflow (mandatory, never automatic):**

```
Draft → Pending Review → Approved → Published
```

- Obituaries are never auto-published, regardless of who submits them.
  Community members may submit obituary information (name, dates, a
  memorial text, photo) through the moderated contribution flow, but every
  submission enters as Draft/Pending Review — it always requires editorial
  approval before anyone but staff can see it.
- Only **Administrator or Editor** roles may approve and publish a
  memorial page. Archivist may draft/edit but not approve/publish.
- Default visibility once Approved and Published is **public**.
- Administrator/Editor actions available on a memorial record: **publish,
  unpublish, archive, edit, reject** (reject returns a community
  submission to the submitter's contact with an internal note; unpublish
  and archive both remove it from public view — archive additionally
  marks it as retained/closed rather than reusable as a draft).

Rules:

- Calm, respectful, memorial visual style — never news-style, never a
  rectangular "card with category badge."
- Do NOT present obituaries as sensational news.
- Privacy and family approval are required before publication.
- On the homepage, exposure is intentionally minimal (§5, item 14) — a small
  quiet mention/link, never a prominent section.

---

# 14. VILLAGE HISTORY — "KƏNDİMİZİN TARİXİ"

Dedicated history section, using an interactive timeline. Include:

- origin of Musaküçə
- meaning/origin of the village name
- Viləş River historical information
- Molla Musa shrine
- 1903 mosque
- first school
- kolkhoz period
- Chapayev sovkhoz
- seed-production period
- important historical events

Example timeline entries:

```
1200–1210 → early settlement tradition
1902      → mosque construction begins
1903      → mosque completed
1928      → first school
1936      → seven-year school
1962      → new school
1970      → secondary education
```

All historical information must clearly distinguish between: verified fact,
official source, family archive, oral history, traditional story, local
research, under research (see §29).

---

# 15. PEOPLE OF MUSAKÜÇƏ — "İNSANLARIMIZ"

Digital people archive. Categories:

- scientists
- teachers
- lawyers
- public officials
- religious figures
- writers and poets
- athletes
- agricultural workers / labor heroes
- entrepreneurs
- other notable villagers

Each profile:

- name, surname, father's name
- birth date, death date
- occupation
- biography
- achievements
- photographs, videos, documents
- memories
- sources

Profiles connect with photos, videos, stories and historical events, and
should feel like an encyclopedia + family archive, not social media.

---

# 16. HEROES AND MEMORIAL ARCHIVE — "QƏHRƏMANLARIMIZ"

Sections:

- Şəhidlərimiz
- Qarabağ müharibəsi iştirakçıları
- II Dünya müharibəsi iştirakçıları / həlak olanlar
- Əmək qəhrəmanları
- Çernobıl iştirakçıları

Profiles are emotional but composed: photo, life story, documents, memories,
sources. Use respectful memorial design throughout.

---

# 17. EDUCATION — "MƏKTƏB"

Include:

- history of Musaküçə school
- first school in 1928
- school buildings
- teachers
- notable graduates
- school photographs
- alumni memories
- current school information

Include: **Fayəddin Xancanov adına Musaküçə kənd tam orta məktəbi**, and the
village library, each with its own information page.

---

# 18. CULTURAL HERITAGE — "MƏDƏNİ İRS"

Dedicated cultural heritage archive:

- həsirçilik
- village traditions
- folklore
- local expressions
- food
- weddings
- mourning traditions
- seasonal agricultural work
- village lifestyle
- traditional crafts

Includes **"Kəndimizin səsi"** for:

- elderly interviews
- oral histories
- audio recordings
- video interviews
- memories
- traditional knowledge

---

# 19. PHOTO ARCHIVE

Photography is one of the core features of the website, spanning both the
archive and the village square:

- **"Fotoalbom"** — the full photo archive, organized by category: Köhnə
  Musaküçə, İnsanlarımız, Məktəb, Məzunlar, Toylar, Mərasimlər, Kənd həyatı,
  Sovxoz, Məscid, Təbiət, Kənd mənzərələri, Müasir Musaküçə.
- **"Bu gün Musaküçə"** — a current/recent photo stream (recent uploads,
  editorial asymmetric gallery), the visual counterpart to "Bu gün kənddə".
- **"Bir foto — bir hekayə"** — the storytelling feature, applied mainly (but
  not exclusively) to historical photographs.

Each photograph can have: title, date, location, people in photo,
description, source, uploader, story.

---

# 20. VIDEO ARCHIVE — "VİDEOLAR"

Videos may include:

- village panoramas
- historical videos
- interviews
- school events
- village events
- agricultural work
- traditional crafts
- community activities

Treated as an archive, browsable by category — not a news feed.

---

# 21. HISTORICAL PLACES

Individual pages for: Musaküçə mosque, Molla Musa shrine, cemetery, old
school, library, and other important historical places. Each supports:
photograph, description, historical background, location, map, related
people, related photographs, related videos. Shared map + page template with
Useful Places (§25).

---

# 22. COMMUNITY CONTRIBUTION — "MUSAKÜÇƏNİN YADDAŞINA SƏN DƏ ƏLAVƏ ET"

A prominent section (and homepage CTA, §5 item 15) with buttons:

- **Foto göndər**
- **Video göndər**
- **Xatirə paylaş**
- **Tarixi məlumat göndər**

Submission fields: name, surname, contact, description, date, location,
people shown, file upload, source/notes, permission to publish.

All submissions require moderation before publication (applies equally to
archive contributions and, separately, to Village Square submissions —
classifieds/services/events — per §9).

---

# 23. INTERACTIVE MAP — "MUSAKÜÇƏ XƏRİTƏDƏ"

One interactive map, two marker layers:

- **Historical places:** mosque, Molla Musa shrine, cemetery, old school,
  other historical locations.
- **Useful places:** school, shops, pharmacy, doctor, tea house, sports
  area, service providers, other important local locations.

Clicking a marker opens information and photographs. The homepage shows a
lightweight preview linking to the full interactive map page.

---

# 24. SEARCH — "VAHİD MƏLUMAT MƏRKƏZİ"

Global search must search across:

- people
- history
- articles
- village updates (Kəndimizdən / Bu gün kənddə)
- photos
- videos
- historical places
- obituaries/memorial (Xatirə)
- documents

A person search should show related photos, videos and stories.

Village Square content (classifieds, services, events) is time-bound and
transactional in nature, and is searched/filtered **separately** from the
archive search (its own filter UI within Elanlar/Xidmətlər/Təqvim) rather
than mixed into "memory" search results.

---

# 25. CONTENT TYPES

The CMS/database should support, as distinct types (never collapse
everything into "News"/"Post"):

**Archive:** Person, Article, VillageUpdate, Obituary, HistoricalEvent,
HistoricalPlace, Photo, PhotoAlbum, Video, Document, Interview,
CulturalItem, School, Teacher, Alumni, Memorial, Source,
CommunitySubmission.

**Village Square:** ClassifiedListing, VillageEvent, Place (unified
Historical/Useful kind — see architecture plan), LocalInfoEntry (unified
Yerli Faydalı Məlumatlar entry: service provider, contact, shop, craftsman,
or attached recommendation — see §11).

No separate ServiceProvider/LocalContact/Recommendation/CommunityQuestion
types — deliberately merged into `LocalInfoEntry` (§11) or the existing
contribution flow (§22) to avoid redundant, overlapping systems.

---

# 26. CONTENT STATUS / SOURCE

Applies to **archive** content, where historical accuracy matters. Each
historical item should support a source/status:

- Verified
- Official Source
- Family Archive
- Oral History
- Local Research
- Traditional Story
- Under Research

This distinction is important for historical accuracy and must never be
presented as flat, unqualified fact when the underlying material is oral
tradition or unverified.

**Village Square** content instead uses a lifecycle status appropriate to
transactional/time-bound content (Active, Fulfilled/Sold, Expired, Removed)
plus a moderation status (Pending, Approved, Rejected) — see §10.

---

# 27. NAVIGATION

**Primary:**

Ana səhifə · Kəndimiz · Kəndimizdən · Elanlar · Təqvim · İnsanlarımız ·
Tariximiz · Fotoalbom · Xəritə

**Secondary:**

Məktəb · Mədəni irs · Qəhrəmanlarımız · Xatirə · Videolar · Kəndimizin səsi
· Faydalı məlumatlar · Əlaqə

"Xəbərlər" must never be used as a top-level/dominant nav label. Current
information is represented as "Kəndimizdən" / "Bu gün kənddə".

---

# 28. ADMIN PANEL

Admin panel is a **Digital Village Archive + Village Square CMS**, not a
News CMS.

Modules:

- Dashboard
- People
- History
- Historical Places
- Photos
- Albums
- Videos
- Interviews
- Village Updates (Kəndimizdən)
- Obituaries / Xatirə
- Memorials
- School
- Culture
- Documents
- Sources
- **Elanlar (classifieds moderation + expiry management)**
- **Yerli Faydalı Məlumatlar (unified services/contacts/recommendations directory)**
- **Tədbirlər / Təqvim (events/calendar)**
- **Places (historical + useful, shared map)**
- Community Submissions (archive contributions)
- Users
- Roles
- Site Settings

Roles:

- Administrator
- Editor
- Archivist

---

# 29. DATABASE

Recommended: **PostgreSQL**, ORM: **Entity Framework Core**.

The database should use relational models and avoid storing the whole
village archive (or the village square) as unstructured text.

Important relationships:

```
Person ↔ Photo
Person ↔ Video
Person ↔ Article
Person ↔ Memorial
Place ↔ Photo
Place ↔ Video
HistoricalEvent ↔ Source
Photo ↔ Album
Article ↔ Source
ClassifiedListing ↔ Photo
LocalInfoEntry ↔ Category
LocalInfoEntry ↔ LocalInfoEntry (recommendation attached to an entry)
VillageEvent ↔ Place
```

---

# 30. TECHNOLOGY STACK

Frontend: Next.js, React, TypeScript, Tailwind CSS.

Backend: ASP.NET Core Web API, .NET 10.

Database: PostgreSQL. ORM: Entity Framework Core.

Infrastructure: Nginx, Cloudflare, VPS.

Media: Object storage / media storage.

**Internationalization readiness:** the public site is **Azerbaijani-first
and Azerbaijani-only for MVP** — no language switcher, no translated UI, no
per-locale content editing screens are built now. However the content
model must not hard-code Azerbaijani text into non-localizable columns in a
way that would force a schema rewrite later:

- User-facing text fields on content entities are stored in a way that
  can be migrated to a per-locale table (`EntityTranslation`-style, keyed
  by `EntityId + LanguageCode`) without changing primary keys or
  relationships — e.g. avoid concatenating multiple languages into one
  field, avoid baking language-specific slugs into foreign keys.
- Routing is structured so a future `/az/...`, `/ru/...`, `/en/...` prefix
  (or equivalent locale routing) can be introduced without renaming
  existing routes.
- Enums/category codes are stored as language-neutral codes (e.g.
  `Category.Mescid`) with display labels resolved at the presentation
  layer, not stored as Azerbaijani strings in the database.

This is a design constraint for Phase 5/6 (database/backend), not an MVP
feature — no RU/EN content or UI ships until a future phase explicitly
scopes it.

---

# 31. SEO

SEO must focus on information discovery rather than news ranking, and on
practical local search intent for Village Square content.

Archive-focused target examples: Musaküçə, Musaküçə kəndi, Musaküçə tarixi,
Musaküçə məktəbi, Musaküçə məscidi, Molla Musa ocağı, Musaküçə tanınmış
şəxsləri, Musaküçə şəhidlər, Musaküçə fotoşəkilləri, Musaküçə kəndi haqqında.

Village Square considerations: expired classifieds/events are `noindex`ed
rather than indexed indefinitely, so search results stay relevant.

Implement: SEO URLs, metadata, canonical, sitemap.xml, robots.txt, Open
Graph, Schema.org, image SEO, proper headings.

---

# 32. MOBILE FIRST

The website must work extremely well on mobile devices, especially for
posting a classified/service listing or browsing today's events — these
flows must be as fast and simple as the archive browsing flows.

Priorities: fast loading, large touch targets, simple navigation, optimized
images, lazy loading, responsive galleries, fast search, simple
listing-posting flow.

---

# 33. SECURITY

Implement: authentication, RBAC, secure admin panel, file validation, upload
limits, HTTPS, audit logs, backups.

Village Square-specific: moderation queue and spam/abuse prevention on
classifieds/services/events submissions, contact-detail protection
(no scraping of phone numbers), rate limiting on listing creation.

Daily database backup. Weekly full backup. Off-site backup.

---

# 34. DEVELOPMENT PRINCIPLE

Do NOT build the entire application blindly in one step. Development
happens in controlled phases (see the separate implementation plan for the
concrete, current phase breakdown).

Before writing code:

1. Inspect the existing workspace.
2. Read this specification.
3. Propose the architecture.
4. Identify ambiguities.
5. Present the implementation plan.
6. Wait for approval.

Do NOT start implementation immediately. Do NOT invent major requirements.
Do NOT turn the project into a news website, a classifieds site, or a social
network.

The core product is:

# MUSAKÜÇƏ — BİZİM KƏND

A warm, modern, accessible digital home for the village — its memory and its
everyday life — for its people, history, memories, and daily village life,
together in one place.
