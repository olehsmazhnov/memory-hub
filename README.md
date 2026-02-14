# Memory Hub

Memory Hub is a Next.js + Supabase app for storing personal notes in folders, with a mobile-friendly UI and PWA install support.

## Features

- Email/password sign up, sign in, sign out (Supabase Auth) with duplicate email check on sign up
- Sign in with Google (Supabase OAuth) - temporarily disabled in UI
- Folder management:
  - Create folder
  - Rename folder
  - Reorder folders with drag and drop
  - Change folder color
  - Show message count per folder
  - Update folders with swipe down on mobile
  - Delete folder
- Notes:
  - Create note in selected folder
  - Show notes count in opened folder
  - Edit note
  - Delete note
  - Switch between list and bricks view
- Link handling:
  - Clickable URL notes
  - YouTube thumbnail preview for YouTube links
- Account settings:
  - Update email
  - Mask email value by default in settings with blur filter
  - Update username metadata
  - Update password
- PWA:
  - Installable on mobile
  - Swipe left/right navigation between sections on mobile
  - Web Share Target endpoint for sharing links (for example from YouTube) into the app draft

## Tech Stack

- Next.js 15 (App Router)
- React 18 + TypeScript
- styled-components
- Supabase (Auth + Postgres + RLS)

## Prerequisites

- Node.js 18.17+ (or Node 20+ recommended)
- npm
- A Supabase project

## Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_ORIGIN` (canonical app origin for safe server redirects; set to your deployed HTTPS origin in production)

## Database Setup (Supabase)

Run SQL migrations in order in your Supabase SQL editor:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_add_folder_color.sql`
3. `supabase/migrations/003_enforce_notes_update_folder_ownership.sql`

These migrations create:

- `public.folders` table
- `public.notes` table
- indexes
- row-level security policies so users can only access their own records

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open:

`http://localhost:3000`

## Production Build

```bash
npm run build
npm run start
```

## NPM Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - Next.js lint command

## Mobile PWA + YouTube Share

To use share-to-app flow:

1. Deploy the app over HTTPS.
2. Open it on mobile and install it to home screen.
3. In YouTube, tap **Share** and select **Memory Hub**.
4. The app opens with shared data prefilled in the note draft.
5. Select folder and tap **Add note**.

Notes:

- Web Share Target works best on Chromium-based mobile browsers.
- iOS Safari PWA share-target support is limited.

## Project Structure

```text
app/                  Next.js app router pages/routes
components/           UI components
hooks/                State/data hooks
lib/                  constants, utils, supabase client, types
public/               static files (icons, service worker)
supabase/migrations/  SQL migrations
```

## Notes

- `npm run lint` may prompt to initialize ESLint config if one is not set up yet.
- `.env.local` is ignored by git.
