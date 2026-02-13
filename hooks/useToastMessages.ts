import { useCallback, useEffect, useState } from 'react';
import { ERROR_TOAST_TIMEOUT_MS, INFO_TOAST_TIMEOUT_MS } from '../lib/constants/ui';

export default function useToastMessages() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setInfoMessage(null);
  }, []);

  useEffect(() => {
    if (!infoMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setInfoMessage(null);
    }, INFO_TOAST_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [infoMessage]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setErrorMessage(null);
    }, ERROR_TOAST_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  return {
    errorMessage,
    infoMessage,
    setErrorMessage,
    setInfoMessage,
    clearMessages
  };
}
