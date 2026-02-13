import { useCallback, useEffect, useState, type DragEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabase from '../lib/supabaseClient';
import { FOLDER_COLOR_DEFAULT } from '../lib/constants/folders';
import type { Folder } from '../lib/types';
import { applyFolderSortOrder, getNextFolderSortOrder } from '../lib/utils/folders';

type UseFoldersOptions = {
  session: Session | null;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
  clearMessages: () => void;
};

export default function useFolders({ session, onError, onInfo, clearMessages }: UseFoldersOptions) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folderTitle, setFolderTitle] = useState('');
  const [folderColor, setFolderColor] = useState(FOLDER_COLOR_DEFAULT);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [isFolderSaving, setIsFolderSaving] = useState(false);
  const [isFolderRenaming, setIsFolderRenaming] = useState(false);
  const [isFolderReordering, setIsFolderReordering] = useState(false);
  const [folderIdBeingColorUpdated, setFolderIdBeingColorUpdated] = useState<string | null>(null);
  const [folderIdBeingDeleted, setFolderIdBeingDeleted] = useState<string | null>(null);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderTitle, setEditingFolderTitle] = useState('');
  const [openFolderMenuId, setOpenFolderMenuId] = useState<string | null>(null);

  const loadFolders = useCallback(
    async (userId: string) => {
      if (!userId) {
        onError('Missing user id.');
        return;
      }

      setIsFoldersLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        onError(error.message);
        setIsFoldersLoading(false);
        return;
      }

      const nextFolders = data ?? [];
      setFolders(
        nextFolders.map((folder) => ({
          ...folder,
          color: folder.color || FOLDER_COLOR_DEFAULT
        }))
      );
      setActiveFolderId((currentId) => {
        if (currentId && nextFolders.some((folder) => folder.id === currentId)) {
          return currentId;
        }

        return nextFolders.length > 0 ? nextFolders[0].id : null;
      });
      setIsFoldersLoading(false);
    },
    [onError]
  );

  useEffect(() => {
    if (!session?.user.id) {
      setFolders([]);
      setActiveFolderId(null);
      setFolderTitle('');
      setFolderColor(FOLDER_COLOR_DEFAULT);
      setFolderIdBeingColorUpdated(null);
      setFolderIdBeingDeleted(null);
      setDraggingFolderId(null);
      setDragOverFolderId(null);
      setEditingFolderId(null);
      setEditingFolderTitle('');
      setOpenFolderMenuId(null);
      return;
    }

    loadFolders(session.user.id);
  }, [loadFolders, session?.user.id]);

  const handleCreateFolder = async () => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    if (!folderTitle.trim()) {
      onError('Folder title is required.');
      return;
    }

    setIsFolderSaving(true);
    const { data, error } = await supabase
      .from('folders')
      .insert({
        title: folderTitle.trim(),
        user_id: session.user.id,
        color: folderColor,
        sort_order: getNextFolderSortOrder(folders)
      })
      .select('*')
      .single();

    if (error) {
      onError(error.message);
      setIsFolderSaving(false);
      return;
    }

    setFolderTitle('');
    setFolderColor(FOLDER_COLOR_DEFAULT);
    onInfo('Folder created.');
    setIsFolderSaving(false);

    if (data) {
      setFolders((current) => [data, ...current]);
      setActiveFolderId(data.id);
      return;
    }

    loadFolders(session.user.id);
  };

  const handleFolderDragStart = (folderId: string) => {
    setDraggingFolderId(folderId);
  };

  const handleFolderDragOver = (event: DragEvent<HTMLDivElement>, folderId: string) => {
    event.preventDefault();

    if (folderId !== dragOverFolderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = (event: DragEvent<HTMLDivElement>, folderId: string) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      if (dragOverFolderId === folderId) {
        setDragOverFolderId(null);
      }
    }
  };

  const handleFolderDragEnd = () => {
    setDraggingFolderId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDrop = async (folderId: string) => {
    if (!draggingFolderId || draggingFolderId === folderId) {
      setDragOverFolderId(null);
      return;
    }

    const sourceIndex = folders.findIndex((folder) => folder.id === draggingFolderId);
    const targetIndex = folders.findIndex((folder) => folder.id === folderId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDragOverFolderId(null);
      return;
    }

    const nextFolders = [...folders];
    const [movedFolder] = nextFolders.splice(sourceIndex, 1);
    nextFolders.splice(targetIndex, 0, movedFolder);

    const orderedFolders = applyFolderSortOrder(nextFolders);
    setFolders(orderedFolders);
    setIsFolderReordering(true);

    const { error } = await supabase.from('folders').upsert(
      orderedFolders.map((folder) => ({
        id: folder.id,
        user_id: folder.user_id,
        title: folder.title,
        color: folder.color || FOLDER_COLOR_DEFAULT,
        sort_order: folder.sort_order
      })),
      { onConflict: 'id' }
    );

    if (error) {
      onError(error.message);
      if (session?.user.id) {
        loadFolders(session.user.id);
      }
    }

    setIsFolderReordering(false);
    setDraggingFolderId(null);
    setDragOverFolderId(null);
  };

  const handleStartFolderRename = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderTitle(folder.title);
    setActiveFolderId(folder.id);
  };

  const handleCancelFolderRename = () => {
    setEditingFolderId(null);
    setEditingFolderTitle('');
  };

  const handleSaveFolderRename = async () => {
    clearMessages();

    if (!session?.user.id || !editingFolderId) {
      onError('You must be signed in.');
      return;
    }

    const trimmedTitle = editingFolderTitle.trim();

    if (!trimmedTitle) {
      onError('Folder title is required.');
      return;
    }

    setIsFolderRenaming(true);
    const { data, error } = await supabase
      .from('folders')
      .update({ title: trimmedTitle })
      .eq('id', editingFolderId)
      .eq('user_id', session.user.id)
      .select('*')
      .single();

    if (error) {
      onError(error.message);
      setIsFolderRenaming(false);
      return;
    }

    if (data) {
      setFolders((current) =>
        current.map((folder) => (folder.id === data.id ? { ...folder, title: data.title } : folder))
      );
    }

    setIsFolderRenaming(false);
    setEditingFolderId(null);
    setEditingFolderTitle('');
    setOpenFolderMenuId(null);
    onInfo('Folder renamed.');
  };

  const handleFolderColorChange = async (folderId: string, color: string) => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    setFolderIdBeingColorUpdated(folderId);
    const { error } = await supabase
      .from('folders')
      .update({ color })
      .eq('id', folderId)
      .eq('user_id', session.user.id);

    if (error) {
      onError(error.message);
      setFolderIdBeingColorUpdated(null);
      return;
    }

    setFolders((current) =>
      current.map((folder) => (folder.id === folderId ? { ...folder, color } : folder))
    );
    setFolderIdBeingColorUpdated(null);
    onInfo('Folder color updated.');
  };

  const handleDeleteFolder = async (folderId: string) => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    const folderToDelete = folders.find((folder) => folder.id === folderId);
    const isConfirmed = window.confirm(
      folderToDelete
        ? `Delete "${folderToDelete.title}" and all notes in it?`
        : 'Delete this folder and all notes in it?'
    );

    if (!isConfirmed) {
      return;
    }

    setFolderIdBeingDeleted(folderId);
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', session.user.id);

    if (error) {
      onError(error.message);
      setFolderIdBeingDeleted(null);
      return;
    }

    setFolders((current) => {
      const nextFolders = current.filter((folder) => folder.id !== folderId);
      setActiveFolderId((currentId) => {
        if (currentId !== folderId) {
          return currentId;
        }

        return nextFolders.length > 0 ? nextFolders[0].id : null;
      });

      return nextFolders;
    });

    setEditingFolderId((currentId) => (currentId === folderId ? null : currentId));
    if (editingFolderId === folderId) {
      setEditingFolderTitle('');
    }
    setOpenFolderMenuId((currentId) => (currentId === folderId ? null : currentId));
    setDraggingFolderId((currentId) => (currentId === folderId ? null : currentId));
    setDragOverFolderId((currentId) => (currentId === folderId ? null : currentId));
    setFolderIdBeingColorUpdated((currentId) => (currentId === folderId ? null : currentId));
    setFolderIdBeingDeleted(null);
    onInfo('Folder deleted.');
  };

  return {
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
    handleStartFolderRename,
    handleCancelFolderRename,
    handleSaveFolderRename,
    handleFolderColorChange,
    handleDeleteFolder
  };
}
