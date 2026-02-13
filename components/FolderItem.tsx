'use client';

import type { DragEvent, KeyboardEvent } from 'react';
import styled from 'styled-components';
import { FOLDER_COLOR_OPTIONS } from '../lib/constants/folders';
import type { Folder } from '../lib/types';
import { formatDateTime } from '../lib/utils/date';
import { MenuIcon } from './Icons';

type FolderItemProps = {
  folder: Folder;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isFolderDeleting: boolean;
  isFolderColorUpdating: boolean;
  isEditing: boolean;
  isFolderRenaming: boolean;
  isFolderReordering: boolean;
  isMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onSelect: () => void;
  onStartRename: () => void;
  onCancelRename: () => void;
  onSaveRename: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onDragStart: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
};

export default function FolderItem({
  folder,
  isActive,
  isDragging,
  isDragOver,
  isFolderDeleting,
  isFolderColorUpdating,
  isEditing,
  isFolderRenaming,
  isFolderReordering,
  isMenuOpen,
  isSidebarCollapsed,
  editingTitle,
  onEditingTitleChange,
  onSelect,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onToggleMenu,
  onCloseMenu,
  onDelete,
  onChangeColor,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}: FolderItemProps) {
  const isFolderBusy = isFolderDeleting || isFolderColorUpdating;
  const folderInitial = folder.title.trim().charAt(0).toUpperCase() || '?';
  const isCollapsedMenuVisible = !isSidebarCollapsed && !isEditing;

  return (
    <FolderItemShell
      $isActive={isActive}
      $isDragging={isDragging}
      $isDragOver={isDragOver}
      $isDeleting={isFolderBusy}
      $isCollapsed={isSidebarCollapsed}
      $isMenuOpen={isMenuOpen}
      draggable={!isSidebarCollapsed && !isEditing && !isFolderReordering && !isFolderBusy}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <FolderContent
        title={folder.title}
        onClick={() => {
          if (!isFolderBusy) {
            onSelect();
          }
        }}
        onDoubleClick={() => {
          if (!isFolderBusy && !isSidebarCollapsed) {
            onStartRename();
          }
        }}
        role="button"
        tabIndex={isEditing ? -1 : 0}
        $isCollapsed={isSidebarCollapsed}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (isEditing || isFolderBusy) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
      >
        {isSidebarCollapsed ? (
          <FolderInitialBadge $color={folder.color}>{folderInitial}</FolderInitialBadge>
        ) : isEditing ? (
          <>
            <FolderInput
              value={editingTitle}
              onChange={(event) => onEditingTitleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSaveRename();
                }
                if (event.key === 'Escape') {
                  onCancelRename();
                }
              }}
              disabled={isFolderRenaming || isFolderBusy}
              autoFocus
            />
            <FolderEditActions>
              <FolderEditButton
                type="button"
                onClick={onSaveRename}
                disabled={isFolderRenaming || isFolderBusy}
              >
                Save
              </FolderEditButton>
              <FolderEditButton
                type="button"
                onClick={onCancelRename}
                disabled={isFolderRenaming || isFolderBusy}
              >
                Cancel
              </FolderEditButton>
            </FolderEditActions>
          </>
        ) : (
          <FolderTitleRow>
            <FolderColorDot $color={folder.color} />
            <FolderTitle>{folder.title}</FolderTitle>
          </FolderTitleRow>
        )}
        {!isSidebarCollapsed ? <FolderMeta>{formatDateTime(folder.created_at)}</FolderMeta> : null}
      </FolderContent>
      {isCollapsedMenuVisible ? (
        <FolderMenu
          tabIndex={-1}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
              onCloseMenu();
            }
          }}
        >
          <FolderMenuButton
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMenu();
            }}
            disabled={isFolderReordering || isFolderBusy}
          >
            <MenuIcon />
          </FolderMenuButton>
          {isMenuOpen ? (
            <FolderMenuList role="menu">
              <FolderMenuItem
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  onStartRename();
                  onCloseMenu();
                }}
                disabled={isFolderBusy}
              >
                Rename
              </FolderMenuItem>
              <FolderMenuDangerItem
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseMenu();
                  onDelete();
                }}
                disabled={isFolderBusy}
              >
                {isFolderDeleting ? 'Deleting...' : 'Delete'}
              </FolderMenuDangerItem>
              <FolderMenuDivider />
              <FolderColorHeading>Color</FolderColorHeading>
              <FolderColorList>
                {FOLDER_COLOR_OPTIONS.map((colorOption) => (
                  <FolderColorButton
                    key={colorOption}
                    type="button"
                    role="menuitem"
                    aria-label={`Set folder color to ${colorOption}`}
                    $color={colorOption}
                    $isActive={folder.color.toLowerCase() === colorOption.toLowerCase()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onChangeColor(colorOption);
                    }}
                    disabled={isFolderBusy}
                  />
                ))}
              </FolderColorList>
            </FolderMenuList>
          ) : null}
        </FolderMenu>
      ) : null}
    </FolderItemShell>
  );
}

const FolderItemShell = styled.div<{
  $isActive?: boolean;
  $isDragging?: boolean;
  $isDragOver?: boolean;
  $isDeleting?: boolean;
  $isCollapsed?: boolean;
  $isMenuOpen?: boolean;
}>`
  background: ${({ $isActive, $isDragOver }) => {
    if ($isDragOver) {
      return 'rgba(42, 158, 244, 0.16)';
    }
    if ($isActive) {
      return 'rgba(42, 158, 244, 0.12)';
    }
    return '#f7f9fc';
  }};
  border: 1px solid ${({ $isActive, $isDragOver }) => {
    if ($isDragOver) {
      return 'rgba(42, 158, 244, 0.6)';
    }
    if ($isActive) {
      return 'rgba(42, 158, 244, 0.45)';
    }
    return 'transparent';
  }};
  border-radius: 14px;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '8px' : '12px 14px')};
  min-height: ${({ $isCollapsed }) => ($isCollapsed ? '64px' : 'auto')};
  position: relative;
  z-index: ${({ $isMenuOpen }) => ($isMenuOpen ? 12 : 1)};
  display: flex;
  align-items: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  gap: 12px;
  cursor: ${({ $isDragging, $isDeleting, $isCollapsed }) => {
    if ($isDeleting) {
      return 'not-allowed';
    }

    if ($isCollapsed) {
      return 'pointer';
    }

    return $isDragging ? 'grabbing' : 'grab';
  }};
  opacity: ${({ $isDragging, $isDeleting }) => {
    if ($isDeleting) {
      return 0.65;
    }

    return $isDragging ? 0.6 : 1;
  }};
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  transform: ${({ $isDragOver }) => ($isDragOver ? 'translateY(-2px)' : 'none')};
  box-shadow: ${({ $isDragOver }) =>
    $isDragOver ? '0 10px 24px rgba(15, 31, 50, 0.12)' : 'none'};

  &:hover {
    border-color: rgba(42, 158, 244, 0.45);
  }
`;

const FolderContent = styled.div<{ $isCollapsed: boolean }>`
  background: transparent;
  padding: 0;
  text-align: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'left')};
  display: flex;
  flex-direction: column;
  align-items: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  gap: 6px;
  flex: 1;
  cursor: pointer;
  outline: none;
`;

const FolderInitialBadge = styled.span<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color};
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: grid;
  place-items: center;
`;

const FolderInput = styled.input`
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 8px 10px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(42, 158, 244, 0.15);
  }
`;

const FolderTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FolderColorDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const FolderTitle = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const FolderMeta = styled.span`
  font-size: 12px;
  color: var(--muted);
`;

const FolderEditActions = styled.div`
  display: flex;
  gap: 8px;
`;

const FolderEditButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-dark);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FolderMenu = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
`;

const FolderMenuButton = styled.button`
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

const FolderMenuList = styled.div`
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
  min-width: 164px;
  z-index: 2;
`;

const FolderMenuItem = styled.button`
  border: none;
  background: transparent;
  padding: 8px 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(42, 158, 244, 0.12);
    color: var(--accent-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FolderMenuDangerItem = styled(FolderMenuItem)`
  color: var(--danger);

  &:hover:enabled {
    background: rgba(217, 84, 77, 0.12);
    color: var(--danger);
  }
`;

const FolderMenuDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--border);
  width: 100%;
  margin: 2px 0;
`;

const FolderColorHeading = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  padding: 0 4px;
`;

const FolderColorList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
`;

const FolderColorButton = styled.button<{ $color: string; $isActive: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: ${({ $color }) => $color};
  cursor: pointer;
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 0 2px #fff inset, 0 0 0 1px rgba(28, 39, 51, 0.85)' : '0 0 0 1px rgba(28, 39, 51, 0.2)'};

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
