alter table public.projects
add column if not exists venue text not null default '';
