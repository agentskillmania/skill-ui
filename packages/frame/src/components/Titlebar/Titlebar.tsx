/** @jsxImportSource @emotion/react */
/**
 * Titlebar component
 * Cross-platform titlebar for frameless windows
 * macOS: [TrafficLights] [AppBrand] [center] —spacer— [end]
 * Windows: [AppBrand] [center] —spacer— [end] [WindowControls]
 */
import { useTheme, layout } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';

import type { TitlebarProps } from '../../types.js';
import { AppBrand } from '../AppBrand/index.js';
import { TrafficLights } from '../TrafficLights/index.js';
import { WindowControls } from '../WindowControls/index.js';

function detectPlatform(): 'macos' | 'windows' {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('windows')) return 'windows';
  }
  return 'macos';
}

export function Titlebar({
  title,
  icon,
  center,
  end,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  platform,
}: TitlebarProps) {
  const theme = useTheme();
  const detectedPlatform = platform ?? detectPlatform();
  const isWindows = detectedPlatform === 'windows';

  const controls = (
    <WindowControls
      isMaximized={isMaximized}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
    />
  );

  const trafficLights = (
    <TrafficLights
      isMaximized={isMaximized}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
    />
  );

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        height: ${layout.titlebarHeight};
        background: ${theme.color.bgContainer};
        border-bottom: 1px solid ${theme.color.border};
        padding: 0 ${theme.spacing['4']};
        -webkit-app-region: drag;
        user-select: none;
        flex-shrink: 0;
      `}
      role="banner"
    >
      {isWindows ? (
        <>
          {/* Windows: brand on left, no extra margin (padding handled by Titlebar) */}
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

          {/* Right: end slot + window controls */}
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
          {controls}
        </>
      ) : (
        <>
          {/* macOS: controls on left */}
          {trafficLights}
          <div
            css={css`
              margin-left: ${theme.spacing['4']};
            `}
          >
            <AppBrand title={title} icon={icon} />
          </div>

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
        </>
      )}
    </div>
  );
}
