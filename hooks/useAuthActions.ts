import { useState } from 'react';
import supabase from '../lib/supabaseClient';

type UseAuthActionsOptions = {
  onError: (message: string) => void;
  onInfo: (message: string) => void;
  clearMessages: () => void;
};

const ALREADY_REGISTERED_EMAIL_MESSAGE = 'This email is already registered. Please sign in or reset password.';

const isAlreadyRegisteredError = (errorMessage: string, errorCode?: string) => {
  const normalizedErrorMessage = errorMessage.toLowerCase();
  const normalizedErrorCode = errorCode?.toLowerCase();

  return (
    normalizedErrorMessage.includes('already registered') ||
    normalizedErrorMessage.includes('already exists') ||
    normalizedErrorCode === 'user_already_exists' ||
    normalizedErrorCode === 'email_exists'
  );
};

export default function useAuthActions({ onError, onInfo, clearMessages }: UseAuthActionsOptions) {
  const [isAuthWorking, setIsAuthWorking] = useState(false);

  const signUp = async (email: string, password: string) => {
    clearMessages();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      onError('Email and password are required.');
      return;
    }

    setIsAuthWorking(true);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword
    });

    if (error) {
      if (isAlreadyRegisteredError(error.message, error.code)) {
        onError(ALREADY_REGISTERED_EMAIL_MESSAGE);
        setIsAuthWorking(false);
        return;
      }

      onError(error.message);
      setIsAuthWorking(false);
      return;
    }

    const isAlreadyRegisteredSignup =
      Array.isArray(data.user?.identities) && data.user.identities.length === 0;

    if (isAlreadyRegisteredSignup) {
      onError(ALREADY_REGISTERED_EMAIL_MESSAGE);
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

  // const signInWithGoogle = async () => {
  //   clearMessages();
  //   setIsAuthWorking(true);
  //
  //   const redirectTo =
  //     typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
  //
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       redirectTo
  //     }
  //   });
  //
  //   if (error) {
  //     onError(error.message);
  //     setIsAuthWorking(false);
  //     return;
  //   }
  //
  //   onInfo('Redirecting to Google...');
  //   setIsAuthWorking(false);
  // };

  return {
    signUp,
    signIn,
    // signInWithGoogle,
    signOut,
    isAuthWorking
  };
}
