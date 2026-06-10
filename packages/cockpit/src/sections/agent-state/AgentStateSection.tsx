/** @jsxImportSource @emotion/react */
import { Cpu } from 'lucide-react';

import { SectionHeader } from '@agentskillmania/skill-ui-shared';

import { ActiveSkillCard } from './ActiveSkillCard.js';
import { CompressionCard } from './CompressionCard.js';
import { LLMContextCard } from './LLMContextCard.js';
import { sectionStyle } from './styles.js';
import type { AgentStateSectionProps } from './types.js';
import { useTheme } from '@agentskillmania/skill-ui-theme';

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
      <SectionHeader icon={Cpu} title="Agent State" />

      <ActiveSkillCard skillState={skillState} />
      <CompressionCard compression={compression} />
      <LLMContextCard llm={llm} />
    </div>
  );
}
