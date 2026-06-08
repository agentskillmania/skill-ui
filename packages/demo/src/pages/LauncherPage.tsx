/**
 * Launcher page — full-screen home with agents, skills, sessions
 */
import { css } from '@emotion/react';
import { Spin, Empty } from 'antd';
import { Launcher } from '@agentskillmania/skill-ui-frame';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useLauncher } from '../hooks/useLauncher.js';
import type { Route } from '../types.js';

interface LauncherPageProps {
  onNavigate: (route: Route) => void;
  onCreateSession: (options: {
    workspacePath: string;
    agentPath?: string;
  }) => Promise<string | null>;
}

export function LauncherPage({ onNavigate, onCreateSession }: LauncherPageProps) {
  const theme = useTheme();
  const { data, loading, error, refresh } = useLauncher();

  if (loading) {
    return (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        `}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: ${theme.color.error};
        `}
      >
        Failed to load: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        `}
      >
        <Empty description="No data" />
      </div>
    );
  }

  const handleAgentChat = async (agentId: string) => {
    const agent = data.agents.find((a) => a.id === agentId);
    if (!agent) return;

    const sessionId = await onCreateSession({
      workspacePath: agent.id,
    });
    if (sessionId) {
      onNavigate({ page: 'workspace', sessionId });
    }
  };

  const handleSkillEdit = async (skillId: string) => {
    const skill = data.skills.find((s) => s.id === skillId);
    if (!skill) return;

    const sessionId = await onCreateSession({
      workspacePath: skill.id,
    });
    if (sessionId) {
      onNavigate({ page: 'workspace', sessionId });
    }
  };

  const handleSessionResume = (sessionId: string) => {
    onNavigate({ page: 'workspace', sessionId });
  };

  const handleAgentCreate = () => {
    // Phase 2: open editor for new agent
  };

  const handleSkillCreate = () => {
    // Phase 2: open editor for new skill
  };

  const handleSessionClear = () => {
    refresh();
  };

  const handleAgentEdit = (agentId: string) => {
    const agent = data.agents.find((a) => a.id === agentId);
    if (!agent) return;
    onNavigate({ page: 'workspace', sessionId: agent.id });
  };

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        background: ${theme.color.bgBase};
      `}
    >
      <Launcher
        agents={data.agents}
        skills={data.skills}
        sessions={data.sessions}
        onAgentChat={handleAgentChat}
        onAgentEdit={handleAgentEdit}
        onAgentCreate={handleAgentCreate}
        onSkillEdit={handleSkillEdit}
        onSkillCreate={handleSkillCreate}
        onSessionResume={handleSessionResume}
        onSessionClear={handleSessionClear}
      />
    </div>
  );
}
