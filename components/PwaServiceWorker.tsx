'use client';

import { useEffect } from 'react';
import { SERVICE_WORKER_URL } from '../lib/constants/pwa';

export default function PwaServiceWorker() {
  useEffect(() => {
    const isServiceWorkerSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;

    if (!isServiceWorkerSupported) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' });
      } catch (_error) {
        // Fail silently to avoid blocking app usage when service workers are unavailable.
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
