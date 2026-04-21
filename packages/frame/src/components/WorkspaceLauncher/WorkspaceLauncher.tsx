/** @jsxImportSource @emotion/react */
/**
 * WorkspaceLauncher 组件
 * 未选择 workspace 时的启动页，支持 list / mondrian 两种布局模式
 * 背景使用浮动渐变色块 + 前景毛玻璃效果
 */
import { useState, useMemo } from 'react';
import { css } from '@emotion/react';
import { Clock } from 'lucide-react';
import { Card, Input, Empty, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTheme, glassEffect } from '@agentskillmania/skill-ui-theme';
import { formatRelativeTime } from './time.js';
import { MondrianLayout } from './MondrianLayout.js';
import { GradientBackground } from './GradientBackground.js';
import type { WorkspaceLauncherProps, WorkspaceCard as WorkspaceCardData } from '../../types.js';

/** 卡片列表最大高度 */
const LIST_MAX_HEIGHT = '400px';

export function WorkspaceLauncher({
  workspaces,
  onSelect,
  onCreate,
  layoutMode = 'list',
}: WorkspaceLauncherProps) {
  const theme = useTheme();
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
      {/* 浮动渐变色块背景 */}
      <GradientBackground />

      {/* 前景内容（毛玻璃） */}
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

        {layoutMode === 'mondrian' ? (
          /* 蒙德里安装饰画布局 */
          <>
            {filtered.length > 0 ? (
              <MondrianLayout workspaces={filtered} onSelect={onSelect} />
            ) : (
              <Empty
                description={search ? '没有匹配的 workspace' : '暂无 workspace'}
                css={css`
                  margin: ${theme.spacing['8']} 0;
                `}
              />
            )}
          </>
        ) : (
          /* 经典列表布局 */
          <>
            {/* 搜索框 */}
            {workspaces.length > 5 && (
              <Input
                prefix={<SearchOutlined />}
                placeholder="搜索 workspace..."
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

            {/* 卡片列表 */}
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
                  description={search ? '没有匹配的 workspace' : '暂无 workspace'}
                  css={css`
                    margin: ${theme.spacing['8']} 0;
                  `}
                />
              )}
            </div>
          </>
        )}

        {/* 新建按钮 */}
        {onCreate && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={onCreate}
            css={css`
              margin-top: ${theme.spacing['4']};
            `}
          >
            新建 Workspace
          </Button>
        )}
      </div>
    </div>
  );
}

/** 单张 workspace 卡片（列表模式） */
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
    </Card>
  );
}
