/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Activity } from 'lucide-react';

import { SectionHeader } from '@agentskillmania/skill-ui-shared';
import { useTheme, flexColumn } from '@agentskillmania/skill-ui-theme';

import type { SessionOverviewData, SessionInfoData } from './types.js';
import { SessionOverviewCard } from './SessionOverviewCard.js';
import { SessionInfoCard } from './SessionInfoCard.js';

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
    <div css={css`${flexColumn(theme, '2')}`}>
      <SectionHeader icon={Activity} title="Session" iconColor={theme.color.primary} />

      {overview && <SessionOverviewCard data={overview} />}
      {info && <SessionInfoCard data={info} defaultCollapsed />}
    </div>
  );
}
