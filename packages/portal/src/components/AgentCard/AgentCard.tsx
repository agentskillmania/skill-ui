/** @jsxImportSource @emotion/react */
import { memo, useState } from 'react';
import { Card, Button, Tag, Popconfirm, Tooltip } from 'antd';
import { Trash2, Pencil, MessageCircle } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { ResourceAvatar } from '../shared/ResourceAvatar.js';
import type { AgentItem } from '../../types.js';

interface AgentCardProps {
  agent: AgentItem;
  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ellipsisStyle = {
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  whiteSpace: 'nowrap' as const,
};

export const AgentCard = memo(
  function AgentCard({ agent, onChat, onEdit, onDelete }: AgentCardProps) {
    const theme = useTheme();
    const { t } = useTranslation('skill-ui-portal');
    const [hovered, setHovered] = useState(false);

    return (
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        css={{
          position: 'relative',
          transition: `border-color ${theme.motion.duration.fast}, box-shadow ${theme.motion.duration.fast}`,
          '&:hover': {
            borderColor: theme.color.primary,
            boxShadow: `0 2px 8px ${theme.color.primaryBg}`,
          },
        }}
        actions={[
          <Button size="small" icon={<Pencil size={14} />} onClick={onEdit}>
            {t('edit')}
          </Button>,
          <Button type="primary" size="small" icon={<MessageCircle size={14} />} onClick={onChat}>
            {t('chat')}
          </Button>,
        ]}
      >
        {/* Delete button — hover-visible */}
        <div
          css={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            opacity: hovered ? 1 : 0,
            transition: `opacity ${theme.motion.duration.fast}`,
          }}
        >
          <Popconfirm
            title={t('deleteConfirmAgent')}
            onConfirm={onDelete}
            okText={t('delete')}
            cancelText={t('cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={14} />} size="small" />
          </Popconfirm>
        </div>

        <Card.Meta
          avatar={<ResourceAvatar id={agent.id} name={agent.name} />}
          title={
            <Tooltip title={agent.name}>
              <div css={ellipsisStyle}>{agent.name}</div>
            </Tooltip>
          }
          description={
            <div css={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
              <Tooltip title={agent.description}>
                <div
                  css={{
                    ...ellipsisStyle,
                    color: theme.color.textSecondary,
                    fontSize: theme.font.size.sm,
                  }}
                >
                  {agent.description}
                </div>
              </Tooltip>
              <div css={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                <Tag color={agent.source === 'builtin' ? 'red' : 'green'}>
                  {agent.source === 'builtin' ? t('builtin') : t('custom')}
                </Tag>
                <span css={{ fontSize: theme.font.size.xs, color: theme.color.textTertiary }}>
                  {t('skillsCount', { count: agent.skillCount })}
                </span>
              </div>
            </div>
          }
        />
      </Card>
    );
  },
  (prev, next) => {
    // UI16: custom comparison — parent passes inline arrow callbacks that are
    // new references every render. Compare only agent identity.
    if (prev.agent === next.agent) return true;
    const a = prev.agent;
    const b = next.agent;
    return (
      a.id === b.id &&
      a.name === b.name &&
      a.description === b.description &&
      a.source === b.source &&
      a.skillCount === b.skillCount
    );
  }
);
