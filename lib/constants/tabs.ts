export const CONTENT_TABS = {
  notes: 'notes',
  settings: 'settings'
} as const;

export type ContentTab = (typeof CONTENT_TABS)[keyof typeof CONTENT_TABS];

export const NOTES_VIEW = {
  list: 'list',
  bricks: 'bricks'
} as const;

export type NotesView = (typeof NOTES_VIEW)[keyof typeof NOTES_VIEW];
