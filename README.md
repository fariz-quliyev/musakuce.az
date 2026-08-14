# Musakuce.az — MUSAKÜÇƏ, BİZİM KƏND

The digital home of Musaküçə village: a long-term memory archive (history,
people, photos, obituaries, culture) combined with a daily-use village
square (current life, classifieds, services, events, local information).

See [`docs/MUSAKUCE_SPEC.md`](docs/MUSAKUCE_SPEC.md) for the full product
specification.

## Repository layout

```
frontend/   Next.js app (public site + integrated /admin CMS)
backend/    ASP.NET Core solution (Musakuce.Domain / Application /
            Infrastructure / Api)
infra/      Nginx config, docker-compose, deployment/backup scripts
docs/       Specification and planning documents
```

## Local development

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

Requires the .NET 10 SDK.

```
cd backend
dotnet build
```

### Database, object storage, and the API

Postgres, MinIO (S3-compatible object storage), and the API itself run
via Docker Compose — see `infra/docker-compose.yml` for why (Windows
Smart App Control blocks freshly-built local .NET assemblies from
running natively; the Linux containers aren't subject to that policy).

```
cd infra
docker compose up -d
```

This starts:

- **postgres** — `localhost:5432` (user/db `musakuce`)
- **minio** — S3 API at `localhost:9000`, console UI at `localhost:9001`
  (dev login: `musakuce_minio` / `musakuce_minio_dev`, see
  `docker-compose.yml`'s `minio`/`api` services). The API creates its
  media bucket (`musakuce-media`) and sets it public-read automatically
  on first boot — see `Musakuce.Infrastructure/Media/
  MediaStorageBootstrapper.cs`.
- **api** — `localhost:5295`

All credentials above are **local development defaults only**, set via
environment variables in `docker-compose.yml` (never hard-coded in
application code). For any real deployment, override every
`Jwt__*` / `Admin__Seed*` / `MediaStorage__*` variable with real
secrets from your secret manager of choice — see the doc comments on
`JwtOptions`, `DevAdminSeeder`, and `MediaStorageOptions` for exactly
what each controls.

**First Administrator account**: set `Admin__SeedEmail` and
`Admin__SeedPassword` (already set to dev defaults in
`docker-compose.yml`) — the API creates that one account on startup, in
Development only, and only if it doesn't already exist yet. From then
on, manage further admin users from `/admin/users` (Administrator role
required).

**Media storage in production**: `MediaStorageOptions` (Infrastructure)
works against any S3-compatible endpoint — set `MediaStorage__Endpoint`
to a real AWS S3 region endpoint (or leave unset to use AWS's default)
or another provider's S3-compatible URL, with real `MediaStorage__
AccessKey`/`SecretKey`, and point `MediaStorage__PublicBaseUrl` at a CDN
in front of the bucket if you have one. Nothing in application code is
MinIO-specific.

## Production readiness

- [`docs/PRODUCTION_ENV.md`](docs/PRODUCTION_ENV.md) — every environment
  variable the app reads, which are secrets, and what production needs
  that the dev defaults above don't cover.
- [`docs/BACKUP_RECOVERY.md`](docs/BACKUP_RECOVERY.md) — the intended
  database/media backup and restore strategy (documentation only; no
  backup job is implemented or scheduled yet).

## Status

Early scaffolding stage — see `docs/MUSAKUCE_SPEC.md` and the project plan
for the current development phase.
