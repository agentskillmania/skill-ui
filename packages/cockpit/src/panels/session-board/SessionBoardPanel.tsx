/** @jsxImportSource @emotion/react */
/**
 * SessionBoardPanel component
 * Renders session diagnostics via SessionSection, AgentStateSection, and RunnerSection.
 * Data structure strictly maps to daemon's agent-diagnostics SSE event.
 */
import { SidebarPanel } from '@agentskillmania/skill-ui-shared';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SessionBoardPanelProps } from './types.js';
import { NAMESPACE } from '../../locales/index.js';
import { AgentStateSection } from '../../sections/agent-state/index.js';
import { RunnerSection } from '../../sections/runner/index.js';
import { SessionSection } from '../../sections/session/index.js';

export function SessionBoardPanel({ state }: SessionBoardPanelProps) {
  const { t } = useTranslation(NAMESPACE);

  return (
    <SidebarPanel title={t('sessionBoardPanel.title')} icon={Activity}>
      <SessionSection overview={state?.session?.overview} info={state?.session?.info} />
      <AgentStateSection
        skillState={state?.agent?.context?.skillState}
        compression={state?.agent?.context?.compression}
        llm={state?.llm}
      />
      <RunnerSection runner={state?.runner} />
    </SidebarPanel>
  );
}
