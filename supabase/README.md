# Supabase Schema

App Selaras saat ini membutuhkan tabel aplikasi `public.projects` yang berelasi ke `auth.users`.

## Jalankan dari VPS

Set `DATABASE_URL` ke connection string Supabase Postgres, lalu jalankan script:

```bash
export DATABASE_URL='postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require'
bash scripts/apply-supabase-schema.sh
```

Gunakan password database dari Supabase Dashboard. Jika port pooler `6543` bermasalah untuk operasi schema, gunakan direct connection string Supabase.

## Alternatif SQL Editor

Copy isi `supabase/schema.sql` ke Supabase SQL Editor, lalu klik Run.

## Seed Demo

Data demo tetap terpisah di `supabase/migrations/20260406_003_seed_demo_project.sql`.
Jalankan seed hanya kalau user `demo@selaras.app` sudah ada di Supabase Auth.
