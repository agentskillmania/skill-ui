/**
 * Header-collapse standard shared by all blocks.
 *
 * Rules:
 * - Every block header toggles collapse (exception: HumanInput while pending).
 * - `autoCollapse` marks the "finished, low-value-to-review" state — the block
 *   renders collapsed by default and auto-collapses when the state flips on
 *   (e.g. streaming → completed). Live states (streaming/pending/error) pass
 *   false and stay expanded.
 */
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function useBlockCollapse(autoCollapse: boolean) {
  const [expanded, setExpanded] = useState(!autoCollapse);
  useEffect(() => {
    if (autoCollapse) setExpanded(false);
  }, [autoCollapse]);
  const toggle = useCallback(() => setExpanded((v) => !v), []);
  return { expanded, toggle };
}

/** Direction chevron for the header right side. Size matches header glyphs. */
export function CollapseChevron({ expanded }: { expanded: boolean }) {
  return expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}
