# Backup & Recovery Strategy

**Status: implemented and restore-tested (Phase 15 §9/§10).** The
database backup/restore mechanism described below is real, not just
documented — `infra/scripts/backup-database.sh` and
`infra/scripts/restore-database.sh`, wired into
`infra/docker-compose.prod.yml`'s `backup`/`restore` services under the
`production-tools` profile (never started by `docker compose up`, only
by an explicit `run --rm`). A full backup → restore-into-a-separate-
database → verify cycle was run this phase against a disposable
temporary Postgres instance (never the persistent dev database) and
confirmed to correctly reproduce all tables and data; see
`docs/DEPLOYMENT.md` §9/§10 for the exact commands and what was
verified. Off-site upload is still not implemented — see "Explicitly
out of scope" below, unchanged from Phase 14 since no off-site provider
has been chosen yet.

## What needs backing up

| Store | Contains | Loss impact |
|---|---|---|
| PostgreSQL (`musakuce` database) | All structured content: People, HistoricalEvents, Photos/Videos metadata, Places, VillageEvents, Listings, LocalInfoEntry, MemorialRecords, CulturalHeritageItems, Interviews, EducationEntries, VillageProfile, Users/Roles, AuditLog | Total — this is the archive itself. Unrecoverable without a backup. |
| Object storage (MinIO locally / S3-compatible in production) | Uploaded media files (photos, videos, documents) referenced by the DB via URL/key | Total for that file — DB rows would reference dead URLs. Media is bulkier but arguably *more* irreplaceable than most rows (family photos, historical scans). |

Both stores must be backed up together on a consistent cadence — a DB
backup without matching media, or vice versa, leaves dangling references
in one direction or the other.

## PostgreSQL backup

- **Daily**: `infra/scripts/backup-database.sh` runs `pg_dump -Fc`
  (custom format — compressed, supports selective/parallel restore)
  against the configured database, writes a timestamped file (e.g.
  `musakuce_musakuce_20260101T030000Z.dump`), and deletes local dump
  files older than `RETENTION_DAYS` (default 14, set via
  `BACKUP_RETENTION_DAYS` in `.env.production` — see
  `docs/PRODUCTION_ENV.md`). A daily cadence bounds worst-case data loss
  to under 24 hours, appropriate for a low-write-volume community/archive
  site (admin-driven content edits, not constant user writes). Scheduling
  is via host-level cron calling
  `docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm backup`
  — see `docs/DEPLOYMENT.md` §14 for the exact crontab line. Deliberately
  not a long-running container with its own internal scheduler: a one-
  shot command triggered by cron is simpler to reason about, log, and
  alert on than a service that could silently stop ticking.
- **Weekly**: run the same `backup` service manually (or via a second,
  weekly cron entry) and copy that specific dump to longer-term storage
  before the daily retention window would otherwise delete it — see
  Retention below. A separate `pg_basebackup`/infrastructure-level
  snapshot remains a reasonable second recovery path if the hosting
  provider offers one, but isn't required now that logical dumps are
  implemented and tested.
- **Retention**: the script enforces `RETENTION_DAYS` locally (default
  14). Longer retention (weekly-for-8-weeks, monthly-for-12-months) is a
  matter of copying specific dated dump files to off-site/cold storage
  before they age out locally — not something the script itself needs to
  track, since that's an off-site-storage lifecycle policy, not a local
  file-rotation one.
- **Off-site**: still not implemented — see "Explicitly out of scope"
  below. The script's local retention is not a substitute for this.
- **Encryption**: backups should be encrypted at rest at the destination
  (most object storage / managed backup services do this by default —
  confirm rather than assume for whichever provider is chosen) since a
  `pg_dump` contains the same PII as the live DB (contact info in
  Listings/LocalInfoEntry, admin user records).

## Object storage (media) backup

- If using a managed provider (AWS S3, Cloudflare R2, Backblaze B2, etc.):
  enable **versioning** on the media bucket and a **cross-region/cross-
  account replication** rule if the provider supports it, rather than
  running a separate custom media-backup job. This piggybacks on
  infrastructure the provider already operates reliably, instead of
  building a home-grown file-sync job.
- If self-hosting MinIO in production (not recommended long-term given
  the note in `infra/docker-compose.yml` that MinIO is explicitly the
  *local-dev* stand-in for a real S3-compatible provider): a periodic
  `mc mirror` to a second bucket/host, on the same cadence as the DB
  backup.

## Restore procedure (implemented and tested — `infra/scripts/restore-database.sh`)

1. **Database restore**: `restore-database.sh <dump-file> <target-database>`,
   invoked via
   `docker compose -f docker-compose.prod.yml --env-file .env.production --profile production-tools run --rm restore /backups/<file>.dump <target-database>`.
   Requires `CONFIRM_RESTORE_TARGET` to be set to the exact same target
   database name as the argument — a deliberate guard against restoring
   over the wrong database by mistake (typing the name twice is a much
   stronger check than a yes/no prompt). Creates the target database if
   it doesn't exist, then runs `pg_restore --clean --if-exists`. Run the
   application's EF Core migrations afterward (the `migrator` service)
   only if the restored dump predates a schema change that's since been
   applied; otherwise the dump already matches the current schema.
   **Tested this phase**: created sample data in a disposable temporary
   database, ran `backup-database.sh` against it, restored the resulting
   dump into a second, separate disposable database via
   `restore-database.sh`, and confirmed all 26 tables and the sample
   record were present and correct in the restored copy, while the
   original database was left untouched throughout. Both temporary
   databases were destroyed after verification — no persistent
   dev/production data was ever touched by this test.
2. **Media restore**: restore the object storage bucket from its
   versioned/replicated copy (see "Object storage (media) backup" above),
   or `mc mirror` back from the backup bucket. Confirm
   `MediaStorage__PublicBaseUrl` still resolves to the restored bucket's
   public endpoint before pointing the API at it. Not exercised this
   phase (no production media bucket exists yet to test against) — the
   database-side restore is what was actually run and verified.
3. **Verification**: after restoring both stores, spot-check that a
   handful of known content records (e.g. a few Published Photos/People/
   Memorial records) load correctly on the public site and that their
   images resolve — a restore that "succeeds" at the file level but leaves
   broken media links is still a failed restore.
4. **Point of contact**: whoever performs a real production restore
   should record what was lost (time window between last backup and
   failure) and communicate that explicitly — silent partial data loss is
   worse than an acknowledged gap.

## Explicitly out of scope for this document

- **Off-site upload** is still not implemented — `backup-database.sh`
  produces a correct local compressed dump with retention, but stops
  there. Once an off-site provider is chosen, add a single upload step
  (`aws s3 cp`, `rclone copy`, or the provider's CLI) after the dump
  succeeds in that script. The strategy is deliberately provider-neutral
  until that choice is made.
- No cron job has been installed on any real host yet (only documented —
  see `docs/DEPLOYMENT.md` §14) — that requires a real production VPS to
  install it on, which doesn't exist yet at this stage of the project.
