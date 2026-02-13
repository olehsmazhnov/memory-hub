alter table public.folders
  add column if not exists color text;

update public.folders
set color = '#2A9EF4'
where color is null;

alter table public.folders
  alter column color set default '#2A9EF4';

alter table public.folders
  alter column color set not null;
