import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabase from '../lib/supabaseClient';
import type { Note } from '../lib/types';

type UseNotesOptions = {
  session: Session | null;
  activeFolderId: string | null;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
  clearMessages: () => void;
  onFolderMessageCountChange?: (folderId: string, messageCountDelta: number) => void;
};

const NOTES_PAGE_SIZE = 30;

export default function useNotes({
  session,
  activeFolderId,
  onError,
  onInfo,
  clearMessages,
  onFolderMessageCountChange
}: UseNotesOptions) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isLoadingMoreNotes, setIsLoadingMoreNotes] = useState(false);
  const [hasMoreNotes, setHasMoreNotes] = useState(false);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isNoteUpdating, setIsNoteUpdating] = useState(false);
  const [openNoteMenuId, setOpenNoteMenuId] = useState<string | null>(null);
  const [noteIdBeingDeleted, setNoteIdBeingDeleted] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (firstNote, secondNote) =>
          new Date(firstNote.created_at).getTime() - new Date(secondNote.created_at).getTime()
      ),
    [notes]
  );

  const loadNotes = useCallback(
    async (userId: string, folderId: string) => {
      if (!userId || !folderId) {
        onError('Missing folder or user id.');
        return;
      }

      setIsNotesLoading(true);
      setIsLoadingMoreNotes(false);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })
        .limit(NOTES_PAGE_SIZE);

      if (error) {
        onError(error.message);
        setIsNotesLoading(false);
        return;
      }

      const latestPage = data ?? [];
      setNotes([...latestPage].reverse());
      setHasMoreNotes(latestPage.length === NOTES_PAGE_SIZE);
      setIsNotesLoading(false);
    },
    [onError]
  );

  const loadMoreNotes = useCallback(async () => {
    if (!session?.user.id || !activeFolderId || isLoadingMoreNotes || isNotesLoading || !hasMoreNotes) {
      return;
    }

    const oldestLoadedNote = sortedNotes[0];
    if (!oldestLoadedNote) {
      return;
    }

    setIsLoadingMoreNotes(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('folder_id', activeFolderId)
      .lt('created_at', oldestLoadedNote.created_at)
      .order('created_at', { ascending: false })
      .limit(NOTES_PAGE_SIZE);

    if (error) {
      onError(error.message);
      setIsLoadingMoreNotes(false);
      return;
    }

    const olderPage = data ?? [];
    const olderNotesAsc = [...olderPage].reverse();
    setNotes((currentNotes) => [...olderNotesAsc, ...currentNotes]);
    setHasMoreNotes(olderPage.length === NOTES_PAGE_SIZE);
    setIsLoadingMoreNotes(false);
  }, [activeFolderId, hasMoreNotes, isLoadingMoreNotes, isNotesLoading, onError, session?.user.id, sortedNotes]);

  useEffect(() => {
    if (!session?.user.id || !activeFolderId) {
      setNotes([]);
      setHasMoreNotes(false);
      setIsLoadingMoreNotes(false);
      setOpenNoteMenuId(null);
      setEditingNoteId(null);
      setEditingNoteContent('');
      setIsNoteUpdating(false);
      return;
    }

    setOpenNoteMenuId(null);
    setEditingNoteId(null);
    setEditingNoteContent('');
    setIsNoteUpdating(false);
    loadNotes(session.user.id, activeFolderId);
  }, [activeFolderId, loadNotes, session?.user.id]);

  useEffect(() => {
    if (!session) {
      setNotes([]);
      setHasMoreNotes(false);
      setIsLoadingMoreNotes(false);
      setNoteContent('');
      setOpenNoteMenuId(null);
      setNoteIdBeingDeleted(null);
      setEditingNoteId(null);
      setEditingNoteContent('');
      setIsNoteUpdating(false);
    }
  }, [session]);

  const handleCreateNote = async () => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    if (!activeFolderId) {
      onError('Select a folder first.');
      return;
    }

    const trimmedNoteContent = noteContent.trim();

    if (!trimmedNoteContent) {
      onError('Note content is required.');
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimisticNote: Note = {
      id: tempId,
      folder_id: activeFolderId,
      user_id: session.user.id,
      content: trimmedNoteContent,
      created_at: new Date().toISOString(),
      ui_status: 'saving'
    };

    setNoteContent('');
    setNotes((current) => [...current, optimisticNote]);
    onFolderMessageCountChange?.(activeFolderId, 1);

    void (async () => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: trimmedNoteContent,
          folder_id: activeFolderId,
          user_id: session.user.id
        })
        .select('*')
        .single();

      if (error) {
        setNotes((currentNotes) => currentNotes.filter((note) => note.id !== tempId));
        onFolderMessageCountChange?.(activeFolderId, -1);
        onError(error.message);
        return;
      }

      if (data) {
        setNotes((currentNotes) =>
          currentNotes.map((note) => (note.id === tempId ? { ...data, ui_status: undefined } : note))
        );
        onInfo('Note added.');
        return;
      }

      loadNotes(session.user.id, activeFolderId);
    })();
  };

  const handleDeleteNote = async (noteId: string) => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    const noteToDelete = notes.find((note) => note.id === noteId);
    const folderIdForDeletedNote = noteToDelete?.folder_id ?? activeFolderId;

    setNoteIdBeingDeleted(noteId);
    setNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === noteId ? { ...note, ui_status: 'deleting' } : note))
    );
    setOpenNoteMenuId(null);

    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingNoteContent('');
      setIsNoteUpdating(false);
    }

    void (async () => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', session.user.id);

      if (error) {
        setNotes((currentNotes) =>
          currentNotes.map((note) => (note.id === noteId ? { ...note, ui_status: undefined } : note))
        );
        onError(error.message);
        setNoteIdBeingDeleted((currentNoteId) => (currentNoteId === noteId ? null : currentNoteId));
        return;
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
      setNoteIdBeingDeleted((currentNoteId) => (currentNoteId === noteId ? null : currentNoteId));
      if (folderIdForDeletedNote) {
        onFolderMessageCountChange?.(folderIdForDeletedNote, -1);
      }
      onInfo('Note deleted.');
    })();
  };

  const handleStartNoteEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setOpenNoteMenuId(null);
  };

  const handleCancelNoteEdit = () => {
    if (isNoteUpdating) {
      return;
    }

    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleSaveNoteEdit = async () => {
    clearMessages();

    if (!session?.user.id || !editingNoteId) {
      onError('You must be signed in.');
      return;
    }

    const trimmedContent = editingNoteContent.trim();

    if (!trimmedContent) {
      onError('Note content is required.');
      return;
    }

    const currentNote = notes.find((note) => note.id === editingNoteId);
    if (currentNote && currentNote.content === trimmedContent) {
      setEditingNoteId(null);
      setEditingNoteContent('');
      return;
    }

    setIsNoteUpdating(true);
    const { data, error } = await supabase
      .from('notes')
      .update({ content: trimmedContent })
      .eq('id', editingNoteId)
      .eq('user_id', session.user.id)
      .select('*')
      .single();

    if (error) {
      onError(error.message);
      setIsNoteUpdating(false);
      return;
    }

    if (data) {
      setNotes((currentNotes) =>
        currentNotes.map((note) => (note.id === data.id ? { ...note, content: data.content } : note))
      );
    }

    setIsNoteUpdating(false);
    setEditingNoteId(null);
    setEditingNoteContent('');
    setOpenNoteMenuId(null);
    onInfo('Note updated.');
  };

  return {
    notes,
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
  };
}
