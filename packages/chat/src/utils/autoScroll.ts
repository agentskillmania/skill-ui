/**
 * Auto-scroll hook
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * Monitor container content changes, auto-scroll to bottom.
 * Pause auto-scroll when user scrolls up manually, resume when scrolled to bottom.
 */
export function useAutoScroll<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 50;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
    // deps is a dynamically passed dependency array, cannot be statically analyzed
  }, deps);

  return { ref, handleScroll };
}
