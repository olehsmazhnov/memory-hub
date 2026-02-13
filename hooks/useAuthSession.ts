import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import supabase from '../lib/supabaseClient';

type UseAuthSessionOptions = {
  onError?: (message: string) => void;
};

export default function useAuthSession({ onError }: UseAuthSessionOptions = {}) {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error && onError) {
        onError(error.message);
      }

      setSession(data.session ?? null);
      setIsSessionLoading(false);
    };

    initSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [onError]);

  return { session, isSessionLoading };
}
