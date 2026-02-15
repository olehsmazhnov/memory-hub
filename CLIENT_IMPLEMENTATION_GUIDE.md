# Memory Hub — Client Implementation Guide

This document explains the app architecture and behavior so you can build another client (for example React Native) against the same backend.

## 1) Product Model

Memory Hub is a personal notes app with:
- Authenticated users
- Folders
- Notes inside folders
- Basic settings (email, username, password)
- PWA share-target flow (web-only)

Core UX rules:
- A user only sees their own data
- Folder order is user-defined (`sort_order`)
- Notes are shown oldest -> newest in UI
- New notes are appended optimistically with temporary `saving` status
- Deletes become temporary `deleting` status until confirmed by backend

---

## 2) Backend and Data Source

- Backend: Supabase (Postgres + Auth + RLS)
- Client SDK in web app: `@supabase/supabase-js`
- Supabase client setup: `lib/supabaseClient.ts`

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database entities

Defined by SQL migrations under `supabase/migrations`.

Main tables:
- `folders`
  - `id`
  - `user_id`
  - `title`
  - `color`
  - `sort_order`
  - `created_at`
- `notes`
  - `id`
  - `folder_id`
  - `user_id`
  - `content`
  - `created_at`

RLS policies ensure each user can only access their own rows.

---

## 3) Frontend Architecture (Web)

## Entry points
- `app/page.tsx` — main app composition and mobile navigation gestures
- `app/layout.tsx` — metadata/layout root
- `app/share-target/route.ts` — receives web share payload and redirects to `/` with query params

## State hooks (business logic)
- `hooks/useAuthSession.ts` — auth session subscription/loading
- `hooks/useAuthActions.ts` — sign in/up/out and auth actions
- `hooks/useFolders.ts` — folder CRUD, reorder, color, counters
- `hooks/useNotes.ts` — notes CRUD + pagination + optimistic create/delete statuses
- `hooks/useSettings.ts` — account settings updates
- `hooks/useToastMessages.ts` — success/error/info toast state
- `hooks/useScrollToBottom.ts` — scroll helper for notes list

## UI components
- `components/Sidebar.tsx` — folders panel
- `components/NotesPanel.tsx` — note composer/list and delete confirmation modal
- `components/NoteItem.tsx` — single note card (menu + swipe actions on mobile)
- `components/SettingsPanel.tsx` — account settings and displayed app version

---

## 4) Critical UX Behaviors to Match in New Client

### 4.1 Folders
- Load user folders ordered by:
  1. `sort_order DESC`
  2. `created_at DESC`
- Show per-folder note count
- Reorder folders by writing updated `sort_order`
- Folder delete requires confirm modal

### 4.2 Notes list + pagination
- Initial load: latest page (currently 30), then reverse for UI so order is oldest -> newest
- On scroll-to-top: load older notes page (`created_at < oldestLoaded.created_at`)
- Append older page to the beginning of current list

### 4.3 Note create (non-blocking optimistic)
- On add:
  - Insert temporary note into list immediately with `ui_status = 'saving'`
  - Clear composer immediately
  - Keep UI interactive
- On success: replace temp note with server note
- On failure: remove temp note, show error

### 4.4 Note delete (non-blocking + confirm)
- Trigger (menu delete or swipe delete) opens confirm modal
- After confirm:
  - Mark note `ui_status = 'deleting'`
  - Disable interactions for that note only
  - Keep rest of UI interactive
- On success: remove note from list
- On failure: remove deleting state and show error

### 4.5 Mobile note gestures
- Swipe right on note => Edit
- Swipe left on note => Delete (opens confirm modal)
- Swipe colors:
  - Right/edit: green
  - Left/delete: red
- Note swipe area blocks global app tab-swipe navigation

### 4.6 Mobile composer behavior
- Opening new-note composer auto-focuses textarea
- After submit, composer closes

### 4.7 PWA orientation
- Orientation is locked to portrait (`portrait-primary`) in PWA manifest constants

---

## 5) Query/Mutation Patterns (reference)

### Load folders
```ts
supabase
  .from('folders')
  .select('id, user_id, title, color, sort_order, created_at, notes(count)')
  .eq('user_id', userId)
  .order('sort_order', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false });
```

### Load latest notes page
```ts
supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .eq('folder_id', folderId)
  .order('created_at', { ascending: false })
  .limit(30);
```

### Load older notes page
```ts
supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .eq('folder_id', folderId)
  .lt('created_at', oldestCreatedAt)
  .order('created_at', { ascending: false })
  .limit(30);
```

### Create note
```ts
supabase
  .from('notes')
  .insert({ content, folder_id, user_id })
  .select('*')
  .single();
```

### Delete note
```ts
supabase
  .from('notes')
  .delete()
  .eq('id', noteId)
  .eq('user_id', userId);
```

---

## 6) React Native Client Plan (recommended)

For React Native, keep this layering:

1. **Supabase service layer**
   - `authService`
   - `foldersService`
   - `notesService`

2. **State layer**
   - Zustand or Redux Toolkit
   - Keep optimistic note states (`saving` / `deleting`) in store

3. **Screens**
   - Auth screen
   - Folders + Notes screen
   - Settings screen

4. **Gestures**
   - Use `react-native-gesture-handler` / Reanimated
   - Mirror thresholds and action directions from web

5. **Pagination**
   - FlatList `onEndReached` equivalent for older notes while preserving chronological display

6. **Consistency rules**
   - Always scope reads/writes by authenticated user
   - Keep folder counters in sync on optimistic create/delete

---

## 7) Versioning

Current app version is synchronized between:
- `package.json`
- `next.config.js` (`appVersion` and `NEXT_PUBLIC_APP_VERSION`)

Settings screen reads and displays `NEXT_PUBLIC_APP_VERSION`.

---

## 8) Files map (quick)

- Main page logic: `app/page.tsx`
- Share target route: `app/share-target/route.ts`
- Notes logic: `hooks/useNotes.ts`
- Folders logic: `hooks/useFolders.ts`
- Notes UI: `components/NotesPanel.tsx`, `components/NoteItem.tsx`
- Settings UI/version: `components/SettingsPanel.tsx`
- Supabase client: `lib/supabaseClient.ts`
- Types: `lib/types/index.ts`

If you want, next step I can generate a ready-to-use **React Native API contract + screen-by-screen implementation checklist** from this guide.
