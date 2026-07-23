/** @jsxImportSource @emotion/react */
/**
 * Windows-style window control buttons (minimize / maximize / close)
 * Display-only + callbacks, does not call window API
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';

import type { TrafficLightsProps } from '../../types.js';

export function WindowControls({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}: TrafficLightsProps) {
  const theme = useTheme();

  const buttonBase = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: ${theme.spacing['8']};
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${theme.color.textSecondary};
    transition:
      background ${theme.motion.duration.fast} ${theme.motion.easing.out},
      color ${theme.motion.duration.fast} ${theme.motion.easing.out};

    &:hover {
      background: ${theme.color.fillTertiary};
      color: ${theme.color.text};
    }
    &:active {
      background: ${theme.color.fillSecondary};
    }
  `;

  const closeButton = css`
    ${buttonBase}
    &:hover {
      background: #e81123;
      color: #ffffff;
    }
    &:active {
      background: #f1707a;
    }
  `;

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        margin-right: -${theme.spacing['4']};
        -webkit-app-region: no-drag;
      `}
    >
      {/* Minimize */}
      <button css={buttonBase} onClick={() => onMinimize?.()} type="button" aria-label="Minimize">
        <Minus size={14} strokeWidth={1.5} />
      </button>

      {/* Maximize / Restore */}
      <button
        css={buttonBase}
        onClick={() => onMaximize?.()}
        type="button"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <Minimize2 size={14} strokeWidth={1.5} />
        ) : (
          <Maximize2 size={14} strokeWidth={1.5} />
        )}
      </button>

      {/* Close */}
      <button css={closeButton} onClick={() => onClose?.()} type="button" aria-label="Close">
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
