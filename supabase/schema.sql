-- Selaras production schema for Supabase/Postgres.
-- Safe to run repeatedly. It creates/updates the app table used by the Next.js app.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique  on delete cascade,
  bride_name text not null default '',
  groom_name text not null default '',
  wedding_date date,
  city text not null default '',
  venue text not null default '',
  guest_count integer not null default 0,
  template text not null default 'Internasional',
  concept text not null default '',
  phase_plan text not null default '',
  moments text not null default '',
  next_steps text not null default '',
  vendor_plan text not null default '',
  guest_plan text not null default '',
  budget_plan text not null default '',
  document_plan text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.projects
  add column if not exists venue text not null default '';

create index if not exists projects_owner_user_id_idx
  on public.projects(owner_user_id);

alter table public.projects enable row level security;

drop policy if exists "Users can view own project" on public.projects;
create policy "Users can view own project"
on public.projects
for select
using (owner_user_id = owner_user_id);

drop policy if exists "Users can insert own project" on public.projects;
create policy "Users can insert own project"
on public.projects
for insert
with check (owner_user_id = owner_user_id);

drop policy if exists "Users can update own project" on public.projects;
create policy "Users can update own project"
on public.projects
for update
using (owner_user_id = owner_user_id)
with check (owner_user_id = owner_user_id);

drop policy if exists "Users can delete own project" on public.projects;
create policy "Users can delete own project"
on public.projects
for delete
using (owner_user_id = owner_user_id);

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();
