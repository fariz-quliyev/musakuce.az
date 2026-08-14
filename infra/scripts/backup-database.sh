#!/bin/sh
# Phase 15 §9 — daily/weekly PostgreSQL backup.
#
# Runs pg_dump in the custom (-Fc) format (compressed, supports
# selective/parallel restore via pg_restore) against the configured
# database, writes a timestamped file into BACKUP_DIR, then deletes
# local dump files older than RETENTION_DAYS. This script only ever
# reads the source database (pg_dump) and only ever deletes files it
# itself created inside BACKUP_DIR — it never touches live database
# tables, so there is no destructive path against production data.
#
# Off-site copy: intentionally NOT implemented here (no off-site
# provider has been chosen yet — see docs/BACKUP_RECOVERY.md). Once one
# is, add a single upload step after the dump succeeds (e.g. `aws s3 cp`,
# `rclone copy`, or the provider's CLI) — this script's job stops at
# producing a correct local compressed dump plus retention.
#
# Usage: PGHOST=... PGPORT=... PGDATABASE=... PGUSER=... PGPASSWORD=... \
#        BACKUP_DIR=/backups RETENTION_DAYS=14 ./backup-database.sh
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:=5432}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${BACKUP_DIR:=/backups}"
: "${RETENTION_DAYS:=14}"

export PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD

mkdir -p "$BACKUP_DIR"

timestamp=$(date -u +%Y%m%dT%H%M%SZ)
dump_file="$BACKUP_DIR/musakuce_${PGDATABASE}_${timestamp}.dump"
tmp_file="${dump_file}.in-progress"

echo "[backup] $(date -u -Iseconds) starting pg_dump of '${PGDATABASE}' -> ${dump_file}"

if pg_dump -Fc --no-owner --no-privileges -f "$tmp_file"; then
    mv "$tmp_file" "$dump_file"
    size=$(du -h "$dump_file" | cut -f1)
    echo "[backup] $(date -u -Iseconds) succeeded: ${dump_file} (${size})"
else
    status=$?
    rm -f "$tmp_file"
    echo "[backup] $(date -u -Iseconds) FAILED (pg_dump exit ${status}) — no partial file left behind" >&2
    exit "$status"
fi

# Retention: only ever deletes files matching this script's own naming
# pattern inside BACKUP_DIR, older than RETENTION_DAYS — never touches
# anything else that might live in the same directory.
deleted=0
for old_file in "$BACKUP_DIR"/musakuce_"${PGDATABASE}"_*.dump; do
    [ -e "$old_file" ] || continue
    if [ "$(find "$old_file" -mtime +"$RETENTION_DAYS" 2>/dev/null)" != "" ]; then
        rm -f "$old_file"
        echo "[backup] $(date -u -Iseconds) removed old backup (older than ${RETENTION_DAYS}d): ${old_file}"
        deleted=$((deleted + 1))
    fi
done

echo "[backup] $(date -u -Iseconds) retention cleanup complete (${deleted} old file(s) removed)"
