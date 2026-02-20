'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { DragEvent, KeyboardEvent, TouchEvent } from 'react';
import { FOLDER_COLOR_OPTIONS } from '../lib/constants/folders';
import type { Folder } from '../lib/types';
import { BRAND_SUBTITLE, BRAND_TITLE } from '../lib/constants/branding';
import FolderItem from './FolderItem';
import { SettingsIcon } from './Icons';
import {
  BrandGroup,
  BrandSubtitle,
  BrandTitle,
  EmptyState,
  MutedText,
  PanelHeader,
  PanelMeta,
  PanelTitle,
  PrimaryButton,
  TextInput
} from './ui';

type SidebarProps = {
  folders: Folder[];
  activeFolderId: string | null;
  folderTitle: string;
  folderColor: string;
  onFolderTitleChange: (value: string) => void;
  onFolderColorChange: (value: string) => void;
  onCreateFolder: () => void;
  isFolderSaving: boolean;
  isFolderReordering: boolean;
  isFoldersLoading: boolean;
  folderIdBeingDeleted: string | null;
  folderIdBeingColorUpdated: string | null;
  draggingFolderId: string | null;
  dragOverFolderId: string | null;
  editingFolderId: string | null;
  editingFolderTitle: string;
  isFolderRenaming: boolean;
  openFolderMenuId: string | null;
  onSelectFolder: (folderId: string) => void;
  onStartRename: (folder: Folder) => void;
  onCancelRename: () => void;
  onSaveRename: () => void;
  onEditingTitleChange: (value: string) => void;
  onToggleMenu: (folderId: string) => void;
  onCloseMenu: () => void;
  onDragStart: (folderId: string) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, folderId: string) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>, folderId: string) => void;
  onDrop: (folderId: string) => void;
  onDragEnd: () => void;
  onFolderTouchStart: (folderId: string) => void;
  onFolderTouchMove: (clientX: number, clientY: number) => void;
  onFolderTouchEnd: () => void;
  onDeleteFolder: (folderId: string) => Promise<void> | void;
  onChangeFolderColor: (folderId: string, color: string) => void;
  onRefreshFolders: () => Promise<void> | void;
  isSettingsActive: boolean;
  onToggleSettings: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  isMobileLayout?: boolean;
};

const PULL_REFRESH_START_DISTANCE_PX = 12;
const PULL_REFRESH_TRIGGER_DISTANCE_PX = 58;
const PULL_REFRESH_MAX_DISTANCE_PX = 120;

export default function Sidebar({
  folders,
  activeFolderId,
  folderTitle,
  folderColor,
  onFolderTitleChange,
  onFolderColorChange,
  onCreateFolder,
  isFolderSaving,
  isFolderReordering,
  isFoldersLoading,
  folderIdBeingDeleted,
  folderIdBeingColorUpdated,
  draggingFolderId,
  dragOverFolderId,
  editingFolderId,
  editingFolderTitle,
  isFolderRenaming,
  openFolderMenuId,
  onSelectFolder,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onEditingTitleChange,
  onToggleMenu,
  onCloseMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onFolderTouchStart,
  onFolderTouchMove,
  onFolderTouchEnd,
  onDeleteFolder,
  onChangeFolderColor,
  onRefreshFolders,
  isSettingsActive,
  onToggleSettings,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  isMobileLayout = false
}: SidebarProps) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [folderIdPendingDelete, setFolderIdPendingDelete] = useState<string | null>(null);
  const [pullDistancePx, setPullDistancePx] = useState(0);
  const [isPullRefreshReady, setIsPullRefreshReady] = useState(false);
  const isFolderSavingRef = useRef(false);
  const pullStartYRef = useRef<number | null>(null);
  const isPullRefreshActiveRef = useRef(false);
  const isDesktopCollapsed = !isMobileLayout && isSidebarCollapsed;
  const pendingDeleteFolder = folderIdPendingDelete
    ? folders.find((folder) => folder.id === folderIdPendingDelete) ?? null
    : null;
  const isDeleteModalOpen = Boolean(folderIdPendingDelete);
  const isDeleteInProgress = folderIdBeingDeleted === folderIdPendingDelete;

  useEffect(() => {
    if (isDesktopCollapsed && isCreateFormOpen) {
      setIsCreateFormOpen(false);
    }
  }, [isCreateFormOpen, isDesktopCollapsed]);

  useEffect(() => {
    if (isFolderSavingRef.current && !isFolderSaving && !folderTitle.trim()) {
      setIsCreateFormOpen(false);
    }

    isFolderSavingRef.current = isFolderSaving;
  }, [isFolderSaving, folderTitle]);

  useEffect(() => {
    if (!folderIdPendingDelete || typeof window === 'undefined') {
      return;
    }

    const handleWindowKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || isDeleteInProgress) {
        return;
      }

      setFolderIdPendingDelete(null);
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [folderIdPendingDelete, isDeleteInProgress]);

  useEffect(() => {
    if (!isMobileLayout) {
      pullStartYRef.current = null;
      isPullRefreshActiveRef.current = false;
      setPullDistancePx(0);
      setIsPullRefreshReady(false);
    }
  }, [isMobileLayout]);

  const handleToggleCreateForm = () => {
    if (isDesktopCollapsed) {
      onToggleSidebarCollapse();
      setIsCreateFormOpen(true);
      return;
    }

    setIsCreateFormOpen((isCurrentOpen) => !isCurrentOpen);
  };

  const handleCreateFolderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    if (isFolderSaving || isFolderReordering) {
      return;
    }

    onCreateFolder();
  };

  const handleDeletePromptOpen = (folderId: string) => {
    setFolderIdPendingDelete(folderId);
  };

  const handleDeletePromptClose = () => {
    if (isDeleteInProgress) {
      return;
    }

    setFolderIdPendingDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!folderIdPendingDelete || isDeleteInProgress) {
      return;
    }

    const folderIdToDelete = folderIdPendingDelete;
    await onDeleteFolder(folderIdToDelete);
    setFolderIdPendingDelete((currentFolderId) =>
      currentFolderId === folderIdToDelete ? null : currentFolderId
    );
  };

  const resetPullRefresh = () => {
    pullStartYRef.current = null;
    isPullRefreshActiveRef.current = false;
    setPullDistancePx(0);
    setIsPullRefreshReady(false);
  };

  const handleSidebarTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobileLayout || isFoldersLoading || isFolderReordering || event.touches.length !== 1) {
      return;
    }

    if (event.currentTarget.scrollTop > 0) {
      return;
    }

    pullStartYRef.current = event.touches[0].clientY;
    isPullRefreshActiveRef.current = true;
    setPullDistancePx(0);
    setIsPullRefreshReady(false);
  };

  const handleSidebarTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isPullRefreshActiveRef.current || pullStartYRef.current === null) {
      return;
    }

    if (event.currentTarget.scrollTop > 0 || draggingFolderId) {
      resetPullRefresh();
      return;
    }

    const touchPoint = event.touches[0];
    if (!touchPoint) {
      return;
    }

    const pullDistanceRawPx = touchPoint.clientY - pullStartYRef.current;
    if (pullDistanceRawPx <= PULL_REFRESH_START_DISTANCE_PX) {
      setPullDistancePx(0);
      setIsPullRefreshReady(false);
      return;
    }

    const pullDistanceAdjustedPx = pullDistanceRawPx - PULL_REFRESH_START_DISTANCE_PX;
    const pullDistanceLimitedPx = Math.min(PULL_REFRESH_MAX_DISTANCE_PX, pullDistanceAdjustedPx);
    setPullDistancePx(pullDistanceLimitedPx);
    setIsPullRefreshReady(pullDistanceLimitedPx >= PULL_REFRESH_TRIGGER_DISTANCE_PX);

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const handleSidebarTouchEnd = () => {
    if (!isPullRefreshActiveRef.current) {
      return;
    }

    const isRefreshTriggered = isPullRefreshReady && !isFoldersLoading;
    resetPullRefresh();

    if (isRefreshTriggered) {
      void onRefreshFolders();
    }
  };

  return (
    <SidebarShell $isSidebarCollapsed={isDesktopCollapsed}>
      {!isMobileLayout ? (
        <SidebarHeader $isSidebarCollapsed={isDesktopCollapsed}>
          {!isDesktopCollapsed ? (
            <BrandGroup>
              <BrandTitle>{BRAND_TITLE}</BrandTitle>
              <BrandSubtitle>{BRAND_SUBTITLE}</BrandSubtitle>
            </BrandGroup>
          ) : null}
          <CollapseButton
            type="button"
            onClick={onToggleSidebarCollapse}
            aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIconSvg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {isDesktopCollapsed ? (
                <path
                  d="M9 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M15 6l-6 6 6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </CollapseIconSvg>
          </CollapseButton>
        </SidebarHeader>
      ) : null}

      <SidebarBody
        $isMobileLayout={isMobileLayout}
        $isCreateFormOpen={isCreateFormOpen}
        $isSidebarCollapsed={isDesktopCollapsed}
        onTouchStart={handleSidebarTouchStart}
        onTouchMove={handleSidebarTouchMove}
        onTouchEnd={handleSidebarTouchEnd}
        onTouchCancel={resetPullRefresh}
      >
        <PullRefreshHint
          aria-hidden={!isMobileLayout || pullDistancePx === 0}
          $isVisible={isMobileLayout && pullDistancePx > 0}
          $isReady={isPullRefreshReady}
          $pullDistancePx={pullDistancePx}
        >
          {isPullRefreshReady ? 'Release to update folders' : 'Pull down to update folders'}
        </PullRefreshHint>
        {!isDesktopCollapsed ? (
          <PanelHeader>
            <PanelTitle>Folders</PanelTitle>
            <PanelMeta>{folders.length} total</PanelMeta>
          </PanelHeader>
        ) : null}

        {isFoldersLoading ? (
          <MutedText>Loading folders...</MutedText>
        ) : folders.length === 0 ? (
          <EmptyState>No folders yet. Create your first one.</EmptyState>
        ) : (
          <FolderList $isSidebarCollapsed={isDesktopCollapsed}>
            {folders.map((folder) => {
              const isEditing = folder.id === editingFolderId;
              return (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isActive={folder.id === activeFolderId}
                  isDragging={folder.id === draggingFolderId}
                  isDragOver={folder.id === dragOverFolderId}
                  isFolderDeleting={folderIdBeingDeleted === folder.id}
                  isFolderColorUpdating={folderIdBeingColorUpdated === folder.id}
                  isEditing={isEditing}
                  isFolderRenaming={isFolderRenaming}
                  isFolderReordering={isFolderReordering}
                  isMenuOpen={openFolderMenuId === folder.id}
                  isSidebarCollapsed={isDesktopCollapsed}
                  editingTitle={editingFolderTitle}
                  onEditingTitleChange={onEditingTitleChange}
                  onSelect={() => onSelectFolder(folder.id)}
                  onStartRename={() => onStartRename(folder)}
                  onCancelRename={onCancelRename}
                  onSaveRename={onSaveRename}
                  onToggleMenu={() => onToggleMenu(folder.id)}
                  onCloseMenu={onCloseMenu}
                  onDelete={() => handleDeletePromptOpen(folder.id)}
                  onChangeColor={(color) => onChangeFolderColor(folder.id, color)}
                  onDragStart={() => onDragStart(folder.id)}
                  onDragOver={(event) => onDragOver(event, folder.id)}
                  onDragLeave={(event) => onDragLeave(event, folder.id)}
                  onDrop={() => onDrop(folder.id)}
                  onDragEnd={onDragEnd}
                  onTouchReorderStart={onFolderTouchStart}
                  onTouchReorderMove={onFolderTouchMove}
                  onTouchReorderEnd={onFolderTouchEnd}
                />
              );
            })}
          </FolderList>
        )}
      </SidebarBody>

      {!isMobileLayout ? (
        <>
          {isCreateFormOpen && !isDesktopCollapsed ? (
            <DesktopComposerCard>
              <TextInput
                type="text"
                placeholder="New folder title"
                value={folderTitle}
                onChange={(event) => onFolderTitleChange(event.target.value)}
                onKeyDown={handleCreateFolderKeyDown}
              />
              <FolderColorPicker>
                {FOLDER_COLOR_OPTIONS.map((colorOption) => (
                  <FolderColorOption
                    key={colorOption}
                    type="button"
                    aria-label={`Set new folder color to ${colorOption}`}
                    $color={colorOption}
                    $isActive={folderColor.toLowerCase() === colorOption.toLowerCase()}
                    onClick={() => onFolderColorChange(colorOption)}
                  />
                ))}
              </FolderColorPicker>
              <PrimaryButton onClick={onCreateFolder} disabled={isFolderSaving || isFolderReordering}>
                Add
              </PrimaryButton>
            </DesktopComposerCard>
          ) : null}

          <SidebarFooter>
            <FooterActions $isCompact={isDesktopCollapsed}>
              <AddFolderButton
                type="button"
                $isCompact={isDesktopCollapsed}
                $isOpen={isCreateFormOpen}
                onClick={handleToggleCreateForm}
                title={isCreateFormOpen ? 'Close folder form' : 'Open folder form'}
                aria-label={isCreateFormOpen ? 'Close folder form' : 'Open folder form'}
              >
                {isCreateFormOpen ? 'x' : '+'}
              </AddFolderButton>

              <SettingsButton
                type="button"
                $isActive={isSettingsActive}
                $isCompact={isDesktopCollapsed}
                onClick={onToggleSettings}
                title="Settings"
              >
                <SettingsIcon />
                {!isDesktopCollapsed ? <SettingsLabel>Settings</SettingsLabel> : null}
              </SettingsButton>
            </FooterActions>
          </SidebarFooter>
        </>
      ) : null}

      {isMobileLayout ? (
        <MobileComposerArea $isMobileLayout={isMobileLayout}>
          {isCreateFormOpen ? (
            <MobileComposerCard>
              <TextInput
                type="text"
                placeholder="New folder title"
                value={folderTitle}
                onChange={(event) => onFolderTitleChange(event.target.value)}
                onKeyDown={handleCreateFolderKeyDown}
              />
              <FolderColorPicker>
                {FOLDER_COLOR_OPTIONS.map((colorOption) => (
                  <FolderColorOption
                    key={colorOption}
                    type="button"
                    aria-label={`Set new folder color to ${colorOption}`}
                    $color={colorOption}
                    $isActive={folderColor.toLowerCase() === colorOption.toLowerCase()}
                    onClick={() => onFolderColorChange(colorOption)}
                  />
                ))}
              </FolderColorPicker>
              <PrimaryButton onClick={onCreateFolder} disabled={isFolderSaving || isFolderReordering}>
                Add
              </PrimaryButton>
            </MobileComposerCard>
          ) : null}
          <MobileAddButton
            type="button"
            aria-label={isCreateFormOpen ? 'Close folder form' : 'Open folder form'}
            onClick={handleToggleCreateForm}
          >
            {isCreateFormOpen ? 'x' : '+'}
          </MobileAddButton>
        </MobileComposerArea>
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteOverlay
          role="presentation"
          onClick={handleDeletePromptClose}
        >
          <DeleteDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-folder-dialog-title"
            aria-describedby="delete-folder-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <DeleteTitle id="delete-folder-dialog-title">
              {pendingDeleteFolder
                ? `Delete "${pendingDeleteFolder.title}" and all notes in it?`
                : 'Delete this folder and all notes in it?'}
            </DeleteTitle>
            <DeleteDescription id="delete-folder-dialog-description">
              This action is permanent and cannot be undone.
            </DeleteDescription>
            <DeleteActions>
              <DeleteActionButton
                type="button"
                onClick={handleDeletePromptClose}
                disabled={isDeleteInProgress}
              >
                Cancel
              </DeleteActionButton>
              <DeleteActionButton
                type="button"
                $isDanger
                onClick={handleDeleteConfirm}
                disabled={isDeleteInProgress}
              >
                {isDeleteInProgress ? 'Deleting...' : 'Delete'}
              </DeleteActionButton>
            </DeleteActions>
          </DeleteDialog>
        </DeleteOverlay>
      ) : null}
    </SidebarShell>
  );
}

const SidebarShell = styled.aside<{ $isSidebarCollapsed: boolean }>`
  background: var(--panel);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: ${({ $isSidebarCollapsed }) => ($isSidebarCollapsed ? '16px 12px' : '24px')};
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 980px) {
    padding: 20px;
  }

  @media (max-width: 720px) {
    padding: 16px;
    border-radius: 16px;
  }
`;

const SidebarHeader = styled.div<{ $isSidebarCollapsed: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $isSidebarCollapsed }) =>
    $isSidebarCollapsed ? 'center' : 'space-between'};
  gap: 12px;
`;

const CollapseButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: var(--accent-dark);
    border-color: rgba(42, 158, 244, 0.45);
  }
`;

const CollapseIconSvg = styled.svg`
  width: 16px;
  height: 16px;
`;

const FolderColorPicker = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FolderColorOption = styled.button<{ $color: string; $isActive: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: none;
  background: ${({ $color }) => $color};
  cursor: pointer;
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 0 0 2px #fff inset, 0 0 0 1px rgba(28, 39, 51, 0.85)' : '0 0 0 1px rgba(28, 39, 51, 0.2)'};
`;

const SidebarBody = styled.div<{ $isMobileLayout: boolean; $isCreateFormOpen: boolean; $isSidebarCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: ${({ $isSidebarCollapsed }) => ($isSidebarCollapsed ? '0' : '6px')};
  margin-right: ${({ $isSidebarCollapsed }) => ($isSidebarCollapsed ? '0' : '-6px')};
  padding-bottom: ${({ $isMobileLayout, $isCreateFormOpen }) => {
    if ($isMobileLayout) {
      return $isCreateFormOpen ? '212px' : '90px';
    }

    return '16px';
  }};

  @media (max-width: 720px) {
    padding-right: 0;
    margin-right: 0;
    overscroll-behavior-y: contain;
  }
`;

const PullRefreshHint = styled.div<{
  $isVisible: boolean;
  $isReady: boolean;
  $pullDistancePx: number;
}>`
  align-self: center;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $isReady }) => ($isReady ? 'var(--accent-dark)' : 'var(--muted)')};
  border-radius: 999px;
  border: 1px solid
    ${({ $isVisible, $isReady }) => {
      if (!$isVisible) {
        return 'transparent';
      }

      return $isReady ? 'rgba(42, 158, 244, 0.45)' : 'rgba(107, 122, 140, 0.25)';
    }};
  background: ${({ $isVisible, $isReady }) => {
    if (!$isVisible) {
      return 'transparent';
    }

    return $isReady ? 'rgba(42, 158, 244, 0.12)' : 'rgba(255, 255, 255, 0.92)';
  }};
  padding: ${({ $isVisible }) => ($isVisible ? '4px 10px' : '0 10px')};
  max-height: ${({ $isVisible }) => ($isVisible ? '32px' : '0')};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: translateY(
    ${({ $isVisible, $pullDistancePx }) => {
      if (!$isVisible) {
        return '0';
      }

      return `${Math.min(20, Math.round($pullDistancePx * 0.35))}px`;
    }}
  );
  transition: opacity 0.12s ease, transform 0.12s ease, max-height 0.12s ease, padding 0.12s ease;
  pointer-events: none;
`;

const FolderList = styled.div<{ $isSidebarCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${({ $isSidebarCollapsed }) =>
    $isSidebarCollapsed
      ? `
    align-items: center;
  `
      : ''}
`;

const SidebarFooter = styled.div`
  margin-top: auto;
`;

const DesktopComposerCard = styled.div`
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 14px 28px rgba(15, 31, 50, 0.12);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FooterActions = styled.div<{ $isCompact: boolean }>`
  display: flex;
  gap: 8px;
  justify-content: ${({ $isCompact }) => ($isCompact ? 'center' : 'space-between')};
  align-items: center;
`;

const AddFolderButton = styled.button<{ $isCompact: boolean; $isOpen: boolean }>`
  width: 52px;
  min-width: 52px;
  height: 52px;
  border-radius: 999px;
  border: none;
  background: ${({ $isOpen }) => ($isOpen ? 'var(--accent-dark)' : 'var(--accent)')};
  color: #fff;
  font-size: 30px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(28, 127, 209, 0.28);
`;

const SettingsButton = styled.button<{ $isActive?: boolean; $isCompact?: boolean }>`
  margin: ${({ $isCompact }) => ($isCompact ? '0 auto' : '0')};
  width: ${({ $isCompact }) => ($isCompact ? '44px' : 'auto')};
  flex: ${({ $isCompact }) => ($isCompact ? '0 0 auto' : '1 1 auto')};
  border-radius: 14px;
  border: 1px solid ${({ $isActive }) => ($isActive ? 'rgba(42, 158, 244, 0.45)' : 'var(--border)')};
  background: ${({ $isActive }) => ($isActive ? 'rgba(42, 158, 244, 0.12)' : '#fff')};
  padding: ${({ $isCompact }) => ($isCompact ? '10px' : '12px 14px')};
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${({ $isActive }) => ($isActive ? 'var(--accent-dark)' : 'var(--text)')};
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease;

  &:hover {
    border-color: rgba(42, 158, 244, 0.45);
    transform: translateY(-1px);
  }

  @media (max-width: 720px) {
    justify-content: center;
  }
`;

const SettingsLabel = styled.span`
  font-size: 14px;
`;

const MobileComposerArea = styled.div<{ $isMobileLayout: boolean }>`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: ${({ $isMobileLayout }) => ($isMobileLayout ? '16px' : '88px')};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  z-index: 4;
  pointer-events: none;
`;

const MobileComposerCard = styled.div`
  width: min(320px, 100%);
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 14px 28px rgba(15, 31, 50, 0.16);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
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
  pointer-events: auto;

  &:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }
`;

const DeleteOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(14, 24, 38, 0.42);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 20px;
`;

const DeleteDialog = styled.div`
  width: min(420px, 100%);
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: 0 20px 46px rgba(15, 31, 50, 0.22);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DeleteTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
`;

const DeleteDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--muted);
`;

const DeleteActions = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const DeleteActionButton = styled.button<{ $isDanger?: boolean }>`
  min-width: 108px;
  border-radius: 12px;
  border: 1px solid ${({ $isDanger }) => ($isDanger ? 'rgba(217, 84, 77, 0.35)' : 'var(--border)')};
  background: ${({ $isDanger }) => ($isDanger ? 'var(--danger)' : '#fff')};
  color: ${({ $isDanger }) => ($isDanger ? '#fff' : 'var(--text)')};
  font-size: 14px;
  font-weight: 600;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease, border-color 0.15s ease;

  &:hover:enabled {
    transform: translateY(-1px);
    filter: brightness(0.97);
    border-color: ${({ $isDanger }) => ($isDanger ? 'rgba(217, 84, 77, 0.55)' : 'rgba(42, 158, 244, 0.45)')};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
