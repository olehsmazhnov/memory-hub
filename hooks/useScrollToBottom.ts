import { useCallback, useEffect, useRef } from 'react';

type UseScrollToBottomOptions = {
  isEnabled: boolean;
  dependencies: unknown[];
};

export default function useScrollToBottom({ isEnabled, dependencies }: UseScrollToBottomOptions) {
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }

    anchor.scrollIntoView({ block: 'end' });
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [isEnabled, scrollToBottom, ...dependencies]);

  return { anchorRef, scrollToBottom };
}
