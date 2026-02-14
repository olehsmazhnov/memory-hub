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
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: true });

      if (error) {
        onError(error.message);
        setIsNotesLoading(false);
        return;
      }

      setNotes(data ?? []);
      setIsNotesLoading(false);
    },
    [onError]
  );

  useEffect(() => {
    if (!session?.user.id || !activeFolderId) {
      setNotes([]);
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

    if (!noteContent.trim()) {
      onError('Note content is required.');
      return;
    }

    setIsNoteSaving(true);
    const { data, error } = await supabase
      .from('notes')
      .insert({
        content: noteContent.trim(),
        folder_id: activeFolderId,
        user_id: session.user.id
      })
      .select('*')
      .single();

    if (error) {
      onError(error.message);
      setIsNoteSaving(false);
      return;
    }

    setNoteContent('');
    onInfo('Note added.');
    setIsNoteSaving(false);
    onFolderMessageCountChange?.(activeFolderId, 1);

    if (data) {
      setNotes((current) => [...current, data]);
      return;
    }

    loadNotes(session.user.id, activeFolderId);
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
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', session.user.id);

    if (error) {
      onError(error.message);
      setNoteIdBeingDeleted(null);
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    setOpenNoteMenuId(null);
    setNoteIdBeingDeleted(null);
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingNoteContent('');
      setIsNoteUpdating(false);
    }
    if (folderIdForDeletedNote) {
      onFolderMessageCountChange?.(folderIdForDeletedNote, -1);
    }
    onInfo('Note deleted.');
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
