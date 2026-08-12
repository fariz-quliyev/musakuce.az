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

### Database

A local PostgreSQL instance is provided via Docker Compose:

```
cd infra
docker compose up -d
```

## Status

Early scaffolding stage — see `docs/MUSAKUCE_SPEC.md` and the project plan
for the current development phase.
