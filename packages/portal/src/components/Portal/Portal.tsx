/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import { Tabs } from 'antd';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { PortalHeader } from '../PortalHeader/PortalHeader.js';
import { SkillSection } from '../SkillSection/SkillSection.js';
import { AgentSection } from '../AgentSection/AgentSection.js';
import { SessionSection } from '../SessionSection/SessionSection.js';
import type { PortalProps, PortalTab } from '../../types.js';

export function Portal(props: PortalProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');
  const [internalTab, setInternalTab] = useState<PortalTab>('skills');

  const activeTab = props.activeTab ?? internalTab;
  const handleTabChange = (tab: PortalTab) => {
    setInternalTab(tab);
    props.onTabChange?.(tab);
  };

  const tabItems = [
    {
      key: 'skills' as PortalTab,
      label: t('skills'),
      children: (
        <SkillSection
          skills={props.skills}
          page={props.skillsPage}
          pageSize={props.skillsPageSize}
          total={props.skillsTotal}
          onPageChange={props.onSkillsPageChange}
          onChat={props.onSkillChat}
          onEdit={props.onSkillEdit}
          onDelete={props.onSkillDelete}
          onCreate={props.onSkillCreate}
        />
      ),
    },
    {
      key: 'agents' as PortalTab,
      label: t('agents'),
      children: (
        <AgentSection
          agents={props.agents}
          page={props.agentsPage}
          pageSize={props.agentsPageSize}
          total={props.agentsTotal}
          onPageChange={props.onAgentsPageChange}
          onChat={props.onAgentChat}
          onEdit={props.onAgentEdit}
          onDelete={props.onAgentDelete}
          onCreate={props.onAgentCreate}
        />
      ),
    },
    {
      key: 'sessions' as PortalTab,
      label: t('sessions'),
      children: (
        <SessionSection
          sessions={props.sessions}
          page={props.sessionsPage}
          pageSize={props.sessionsPageSize}
          total={props.sessionsTotal}
          onPageChange={props.onSessionsPageChange}
          onResume={props.onSessionResume}
          onDelete={props.onSessionDelete}
          onFork={props.onSessionFork}
          onClear={props.onSessionClear}
        />
      ),
    },
  ];

  return (
    <div
      css={{
        height: '100%',
        overflowY: 'auto',
        background: theme.color.bgBase,
        padding: theme.spacing[6],
      }}
    >
      <PortalHeader
        results={props.searchResults}
        onSearch={props.onSearch}
        githubUrl={props.githubUrl}
        onSelect={(type, id) => {
          if (props.onSearchSelect) {
            props.onSearchSelect(type, id);
          } else {
            if (type === 'agent') props.onAgentChat(id);
            if (type === 'skill') props.onSkillChat(id);
            if (type === 'session') props.onSessionResume(id);
          }
        }}
        onEdit={(type, id) => {
          if (props.onSearchEdit) {
            props.onSearchEdit(type, id);
          } else {
            if (type === 'agent') props.onAgentEdit(id);
            if (type === 'skill') props.onSkillEdit(id);
            if (type === 'session') props.onSessionDelete(id);
          }
        }}
      />

      <Tabs
        activeKey={activeTab}
        onChange={(k) => handleTabChange(k as PortalTab)}
        items={tabItems}
        animated={{ inkBar: true, tabPane: true }}
      />
    </div>
  );
}
