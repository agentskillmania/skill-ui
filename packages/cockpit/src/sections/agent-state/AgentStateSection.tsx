/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Cpu } from 'lucide-react';

import { ActiveSkillCard } from './ActiveSkillCard.js';
import { CompressionCard } from './CompressionCard.js';
import { LLMContextCard } from './LLMContextCard.js';
import { sectionStyle } from './styles.js';
import type { AgentStateSectionProps } from './types.js';

/**
 * AgentStateSection renders a section header followed by three cards:
 * ActiveSkillCard, CompressionCard, and LLMContextCard.
 * Follows the same section pattern as SessionSection.
 */
export function AgentStateSection({
  skillState,
  compression,
  llm,
}: AgentStateSectionProps) {
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
        <Cpu size={14} />
        Agent State
        <div
          css={css`
            flex: 1;
            height: 1px;
            background: ${theme.color.borderSecondary};
          `}
        />
      </div>

      <ActiveSkillCard skillState={skillState} />
      <CompressionCard compression={compression} />
      <LLMContextCard llm={llm} />
    </div>
  );
}
