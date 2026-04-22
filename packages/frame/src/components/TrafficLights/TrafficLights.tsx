/** @jsxImportSource @emotion/react */
/**
 * TrafficLights component
 * macOS-style window control buttons (red/yellow/green), display-only + callbacks, does not call window API
 */
import { css } from '@emotion/react';
import { X, Minus, Copy, Expand } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { TrafficLightsProps } from '../../types.js';

export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}: TrafficLightsProps) {
  const theme = useTheme();

  const buttonBase = css`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: filter ${theme.motion.duration.fast} ${theme.motion.easing.out};

    &:hover {
      filter: brightness(0.9);
    }
    &:active {
      filter: brightness(0.8);
    }
    svg {
      position: absolute;
      width: 8px;
      height: 8px;
      color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity ${theme.motion.duration.fast};
    }
  `;

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing['2']};
        padding: 0 ${theme.spacing['2']};
        -webkit-app-region: no-drag;

        &:hover button svg {
          opacity: 1;
        }
      `}
    >
      {/* Close — red */}
      <button
        css={css`
          ${buttonBase}
          background: #ff5f57;
        `}
        onClick={() => onClose?.()}
        title="关闭"
        type="button"
        aria-label="关闭窗口"
      >
        <X size={8} strokeWidth={5} />
      </button>

      {/* Minimize — yellow */}
      <button
        css={css`
          ${buttonBase}
          background: #febc2e;
        `}
        onClick={() => onMinimize?.()}
        title="最小化"
        type="button"
        aria-label="最小化窗口"
      >
        <Minus size={8} strokeWidth={5} />
      </button>

      {/* Maximize/restore — green */}
      <button
        css={css`
          ${buttonBase}
          background: #28c840;
        `}
        onClick={() => onMaximize?.()}
        title={isMaximized ? '还原' : '最大化'}
        type="button"
        aria-label={isMaximized ? '还原窗口' : '最大化窗口'}
      >
        {isMaximized ? <Copy size={7} strokeWidth={5} /> : <Expand size={7} strokeWidth={5} />}
      </button>
    </div>
  );
}
