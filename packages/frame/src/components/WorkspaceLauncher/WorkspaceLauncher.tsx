/** @jsxImportSource @emotion/react */
/**
 * WorkspaceLauncher component
 * Launcher page when no workspace is selected, supports list / mondrian layout modes
 * Background uses floating gradient blobs + foreground glassmorphism effect
 */
import { useState, useMemo } from 'react';
import { css } from '@emotion/react';
import { Clock } from 'lucide-react';
import { Card, Input, Empty, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTheme, glassEffect } from '@agentskillmania/skill-ui-theme';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from './time.js';
import { MondrianLayout } from './MondrianLayout.js';
import { GradientBackground } from './GradientBackground.js';
import type { WorkspaceLauncherProps, WorkspaceCard as WorkspaceCardData } from '../../types.js';

/** Maximum height of card list */
const LIST_MAX_HEIGHT = '400px';

export function WorkspaceLauncher({
  workspaces,
  onSelect,
  onCreate,
  layoutMode = 'list',
}: WorkspaceLauncherProps) {
  const theme = useTheme();
  const { t } = useTranslation('skill-ui-frame');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return workspaces;
    const keyword = search.trim().toLowerCase();
    return workspaces.filter(
      (ws) =>
        ws.name.toLowerCase().includes(keyword) || ws.description?.toLowerCase().includes(keyword)
    );
  }, [workspaces, search]);

  return (
    <div
      css={css`
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        overflow: hidden;
      `}
    >
      {/* Floating gradient blob background */}
      <GradientBackground />

      {/* Foreground content (glassmorphism) */}
      <div
        css={css`
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: ${theme.spacing['8']};
          ${glassEffect(theme, 'light')}
          border-radius: ${theme.radius.xl};
          box-shadow: ${theme.shadow.lg};
          max-width: 560px;
          width: 90%;
          max-height: 80vh;
          margin: ${theme.spacing['6']} auto;
        `}
      >
        <h1
          css={css`
            font-size: ${theme.font.size['2xl']};
            font-weight: 700;
            color: ${theme.color.text};
            margin-bottom: ${theme.spacing['1']};
          `}
        >
          {t('launcher.title')}
        </h1>
        <p
          css={css`
            font-size: ${theme.font.size.base};
            color: ${theme.color.textTertiary};
            margin-bottom: ${theme.spacing['6']};
          `}
        >
          {t('launcher.subtitle')}
        </p>

        {layoutMode === 'mondrian' ? (
          /* Mondrian decorative painting layout */
          <>
            {filtered.length > 0 ? (
              <MondrianLayout workspaces={filtered} onSelect={onSelect} />
            ) : (
              <Empty
                description={search ? t('launcher.noMatch') : t('launcher.empty')}
                css={css`
                  margin: ${theme.spacing['8']} 0;
                `}
              />
            )}
          </>
        ) : (
          /* Classic list layout */
          <>
            {/* Search box */}
            {workspaces.length > 5 && (
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('launcher.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                css={css`
                  width: 100%;
                  max-width: 480px;
                  margin-bottom: ${theme.spacing['3']};
                `}
              />
            )}

            {/* Card list */}
            <div
              css={css`
                display: flex;
                flex-direction: column;
                gap: ${theme.spacing['2']};
                width: 100%;
                max-width: 480px;
                max-height: ${LIST_MAX_HEIGHT};
                overflow-y: auto;
                padding: ${theme.spacing['1']};
              `}
            >
              {filtered.length > 0 ? (
                filtered.map((ws) => (
                  <WorkspaceCardItem key={ws.id} workspace={ws} onSelect={onSelect} />
                ))
              ) : (
                <Empty
                  description={search ? t('launcher.noMatch') : t('launcher.empty')}
                  css={css`
                    margin: ${theme.spacing['8']} 0;
                  `}
                />
              )}
            </div>
          </>
        )}

        {/* Create button */}
        {onCreate && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={onCreate}
            css={css`
              margin-top: ${theme.spacing['4']};
            `}
          >
            {t('launcher.newWorkspace')}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Single workspace card (list mode) */
function WorkspaceCardItem({
  workspace,
  onSelect,
}: {
  workspace: WorkspaceCardData;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <Card
      hoverable
      size="small"
      onClick={() => onSelect(workspace.id)}
      css={css`
        cursor: pointer;
        border-color: ${theme.color.border};
        box-shadow: ${theme.shadow.sm};
        border-radius: ${theme.radius.lg};
        transition:
          border-color ${theme.motion.duration.fast},
          box-shadow ${theme.motion.duration.fast};

        &:hover {
          border-color: ${theme.color.primary} !important;
          box-shadow: 0 0 0 1px ${theme.color.primary} !important;
        }

        .ant-card-body {
          display: flex;
          align-items: center;
          gap: ${theme.spacing['3']};
          padding: ${theme.spacing['3']} ${theme.spacing['4']};
        }
      `}
    >
      {/* Icon */}
      {workspace.icon && (
        <div
          css={css`
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: ${theme.radius.md};
            background: ${theme.color.primaryBg};
            color: ${theme.color.primary};
            flex-shrink: 0;
          `}
        >
          {workspace.icon}
        </div>
      )}

      {/* Info */}
      <div
        css={css`
          flex: 1;
          min-width: 0;
        `}
      >
        <div
          css={css`
            font-size: ${theme.font.size.lg};
            font-weight: 600;
            color: ${theme.color.text};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
        >
          {workspace.name}
        </div>
        {workspace.description && (
          <div
            css={css`
              font-size: ${theme.font.size.sm};
              color: ${theme.color.textTertiary};
              margin-top: ${theme.spacing['0.5']};
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}
          >
            {workspace.description}
          </div>
        )}
      </div>

      {/* Last opened time */}
      {workspace.lastOpened && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing['1']};
            font-size: ${theme.font.size.xs};
            color: ${theme.color.textQuaternary};
            flex-shrink: 0;
          `}
        >
          <Clock size={12} />
          {formatRelativeTime(workspace.lastOpened)}
        </div>
      )}
    </Card>
  );
}
