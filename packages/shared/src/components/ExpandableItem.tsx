import { memo, useCallback, type ReactNode } from 'react';
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useToggle } from '../hooks/index.js';

/** Context provided to renderSummary callback. */
export interface ExpandableItemContext {
  /** Current expanded state. */
  expanded: boolean;
  /** Toggle expanded state. */
  toggle: () => void;
}

export interface ExpandableItemProps {
  /** Controlled expand state. */
  expanded?: boolean;
  /** Uncontrolled initial state (default: false). */
  defaultExpanded?: boolean;
  /** Expand state change callback. */
  onToggle?: (expanded: boolean) => void;
  /** Whether this item can expand. */
  expandable?: boolean;
  /** Summary row — always visible. */
  renderSummary: (ctx: ExpandableItemContext) => ReactNode;
  /** Detail content — shown when expanded. */
  renderDetail?: () => ReactNode;
  /** Animation duration in ms (default: 150). */
  animationDuration?: number;
  /** Additional className. */
  className?: string;
}

/** Headless expandable list item — behavior only, no UI. */
export const ExpandableItem = memo(function ExpandableItem({
  expanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
  expandable = true,
  renderSummary,
  renderDetail,
  animationDuration = 150,
  className,
}: ExpandableItemProps) {
  const theme = useTheme();
  const toggle = useToggle(defaultExpanded);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : toggle.value;
  const canExpand = expandable && !!renderDetail;

  const handleToggle = useCallback(() => {
    if (!canExpand) return;
    const next = !isExpanded;
    toggle.set(next);
    onToggle?.(next);
  }, [canExpand, isExpanded, onToggle, toggle]);

  const ctx: ExpandableItemContext = {
    expanded: canExpand && isExpanded,
    toggle: handleToggle,
  };

  return (
    <div className={className}>
      {renderSummary(ctx)}
      {canExpand && isExpanded && (
        <div
          css={css`
            overflow: hidden;
            transition: max-height ${animationDuration}ms ${theme.motion.easing.out};
          `}
        >
          {renderDetail!()}
        </div>
      )}
    </div>
  );
});
