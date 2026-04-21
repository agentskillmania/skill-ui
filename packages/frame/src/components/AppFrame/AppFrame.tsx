/** @jsxImportSource @emotion/react */
/**
 * AppFrame 组件
 * 顶层窗口壳子，Titlebar + Portal（children）
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Titlebar } from '../Titlebar/index.js';
import type { AppFrameProps } from '../../types.js';

export function AppFrame({
  children,
  title,
  icon,
  titlebarCenter,
  titlebarEnd,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
}: AppFrameProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: ${theme.color.bgLayout};
        color: ${theme.color.text};
        overflow: hidden;
      `}
    >
      <Titlebar
        title={title}
        icon={icon}
        center={titlebarCenter}
        end={titlebarEnd}
        isMaximized={isMaximized}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />

      {/* Portal — 消费方决定内容 */}
      <div
        css={css`
          flex: 1;
          min-height: 0;
          overflow: auto;
        `}
      >
        {children}
      </div>
    </div>
  );
}
