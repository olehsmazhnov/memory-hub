-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  sort_order bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.folders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_folders_user_created_at
  on public.folders (user_id, created_at desc);

create index if not exists idx_folders_user_sort_order
  on public.folders (user_id, sort_order desc);

create index if not exists idx_notes_folder_created_at
  on public.notes (folder_id, created_at asc);

create index if not exists idx_notes_user_id
  on public.notes (user_id);

-- RLS
alter table public.folders enable row level security;
alter table public.notes enable row level security;

-- Policies: folders
create policy "folders_select_own"
  on public.folders
  for select
  using (auth.uid() = user_id);

create policy "folders_insert_own"
  on public.folders
  for insert
  with check (auth.uid() = user_id);

create policy "folders_update_own"
  on public.folders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "folders_delete_own"
  on public.folders
  for delete
  using (auth.uid() = user_id);

-- Policies: notes
create policy "notes_select_own"
  on public.notes
  for select
  using (auth.uid() = user_id);

create policy "notes_insert_own_folder"
  on public.notes
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.folders
      where folders.id = notes.folder_id
        and folders.user_id = auth.uid()
    )
  );

create policy "notes_update_own"
  on public.notes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes
  for delete
  using (auth.uid() = user_id);
