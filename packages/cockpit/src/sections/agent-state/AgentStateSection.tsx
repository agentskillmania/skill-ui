/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Cpu } from 'lucide-react';

import { useTheme, flexColumn } from '@agentskillmania/skill-ui-theme';
import { SectionHeader } from '@agentskillmania/skill-ui-shared';

import { ActiveSkillCard } from './ActiveSkillCard.js';
import { CompressionCard } from './CompressionCard.js';
import { LLMContextCard } from './LLMContextCard.js';
import type { AgentStateSectionProps } from './types.js';

/**
 * AgentStateSection renders a section header followed by three cards:
 * ActiveSkillCard, CompressionCard, and LLMContextCard.
 * Follows the same section pattern as SessionSection.
 */
export function AgentStateSection({ skillState, compression, llm }: AgentStateSectionProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        ${flexColumn(theme, '2')}
      `}
    >
      <SectionHeader icon={Cpu} title="Agent State" iconColor={theme.color.primary} />

      <ActiveSkillCard skillState={skillState} />
      <CompressionCard compression={compression} />
      <LLMContextCard llm={llm} />
    </div>
  );
}
