/** @jsxImportSource @emotion/react */
import { useMemo } from 'react';
import { Button, Empty, Select, Popconfirm } from 'antd';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { PaginationBar, DEFAULT_PAGE_SIZE } from '@agentskillmania/skill-ui-shared';
import { SessionRow } from '../SessionRow/SessionRow.js';
import type { SessionItem } from '../../types.js';

interface SessionSectionProps {
  sessions: SessionItem[];
  page: number;
  pageSize?: number;
  total: number;
  onPageChange: (page: number) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onFork?: (id: string) => void;
  onClear?: () => void;
  /** Controlled workspace filter value */
  filterWorkspace: string | undefined;
  /** Callback when workspace filter changes */
  onFilterWorkspaceChange: (workspace: string | undefined) => void;
}

export function SessionSection({
  sessions,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  total,
  onPageChange,
  onResume,
  onDelete,
  onFork,
  onClear,
  filterWorkspace,
  onFilterWorkspaceChange,
}: SessionSectionProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-portal');

  const workspaceOptions = useMemo(() => {
    const paths = Array.from(new Set(sessions.map((s) => s.workspacePath))).sort();
    return paths.map((p) => ({ value: p, label: p }));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!filterWorkspace) return sessions;
    return sessions.filter((s) => s.workspacePath === filterWorkspace);
  }, [sessions, filterWorkspace]);

  return (
    <div>
      <div
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[4],
        }}
      >
        <span css={{ fontSize: theme.font.size.xl, fontWeight: 600 }}>{t('sessions')}</span>
        <div css={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3] }}>
          <Select<string | undefined>
            value={filterWorkspace}
            onChange={(value) => onFilterWorkspaceChange(value)}
            options={workspaceOptions}
            allowClear
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            placeholder={t('filterByWorkspace') ?? '筛选工作区'}
            css={{ minWidth: 220 }}
          />
          {total > 0 && onClear && (
            <Popconfirm
              title={t('clearAllConfirm') ?? '确定要清除全部会话吗？'}
              onConfirm={onClear}
              okText={t('delete')}
              cancelText={t('cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button type="link">{t('clearAll')}</Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <>
          <div
            css={{
              border: `1px solid ${theme.color.border}`,
              borderRadius: theme.radius.md,
              overflow: 'hidden',
            }}
          >
            {filteredSessions.map((session, index) => (
              <SessionRow
                key={session.id}
                session={session}
                onResume={() => onResume(session.id)}
                onDelete={() => onDelete(session.id)}
                onFork={onFork ? () => onFork(session.id) : undefined}
                isLast={index === filteredSessions.length - 1}
              />
            ))}
          </div>
          <PaginationBar current={page} pageSize={pageSize} total={total} onChange={onPageChange} />
        </>
      ) : (
        <Empty description={t('noSessions')} />
      )}
    </div>
  );
}
