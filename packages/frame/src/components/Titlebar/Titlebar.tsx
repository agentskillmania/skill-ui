/** @jsxImportSource @emotion/react */
/**
 * Titlebar component
 * macOS-style titlebar for frameless windows
 * Structure: [TrafficLights] [AppBrand] [center slot] —right— [end slot]
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
      {/* Left: window controls + brand */}
      <TrafficLights
        isMaximized={isMaximized}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      />
      <AppBrand title={title} icon={icon} />

      {/* Center slot */}
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

      {/* Flexible spacing */}
      {!center && (
        <div
          css={css`
            flex: 1;
          `}
        />
      )}

      {/* Right slot */}
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
