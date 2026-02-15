'use client';

import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import AuthLayout from '../components/AuthLayout';
import NotesPanel from '../components/NotesPanel';
import SettingsPanel from '../components/SettingsPanel';
import Sidebar from '../components/Sidebar';
import StatusCard from '../components/StatusCard';
import ToastStack from '../components/ToastStack';
import { SettingsIcon } from '../components/Icons';
import useAuthActions from '../hooks/useAuthActions';
import useAuthSession from '../hooks/useAuthSession';
import useFolders from '../hooks/useFolders';
import useNotes from '../hooks/useNotes';
import useScrollToBottom from '../hooks/useScrollToBottom';
import useSettings from '../hooks/useSettings';
import useToastMessages from '../hooks/useToastMessages';
import { CONTENT_TABS, NOTES_VIEW, type ContentTab, type NotesView } from '../lib/constants/tabs';
import { SHARED_DRAFT_INFO_MESSAGE } from '../lib/constants/pwa';
import { getSharedDraft, getSharedPayloadFromSearchParams } from '../lib/utils/shareTarget';

const MOBILE_BREAKPOINT_PX = 720;
const MOBILE_NAV_HEIGHT_PX = 76;
const MOBILE_NAV_SIDE_GUTTER_PX = 20;
const MOBILE_SWIPE_TRIGGER_PX = 72;
const MOBILE_SWIPE_VERTICAL_TOLERANCE_PX = 52;
const MOBILE_SWIPE_CANCEL_VERTICAL_PX = 72;
const MOBILE_SWIPE_PREVENT_DEFAULT_PX = 18;

export default function Page() {
  const [activeTab, setActiveTab] = useState<ContentTab>(CONTENT_TABS.notes);
  const [notesView, setNotesView] = useState<NotesView>(NOTES_VIEW.list);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMobileFolderListVisible, setIsMobileFolderListVisible] = useState(true);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const isSwipeNavigationTrackingRef = useRef(false);

  const { errorMessage, infoMessage, setErrorMessage, setInfoMessage, clearMessages } =
    useToastMessages();
  const { session, isSessionLoading } = useAuthSession({ onError: setErrorMessage });
  const { signIn, signUp, signOut, isAuthWorking } = useAuthActions({
    onError: setErrorMessage,
    onInfo: setInfoMessage,
    clearMessages
  });

  const {
    folders,
    activeFolderId,
    setActiveFolderId,
    folderTitle,
    setFolderTitle,
    folderColor,
    setFolderColor,
    isFoldersLoading,
    isFolderSaving,
    isFolderRenaming,
    isFolderReordering,
    folderIdBeingColorUpdated,
    folderIdBeingDeleted,
    draggingFolderId,
    dragOverFolderId,
    editingFolderId,
    editingFolderTitle,
    setEditingFolderTitle,
    openFolderMenuId,
    setOpenFolderMenuId,
    handleCreateFolder,
    handleFolderDragStart,
    handleFolderDragOver,
    handleFolderDragLeave,
    handleFolderDragEnd,
    handleFolderDrop,
    handleFolderTouchStart,
    handleFolderTouchMove,
    handleFolderTouchEnd,
    handleStartFolderRename,
    handleCancelFolderRename,
    handleSaveFolderRename,
    handleFolderColorChange,
    handleDeleteFolder,
    handleFolderMessageCountChange,
    handleRefreshFolders
  } = useFolders({
    session,
    onError: setErrorMessage,
    onInfo: setInfoMessage,
    clearMessages
  });

  const {
    sortedNotes,
    noteContent,
    setNoteContent,
    isNotesLoading,
    isLoadingMoreNotes,
    hasMoreNotes,
    loadMoreNotes,
    isNoteSaving,
    isNoteUpdating,
    openNoteMenuId,
    setOpenNoteMenuId,
    noteIdBeingDeleted,
    editingNoteId,
    editingNoteContent,
    setEditingNoteContent,
    handleCreateNote,
    handleDeleteNote,
    handleStartNoteEdit,
    handleCancelNoteEdit,
    handleSaveNoteEdit
  } = useNotes({
    session,
    activeFolderId,
    onError: setErrorMessage,
    onInfo: setInfoMessage,
    clearMessages,
    onFolderMessageCountChange: handleFolderMessageCountChange
  });

  const {
    settingsEmail,
    setSettingsEmail,
    settingsUsername,
    setSettingsUsername,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSettingsSaving,
    handleSaveSettings
  } = useSettings({
    session,
    onError: setErrorMessage,
    onInfo: setInfoMessage,
    clearMessages
  });

  const activeFolder = useMemo(
    () => folders.find((folder) => folder.id === activeFolderId) ?? null,
    [folders, activeFolderId]
  );

  const latestNoteId = sortedNotes.length ? sortedNotes[sortedNotes.length - 1].id : null;

  const { anchorRef: notesAnchorRef, scrollToBottom } = useScrollToBottom({
    isEnabled: activeTab === CONTENT_TABS.notes,
    dependencies: [activeFolderId, notesView, latestNoteId]
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    setIsMobileViewport(mediaQuery.matches);

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
      return () => {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      };
    }

    legacyMediaQuery.addListener?.(handleMediaQueryChange);
    return () => {
      legacyMediaQuery.removeListener?.(handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sharedPayload = getSharedPayloadFromSearchParams(new URLSearchParams(window.location.search));
    const sharedDraft = getSharedDraft(sharedPayload);

    if (!sharedDraft) {
      return;
    }

    setNoteContent((currentNoteContent) => {
      const trimmedCurrentNoteContent = currentNoteContent.trim();

      if (!trimmedCurrentNoteContent) {
        return sharedDraft;
      }

      if (trimmedCurrentNoteContent.includes(sharedDraft)) {
        return currentNoteContent;
      }

      return `${currentNoteContent}\n${sharedDraft}`;
    });
    setInfoMessage(SHARED_DRAFT_INFO_MESSAGE);
  }, [setInfoMessage, setNoteContent]);

  useEffect(() => {
    if (!session) {
      setActiveTab(CONTENT_TABS.notes);
      setIsMobileFolderListVisible(true);
      setIsSidebarCollapsed(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isMobileViewport || activeTab !== CONTENT_TABS.notes) {
      return;
    }

    if (!activeFolderId) {
      setIsMobileFolderListVisible(true);
    }
  }, [activeFolderId, activeTab, isMobileViewport]);

  useEffect(() => {
    if (isMobileViewport) {
      setIsSidebarCollapsed(false);
    }
  }, [isMobileViewport]);

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setActiveTab(CONTENT_TABS.notes);

    if (isMobileViewport) {
      setIsMobileFolderListVisible(false);
    }
  };

  const handleToggleSettings = () => {
    setActiveTab((currentTab) =>
      currentTab === CONTENT_TABS.settings ? CONTENT_TABS.notes : CONTENT_TABS.settings
    );
  };

  const handleOpenMobileFolders = () => {
    setActiveTab(CONTENT_TABS.notes);
    setIsMobileFolderListVisible(true);
  };

  const handleOpenMobileSettings = () => {
    setActiveTab(CONTENT_TABS.settings);
  };

  const resetMobileSwipeTracking = () => {
    swipeStartXRef.current = null;
    swipeStartYRef.current = null;
    isSwipeNavigationTrackingRef.current = false;
  };

  const isMobileSwipeTargetAllowed = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const blockedTargetSelector =
      'input, textarea, select, button, a, [role="button"], [contenteditable="true"], [data-disable-nav-swipe="true"]';

    return !target.closest(blockedTargetSelector);
  };

  const handleMobileNavigationSwipeStart = (event: TouchEvent<HTMLElement>) => {
    if (!isMobileViewport || event.touches.length !== 1) {
      return;
    }

    if (!isMobileSwipeTargetAllowed(event.target)) {
      resetMobileSwipeTracking();
      return;
    }

    const initialTouch = event.touches[0];
    swipeStartXRef.current = initialTouch.clientX;
    swipeStartYRef.current = initialTouch.clientY;
    isSwipeNavigationTrackingRef.current = true;
  };

  const handleMobileNavigationSwipeMove = (event: TouchEvent<HTMLElement>) => {
    if (!isSwipeNavigationTrackingRef.current) {
      return;
    }

    const swipeStartX = swipeStartXRef.current;
    const swipeStartY = swipeStartYRef.current;
    const activeTouch = event.touches[0];

    if (swipeStartX === null || swipeStartY === null || !activeTouch) {
      resetMobileSwipeTracking();
      return;
    }

    const swipeDeltaX = activeTouch.clientX - swipeStartX;
    const swipeDeltaY = activeTouch.clientY - swipeStartY;

    if (
      Math.abs(swipeDeltaY) > MOBILE_SWIPE_CANCEL_VERTICAL_PX &&
      Math.abs(swipeDeltaY) > Math.abs(swipeDeltaX)
    ) {
      resetMobileSwipeTracking();
      return;
    }

    if (
      Math.abs(swipeDeltaX) > MOBILE_SWIPE_PREVENT_DEFAULT_PX &&
      Math.abs(swipeDeltaX) > Math.abs(swipeDeltaY) &&
      event.cancelable
    ) {
      event.preventDefault();
    }
  };

  const handleMobileNavigationSwipeEnd = (event: TouchEvent<HTMLElement>) => {
    if (!isSwipeNavigationTrackingRef.current) {
      return;
    }

    const swipeStartX = swipeStartXRef.current;
    const swipeStartY = swipeStartYRef.current;
    const changedTouch = event.changedTouches[0];
    resetMobileSwipeTracking();

    if (swipeStartX === null || swipeStartY === null || !changedTouch) {
      return;
    }

    const swipeDeltaX = changedTouch.clientX - swipeStartX;
    const swipeDeltaY = changedTouch.clientY - swipeStartY;

    if (
      Math.abs(swipeDeltaX) < MOBILE_SWIPE_TRIGGER_PX ||
      Math.abs(swipeDeltaY) > MOBILE_SWIPE_VERTICAL_TOLERANCE_PX
    ) {
      return;
    }

    if (swipeDeltaX < 0) {
      if (activeTab !== CONTENT_TABS.settings) {
        setActiveTab(CONTENT_TABS.settings);
      }
      return;
    }

    if (activeTab === CONTENT_TABS.settings) {
      setActiveTab(CONTENT_TABS.notes);
      setIsMobileFolderListVisible(true);
      return;
    }

    if (activeTab === CONTENT_TABS.notes && !isMobileFolderListVisible) {
      setIsMobileFolderListVisible(true);
    }
  };

  const isMobileFoldersTabActive = activeTab === CONTENT_TABS.notes;
  const isMobileSettingsTabActive = activeTab === CONTENT_TABS.settings;

  const notesPanel = (
    <NotesPanel
      activeFolderTitle={activeFolder?.title ?? null}
      activeFolderNoteCount={activeFolder?.messageCount ?? 0}
      noteContent={noteContent}
      onNoteContentChange={setNoteContent}
      onCreateNote={handleCreateNote}
      isNoteSaving={isNoteSaving}
      isNotesLoading={isNotesLoading}
      isLoadingMoreNotes={isLoadingMoreNotes}
      hasMoreNotes={hasMoreNotes}
      onLoadMoreNotes={loadMoreNotes}
      notes={sortedNotes}
      notesView={notesView}
      onNotesViewChange={setNotesView}
      openNoteMenuId={openNoteMenuId}
      onToggleNoteMenu={(noteId) =>
        setOpenNoteMenuId((currentNoteId) => (currentNoteId === noteId ? null : noteId))
      }
      onCloseNoteMenu={() => setOpenNoteMenuId(null)}
      onDeleteNote={handleDeleteNote}
      noteIdBeingDeleted={noteIdBeingDeleted}
      editingNoteId={editingNoteId}
      editingNoteContent={editingNoteContent}
      onEditingNoteContentChange={setEditingNoteContent}
      onStartEditNote={handleStartNoteEdit}
      onCancelEditNote={handleCancelNoteEdit}
      onSaveEditNote={handleSaveNoteEdit}
      isNoteUpdating={isNoteUpdating}
      scrollAnchorRef={notesAnchorRef}
      onPreviewLoad={scrollToBottom}
      isFolderSelected={Boolean(activeFolderId)}
      isMobileLayout={isMobileViewport}
    />
  );

  const settingsPanel = (
    <SettingsPanel
      settingsEmail={settingsEmail}
      settingsUsername={settingsUsername}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      onEmailChange={setSettingsEmail}
      onUsernameChange={setSettingsUsername}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSaveSettings={handleSaveSettings}
      onSignOut={signOut}
      isSettingsSaving={isSettingsSaving}
      isAuthWorking={isAuthWorking}
    />
  );

  const foldersPanel = (
    <Sidebar
      folders={folders}
      activeFolderId={activeFolderId}
      folderTitle={folderTitle}
      folderColor={folderColor}
      onFolderTitleChange={setFolderTitle}
      onFolderColorChange={setFolderColor}
      onCreateFolder={handleCreateFolder}
      isFolderSaving={isFolderSaving}
      isFolderReordering={isFolderReordering}
      isFoldersLoading={isFoldersLoading}
      folderIdBeingColorUpdated={folderIdBeingColorUpdated}
      folderIdBeingDeleted={folderIdBeingDeleted}
      draggingFolderId={draggingFolderId}
      dragOverFolderId={dragOverFolderId}
      editingFolderId={editingFolderId}
      editingFolderTitle={editingFolderTitle}
      isFolderRenaming={isFolderRenaming}
      openFolderMenuId={openFolderMenuId}
      onSelectFolder={handleSelectFolder}
      onStartRename={handleStartFolderRename}
      onCancelRename={handleCancelFolderRename}
      onSaveRename={handleSaveFolderRename}
      onEditingTitleChange={setEditingFolderTitle}
      onToggleMenu={(folderId) =>
        setOpenFolderMenuId((currentFolderId) => (currentFolderId === folderId ? null : folderId))
      }
      onCloseMenu={() => setOpenFolderMenuId(null)}
      onDragStart={handleFolderDragStart}
      onDragOver={handleFolderDragOver}
      onDragLeave={handleFolderDragLeave}
      onDrop={handleFolderDrop}
      onDragEnd={handleFolderDragEnd}
      onFolderTouchStart={handleFolderTouchStart}
      onFolderTouchMove={handleFolderTouchMove}
      onFolderTouchEnd={handleFolderTouchEnd}
      onDeleteFolder={handleDeleteFolder}
      onChangeFolderColor={handleFolderColorChange}
      onRefreshFolders={handleRefreshFolders}
      isSettingsActive={activeTab === CONTENT_TABS.settings}
      onToggleSettings={handleToggleSettings}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebarCollapse={() =>
        setIsSidebarCollapsed((isCurrentSidebarCollapsed) => !isCurrentSidebarCollapsed)
      }
      isMobileLayout={isMobileViewport}
    />
  );

  return (
    <>
      <GlobalStyle />
      <PageShell>
        <LandscapeLockOverlay>
          <LandscapeLockCard>
            <LandscapeLockTitle>Portrait mode only</LandscapeLockTitle>
            <LandscapeLockText>Please rotate your device back to vertical orientation.</LandscapeLockText>
          </LandscapeLockCard>
        </LandscapeLockOverlay>

        <AppContent>
        {isSessionLoading ? (
          <CenteredScreen>
            <StatusCard title="Loading session" message="Checking your auth status..." />
          </CenteredScreen>
        ) : session ? (
          <>
            <MainGrid
              $isSidebarCollapsed={isSidebarCollapsed}
              onTouchStart={handleMobileNavigationSwipeStart}
              onTouchMove={handleMobileNavigationSwipeMove}
              onTouchEnd={handleMobileNavigationSwipeEnd}
              onTouchCancel={resetMobileSwipeTracking}
            >
              {isMobileViewport ? (
                activeTab === CONTENT_TABS.settings ? (
                  <ContentShell>{settingsPanel}</ContentShell>
                ) : isMobileFolderListVisible ? (
                  foldersPanel
                ) : (
                  <ContentShell>
                    <MobileNotesHeader>
                      <MobileBackButton
                        type="button"
                        onClick={() => setIsMobileFolderListVisible(true)}
                      >
                        Folders
                      </MobileBackButton>
                      <MobileFolderInfo>
                        {activeFolder ? <MobileFolderDot $color={activeFolder.color} /> : null}
                        <MobileFolderLabel>{activeFolder?.title ?? 'Selected folder'}</MobileFolderLabel>
                        {activeFolder ? (
                          <MobileFolderCount>{activeFolder.messageCount}</MobileFolderCount>
                        ) : null}
                      </MobileFolderInfo>
                    </MobileNotesHeader>
                    {notesPanel}
                  </ContentShell>
                )
              ) : (
                <>
                  {foldersPanel}
                  <ContentShell>
                    {activeTab === CONTENT_TABS.notes ? notesPanel : settingsPanel}
                  </ContentShell>
                </>
              )}
            </MainGrid>

            {isMobileViewport ? (
              <MobileBottomNav role="tablist" aria-label="App sections">
                <MobileTabButton
                  type="button"
                  role="tab"
                  aria-selected={isMobileFoldersTabActive}
                  $isActive={isMobileFoldersTabActive}
                  onClick={handleOpenMobileFolders}
                >
                  <FolderTabIcon />
                  <span>Folders</span>
                </MobileTabButton>
                <MobileTabButton
                  type="button"
                  role="tab"
                  aria-selected={isMobileSettingsTabActive}
                  $isActive={isMobileSettingsTabActive}
                  onClick={handleOpenMobileSettings}
                >
                  <SettingsIcon />
                  <span>Settings</span>
                </MobileTabButton>
              </MobileBottomNav>
            ) : null}
          </>
        ) : (
          <AuthLayout
            onSignIn={signIn}
            onSignUp={signUp}
            // onSignInWithGoogle={signInWithGoogle}
            isAuthWorking={isAuthWorking}
          />
        )}

        <ToastStack
          errorMessage={errorMessage}
          infoMessage={infoMessage}
          onDismissError={() => setErrorMessage(null)}
          onDismissInfo={() => setInfoMessage(null)}
        />
        </AppContent>
      </PageShell>
    </>
  );
}

const FolderTabIcon = () => (
  <MobileTabIcon viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M3.8 6.5c0-1 .8-1.8 1.8-1.8h4l1.7 1.8h7.1c1 0 1.8.8 1.8 1.8V17c0 1-.8 1.8-1.8 1.8H5.6c-1 0-1.8-.8-1.8-1.8V6.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </MobileTabIcon>
);

const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    --bg-top: #f5f8ff;
    --bg-bottom: #eef3ff;
    --panel: #ffffff;
    --border: #dfe6f1;
    --text: #1c2733;
    --muted: #6b7a8c;
    --accent: #2a9ef4;
    --accent-dark: #1c7fd1;
    --danger: #d9544d;
    --shadow: 0 18px 40px rgba(18, 38, 63, 0.08);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: radial-gradient(circle at top, var(--bg-top), var(--bg-bottom));
    color: var(--text);
    overflow: hidden;
  }

  button,
  input,
  textarea {
    font-family: inherit;
  }
`;

const PageShell = styled.main`
  height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const AppContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: ${MOBILE_BREAKPOINT_PX}px) and (orientation: landscape) {
    visibility: hidden;
    pointer-events: none;
  }
`;

const LandscapeLockOverlay = styled.div`
  display: none;

  @media (max-width: ${MOBILE_BREAKPOINT_PX}px) and (orientation: landscape) {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at top, var(--bg-top), var(--bg-bottom));
    padding: 20px;
  }
`;

const LandscapeLockCard = styled.div`
  width: min(420px, 100%);
  border-radius: 18px;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: var(--shadow);
  padding: 20px;
  text-align: center;
`;

const LandscapeLockTitle = styled.h3`
  margin: 0;
  font-size: 20px;
`;

const LandscapeLockText = styled.p`
  margin: 10px 0 0;
  color: var(--muted);
`;

const MainGrid = styled.section<{ $isSidebarCollapsed: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isSidebarCollapsed }) => ($isSidebarCollapsed ? '92px 1fr' : '320px 1fr')};
  grid-template-rows: minmax(0, 1fr);
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(240px, 40%) minmax(0, 1fr);
    padding: 16px;
    gap: 16px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT_PX}px) {
    grid-template-rows: minmax(0, 1fr);
    padding: 12px 12px calc(${MOBILE_NAV_HEIGHT_PX}px + 18px + env(safe-area-inset-bottom));
    gap: 12px;
  }
`;

const ContentShell = styled.section`
  background: var(--panel);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 980px) {
    padding: 20px;
  }

  @media (max-width: ${MOBILE_BREAKPOINT_PX}px) {
    padding: 16px;
    border-radius: 16px;
  }
`;

const MobileNotesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const MobileFolderInfo = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  max-width: 58%;
`;

const MobileBackButton = styled.button`
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    border-color: rgba(42, 158, 244, 0.45);
    color: var(--accent-dark);
  }
`;

const MobileFolderDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const MobileFolderLabel = styled.span`
  font-size: 13px;
  color: var(--muted);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MobileFolderCount = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-dark);
  border-radius: 999px;
  border: 1px solid rgba(42, 158, 244, 0.28);
  background: rgba(42, 158, 244, 0.14);
  min-width: 22px;
  padding: 2px 6px;
  text-align: center;
  flex-shrink: 0;
`;

const MobileBottomNav = styled.nav`
  position: fixed;
  left: calc(${MOBILE_NAV_SIDE_GUTTER_PX}px + env(safe-area-inset-left));
  right: calc(${MOBILE_NAV_SIDE_GUTTER_PX}px + env(safe-area-inset-right));
  bottom: calc(12px + env(safe-area-inset-bottom));
  border-radius: 20px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(14px);
  box-shadow: 0 14px 32px rgba(15, 31, 50, 0.14);
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  z-index: 30;
`;

const MobileTabButton = styled.button<{ $isActive: boolean }>`
  border: none;
  border-radius: 14px;
  background: ${({ $isActive }) => ($isActive ? 'rgba(42, 158, 244, 0.16)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'var(--accent-dark)' : 'var(--muted)')};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
`;

const MobileTabIcon = styled.svg`
  width: 16px;
  height: 16px;
`;

const CenteredScreen = styled.section`
  flex: 1;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
`;
