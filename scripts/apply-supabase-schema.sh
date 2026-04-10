#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_FILE="$ROOT_DIR/supabase/schema.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql tidak ditemukan. Install postgresql-client dulu di VPS."
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL belum diset."
  echo "Contoh:"
  echo "  export DATABASE_URL='postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require'"
  exit 1
fi

echo "Applying Supabase schema from $SCHEMA_FILE"
psql "$DATABASE_URL" \
  --set ON_ERROR_STOP=on \
  --file "$SCHEMA_FILE"

echo "Schema berhasil diterapkan."
