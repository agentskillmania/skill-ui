/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Button, Popconfirm, Space } from 'antd';
import { Trash2, MessageCircle, GitBranch } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SessionItem } from '../../types.js';
import { ResourceAvatar } from '../ResourceAvatar/index.js';

interface SessionRowProps {
  session: SessionItem;
  onResume: () => void;
  onDelete: () => void;
  onFork?: () => void;
  isLast?: boolean;
}

export const SessionRow = memo(
  function SessionRow({ session, onResume, onDelete, onFork, isLast }: SessionRowProps) {
    // memo body unchanged — see the custom areEqual below for why memo still works
    // even though parent passes inline arrow callbacks.
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
              aria-label={t('resumeSession')}
              icon={<MessageCircle size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onResume();
              }}
            />
            <Button
              type="text"
              size="small"
              aria-label={t('forkSession')}
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
              <Button
                type="text"
                danger
                aria-label={t('delete')}
                icon={<Trash2 size={14} />}
                size="small"
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    );
  },
  (prev, next) => {
    // UI16: custom comparison — parent passes inline arrow callbacks
    // (onResume/onDelete/onFork) that are new references every render, so the
    // default shallow memo always bails. Compare only the data that actually
    // affects the row's output: session identity (by id + lastActive + tokenCount)
    // and isLast.
    if (prev.isLast !== next.isLast) return false;
    if (prev.session === next.session) return true;
    const a = prev.session;
    const b = next.session;
    return (
      a.id === b.id &&
      a.agentName === b.agentName &&
      a.workspacePath === b.workspacePath &&
      a.lastActive === b.lastActive &&
      a.tokenCount === b.tokenCount &&
      a.agentId === b.agentId
    );
  }
);
