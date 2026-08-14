#!/bin/sh
# Phase 15 §9/§10 — restores a pg_dump (-Fc) backup produced by
# backup-database.sh into a target database.
#
# Deliberately requires the caller to repeat the target database name via
# CONFIRM_RESTORE_TARGET, matching the positional argument exactly —
# a plain "yes/no" prompt is easy to blast through on autopilot; typing
# the actual database name again is a much stronger guard against
# restoring over the wrong target by mistake (e.g. production instead of
# a scratch/staging database).
#
# Usage:
#   PGHOST=... PGPORT=... PGUSER=... PGPASSWORD=... \
#   CONFIRM_RESTORE_TARGET=musakuce_restore_test \
#   ./restore-database.sh /backups/musakuce_x_20260101T000000Z.dump musakuce_restore_test
set -eu

dump_file="${1:?Usage: restore-database.sh <dump-file> <target-database>}"
target_db="${2:?Usage: restore-database.sh <dump-file> <target-database>}"

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:=5432}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${CONFIRM_RESTORE_TARGET:?Set CONFIRM_RESTORE_TARGET to the exact target database name to confirm this restore}"

if [ "$CONFIRM_RESTORE_TARGET" != "$target_db" ]; then
    echo "[restore] Refusing to proceed: CONFIRM_RESTORE_TARGET ('${CONFIRM_RESTORE_TARGET}') does not match the target database argument ('${target_db}')." >&2
    exit 1
fi

if [ ! -f "$dump_file" ]; then
    echo "[restore] Dump file not found: ${dump_file}" >&2
    exit 1
fi

export PGHOST PGPORT PGUSER PGPASSWORD

echo "[restore] $(date -u -Iseconds) target database: ${target_db}"

# Create the target database if it doesn't already exist. Never drops or
# creates any database other than the one explicitly named and confirmed
# above.
if ! psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '${target_db}'" | grep -q 1; then
    echo "[restore] $(date -u -Iseconds) database '${target_db}' does not exist — creating it"
    createdb "$target_db"
fi

echo "[restore] $(date -u -Iseconds) running pg_restore --clean --if-exists from ${dump_file}"
pg_restore -d "$target_db" --clean --if-exists --no-owner --no-privileges "$dump_file"

echo "[restore] $(date -u -Iseconds) restore complete into '${target_db}'"
