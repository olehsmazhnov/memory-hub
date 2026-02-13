drop policy if exists "notes_update_own" on public.notes;

create policy "notes_update_own"
  on public.notes
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.folders
      where folders.id = notes.folder_id
        and folders.user_id = auth.uid()
    )
  );
