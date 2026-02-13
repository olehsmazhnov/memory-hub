import { useState } from 'react';
import supabase from '../lib/supabaseClient';

type UseAuthActionsOptions = {
  onError: (message: string) => void;
  onInfo: (message: string) => void;
  clearMessages: () => void;
};

export default function useAuthActions({ onError, onInfo, clearMessages }: UseAuthActionsOptions) {
  const [isAuthWorking, setIsAuthWorking] = useState(false);

  const signUp = async (email: string, password: string) => {
    clearMessages();

    if (!email.trim() || !password.trim()) {
      onError('Email and password are required.');
      return;
    }

    setIsAuthWorking(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      onError(error.message);
      setIsAuthWorking(false);
      return;
    }

    onInfo('Check your email for a confirmation link.');
    setIsAuthWorking(false);
  };

  const signIn = async (email: string, password: string) => {
    clearMessages();

    if (!email.trim() || !password.trim()) {
      onError('Email and password are required.');
      return;
    }

    setIsAuthWorking(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error) {
      onError(error.message);
      setIsAuthWorking(false);
      return;
    }

    setIsAuthWorking(false);
  };

  const signOut = async () => {
    clearMessages();
    setIsAuthWorking(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      onError(error.message);
    }

    setIsAuthWorking(false);
  };

  return {
    signUp,
    signIn,
    signOut,
    isAuthWorking
  };
}
