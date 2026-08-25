/**
 * Auto-scroll hook
 */
import { useLayoutEffect, useRef, useCallback } from 'react';

/**
 * Monitor container content changes, auto-scroll to bottom.
 * Pause auto-scroll when user scrolls up manually, resume when scrolled to bottom.
 *
 * Positioning lives in useLayoutEffect (before paint), not useEffect: a
 * plain effect runs after the first paint, so mounting with a long restored
 * history paints one frame at scrollTop=0 (conversation top) and then jumps
 * to bottom — visible as the whole list dropping by a frame.
 *
 * The ResizeObserver pins the bottom when EXISTING content grows in place
 * after mount (image decode, deferred block render): the deps-driven scroll
 * only fires when the message list changes, not on height growth. The
 * scroll container's own box is sized by layout and never resizes on
 * content growth, so the children are what get observed.
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

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (shouldAutoScroll.current) {
      el.scrollTop = el.scrollHeight;
    }
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (shouldAutoScroll.current && ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    });
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
    // deps is a dynamically passed dependency array, cannot be statically analyzed
  }, deps);

  return { ref, handleScroll };
}
