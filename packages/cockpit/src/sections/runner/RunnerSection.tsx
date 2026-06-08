/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Settings } from 'lucide-react';

import { FeatureTagsCard } from './FeatureTagsCard.js';
import { SkillsCard } from './SkillsCard.js';
import { ToolsCard } from './ToolsCard.js';
import { sectionStyle } from './styles.js';
import type { RunnerSectionProps } from './types.js';

/**
 * RunnerSection renders a section header followed by three cards:
 * FeatureTagsCard, ToolsCard, and SkillsCard.
 * Follows the same section pattern as AgentStateSection and SessionSection.
 */
export function RunnerSection({ runner }: RunnerSectionProps) {
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
        <Settings size={14} />
        Runner
        <div
          css={css`
            flex: 1;
            height: 1px;
            background: ${theme.color.borderSecondary};
          `}
        />
      </div>

      <FeatureTagsCard features={runner?.features} />
      <ToolsCard tools={runner?.tools} />
      <SkillsCard skills={runner?.skills} />
    </div>
  );
}
