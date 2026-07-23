/** @jsxImportSource @emotion/react */
/**
 * EventRow component — unified shell for all event types.
 * Displays type tag, content text, and expandable payload detail.
 * Uses shared ExpandableRow with code variant for JSON payloads.
 */
import { ExpandableRow } from '@agentskillmania/skill-ui-shared';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { memo, useCallback } from 'react';

import { renderEventContent } from './eventRows.js';
import { EventTypeTag } from './EventTypeTag.js';
import type { CockpitEvent } from './types.js';

export interface EventRowProps {
  event: CockpitEvent;
  /** Called when the row's height changes (e.g., expand/collapse). Used by virtual scroll to re-measure. */
  onHeightChange?: () => void;
}

export const EventRow = memo(function EventRow({ event, onHeightChange }: EventRowProps) {
  const theme = useTheme();
  const hasDetail = event.payload && Object.keys(event.payload).length > 0;
  const handleToggle = useCallback(() => {
    onHeightChange?.();
  }, [onHeightChange]);

  return (
    <ExpandableRow
      expandable={hasDetail}
      defaultExpanded={false}
      onToggle={handleToggle}
      detailVariant="code"
      renderSummary={({ expanded }) => (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          `}
        >
          <EventTypeTag type={event.type} theme={theme} />
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              color: ${theme.color.text};
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              flex: 1;
            `}
          >
            {renderEventContent(event, expanded)}
          </span>
        </div>
      )}
      renderDetail={
        hasDetail ? () => <pre>{JSON.stringify(event.payload, null, 2)}</pre> : undefined
      }
    />
  );
});
