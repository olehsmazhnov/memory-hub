'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import styled from 'styled-components';
import type { Note } from '../lib/types';
import { NOTES_VIEW, type NotesView } from '../lib/constants/tabs';
import { NOTES_GRID_MIN_WIDTH_PX } from '../lib/constants/ui';
import { BricksIcon, ListIcon } from './Icons';
import NoteItem from './NoteItem';
import {
  EmptyState,
  MutedText,
  PanelActions,
  PanelHeader,
  PanelMeta,
  PanelTitle,
  PrimaryButton,
  TextArea
} from './ui';

type NotesPanelProps = {
  activeFolderTitle: string | null;
  noteContent: string;
  onNoteContentChange: (value: string) => void;
  onCreateNote: () => void;
  isNoteSaving: boolean;
  isNotesLoading: boolean;
  notes: Note[];
  notesView: NotesView;
  onNotesViewChange: (view: NotesView) => void;
  openNoteMenuId: string | null;
  onToggleNoteMenu: (noteId: string) => void;
  onCloseNoteMenu: () => void;
  onDeleteNote: (noteId: string) => void;
  noteIdBeingDeleted: string | null;
  scrollAnchorRef: RefObject<HTMLDivElement>;
  onPreviewLoad: () => void;
  isFolderSelected: boolean;
  isMobileLayout?: boolean;
};

export default function NotesPanel({
  activeFolderTitle,
  noteContent,
  onNoteContentChange,
  onCreateNote,
  isNoteSaving,
  isNotesLoading,
  notes,
  notesView,
  onNotesViewChange,
  openNoteMenuId,
  onToggleNoteMenu,
  onCloseNoteMenu,
  onDeleteNote,
  noteIdBeingDeleted,
  scrollAnchorRef,
  onPreviewLoad,
  isFolderSelected,
  isMobileLayout = false
}: NotesPanelProps) {
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);
  const isNoteSavingRef = useRef(false);

  const viewOptions = useMemo(
    () => [
      { value: NOTES_VIEW.list, label: 'List' },
      { value: NOTES_VIEW.bricks, label: 'Bricks' }
    ],
    []
  );

  useEffect(() => {
    if (!isMobileLayout) {
      setIsMobileComposerOpen(false);
    }
  }, [isMobileLayout]);

  useEffect(() => {
    if (isNoteSavingRef.current && !isNoteSaving && !noteContent.trim()) {
      setIsMobileComposerOpen(false);
    }

    isNoteSavingRef.current = isNoteSaving;
  }, [isNoteSaving, noteContent]);

  return (
    <PanelShell>
      {!isMobileLayout ? (
        <PanelHeader>
          <PanelTitle>Notes</PanelTitle>
          <PanelActions>
            <PanelMeta>{activeFolderTitle ? `In ${activeFolderTitle}` : 'Select a folder'}</PanelMeta>
            <ViewToggle role="group" aria-label="Notes view">
              {viewOptions.map((option) => (
                <ViewButton
                  key={option.value}
                  type="button"
                  $isActive={notesView === option.value}
                  onClick={() => onNotesViewChange(option.value)}
                >
                  {option.value === NOTES_VIEW.list ? <ListIcon /> : <BricksIcon />}
                  <ViewText>{option.label}</ViewText>
                </ViewButton>
              ))}
            </ViewToggle>
          </PanelActions>
        </PanelHeader>
      ) : null}

      {!isMobileLayout ? (
        <NoteComposer>
          <TextArea
            placeholder={activeFolderTitle ? 'Write a note...' : 'Pick a folder to start writing'}
            value={noteContent}
            onChange={(event) => onNoteContentChange(event.target.value)}
            disabled={!isFolderSelected}
          />
          <NoteSendButton onClick={onCreateNote} disabled={isNoteSaving || !isFolderSelected}>
            Add note
          </NoteSendButton>
        </NoteComposer>
      ) : null}

      <ContentScrollArea $isMobileLayout={isMobileLayout} $isMobileComposerOpen={isMobileComposerOpen}>
        {isNotesLoading ? (
          <MutedText>Loading notes...</MutedText>
        ) : !isFolderSelected ? (
          <EmptyState>Select a folder to see its notes.</EmptyState>
        ) : notes.length === 0 ? (
          <EmptyState>No notes yet. Add the first one.</EmptyState>
        ) : notesView === NOTES_VIEW.list ? (
          <NotesList>
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onPreviewLoad={onPreviewLoad}
                isMenuOpen={openNoteMenuId === note.id}
                isDeleting={noteIdBeingDeleted === note.id}
                onToggleMenu={() => onToggleNoteMenu(note.id)}
                onCloseMenu={onCloseNoteMenu}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </NotesList>
        ) : (
          <NotesGrid>
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onPreviewLoad={onPreviewLoad}
                isMenuOpen={openNoteMenuId === note.id}
                isDeleting={noteIdBeingDeleted === note.id}
                onToggleMenu={() => onToggleNoteMenu(note.id)}
                onCloseMenu={onCloseNoteMenu}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </NotesGrid>
        )}
        <ScrollAnchor ref={scrollAnchorRef} />
      </ContentScrollArea>

      {isMobileLayout ? (
        <MobileComposerArea>
          {isMobileComposerOpen ? (
            <MobileComposerCard>
              <TextArea
                placeholder={activeFolderTitle ? 'Write a note...' : 'Pick a folder to start writing'}
                value={noteContent}
                onChange={(event) => onNoteContentChange(event.target.value)}
                disabled={!isFolderSelected}
              />
              <PrimaryButton onClick={onCreateNote} disabled={isNoteSaving || !isFolderSelected}>
                Add note
              </PrimaryButton>
            </MobileComposerCard>
          ) : null}
          <MobileAddButton
            type="button"
            aria-label={isMobileComposerOpen ? 'Close note form' : 'Open note form'}
            onClick={() => setIsMobileComposerOpen((isCurrentOpen) => !isCurrentOpen)}
          >
            {isMobileComposerOpen ? 'x' : '+'}
          </MobileAddButton>
        </MobileComposerArea>
      ) : null}
    </PanelShell>
  );
}

const PanelShell = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
`;

const NoteComposer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
`;

const ContentScrollArea = styled.div<{ $isMobileLayout: boolean; $isMobileComposerOpen: boolean }>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  margin-right: -6px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: ${({ $isMobileLayout, $isMobileComposerOpen }) => {
    if (!$isMobileLayout) {
      return '0';
    }

    return $isMobileComposerOpen ? '250px' : '90px';
  }};

  @media (max-width: 720px) {
    padding-right: 0;
    margin-right: 0;
  }
`;

const ScrollAnchor = styled.div`
  height: 1px;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotesGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(${NOTES_GRID_MIN_WIDTH_PX}px, 1fr));
`;

const NoteSendButton = styled(PrimaryButton)`
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 8px 14px;

  @media (max-width: 720px) {
    right: 10px;
    bottom: 10px;
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const ViewToggle = styled.div`
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px;
  background: #fff;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

const ViewButton = styled.button<{ $isActive?: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ $isActive }) => ($isActive ? 'rgba(42, 158, 244, 0.18)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'var(--accent-dark)' : 'var(--muted)')};
  cursor: pointer;

  &:hover {
    color: var(--accent-dark);
  }

  @media (max-width: 720px) {
    flex: 1;
    justify-content: center;
  }
`;

const ViewText = styled.span`
  font-size: 12px;

  @media (max-width: 420px) {
    display: none;
  }
`;

const MobileComposerArea = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  z-index: 4;
`;

const MobileComposerCard = styled.div`
  width: min(360px, calc(100vw - 68px));
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 14px 28px rgba(15, 31, 50, 0.16);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  & textarea {
    min-height: 110px;
    padding-right: 12px;
    padding-bottom: 12px;
  }
`;

const MobileAddButton = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(28, 127, 209, 0.34);
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }
`;
