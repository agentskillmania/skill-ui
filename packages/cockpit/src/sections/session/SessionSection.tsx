/** @jsxImportSource @emotion/react */
import { Activity } from 'lucide-react';

import { SectionHeader } from '@agentskillmania/skill-ui-shared';

import type { SessionOverviewData, SessionInfoData } from './types.js';
import { SessionOverviewCard } from './SessionOverviewCard.js';
import { SessionInfoCard } from './SessionInfoCard.js';
import { sectionStyle } from './styles.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';

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
      <SectionHeader icon={Activity} title="Session" />

      {overview && <SessionOverviewCard data={overview} />}
      {info && <SessionInfoCard data={info} defaultCollapsed />}
    </div>
  );
}
