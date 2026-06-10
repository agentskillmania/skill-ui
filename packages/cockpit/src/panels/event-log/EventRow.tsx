/** @jsxImportSource @emotion/react */
/**
 * EventRow component — unified shell for all event types.
 * Displays type tag, content text, and expandable payload detail.
 * Uses shared ExpandableRow with code variant for JSON payloads.
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { CockpitEvent } from './types.js';
import { renderEventContent } from './eventRows.js';
import { EventTypeTag } from './EventTypeTag.js';
import { ExpandableRow } from '@agentskillmania/skill-ui-shared';

export interface EventRowProps {
  event: CockpitEvent;
}

export function EventRow({ event }: EventRowProps) {
  const theme = useTheme();
  const hasDetail = event.payload && Object.keys(event.payload).length > 0;

  return (
    <ExpandableRow
      expandable={hasDetail}
      defaultExpanded={false}
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
      renderDetail={hasDetail ? () => (
        <pre>{JSON.stringify(event.payload, null, 2)}</pre>
      ) : undefined}
    />
  );
}
