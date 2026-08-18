# Phase 15 §11 — production image for the Next.js app. Not used in local
# development (that runs via `npm run dev` directly, or the frontend has
# no service in infra/docker-compose.yml's dev topology) — this exists
# solely for infra/docker-compose.prod.yml.

# Security-audit fix (§Phase 7) — pinned to the digest current as of
# 2026-08-18 (all three stages use the same base) so a future build
# can't silently pull a newer, unreviewed image under the ":22-alpine"
# tag. Repin deliberately (new `docker buildx imagetools inspect
# node:22-alpine`) when intentionally taking a base-image update.
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are baked into the client bundle at build time —
# they must be the real production values already at this step, not
# supplied later via `docker run -e`. See docs/PRODUCTION_ENV.md.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MEDIA_BASE_URL=$NEXT_PUBLIC_MEDIA_BASE_URL
RUN npm run build

# Runtime — only the standalone output (next.config.ts's output:
# "standalone"), not the full node_modules tree or source.
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node:*-alpine images ship a built-in unprivileged "node" user.
RUN apk add --no-cache curl
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
    CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
