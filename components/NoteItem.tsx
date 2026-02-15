'use client';

import { useMemo, useRef, useState, type TouchEvent } from 'react';
import styled from 'styled-components';
import type { Note } from '../lib/types';
import { formatDateTime } from '../lib/utils/date';
import { getContentLink } from '../lib/utils/links';
import { getYouTubeThumbnailUrl, getYouTubeVideoId, getYouTubeWatchUrl } from '../lib/utils/youtube';
import { YOUTUBE_PREVIEW_ALT } from '../lib/constants/youtube';
import { MenuIcon } from './Icons';

type NoteItemProps = {
  note: Note;
  onPreviewLoad?: () => void;
  isMenuOpen: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  editingContent: string;
  onEditingContentChange: (value: string) => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
};

const SWIPE_TRIGGER_PX = 92;
const SWIPE_MAX_PX = 132;
const SWIPE_CANCEL_VERTICAL_PX = 52;

type SwipeDirection = 'left' | 'right' | null;

export default function NoteItem({
  note,
  onPreviewLoad,
  isMenuOpen,
  isDeleting,
  isSaving,
  isEditing,
  isUpdating,
  editingContent,
  onEditingContentChange,
  onToggleMenu,
  onCloseMenu,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete
}: NoteItemProps) {
  const videoId = getYouTubeVideoId(note.content);
  const isYouTubePreview = Boolean(videoId);
  const thumbnailUrl = videoId ? getYouTubeThumbnailUrl(videoId) : '';
  const watchUrl = videoId ? getYouTubeWatchUrl(videoId) : '';
  const contentLink = getContentLink(note.content);
  const isNoteBusy = isDeleting || isSaving || isUpdating;

  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipeTrackingRef = useRef(false);

  const swipeDirection: SwipeDirection = swipeOffset > 0 ? 'right' : swipeOffset < 0 ? 'left' : null;
  const absSwipeOffset = Math.abs(swipeOffset);
  const swipeProgress = Math.min(absSwipeOffset / SWIPE_TRIGGER_PX, 1);

  const swipeHint = useMemo(() => {
    if (swipeDirection === 'right') {
      return 'Edit';
    }

    if (swipeDirection === 'left') {
      return 'Delete';
    }

    return '';
  }, [swipeDirection]);

  const resetSwipeState = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isSwipeTrackingRef.current = false;
    setSwipeOffset(0);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    event.stopPropagation();

    if (isEditing || isNoteBusy || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isSwipeTrackingRef.current = true;
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    event.stopPropagation();

    if (!isSwipeTrackingRef.current) {
      return;
    }

    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const touch = event.touches[0];

    if (startX === null || startY === null || !touch) {
      resetSwipeState();
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaY) > SWIPE_CANCEL_VERTICAL_PX && Math.abs(deltaY) > Math.abs(deltaX)) {
      resetSwipeState();
      return;
    }

    if (Math.abs(deltaX) > 14 && Math.abs(deltaX) > Math.abs(deltaY) && event.cancelable) {
      event.preventDefault();
    }

    setSwipeOffset(Math.max(-SWIPE_MAX_PX, Math.min(SWIPE_MAX_PX, deltaX)));
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    event.stopPropagation();

    if (!isSwipeTrackingRef.current) {
      return;
    }

    const finalOffset = swipeOffset;
    resetSwipeState();

    if (finalOffset >= SWIPE_TRIGGER_PX) {
      onStartEdit();
      return;
    }

    if (finalOffset <= -SWIPE_TRIGGER_PX) {
      onDelete();
    }
  };

  const handleTouchCancel = (event: TouchEvent<HTMLElement>) => {
    event.stopPropagation();
    resetSwipeState();
  };

  return (
    <NoteSwipeShell
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <SwipeBackground $direction={swipeDirection} $progress={swipeProgress}>
        <SwipeLabel $align={swipeDirection === 'right' ? 'left' : 'right'}>{swipeHint}</SwipeLabel>
      </SwipeBackground>
      <NoteCard style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}>
        <NoteHeader>
          {!isEditing ? (
            <NoteMenu
              tabIndex={-1}
              onBlur={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                  onCloseMenu();
                }
              }}
            >
              <NoteMenuButton
                type="button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleMenu();
                }}
                disabled={isNoteBusy}
              >
                <MenuIcon />
              </NoteMenuButton>
              {isMenuOpen ? (
                <NoteMenuList role="menu">
                  <NoteMenuItem
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCloseMenu();
                      onStartEdit();
                    }}
                    disabled={isNoteBusy}
                  >
                    Edit
                  </NoteMenuItem>
                  <NoteMenuDangerItem
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCloseMenu();
                      onDelete();
                    }}
                    disabled={isNoteBusy}
                  >
                    Delete
                  </NoteMenuDangerItem>
                </NoteMenuList>
              ) : null}
            </NoteMenu>
          ) : null}
        </NoteHeader>
        {isEditing ? (
          <>
            <NoteEditTextArea
              value={editingContent}
              onChange={(event) => onEditingContentChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onCancelEdit();
                }

                if ((event.key === 'Enter' && event.ctrlKey) || (event.key === 'Enter' && event.metaKey)) {
                  event.preventDefault();
                  onSaveEdit();
                }
              }}
              disabled={isNoteBusy}
              autoFocus
            />
            <NoteEditActions>
              <NoteActionButton type="button" onClick={onSaveEdit} disabled={isNoteBusy}>
                {isUpdating ? 'Saving...' : 'Save'}
              </NoteActionButton>
              <NoteActionButton type="button" onClick={onCancelEdit} disabled={isNoteBusy}>
                Cancel
              </NoteActionButton>
            </NoteEditActions>
          </>
        ) : (
          <>
            {isYouTubePreview ? (
              <VideoPreview href={watchUrl} target="_blank" rel="noreferrer">
                <VideoThumbnail
                  src={thumbnailUrl}
                  alt={YOUTUBE_PREVIEW_ALT}
                  loading="lazy"
                  onLoad={onPreviewLoad}
                />
                <PreviewBadge>YT</PreviewBadge>
              </VideoPreview>
            ) : null}
            {contentLink ? (
              <NoteLink href={contentLink} target="_blank" rel="noreferrer">
                {note.content}
              </NoteLink>
            ) : (
              <NoteContent>{note.content}</NoteContent>
            )}
          </>
        )}
        <NoteMetaRow>
          <NoteMeta>{formatDateTime(note.created_at)}</NoteMeta>
          {isSaving ? <NoteStatus $kind="saving">Saving...</NoteStatus> : null}
          {isDeleting ? <NoteStatus $kind="deleting">Deleting...</NoteStatus> : null}
        </NoteMetaRow>
      </NoteCard>
    </NoteSwipeShell>
  );
}

const NoteSwipeShell = styled.article.attrs({
  'data-disable-nav-swipe': 'true'
})`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  touch-action: pan-y;
`;

const SwipeBackground = styled.div<{ $direction: SwipeDirection; $progress: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $direction }) => ($direction === 'right' ? 'flex-start' : 'flex-end')};
  padding: 0 16px;
  background: ${({ $direction }) =>
    $direction === 'right' ? 'rgba(22, 163, 74, 0.88)' : $direction === 'left' ? 'rgba(220, 38, 38, 0.88)' : 'transparent'};
  opacity: ${({ $progress }) => $progress};
  pointer-events: none;
  transition: opacity 0.12s ease;
`;

const SwipeLabel = styled.span<{ $align: 'left' | 'right' }>`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-align: ${({ $align }) => $align};
`;

const NoteCard = styled.div`
  border-radius: 14px;
  border: 1px solid var(--border);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9fbff;
  transition: transform 0.16s ease;

  @media (max-width: 720px) {
    padding: 12px 14px;
  }
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const NoteMenu = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
`;

const NoteMenuButton = styled.button`
  border: none;
  background: transparent;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--muted);
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--accent-dark);
    background: rgba(42, 158, 244, 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NoteMenuList = styled.div`
  position: absolute;
  top: 28px;
  right: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 12px 30px rgba(15, 31, 50, 0.12);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
  z-index: 20;

  @media (max-width: 720px) {
    top: auto;
    bottom: 28px;
  }
`;

const NoteMenuItem = styled.button`
  border: none;
  background: transparent;
  padding: 8px 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;

  &:hover:enabled {
    background: rgba(42, 158, 244, 0.12);
    color: var(--accent-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NoteMenuDangerItem = styled(NoteMenuItem)`
  color: var(--danger);

  &:hover:enabled {
    background: rgba(217, 84, 77, 0.12);
    color: var(--danger);
  }
`;

const NoteEditTextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 10px 12px;
  font-size: 14px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(42, 158, 244, 0.15);
  }

  @media (max-width: 720px) {
    font-size: 13px;
  }
`;

const NoteEditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const NoteActionButton = styled.button`
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover:enabled {
    border-color: rgba(42, 158, 244, 0.45);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const VideoPreview = styled.a`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  display: block;
  max-width: 340px;
  align-self: flex-end;

  @media (max-width: 720px) {
    max-width: 100%;
    align-self: stretch;
  }
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const PreviewBadge = styled.span`
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
`;

const NoteContent = styled.p`
  margin: 0;
  white-space: pre-wrap;
  font-size: 14px;

  @media (max-width: 720px) {
    font-size: 13px;
  }
`;

const NoteLink = styled.a`
  margin: 0;
  white-space: pre-wrap;
  font-size: 14px;
  color: var(--accent-dark);
  text-decoration: underline;
  word-break: break-word;

  &:hover {
    color: var(--accent);
  }

  @media (max-width: 720px) {
    font-size: 13px;
  }
`;

const NoteMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const NoteMeta = styled.span`
  font-size: 12px;
  color: var(--muted);
`;

const NoteStatus = styled.span<{ $kind: 'saving' | 'deleting' }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $kind }) => ($kind === 'saving' ? '#0369a1' : 'var(--danger)')};
`;
