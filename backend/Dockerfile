# syntax=docker/dockerfile:1

# ---- build ------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
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
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
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
