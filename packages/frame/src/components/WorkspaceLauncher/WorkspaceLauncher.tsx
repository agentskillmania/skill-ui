/** @jsxImportSource @emotion/react */
/**
 * WorkspaceLauncher 组件
 * 未选择 workspace 时的启动页，展示最近 workspace 卡片 + 新建按钮
 */
import { css } from '@emotion/react';
import { Plus, Clock } from 'lucide-react';
import { useTheme, card, textTruncate } from '@agentskillmania/skill-ui-theme';
import type { WorkspaceLauncherProps, WorkspaceCard as WorkspaceCardData } from '../../types.js';

/** 单张 workspace 卡片 */
function WorkspaceCardItem({
  workspace,
  onSelect,
}: {
  workspace: WorkspaceCardData;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  return (
    <button
      css={[
        card(theme),
        css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing['3']};
          width: 100%;
          padding: ${theme.spacing['3']} ${theme.spacing['4']};
          cursor: pointer;
          text-align: left;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.lg};
          background: ${theme.color.bgContainer};
          transition:
            border-color ${theme.motion.duration.fast},
            box-shadow ${theme.motion.duration.fast};

          &:hover {
            border-color: ${theme.color.primary};
            box-shadow: 0 0 0 1px ${theme.color.primary};
          }
        `,
      ]}
      onClick={() => onSelect(workspace.id)}
      type="button"
      aria-label={`打开 ${workspace.name}`}
    >
      {/* 图标 */}
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

      {/* 信息 */}
      <div
        css={css`
          flex: 1;
          min-width: 0;
        `}
      >
        <div
          css={[
            textTruncate(theme),
            css`
              font-size: ${theme.font.size.lg};
              font-weight: 600;
              color: ${theme.color.text};
            `,
          ]}
        >
          {workspace.name}
        </div>
        {workspace.description && (
          <div
            css={[
              textTruncate(theme),
              css`
                font-size: ${theme.font.size.sm};
                color: ${theme.color.textTertiary};
                margin-top: ${theme.spacing['0.5']};
              `,
            ]}
          >
            {workspace.description}
          </div>
        )}
      </div>

      {/* 最后打开时间 */}
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
    </button>
  );
}

export function WorkspaceLauncher({ workspaces, onSelect, onCreate }: WorkspaceLauncherProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: ${theme.spacing['8']};
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
        打开 Workspace
      </h1>
      <p
        css={css`
          font-size: ${theme.font.size.base};
          color: ${theme.color.textTertiary};
          margin-bottom: ${theme.spacing['6']};
        `}
      >
        选择一个已有的 workspace，或创建新的
      </p>

      {/* 卡片列表 */}
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing['2']};
          width: 100%;
          max-width: 480px;
        `}
      >
        {workspaces.map((ws) => (
          <WorkspaceCardItem key={ws.id} workspace={ws} onSelect={onSelect} />
        ))}
      </div>

      {/* 新建按钮 */}
      {onCreate && (
        <button
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing['2']};
            margin-top: ${theme.spacing['6']};
            padding: ${theme.spacing['2']} ${theme.spacing['4']};
            border: 1px dashed ${theme.color.border};
            border-radius: ${theme.radius.md};
            background: transparent;
            color: ${theme.color.textSecondary};
            font-size: ${theme.font.size.base};
            cursor: pointer;
            transition:
              border-color ${theme.motion.duration.fast},
              color ${theme.motion.duration.fast};

            &:hover {
              border-color: ${theme.color.primary};
              color: ${theme.color.primary};
            }
          `}
          onClick={onCreate}
          type="button"
        >
          <Plus size={16} />
          新建 Workspace
        </button>
      )}
    </div>
  );
}

/** 格式化相对时间 */
function formatRelativeTime(isoTime: string): string {
  const now = Date.now();
  const then = new Date(isoTime).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return '刚刚';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;

  return `${Math.floor(months / 12)} 年前`;
}
