/** @jsxImportSource @emotion/react */
/**
 * Titlebar 组件
 * macOS 风格标题栏，frameless 窗口专用
 * 结构：[TrafficLights] [AppBrand] [center 插槽] —靠右— [end 插槽]
 */
import { css } from '@emotion/react';
import { useTheme, layout } from '@agentskillmania/skill-ui-theme';
import { TrafficLights } from '../TrafficLights/index.js';
import { AppBrand } from '../AppBrand/index.js';
import type { TitlebarProps } from '../../types.js';

export function Titlebar({
  title,
  icon,
  center,
  end,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
}: TitlebarProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        height: ${layout.titlebarHeight};
        background: ${theme.color.bgContainer};
        border-bottom: 1px solid ${theme.color.border};
        padding: 0 ${theme.spacing['3']};
        -webkit-app-region: drag;
        user-select: none;
        flex-shrink: 0;
      `}
      role="banner"
    >
      {/* 左侧：窗口控制 + 品牌 */}
      <TrafficLights
        isMaximized={isMaximized}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />
      <AppBrand title={title} icon={icon} />

      {/* 中间插槽 */}
      {center && (
        <div
          css={css`
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-app-region: no-drag;
          `}
        >
          {center}
        </div>
      )}

      {/* 弹性间距 */}
      {!center && (
        <div
          css={css`
            flex: 1;
          `}
        />
      )}

      {/* 右侧插槽 */}
      {end && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing['1']};
            -webkit-app-region: no-drag;
          `}
        >
          {end}
        </div>
      )}
    </div>
  );
}
