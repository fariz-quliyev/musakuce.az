# Deployment Guide

**Status: preparation complete, not yet deployed.** This document
describes the actual, tested project architecture — every command here
either matches a pattern already used successfully in this repository
(the dev `docker-compose.yml`'s `migrator` service) or was run and
verified during Phase 15 against disposable/temporary resources (never
the real production environment, which does not exist yet). Nothing in
this document has been executed against a real VPS, real DNS, or real
Cloudflare settings.

See also: `docs/PRODUCTION_ENV.md` (every environment variable) and
`docs/BACKUP_RECOVERY.md` (backup/restore strategy in more depth).

---

## 1. VPS prerequisites

- A Linux VPS (Debian/Ubuntu recommended — matches the `node:22-alpine`/
  `mcr.microsoft.com/dotnet/aspnet:10.0` Linux container images used
  throughout; no code in this project assumes Windows).
- At minimum: 2 vCPU / 4 GB RAM as a starting point for Postgres + API +
  frontend + Nginx on one box. Adjust once real traffic is observed —
  this isn't a measured figure, just a reasonable floor for a low-to-
  moderate-traffic community site.
- A persistent disk large enough for the Postgres data volume, the media
  bucket (if self-hosting object storage — not the default recommendation,
  see §6), and local backup retention (`BACKUP_RETENTION_DAYS` worth of
  `pg_dump` files — small relative to media, since it's structured data
  only).
- Outbound HTTPS access (for pulling Docker images, talking to the S3-
  compatible media provider, Open-Meteo for the weather widget).
- A domain (`musakuce.az`) with DNS delegated to Cloudflare.

## 2. Docker installation

Install Docker Engine + the Compose plugin per Docker's own official
instructions for your VPS's distribution (not reproduced here — this
project doesn't pin a specific Docker version, and copying install
commands that could go stale is worse than pointing at the source of
truth). Verify with:

```
docker --version
docker compose version
```

## 3. Environment configuration

Copy `docs/PRODUCTION_ENV.md`'s variable list into a `.env.production`
file **on the VPS only** (never committed — confirm it's covered by
`.gitignore` before creating it). This file is read by
`docker-compose.prod.yml` via `--env-file .env.production`.

Generate the JWT secret with a real random-bytes generator, not a typed
phrase:

```
openssl rand -base64 64
```

Set every REQUIRED variable from `docs/PRODUCTION_ENV.md` — the
application (both `Program.cs`'s fail-fast checks and this same
`.env.production` file) is the single source of truth for what's
actually required; don't guess.

## 4. Repository on the VPS

Clone the repository to the VPS (or otherwise get the source there — this
project builds its Docker images from source via `docker-compose.prod.yml`'s
`build:` blocks, it doesn't pull pre-built images from a registry).
`docker-compose.prod.yml` and `infra/scripts/*.sh` and
`infra/nginx/musakuce.conf.template` all live under `infra/` and expect
to run with `../backend` and `../frontend` as sibling directories, matching
this repo's existing layout — no different from how the dev compose file
already works.

## 5. Database setup

Bring up just Postgres first:

```
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
```

Wait for it to report healthy (`docker compose -f docker-compose.prod.yml ps`).
`docker-compose.prod.yml`'s `postgres` service uses a named volume
(`musakuce_postgres_prod_data`) — persistent across container
recreation, and does **not** publish port 5432 to the host (only reachable
from other containers on the same Compose network — verified by reading
the file: no `ports:` entry under `postgres`).

## 6. Media storage configuration

Provision a real S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze
B2, etc. — `MediaStorageOptions` on the backend is provider-agnostic, see
`docs/PRODUCTION_ENV.md`). Self-hosting MinIO in production is not
recommended (it was always documented as the *local-dev* stand-in — see
`infra/docker-compose.yml`'s comments); `docker-compose.prod.yml`
deliberately has no MinIO service.

Set `MediaStorage__*` / `MEDIA_STORAGE_*` per `docs/PRODUCTION_ENV.md`,
including the AWS-specific "Block Public Access" note if using real S3.

## 7. Migrations (explicit, controlled — never automatic)

The API does **not** run migrations on startup (confirmed: no
`Database.Migrate()` call anywhere in `Program.cs` or elsewhere). Run
them explicitly, once, before first starting `api`:

```
docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm migrator
```

This reuses the exact same pattern as the dev `migrator` service
(`mcr.microsoft.com/dotnet/sdk:10.0`, mounts `../backend`, runs
`dotnet ef database update`), pointed at the production database via
`.env.production`'s `DB_*` variables. Tested this phase against a fresh,
empty temporary Postgres database (never the persistent dev database):
all 9 migrations applied cleanly, including the Phase 14 trigram search
indexes.

## 8. Admin bootstrap

Create the first Administrator account — **explicit, one-time, safe to
re-run**:

```
docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm admin-bootstrap
```

This runs the already-built `api` image with the `--bootstrap-admin`
argument (`Program.cs`) instead of starting Kestrel — it never accepts
HTTP traffic, just runs `AdminBootstrap.RunAsync` and exits. Requires
`ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` (and optionally
`ADMIN_BOOTSTRAP_DISPLAY_NAME`) set in `.env.production` for this one
invocation.

**What it does**: creates the account via the existing ASP.NET Identity
`UserManager` (same password policy as everywhere else in the app: ≥10
chars, uppercase + digit required), assigns the `Administrator` role via
the existing RBAC model (`Roles.Administrator`), and exits 0. Never logs
the password. Never invented a separate auth system — it's the same
Identity stack the rest of the app uses.

**If an administrator already exists** (same email): logs
`"already exists ... no changes made"` and exits 0 — the password is
**never** reset and the role is **never** re-assigned. Safe to run this
command again after a redeploy, a retry, or by habit.

**Verifying the account exists**: log in at `/admin/login` with the
email/password you set, or query directly:
`docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres psql -U <DB_USER> -d <DB_NAME> -c "SELECT \"Email\" FROM \"AspNetUsers\";"`

**Disabling/removing the bootstrap credentials after first use**: these
are not a standing account with a special role — they're just the
`ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` values you typed for
one `run --rm` invocation. After the account is created: remove those two
lines from `.env.production` (or leave them — re-running is a safe no-op,
per above, so there's no urgency, but removing them avoids the password
sitting in a file longer than necessary). If you want to retire the
*account* itself later, do that the same way as any other admin user —
through `/admin/users` (Administrator role required), which is the
existing, ordinary user-management flow, not something special to
bootstrap.

**Tested this phase** (see the "Production dry run" section below for
the exact scenarios): created successfully on first run, safely no-op on
a second run with the same email, and fails clearly (exit code 1, no
account touched) if the required env vars are missing — all verified
against a disposable temporary database, never the real dev database.

## 9. Build and start the application

```
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

This builds `api` (from `backend/Dockerfile` — already non-root, Phase
14) and `frontend` (from `frontend/Dockerfile`, new this phase —
multi-stage build producing a `next.config.ts` `output: "standalone"`
bundle, also non-root, runs as the image's built-in `node` user), then
starts `postgres` (if not already up from §5), `api`, and `frontend` in
dependency order (`depends_on: condition: service_healthy` throughout).

**The bundled `nginx` service is intentionally excluded from this
command** — it's gated behind the `bundled-nginx` Compose profile (see
the file's own top-of-file comment), which a plain `up -d` never
activates. Whether you need it at all depends on which topology applies
to you — see §10 (dedicated VPS, `nginx` included) vs. §10b (shared VPS,
`nginx` never started) below.

Note: `NEXT_PUBLIC_*` values are baked into the frontend image at *build*
time (Docker `ARG`/`ENV` in `frontend/Dockerfile`) — changing one
requires `--build` again, not just a restart.

## 10. Nginx, Cloudflare, HTTPS (topology A — dedicated VPS)

**This section assumes Musakuce owns the whole VPS** (its own `nginx`
container binds 80/443 directly). **If you're deploying onto a VPS that
already runs its own host-level Nginx for another site — this project's
actual current deployment target — skip to §10b instead**, which
describes the shared-host topology: host Nginx owns 80/443, terminates
TLS via Certbot/Let's Encrypt, and reverse-proxies to Musakuce's
`api`/`frontend` containers over loopback ports. Both topologies build
from the same `docker-compose.prod.yml` and the same application images;
only how Nginx/TLS is arranged differs.

**Topology**: `Internet → Cloudflare (public HTTPS) → Nginx → {frontend, api}`.

1. In Cloudflare: issue a free **Origin Certificate** (SSL/TLS → Origin
   Server → Create Certificate) for `musakuce.az`. Save the cert/key to
   the VPS, e.g. `/etc/musakuce/certs/origin.crt` / `origin.key`, and set
   `SSL_CERT_DIR=/etc/musakuce/certs` in `.env.production`.
2. Set Cloudflare's SSL/TLS mode to **Full (strict)** — this validates
   the origin cert Cloudflare just issued, so traffic between Cloudflare
   and the VPS is always encrypted (never "Flexible", which allows
   plaintext HTTP on that leg).
3. Enable Cloudflare's "Always Use HTTPS" rule (defense in depth —
   `infra/nginx/musakuce.conf.template` also redirects 80→443 itself).
4. Render the Nginx config template (substituting the real domain and
   the cert paths from step 1) into the location
   `docker-compose.prod.yml`'s `nginx` service mounts
   (`../infra/nginx/rendered`):
   ```
   mkdir -p infra/nginx/rendered
   DOMAIN=musakuce.az \
   SSL_CERT_PATH=/etc/nginx/certs/origin.crt \
   SSL_CERT_KEY_PATH=/etc/nginx/certs/origin.key \
   envsubst '${DOMAIN} ${SSL_CERT_PATH} ${SSL_CERT_KEY_PATH}' \
     < infra/nginx/musakuce.conf.template > infra/nginx/rendered/default.conf
   ```
   (`envsubst` ships in the `gettext-base` package on Debian/Ubuntu.)
5. **Verified this phase** (syntax only, no real cert/domain — see
   "Production dry run" below): the rendered config passes `nginx -t`
   cleanly, including the `resolver 127.0.0.11` + `set $upstream_*`
   pattern needed so Nginx doesn't crash-loop if it starts before
   `api`/`frontend` are ready (a real startup-ordering issue discovered
   and fixed while syntax-testing this file this phase — the original
   version without it failed `nginx -t` with
   `host not found in upstream "api"`).

Cloudflare DNS records (**not created this phase** — DNS was explicitly
out of scope): an `A`/`AAAA` (or `CNAME`) record for `musakuce.az`
pointed at the VPS IP, proxied (orange-clouded) through Cloudflare.

## 10b. Nginx, Cloudflare, HTTPS (topology B — shared host Nginx)

**This is this project's actual deployment target**: a VPS that already
runs its own host-level Nginx serving another, unrelated site (ports
80/443 already bound by that process — confirmed by a read-only VPS
audit). Musakuce's bundled `nginx` container (§10) cannot be used here —
it would either fail to bind already-occupied ports or, worse, fight the
existing process for them. Instead:

**Topology**: `Internet → Cloudflare (public HTTPS) → host's own Nginx → {127.0.0.1:3001 frontend, 127.0.0.1:8081/api api}`.

1. **Do not start the bundled `nginx` service.** It's gated behind the
   `bundled-nginx` Compose profile specifically so the normal startup
   command (§9) never touches it. Bring up only `postgres`, `api`, and
   `frontend`.
2. `api`/`frontend` publish to **loopback-only** host ports —
   `127.0.0.1:8081→8080` and `127.0.0.1:3001→3000` respectively (see
   `docker-compose.prod.yml`'s `ports:` entries under those two
   services) — matching the same loopback-binding convention this VPS's
   other site's own containers already use. Never publish these to
   `0.0.0.0`; the host's own Nginx is the only intended caller.
3. Install a new server block into the host's existing Nginx — do not
   modify that site's own config. `infra/nginx/musakuce.host-shared.conf.example`
   is a ready-to-adapt reference (proxies `/api/` → `127.0.0.1:8081`,
   `/` → `127.0.0.1:3001`, redirects `www.musakuce.az` → `musakuce.az`,
   sets a per-server `client_max_body_size 25m` since the shared host's
   own global default may be smaller). Copy it alongside that site's
   config (e.g. `/etc/nginx/sites-available/musakuce.az`), symlink into
   `sites-enabled/`, then `nginx -t` and `systemctl reload nginx` (reload,
   not restart — avoids disturbing the other site's active connections).
4. Issue the certificate with **Certbot** (`certbot --nginx -d musakuce.az
   -d www.musakuce.az`), matching this VPS's existing certificate
   convention for its other site, rather than a Cloudflare Origin
   Certificate — Certbot rewrites the file from step 3 in place to add
   the 443/SSL server block. This is a deliberate topology-B-specific
   choice: topology A (§10) uses a Cloudflare Origin Certificate because
   it assumes Musakuce's own Nginx is the sole origin; here, matching
   the shared host's own established convention keeps certificate
   renewal (`certbot renew`, already cron-scheduled on such a host for
   its other site) uniform across every site it serves, rather than
   introducing a second, differently-managed certificate mechanism
   alongside it.
5. Cloudflare configuration (DNS record, SSL/TLS mode, "Always Use
   HTTPS", `www` redirect rule) is unchanged from §10/§11 — the
   Cloudflare-side setup doesn't depend on which origin-side topology is
   in front of it. **Not performed yet** — deliberately deferred; the
   domain itself is registered and active, but no DNS record has been
   created pointing it at this VPS.
6. Once Cloudflare is actually proxying traffic here, add the
   Cloudflare-IP-range `set_real_ip_from` / `real_ip_header
   CF-Connecting-IP` directives (already written out in
   `infra/nginx/musakuce.conf.template`, reusable verbatim) once, at the
   shared host Nginx's `http{}` scope — not duplicated per server block,
   and not needed until Cloudflare is confirmed in front of real traffic.

**Not yet done** (this phase was read-only VPS audit + this
configuration/documentation update only — no VPS file was touched, no
container started, no DNS/Cloudflare record created): steps 3–6 above
all happen on the VPS itself, not in this repository.

## 11. Public URL / canonical host

**Canonical: `https://musakuce.az`** (apex domain, not `www.`). This
isn't a new decision made in isolation — it's the domain every part of
the existing codebase already assumes (`frontend/app/layout.tsx`'s
`metadataBase` fallback, `frontend/lib/structuredData.ts`,
`frontend/app/sitemap.ts`, `frontend/app/robots.ts` — all default to
`https://musakuce.az` with no `www.` anywhere in source). Confirmed via
a repo-wide search this phase: no code references `www.musakuce.az` or
any other domain.

**Redirect strategy**: `www.musakuce.az → https://musakuce.az`, handled
at the Cloudflare level (Bulk Redirect or a Page Rule), not in
application code — this is edge/DNS-layer routing, not something Nginx
or Next.js needs to know about, and keeps the redirect working even if
Cloudflare is fronting the site before any request reaches the origin.
Add a DNS record for `www` pointed at Cloudflare (proxied) purely so the
redirect rule has something to match.

Set `NEXT_PUBLIC_SITE_URL=https://musakuce.az` and
`Cors__AllowedOrigins__0` / `PUBLIC_SITE_URL=https://musakuce.az` in
`.env.production` (see `docs/PRODUCTION_ENV.md`) — no `www.` origin
needs to be separately CORS-allowed, since it never reaches the API
directly (redirected before that).

## 12. Health checks

- `GET /health` (API) — liveness: `{"status":"ok"}`, no auth, no
  sensitive info, deliberately independent of Postgres/R2/anything
  external (confirmed by reading `Program.cs`: it's a single hardcoded
  literal, not derived from any internal state) — a database outage
  must never make an otherwise-healthy process look dead.
- `GET /health/ready` (API) — readiness (security-audit fix, Phase 10):
  additionally confirms Postgres is reachable via
  `Database.CanConnectAsync()`, no auth, returns `503` (not `200`) when
  the database can't be reached. This is what `api`'s Docker healthcheck
  now uses in both `docker-compose.yml` and `docker-compose.prod.yml` —
  `/health` still exists unchanged for anything that specifically wants
  the pure liveness check.
- `GET /` (frontend) — used by the frontend's own Docker healthcheck
  (200 = healthy).
- Nginx — healthcheck added this phase (`wget --spider` against
  `https://localhost/`).
- Postgres — `pg_isready`, already existed.

Previously this project didn't distinguish liveness from readiness as
separate endpoints — `/health` conflated both (matching Phase 14's
original assessment: a minimal container/orchestration check, not a
product feature). The security audit that added `/health/ready` above
is exactly the "reasonable future enhancement" this section used to
describe as optional; it's no longer optional now that it exists.
`depends_on: condition: service_healthy` (the `frontend` service, gated
on `api`) now means "the API can reach its database," not just "the API
process didn't crash."

## 13. Logging

Reviewed this phase (`Program.cs`, `GlobalExceptionHandler.cs`,
`AdminBootstrap.cs`, EF Core's default command logging): no password,
JWT secret, S3 secret key, connection string, or `Authorization` header
value is ever passed to a log call. EF Core's parameterized-query
logging shows `?` placeholders instead of bound values by default
(confirmed live this phase — the admin-bootstrap test's password never
appeared in output, even with EF command logging enabled). Set
`ASPNETCORE_ENVIRONMENT=Production` in production (already REQUIRED, see
`docs/PRODUCTION_ENV.md`) — this also lowers the default log verbosity
compared to Development.

Useful production log events, already in place: application start,
migration application (from the `migrator` tool's own output, not the
`api` service), `/health` checks (standard ASP.NET Core request
logging), authentication failures (login rate-limiter rejections and
Identity's own failed-login handling — neither logs the attempted
password), and all admin content actions via the existing `AuditLog`
table/UI at `/admin/audit-log` (a product feature, not just log lines).

## 14. Backup

See `docs/BACKUP_RECOVERY.md` for the full strategy. Command:

```
docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm backup
```

Schedule via host crontab (not a container-internal scheduler — see
`docs/BACKUP_RECOVERY.md` for why):

```
0 3 * * * cd /path/to/musakuce.az/infra && docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm backup >> /var/log/musakuce-backup.log 2>&1
```

Not installed on any real host this phase (no real host exists yet) —
tested by running the underlying script directly against a disposable
temporary Postgres instance (see §15 below).

## 15. Rollback

- **Application rollback**: `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build` after checking out a prior commit — the build is reproducible from source, there's no separate release-artifact registry to roll back in.
- **Database rollback**: prefer restoring from the most recent good backup (§16) over `dotnet ef database update <previous-migration>` for anything beyond the most trivial schema change — EF "down" migrations aren't exercised in normal operation and a restore is a more reliably-tested path (this phase specifically verified restore, not migration rollback).
- Because `api`/`frontend`/`nginx` all have `restart: unless-stopped` and real healthchecks, a bad deploy that fails its healthcheck will be visible via `docker compose ps` rather than silently serving broken requests indefinitely — check that before assuming a deploy succeeded.

## 16. Restore

```
docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm restore /backups/<file>.dump <target-database>
```

Requires `CONFIRM_RESTORE_TARGET=<target-database>` set to the exact
same name as the argument (`.env.production` or `-e` on the command
line) — a deliberate typed-confirmation guard, see
`docs/BACKUP_RECOVERY.md`. **Tested this phase** end-to-end against
disposable temporary databases (not the real dev database, per this
phase's explicit instruction) — full detail in
`docs/BACKUP_RECOVERY.md`'s Restore procedure section.

## 17. Production content workflow (Phase 15 §15/§16)

Not a code change — a process rule for whoever operates the admin CMS
after launch.

**Photography**: `frontend/public/images/village/DEMO_SOURCES.md`
already documents that every photo currently in the codebase is a
temporary, explicitly-licensed Pexels stock photo, not a real Musaküçə
photograph — unchanged this phase, per instruction not to touch it. The
rule going forward: **before publishing a real Musaküçə photograph
through the admin CMS**, whoever uploads it must have one of:

- ownership (they took the photo, or it's a family/community photo they
  have permission to share), or
- explicit permission from whoever does own it, or
- a clear, checkable reusable license (matching the same bar
  `DEMO_SOURCES.md` already applied when sourcing the temporary demo
  images — individually verified not to depict an identifiable
  landmark/person without consent, license terms recorded).

This isn't enforced in code (no automated way to verify a photo's
provenance), and shouldn't be — it's an editorial/admin responsibility,
the same as verifying any other historical claim before publishing it
(matches the existing `SourceStatus` field already on Photo/Person/
HistoricalEvent/etc. records, which exists for exactly this kind of
provenance tracking).

**Demo content cannot silently become production content** — verified
this phase, unchanged from Phase 14: every public page fetches through
`withFallback()` (confirmed still in place across the same 24+ call
sites checked in Phase 14), which only ever renders the Pexels/mock
fallback data when the real API call fails, and always renders the
`DataSourceNote` badge ("Nümunə məlumat — backend hələ qoşulmayıb") when
it does. Once the production API is live and reachable (which it will
be, per this phase's deployment prep), `withFallback()` always resolves
to real data and that badge never renders — there is no toggle or
config flag that could accidentally leave it showing demo content
labeled as real, or vice versa. The distinction between Demo (code-level
fallback, never touches the database), Draft (real DB row, unpublished,
`PublicationStatus.Draft`), and Published (real DB row, live) remains
exactly the three-state model already built in Phase 12 — nothing to
add here.

---

## Production dry run (Phase 15 §22) — what was actually verified

A full production-like stack (`postgres` + `api` + `frontend` + `nginx`,
built and run from `docker-compose.prod.yml` exactly as documented above)
was stood up locally under an isolated Compose project name
(`musakuce-dryrun`), using a throwaway `.env.production`-equivalent file
that lived only in the session's scratchpad (never in the repo), with
host ports remapped to 8080/8443 so it never touched the public
internet or collided with anything else. Every step below was run for
real, then the entire stack — containers, images, volumes, network, and
the temporary env/override files — was destroyed immediately after.

**What broke first, exactly as documented in §7 above**: starting `api`
before running `migrator` failed loudly (`relation "AspNetRoles" does
not exist`) — which is the *correct* behavior confirming migrations
really must run first, not a bug. Restarted in the documented order
(§5 postgres → §7 migrator → §9 up) and it proceeded cleanly.

**A real bug was found and fixed**: `/api/*` requests returned a bare
`404` straight from Nginx (never reaching the API — confirmed via the
`Server: nginx` response header and the request never appearing in the
API's own logs), even though the API responded correctly when queried
directly on the Compose network. Root cause: `musakuce.conf.template`'s
`location /api/` used `proxy_pass http://$upstream_api/api/;` — a
variable-based proxy target with a URI suffix. Nginx does not perform
its usual "replace the matched location prefix" URI rewrite when the
proxy target is a variable (needed here for the Compose-DNS-resolver
pattern, see §10 above), so the URI handling breaks silently. Fixed by
dropping the URI suffix (`proxy_pass http://$upstream_api;`) — correct
here regardless, since the backend's own routes already live at
`/api/...`, so no rewriting was ever needed. Re-verified working after
the fix, and the corrected version is what's committed in
`infra/nginx/musakuce.conf.template` — the version described earlier in
this document already reflects the fix, not the broken original.

**Verified working, in order, through the real chain
(`curl → Nginx → frontend/api → Postgres`)**:

1. `backend/Dockerfile` and `frontend/Dockerfile` both build successfully.
2. `docker-compose.prod.yml`'s `migrator` service applies all 9
   migrations to a fresh empty database.
3. `api`, `frontend`, and `nginx` all reach Docker's `healthy` state via
   their real healthchecks, in dependency order.
4. `admin-bootstrap` creates the first Administrator account through the
   real `docker compose ... run --rm admin-bootstrap` command.
5. **Frontend loads**: `GET https://localhost:8443/` → 200, through Nginx.
6. **API responds**: `GET https://localhost:8443/api/search?q=eli` → 200
   with the correct empty-result JSON shape (after the Nginx fix above).
7. **Login works**: `POST https://localhost:8443/api/auth/login` with the
   bootstrap account's credentials → 200 with a valid JWT, through the
   full Nginx→API→Postgres chain.
8. **Admin reachable**: `GET https://localhost:8443/admin/login` → 200.
9. **Sitemap/robots work**: both 200 through Nginx, matching the same
   content already verified in Phase 14.
10. **HTTP→HTTPS redirect works**: `GET http://localhost:8080/` → 301.
11. **Media storage reachable**: `MediaStorage__Endpoint` pointed at the
    existing dev MinIO instance (`http://host.docker.internal:9000`, no
    real cloud credentials used) — `MediaStorageBootstrapper` logged
    neither a creation event nor a failure warning, consistent with
    successfully finding the bucket already present and reachable. A
    full upload was not exercised (would need a multipart request
    through the community-submission or admin upload flow specifically,
    not just connectivity) — connectivity is confirmed, the upload code
    path itself was not re-tested since Phase 8 didn't change this phase.
12. `infra/nginx/musakuce.conf.template` passes `nginx -t` (both before
    and after the fix above).
13. Backup → restore → verify (§16 above) fully exercised, separately,
    against disposable temporary databases.

**Not verified** (would require real DNS/Cloudflare/a real S3 account,
all explicitly out of scope for this phase): actual Cloudflare
proxying/TLS termination; a real S3-compatible bucket end-to-end; CRUD
through the admin UI in a browser (the JWT-issuing login endpoint was
verified directly; the 43 passing backend integration tests already
cover CRUD correctness independently of this specific Docker topology);
map/weather widget rendering (unchanged client-side code, already
verified working in Phase 9-14, not re-tested here since nothing in
this phase touched them).

**Cleanup confirmed**: `docker compose ... down -v --rmi local`, plus
manual removal of the `admin-bootstrap` image and its two named tool-cache
volumes (not covered by `down` since that service is only ever invoked
via `run`, not part of the `up` topology) and the rendered Nginx config
directory. `docker ps -a` / `docker volume ls` after cleanup show only
the pre-existing, unrelated dev stack (`musakuce-api`/`musakuce-minio`/
`musakuce-postgres` and their `infra_*` volumes) — nothing dry-run-related
left behind.

## Testing (Phase 15 §23)

- `dotnet build` / `dotnet test`: 43/43 passing, 0 errors.
- `npm run lint` / `npm run build`: 0 errors (1 pre-existing, unrelated
  warning), including with `NEXT_PUBLIC_MEDIA_BASE_URL` set, to confirm
  the new `next.config.ts` branch doesn't break the build either way.
- No test data remains in the persistent dev database (all Phase 15
  testing used disposable temporary Postgres containers, destroyed after
  each test — confirmed removed: `musakuce-bootstrap-test`,
  `musakuce-migrator-test`, and their volumes).
- No production secrets were committed — `.env.production` was never
  created in the repository; `docker-compose.prod.yml` only ever
  references `${VAR}` placeholders.
- `docker-compose.prod.yml` was read back after writing to confirm: no
  `ports:` entry on `postgres`, `api`, or `frontend` (only `nginx`
  publishes 80/443); no MinIO service; `migrator`/`admin-bootstrap`/
  `backup`/`restore` are all scoped to the `production-tools` profile.
