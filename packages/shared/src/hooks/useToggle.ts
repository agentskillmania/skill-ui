import { useCallback, useRef, useState } from 'react';

/** Return type of useToggle hook. */
export interface UseToggleReturn {
  /** Current boolean value. */
  value: boolean;
  /** Set value to a specific boolean. */
  set: (v: boolean) => void;
  /** Toggle the current value. */
  toggle: () => void;
  /** Reset to the initial value. */
  reset: () => void;
}

/**
 * Boolean state management hook with set, toggle, and reset operations.
 * @param initial - Starting value, defaults to false.
 */
export function useToggle(initial: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initial);
  const initialRef = useRef(initial);

  const set = useCallback((v: boolean) => setValue(v), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const reset = useCallback(() => setValue(initialRef.current), []);

  return { value, set, toggle, reset };
}
