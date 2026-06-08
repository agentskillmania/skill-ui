/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Activity } from 'lucide-react';
import type { SessionOverviewData, SessionInfoData } from './types.js';
import { SessionOverviewCard } from './SessionOverviewCard.js';
import { SessionInfoCard } from './SessionInfoCard.js';
import { sectionStyle } from './styles.js';

/** Props for SessionSection — container for Overview and Session Info cards. */
interface SessionSectionProps {
  /** Session overview data displayed in the top card. */
  overview?: SessionOverviewData;
  /** Session detail data displayed in the bottom card. */
  info?: SessionInfoData;
}

/**
 * SessionSection renders a section header with icon followed by
 * both the SessionOverviewCard and SessionInfoCard in vertical layout.
 */
export function SessionSection({ overview, info }: SessionSectionProps) {
  const theme = useTheme();

  return (
    <div css={sectionStyle(theme)}>
      {/* Section header */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[1]};
          padding: ${theme.spacing[1]} 0;
          font-size: ${theme.font.size.xs};
          font-weight: ${theme.font.weight.bold};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme.color.textSecondary};
        `}
      >
        <Activity size={14} />
        Session
        <div
          css={css`
            flex: 1;
            height: 1px;
            background: ${theme.color.borderSecondary};
          `}
        />
      </div>

      {overview && <SessionOverviewCard data={overview} />}
      {info && <SessionInfoCard data={info} defaultCollapsed />}
    </div>
  );
}
