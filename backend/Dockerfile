# syntax=docker/dockerfile:1

# ---- build ------------------------------------------------------------
# Security-audit fix (§Phase 7) — pinned to the digest current as of
# 2026-08-18 so a future `docker build` can't silently pull a newer,
# unreviewed image under the same ":10.0" tag. Repin deliberately (new
# `docker buildx imagetools inspect mcr.microsoft.com/dotnet/sdk:10.0`)
# when intentionally taking a base-image update, not automatically.
FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:e1ffd2a92ae84c1291bc1b6887501f8af98e6331e7af6d4c8d37168c5e87a64c AS build
WORKDIR /src

# Copy project files first so `dotnet restore` is cached independently
# of source-code changes.
COPY Musakuce.slnx ./
COPY Musakuce.Domain/Musakuce.Domain.csproj Musakuce.Domain/
COPY Musakuce.Application/Musakuce.Application.csproj Musakuce.Application/
COPY Musakuce.Infrastructure/Musakuce.Infrastructure.csproj Musakuce.Infrastructure/
COPY Musakuce.Api/Musakuce.Api.csproj Musakuce.Api/
RUN dotnet restore Musakuce.Api/Musakuce.Api.csproj

COPY . .
RUN dotnet publish Musakuce.Api/Musakuce.Api.csproj -c Release -o /app/publish --no-restore

# ---- final (runtime-only, no SDK) --------------------------------------
# Security-audit fix (§Phase 7) — same digest-pinning rationale as the
# build stage above.
FROM mcr.microsoft.com/dotnet/aspnet:10.0@sha256:a4556ed033fa96f984bb7a8d348851cb2d36b1281dd2420070045f664fbb5f94 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# curl for the compose-level healthcheck against /health (Program.cs) —
# the base runtime image doesn't include it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Run as the non-root "app" user baked into the official .NET 8+ Linux
# images (Phase 14 §17) instead of the image's default root — the app
# only needs to bind port 8080 and write nothing to disk, so no
# permission fixup is required beyond this.
USER app

ENTRYPOINT ["dotnet", "Musakuce.Api.dll"]
