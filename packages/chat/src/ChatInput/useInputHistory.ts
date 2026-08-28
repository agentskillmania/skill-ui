/**
 * Input history recall — bash/readline semantics, fully internal to ChatInput.
 *
 * All state lives in refs (recalling must not re-render); writes go through
 * the controlled `onChange`, so the host keeps owning the value. The history
 * lives and dies with the component instance — hosts that mount one input per
 * session get per-session isolation for free.
 */
import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';

const MAX_HISTORY = 50;

export function useInputHistory(onChange: (value: string) => void) {
  // Newest last; consecutive duplicates collapse, older entries fall off at
  // MAX_HISTORY.
  const historyRef = useRef<string[]>([]);
  // -1 = not browsing (draft position); >=0 = browsing at that history slot.
  const indexRef = useRef(-1);
  // The input content captured when browsing started; restored when ArrowDown
  // walks past the newest entry.
  const draftRef = useRef('');

  // Keep the write callback fresh without recreating handleArrowKey.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /** Record a sent message and reset the browse pointer to the draft position. */
  const commit = useCallback((message: string) => {
    if (!message) return;
    const h = historyRef.current;
    if (h[h.length - 1] !== message) {
      h.push(message);
      if (h.length > MAX_HISTORY) h.shift();
    }
    indexRef.current = -1;
  }, []);

  /**
   * Handle ArrowUp/ArrowDown from the textarea. Returns true when the key was
   * consumed for history navigation (preventDefault already applied); false
   * lets the native caret behavior through.
   */
  const handleArrowKey = useCallback((e: KeyboardEvent): boolean => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return false;
    // Modified arrows belong to the editor (selection, word jumps).
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return false;
    // Arrow keys navigate IME candidates during composition.
    if (e.nativeEvent.isComposing) return false;

    const el = e.currentTarget as HTMLTextAreaElement;
    const value = el.value;
    const caret = el.selectionStart ?? value.length;
    const h = historyRef.current;

    if (e.key === 'ArrowUp') {
      if (h.length === 0) return false;
      // Multi-line input: the caret must already be on the first line —
      // otherwise ArrowUp should keep moving it between lines.
      if (value.slice(0, caret).includes('\n')) return false;
      e.preventDefault();
      // At the oldest entry the pointer clamps: consume the key so the caret
      // doesn't jump to line start, but skip the redundant onChange write.
      const prev = indexRef.current;
      if (prev === -1) {
        draftRef.current = value;
        indexRef.current = h.length - 1;
      } else if (prev > 0) {
        indexRef.current = prev - 1;
      }
      if (indexRef.current !== prev) onChangeRef.current(h[indexRef.current]);
      return true;
    }

    // ArrowDown: outside browsing mode the caret moves natively.
    if (indexRef.current === -1) return false;
    if (value.slice(caret).includes('\n')) return false;
    e.preventDefault();
    if (indexRef.current < h.length - 1) {
      indexRef.current += 1;
      onChangeRef.current(h[indexRef.current]);
    } else {
      indexRef.current = -1;
      onChangeRef.current(draftRef.current);
    }
    return true;
  }, []);

  return { commit, handleArrowKey };
}
