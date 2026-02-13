import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabase from '../lib/supabaseClient';
import {
  EMAIL_AND_PASSWORD_MESSAGE,
  EMAIL_UPDATE_MESSAGE,
  NO_SETTINGS_CHANGE_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  PASSWORD_UPDATED_MESSAGE,
  SETTINGS_SAVED_MESSAGE
} from '../lib/constants/messages';
import { MIN_PASSWORD_LENGTH } from '../lib/constants/ui';

type UseSettingsOptions = {
  session: Session | null;
  onError: (message: string) => void;
  onInfo: (message: string) => void;
  clearMessages: () => void;
};

export default function useSettings({ session, onError, onInfo, clearMessages }: UseSettingsOptions) {
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsUsername, setSettingsUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      setSettingsEmail('');
      setSettingsUsername('');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    setSettingsEmail(session.user.email ?? '');
    setSettingsUsername(String(session.user.user_metadata?.username ?? ''));
  }, [session]);

  const handleSaveSettings = async () => {
    clearMessages();

    if (!session?.user.id) {
      onError('You must be signed in.');
      return;
    }

    const trimmedEmail = settingsEmail.trim();
    const trimmedUsername = settingsUsername.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const currentEmail = session.user.email ?? '';
    const currentUsername = String(session.user.user_metadata?.username ?? '');

    if (!trimmedEmail) {
      onError('Email is required.');
      return;
    }

    if (trimmedNewPassword || trimmedConfirmPassword) {
      if (trimmedNewPassword.length < MIN_PASSWORD_LENGTH) {
        onError(PASSWORD_TOO_SHORT_MESSAGE);
        return;
      }

      if (trimmedNewPassword !== trimmedConfirmPassword) {
        onError(PASSWORD_MISMATCH_MESSAGE);
        return;
      }
    }

    const updates: { email?: string; password?: string; data?: { username?: string } } = {};

    if (trimmedEmail !== currentEmail) {
      updates.email = trimmedEmail;
    }

    if (trimmedUsername !== currentUsername) {
      updates.data = { username: trimmedUsername };
    }

    if (trimmedNewPassword) {
      updates.password = trimmedNewPassword;
    }

    if (Object.keys(updates).length === 0) {
      onInfo(NO_SETTINGS_CHANGE_MESSAGE);
      return;
    }

    setIsSettingsSaving(true);
    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      onError(error.message);
      setIsSettingsSaving(false);
      return;
    }

    if (updates.email && updates.password) {
      onInfo(EMAIL_AND_PASSWORD_MESSAGE);
    } else if (updates.email) {
      onInfo(EMAIL_UPDATE_MESSAGE);
    } else if (updates.password) {
      onInfo(PASSWORD_UPDATED_MESSAGE);
    } else {
      onInfo(SETTINGS_SAVED_MESSAGE);
    }

    if (updates.password) {
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsSettingsSaving(false);
  };

  return {
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
  };
}
