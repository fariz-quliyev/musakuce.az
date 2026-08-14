# Production environment variables

Exhaustive list of every configuration key the application actually reads
at runtime (verified by grepping the source and, where noted, by testing
against a real running process — not inferred from docs). None of these
have real production values anywhere in this repository. **Do not put
real production credentials into the repository** — every variable
marked **Secret** must come from your deployment platform's secret
mechanism (a `.env.production` file that is never committed — see
`.gitignore` — or your host's secret manager), never hardcoded or checked
in.

Each variable is classified:

- **REQUIRED** — the application will not start (or will start
  meaningfully broken) without it in a non-Development environment.
- **OPTIONAL** — has a sane default or degrades gracefully if unset.
- **DEV ONLY** — only has any effect when `ASPNETCORE_ENVIRONMENT=Development`; harmless (and normally unset) in production.

## Two layers of naming — don't confuse them

There are two different naming conventions in play, and they map to each
other, not to the same variable:

1. **Application config keys** (what the .NET app and Next.js app
   actually read) — e.g. `Jwt__Secret`, `NEXT_PUBLIC_SITE_URL`. These are
   what every table below documents.
2. **`.env.production` convenience variables** (what
   `infra/docker-compose.prod.yml` reads to *build* the application
   config keys above) — e.g. `JWT_SECRET`, `PUBLIC_SITE_URL`. These exist
   only so `.env.production` reads as a flat, compose-friendly file;
   `docker-compose.prod.yml`'s `environment:` blocks do the translation
   (e.g. `Jwt__Secret: ${JWT_SECRET}`).

If you're deploying via `docker-compose.prod.yml`, you set the
`.env.production` names. If you're running the published binaries
directly (no Compose), you set the application config keys directly. The
table in each section below gives the application config key first, with
the matching `.env.production` name noted where one exists.

---

## Backend (ASP.NET Core, `__` = config-section separator)

### Database — REQUIRED

| Variable | `.env.production` name | Controls | Secret? | Local dev default |
|---|---|---|---|---|
| `ConnectionStrings__Default` | (built from `DB_USER`/`DB_PASSWORD`/`DB_NAME` by docker-compose.prod.yml) | Postgres connection string (Npgsql) | **Yes** | `Host=postgres;Port=5432;Database=musakuce;Username=musakuce;Password=musakuce_dev` |

**Startup enforcement**: throws unconditionally in every environment if
missing — the API will not start without it. Verified: this has been
true since Phase 8 and was re-confirmed this phase.

### JWT auth — REQUIRED (Secret, Issuer, Audience) / OPTIONAL (ExpiryHours)

| Variable | `.env.production` name | Controls | Secret? | Local dev default |
|---|---|---|---|---|
| `Jwt__Secret` | `JWT_SECRET` | Symmetric signing key for admin JWTs | **Yes** | dev-only fixed string; auto-generates an ephemeral random key each restart if unset **in Development only** |
| `Jwt__Issuer` | `JWT_ISSUER` | JWT `iss` claim | No | class default `musakuce-az` |
| `Jwt__Audience` | `JWT_AUDIENCE` | JWT `aud` claim | No | class default `musakuce-az-admin` |
| `Jwt__ExpiryHours` | — | Token lifetime (hours) | No | class default `12` |

**Startup enforcement**: refuses to start outside Development if
`Jwt__Secret` is blank (`Program.cs`). Must be a real, stable secret in
production — an ephemeral key would invalidate every session on every
restart/deploy. **Generating one**: `openssl rand -base64 64` (or any
generator producing ≥ 64 random bytes) — never reuse the dev-only fixed
string from `infra/docker-compose.yml`, and never reuse the same secret
across environments (a leaked staging secret should not compromise
production).

### First-admin bootstrap — REQUIRED, only for the one bootstrap invocation (see docs/DEPLOYMENT.md §7)

| Variable | `.env.production` name | Controls | Secret? |
|---|---|---|---|
| `AdminBootstrap__Email` | `ADMIN_BOOTSTRAP_EMAIL` | Email of the account the bootstrap tool creates | No |
| `AdminBootstrap__Password` | `ADMIN_BOOTSTRAP_PASSWORD` | Password for that account | **Yes** |
| `AdminBootstrap__DisplayName` | `ADMIN_BOOTSTRAP_DISPLAY_NAME` | Display name for that account | No |

Phase 15 §3 — these are read **only** by the explicit
`--bootstrap-admin` code path (`AdminBootstrap.cs`), never by the
ordinary running `api` service. Set them only for the single
`docker compose ... run --rm admin-bootstrap` invocation that creates the
account (see `docker-compose.prod.yml`'s `admin-bootstrap` service) —
do **not** add them to the long-running `api` service's environment, and
remove/rotate the password value from wherever you typed it (shell
history, a temporary `.env` snippet) once the account exists. Safe to
run more than once: if the email already exists, it's a no-op (existing
password is never reset) — see `docs/DEPLOYMENT.md` §7 for the full
walkthrough and verification steps.

### CORS — REQUIRED

| Variable | `.env.production` name | Controls | Secret? | Local dev default |
|---|---|---|---|---|
| `Cors__AllowedOrigins__0`, `__1`, `__2`, ... (array) | `PUBLIC_SITE_URL` (single origin; add more `Cors__AllowedOrigins__N` directly if you ever need >1) | Browser origins allowed to call the API | No | `Cors__AllowedOrigins__0=http://localhost:3000` |

**Startup enforcement (Phase 15 §18 fix)**: previously this failed
*silently* — an empty allow-list just blocked every browser origin
without any error. `Program.cs` now throws at startup outside
Development if the list is empty, so a forgotten CORS variable is caught
immediately instead of shipping an API no browser can reach. Verified
live this phase (see docs/DEPLOYMENT.md's testing notes). Set to the
real canonical production origin, e.g. `https://musakuce.az` — do not
add `http://localhost:*` in production, and do not use `*`.

### Media storage (S3-compatible — MinIO locally, real S3/R2/etc. in production) — REQUIRED (Bucket/AccessKey/SecretKey) / OPTIONAL (rest)

| Variable | `.env.production` name | Controls | Secret? | Local dev default |
|---|---|---|---|---|
| `MediaStorage__Endpoint` | `MEDIA_STORAGE_ENDPOINT` | S3-compatible endpoint URL | No | `http://minio:9000` — leave unset in production to use AWS's default regional endpoint, or set to another provider's S3-compatible URL (R2, Backblaze B2, etc.) |
| `MediaStorage__Region` | `MEDIA_STORAGE_REGION` | AWS region (used only when `Endpoint` is empty) | No | `us-east-1` |
| `MediaStorage__Bucket` | `MEDIA_STORAGE_BUCKET` | Bucket name | **Yes*** | `musakuce-media` |
| `MediaStorage__AccessKey` | `MEDIA_STORAGE_ACCESS_KEY` | S3 access key ID | **Yes** | `musakuce_minio` |
| `MediaStorage__SecretKey` | `MEDIA_STORAGE_SECRET_KEY` | S3 secret access key | **Yes** | `musakuce_minio_dev` |
| `MediaStorage__ForcePathStyle` | `MEDIA_STORAGE_FORCE_PATH_STYLE` | Path-style vs. virtual-hosted S3 URLs | No | `true` (needed for MinIO; real AWS S3 typically wants `false`) |
| `MediaStorage__PublicBaseUrl` | `MEDIA_STORAGE_PUBLIC_BASE_URL` | Base URL used to build public media links returned to clients, **and** the value the frontend's `NEXT_PUBLIC_MEDIA_BASE_URL` should match | No | `http://localhost:9000/musakuce-media` — must be a browser-reachable URL (a CDN domain in production), not a Docker-internal address |

\* Bucket isn't a secret itself, but is required alongside AccessKey/SecretKey.

**Startup enforcement (Phase 15 §18 fix)**: previously a blank
`Bucket`/`AccessKey`/`SecretKey` didn't stop the API from starting — it
only failed later, on the first real upload, as a logged warning.
`Program.cs` now checks all three outside Development and refuses to
start if any is blank. Verified live this phase.

**AWS S3-specific operational note**: `MediaStorageBootstrapper` sets the
bucket's policy to public-read on first boot (needed so uploaded photos
are publicly viewable). On real AWS S3, this requires the bucket's
"Block Public Access" setting to be disabled first — if it's left at
AWS's default (blocked), the bootstrapper logs a non-fatal warning and
uploads will work but images won't load publicly. Confirm this setting
when provisioning the bucket, not after deploying.

### Built-in ASP.NET Core — REQUIRED (`ASPNETCORE_ENVIRONMENT`) / OPTIONAL (rest)

| Variable | Controls | Secret? | Local dev default |
|---|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Development` vs. everything else — gates every fail-fast check above, dev admin seeding, Swagger/OpenAPI exposure, and `RequireHttpsMetadata` for JWT bearer | No | `Development` — **must be `Production`** (or any non-`Development` value) in production |
| `ASPNETCORE_URLS` | Kestrel listen URL | No | `http://+:8080` |
| `AllowedHosts` | Host-header validation allow-list | No | `"*"` in `appsettings.json` — fine to leave as-is since Nginx (see docs/DEPLOYMENT.md) already only forwards the expected `Host` header for the configured domain |

### DEV ONLY — has no effect in production regardless of whether it's set

| Variable | Controls |
|---|---|
| `Admin__SeedEmail` / `Admin__SeedPassword` / `Admin__SeedDisplayName` | The *old* Phase 7 dev-convenience seeder (`DevAdminSeeder.SeedDevAdministratorAsync`) — only runs when `ASPNETCORE_ENVIRONMENT=Development`. Superseded in production by the explicit `AdminBootstrap__*` mechanism above; do not set these in `.env.production`, they'd simply be ignored. |

### Hardcoded, not configurable via env var (documented so it's not mistaken for a missing variable)

- Login rate limiting: 10 requests/minute per IP (`Program.cs`, policy `"login"`).
- Community photo-upload rate limiting: 10 requests/10 minutes per IP (`Program.cs`, policy `"community-upload"`).
- Identity password/lockout policy: min length 10, requires uppercase + digit, 5 failed attempts → 15-minute lockout.

Fine as fixed values for the current scale of the site; revisit only if
real traffic patterns demand it, not preemptively.

---

## Frontend (Next.js — `NEXT_PUBLIC_*` vars are baked into the client bundle **at build time**, not read at container startup, and are visible to anyone viewing page source; never put a secret in one)

| Variable | Controls | Secret? | Classification | Fallback if unset |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL the frontend calls the backend API at | No | REQUIRED for production | `http://localhost:5295` — a production build without this set will silently try to reach `localhost`, which will simply fail; no startup guard, so this must be verified post-deploy by loading the site |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used throughout SEO metadata, sitemap.xml, robots.txt, and JSON-LD | No | OPTIONAL | `https://musakuce.az` — this already **is** the real canonical production URL (apex domain, not `www.` — see §14 in docs/DEPLOYMENT.md), so the fallback is correct as-is; only override if the canonical domain ever changes |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Which remote image host `next/image` is allowed to optimize/serve from (Phase 15 §5) — must match `MediaStorage__PublicBaseUrl` above | No | REQUIRED for production | unset — local MinIO (`localhost:9000`) remains allow-listed unconditionally regardless, so development is unaffected; in production, every image from the real media host 400s until this is set **and the frontend is rebuilt** (it's read at build time, not runtime) |

`NODE_ENV` is also read once (to set the `secure` flag on the admin auth
cookie) but this is set automatically by Next.js tooling, not something
to configure manually.

**Reminder**: because `NEXT_PUBLIC_*` values are compiled into the
JavaScript bundle during `next build` / the Docker image build, changing
any of them requires rebuilding and redeploying the frontend image —
restarting the container with a different env var has no effect.

---

## `.env.production`-only variables (docker-compose.prod.yml)

These exist purely to configure the Docker Compose topology itself —
they don't map 1:1 to an application config key, or they configure more
than one service:

| Variable | Controls | Secret? |
|---|---|---|
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Postgres container's own credentials, and the values interpolated into `ConnectionStrings__Default` for `api`/`migrator`/`admin-bootstrap` | `DB_PASSWORD`: **Yes** |
| `SSL_CERT_DIR` | Host directory containing the TLS certificate/key Nginx mounts (see docs/DEPLOYMENT.md §10) | No (path, not a secret itself — but protect the directory's contents) |
| `BACKUP_RETENTION_DAYS` | How many days of local backup files `backup-database.sh` keeps before deleting old ones | No |

---

## Known, deliberate security tradeoffs (not oversights — documented so they aren't "discovered" and re-litigated during deployment)

- The admin auth cookie (`musakuce_admin_token`) is deliberately
  **not `httpOnly`** — a Phase 7 decision, documented in
  `frontend/lib/auth/constants.ts`. Carried forward as-is per Phase 14/15's
  explicit instruction not to redesign the authentication architecture.
- JWTs are stateless with no server-side revocation list — logging out
  clears the client-side cookie but a stolen token remains valid until it
  expires (`Jwt__ExpiryHours`, 12h default). Acceptable for this site's
  current risk profile; revisit if the admin surface grows.
- Rate limiting is in-memory (per-process), not distributed — fine for a
  single-instance deployment (which is what `docker-compose.prod.yml`
  describes); would need revisiting only if the API is ever horizontally
  scaled behind a load balancer.
