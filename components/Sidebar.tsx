'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { DragEvent } from 'react';
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
  onDeleteFolder: (folderId: string) => void;
  onChangeFolderColor: (folderId: string, color: string) => void;
  isSettingsActive: boolean;
  onToggleSettings: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  isMobileLayout?: boolean;
};

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
  onDeleteFolder,
  onChangeFolderColor,
  isSettingsActive,
  onToggleSettings,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  isMobileLayout = false
}: SidebarProps) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const isFolderSavingRef = useRef(false);
  const isDesktopCollapsed = !isMobileLayout && isSidebarCollapsed;

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

  const handleToggleCreateForm = () => {
    if (isDesktopCollapsed) {
      onToggleSidebarCollapse();
      setIsCreateFormOpen(true);
      return;
    }

    setIsCreateFormOpen((isCurrentOpen) => !isCurrentOpen);
  };

  return (
    <SidebarShell>
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

      <SidebarBody $isMobileLayout={isMobileLayout} $isCreateFormOpen={isCreateFormOpen}>
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
                  onDelete={() => onDeleteFolder(folder.id)}
                  onChangeColor={(color) => onChangeFolderColor(folder.id, color)}
                  onDragStart={() => onDragStart(folder.id)}
                  onDragOver={(event) => onDragOver(event, folder.id)}
                  onDragLeave={(event) => onDragLeave(event, folder.id)}
                  onDrop={() => onDrop(folder.id)}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </FolderList>
        )}
      </SidebarBody>

      {!isMobileLayout ? (
        <SidebarFooter>
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
        </SidebarFooter>
      ) : null}

      <MobileComposerArea $isMobileLayout={isMobileLayout}>
        {isCreateFormOpen ? (
          <MobileComposerCard>
            <TextInput
              type="text"
              placeholder="New folder title"
              value={folderTitle}
              onChange={(event) => onFolderTitleChange(event.target.value)}
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
    </SidebarShell>
  );
}

const SidebarShell = styled.aside`
  background: var(--panel);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  position: relative;

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

const SidebarBody = styled.div<{ $isMobileLayout: boolean; $isCreateFormOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
  margin-right: -6px;
  padding-bottom: ${({ $isMobileLayout, $isCreateFormOpen }) => {
    if ($isMobileLayout) {
      return $isCreateFormOpen ? '212px' : '90px';
    }

    return $isCreateFormOpen ? '228px' : '96px';
  }};

  @media (max-width: 720px) {
    padding-right: 0;
    margin-right: 0;
  }
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

const SettingsButton = styled.button<{ $isActive?: boolean; $isCompact?: boolean }>`
  margin: ${({ $isCompact }) => ($isCompact ? '0 auto' : '0')};
  width: ${({ $isCompact }) => ($isCompact ? '44px' : '100%')};
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
