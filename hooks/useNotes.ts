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
};

export default function useNotes({
  session,
  activeFolderId,
  onError,
  onInfo,
  clearMessages
}: UseNotesOptions) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [openNoteMenuId, setOpenNoteMenuId] = useState<string | null>(null);
  const [noteIdBeingDeleted, setNoteIdBeingDeleted] = useState<string | null>(null);

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
      return;
    }

    loadNotes(session.user.id, activeFolderId);
  }, [activeFolderId, loadNotes, session?.user.id]);

  useEffect(() => {
    if (!session) {
      setNotes([]);
      setNoteContent('');
      setOpenNoteMenuId(null);
      setNoteIdBeingDeleted(null);
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
    onInfo('Note deleted.');
  };

  return {
    notes,
    sortedNotes,
    noteContent,
    setNoteContent,
    isNotesLoading,
    isNoteSaving,
    openNoteMenuId,
    setOpenNoteMenuId,
    noteIdBeingDeleted,
    handleCreateNote,
    handleDeleteNote
  };
}
