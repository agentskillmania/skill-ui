/** @jsxImportSource @emotion/react */
/**
 * EventRow component — unified shell for all event types
 * Displays type tag, content text, and expandable payload detail
 */
import { css } from '@emotion/react';
import { useTheme, interactiveRow } from '@agentskillmania/skill-ui-theme';
import type { CockpitEvent } from './types.js';
import { renderEventContent } from './eventRows.js';
import { EventTypeTag } from './EventTypeTag.js';
import { ExpandableItem } from '@agentskillmania/skill-ui-shared';

export interface EventRowProps {
  event: CockpitEvent;
}

export function EventRow({ event }: EventRowProps) {
  const theme = useTheme();
  const hasDetail = event.payload && Object.keys(event.payload).length > 0;

  return (
    <ExpandableItem
      expandable={hasDetail}
      defaultExpanded={false}
      renderSummary={({ expanded, toggle }) => (
        <div css={interactiveRow(theme, { active: expanded })} onClick={toggle}>
          {/* Header line: tag + content */}
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
        </div>
      )}
      renderDetail={() => (
        <div
          css={css`
            margin-top: ${theme.spacing[1]};
            padding: ${theme.spacing[2]};
            background: ${theme.color.fillSecondary};
            font-size: ${theme.font.size.xs};
            font-family: ${theme.font.familyMono};
            color: ${theme.color.textSecondary};
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow: auto;
          `}
        >
          {JSON.stringify(event.payload, null, 2)}
        </div>
      )}
    />
  );
}
