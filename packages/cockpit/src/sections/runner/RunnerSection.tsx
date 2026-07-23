/** @jsxImportSource @emotion/react */
import { SectionHeader } from '@agentskillmania/skill-ui-shared';
import { useTheme, flexColumn } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Settings } from 'lucide-react';

import { FeatureTagsCard } from './FeatureTagsCard.js';
import { SkillsCard } from './SkillsCard.js';
import { ToolsCard } from './ToolsCard.js';
import type { RunnerSectionProps } from './types.js';

/**
 * RunnerSection renders a section header followed by three cards:
 * FeatureTagsCard, ToolsCard, and SkillsCard.
 * Follows the same section pattern as AgentStateSection and SessionSection.
 */
export function RunnerSection({ runner }: RunnerSectionProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        ${flexColumn(theme, '2')}
      `}
    >
      <SectionHeader icon={Settings} title="Runner" iconColor={theme.color.primary} />

      <FeatureTagsCard features={runner?.features} />
      <ToolsCard tools={runner?.tools} />
      <SkillsCard skills={runner?.skills} />
    </div>
  );
}
