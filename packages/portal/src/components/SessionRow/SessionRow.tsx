/** @jsxImportSource @emotion/react */
import { memo, useState } from 'react';
import { Button, Popconfirm, Space } from 'antd';
import { Trash2, MessageCircle, GitBranch } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { ResourceAvatar } from '../shared/ResourceAvatar.js';
import type { SessionItem } from '../../types.js';

interface SessionRowProps {
  session: SessionItem;
  onResume: () => void;
  onDelete: () => void;
  onFork?: () => void;
  isLast?: boolean;
}

export const SessionRow = memo(function SessionRow({ session, onResume, onDelete, onFork, isLast }: SessionRowProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onResume}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[3],
        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : `1px solid ${theme.color.border}`,
        background: hovered ? theme.color.fill : 'transparent',
        transition: `background ${theme.motion.duration.fast}`,
      }}
    >
      <ResourceAvatar id={session.agentId} name={session.agentName} size={36} />

      <div css={{ flex: 1, minWidth: 0 }}>
        <div css={{ fontWeight: 600, color: theme.color.text }}>{session.agentName}</div>
        <div
          css={{
            fontSize: theme.font.size.sm,
            color: theme.color.textTertiary,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {session.workspacePath}
        </div>
      </div>

      <div css={{ display: 'flex', alignItems: 'center', gap: theme.spacing[4], flexShrink: 0 }}>
        <span css={{ fontSize: theme.font.size.sm, color: theme.color.textTertiary }}>
          {session.lastActive}
        </span>
        <span css={{ fontSize: theme.font.size.sm, color: theme.color.textTertiary }}>
          {t('tokens', { count: session.tokenCount })}
        </span>
      </div>

      <div
        css={{
          opacity: hovered ? 1 : 0,
          transition: `opacity ${theme.motion.duration.fast}`,
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<MessageCircle size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onResume();
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<GitBranch size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              onFork?.();
            }}
          />
          <Popconfirm
            title={t('deleteConfirmSession')}
            onConfirm={onDelete}
            okText={t('delete')}
            cancelText={t('cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={14} />} size="small" />
          </Popconfirm>
        </Space>
      </div>
    </div>
  );
});
