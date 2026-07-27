/**
 * Launcher page — simple list of agents, skills, and sessions
 * Uses antd components directly (skill-ui-frame has no Launcher component)
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Spin, Empty, Card, List, Typography, Tag, Button } from 'antd';
import {
  RobotOutlined,
  BookOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import { useLauncher } from '../hooks/useLauncher.js';
import type { Route } from '../types.js';

const { Text, Title } = Typography;

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
      <div css={css`display: flex; align-items: center; justify-content: center; height: 100%;`}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div css={css`display: flex; align-items: center; justify-content: center; height: 100%; color: ${theme.color.error};`}>
        Failed to load: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div css={css`display: flex; align-items: center; justify-content: center; height: 100%;`}>
        <Empty description="No data" />
      </div>
    );
  }

  const handleNewSession = async () => {
    const sessionId = await onCreateSession({ workspacePath: './workspace' });
    if (sessionId) {
      onNavigate({ page: 'workspace', sessionId });
    }
  };

  const handleAgentChat = async (agentId: string) => {
    const sessionId = await onCreateSession({ workspacePath: './workspace', agentPath: agentId });
    if (sessionId) {
      onNavigate({ page: 'workspace', sessionId });
    }
  };

  const handleSessionResume = (sessionId: string) => {
    onNavigate({ page: 'workspace', sessionId });
  };

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        background: ${theme.color.bgBase};
        padding: ${theme.spacing[6]} ${theme.spacing[8]};
        max-width: 960px;
        margin: 0 auto;
      `}
    >
      <div css={css`display: flex; justify-content: space-between; align-items: center; margin-bottom: ${theme.spacing[6]};`}>
        <Title level={3} css={css`margin: 0;`}>Skill UI Demo</Title>
        <Button icon={<PlusOutlined />} onClick={handleNewSession}>New Session</Button>
      </div>

      {/* Sessions */}
      {data.sessions.length > 0 && (
        <Card
          title={<><MessageOutlined /> Sessions</>}
          size="small"
          css={css`margin-bottom: ${theme.spacing[4]};`}
          extra={<Button size="small" type="text" icon={<ReloadOutlined />} onClick={refresh} />}
        >
          <List
            dataSource={data.sessions}
            renderItem={(s) => (
              <List.Item
                actions={[
                  <Button size="small" onClick={() => handleSessionResume(s.id)}>Resume</Button>,
                ]}
              >
                <List.Item.Meta
                  title={s.agentName}
                  description={
                    <Text type="secondary">
                      {s.model} · {s.messageCount} messages · {s.status}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Agents */}
      {data.agents.length > 0 && (
        <Card title={<><RobotOutlined /> Agents</>} size="small" css={css`margin-bottom: ${theme.spacing[4]};`}>
          <List
            dataSource={data.agents}
            renderItem={(a) => (
              <List.Item
                actions={[
                  <Button size="small" onClick={() => handleAgentChat(a.id)}>Chat</Button>,
                ]}
              >
                <List.Item.Meta
                  title={a.name}
                  description={
                    <div>
                      <Text type="secondary">{a.description}</Text>
                      <div css={css`margin-top: 4px;`}>
                        <Tag>{a.toolCount} tools</Tag>
                        <Tag>{a.skillCount} skills</Tag>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Card title={<><BookOutlined /> Skills</>} size="small">
          <List
            dataSource={data.skills}
            renderItem={(s) => (
              <List.Item>
                <List.Item.Meta title={s.name} description={s.description} />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
}
