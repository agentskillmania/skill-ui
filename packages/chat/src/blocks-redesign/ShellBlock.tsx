/**
 * Shell tool block — renders a command execution as a terminal window.
 * Collapses to a prompt-line summary once the command exits successfully;
 * the palette follows the current light/dark theme mode.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css, keyframes } from '@emotion/react';
import { Terminal } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { BlockProps, ShellMetadata } from '../types.js';
import { CollapseChevron, useBlockCollapse } from './collapse.js';

const blinkKeyframes = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

/** Terminal palettes per theme mode */
const palettes = {
  light: {
    bodyBg: '#f8fafc',
    text: '#334155',
    command: '#0f172a',
    prompt: '#16a34a',
    dim: '#94a3b8',
    scrollbar: '#cbd5e1',
    exitFail: '#dc2626',
  },
  dark: {
    bodyBg: '#0f172a',
    text: '#cbd5e1',
    command: '#f8fafc',
    prompt: '#4ade80',
    dim: '#64748b',
    scrollbar: '#334155',
    exitFail: '#f87171',
  },
} as const;

/** Strip ANSI escape sequences and normalize carriage returns.
 * Follow-up: swap for ansi-to-react to render colors instead of stripping. */
function cleanOutput(raw: string): string {
  return (
    raw
      .replace(/\r\n/g, '\n')
      .replace(/\r(?!\n)/g, '\n')
      // CSI sequences (colors, cursor moves): ESC [ … letter
      // eslint-disable-next-line no-control-regex
      .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
      // OSC sequences (window title etc.): ESC ] … BEL/ST
      // eslint-disable-next-line no-control-regex
      .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
  );
}

export const ShellBlock = memo(function ShellBlock({ block }: BlockProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const meta = block.metadata as ShellMetadata | undefined;
  const accent = theme.blockColor.toolScript;
  const term = palettes[theme.mode === 'dark' ? 'dark' : 'light'];
  const isRunning = block.status === 'streaming' || block.status === 'pending';
  const exitCode = meta?.exitCode;
  const failed = block.status === 'error' || (exitCode !== undefined && exitCode !== 0);

  // 运行中和失败时展开；成功结束后自动收起为一行命令摘要
  const { expanded, toggle } = useBlockCollapse(!isRunning && !failed);

  const outputRef = useRef<HTMLDivElement>(null);
  const output = cleanOutput(meta?.output ?? '');

  // 流式输出时始终钉在底部，展示最新日志
  useEffect(() => {
    const el = outputRef.current;
    if (el && isRunning) {
      el.scrollTop = el.scrollHeight;
    }
  }, [output, isRunning]);

  return (
    <div
      css={css`
        border-radius: ${theme.radius.lg};
        background: ${theme.color.bgContainer};
        border: 1px solid ${theme.color.border};
        overflow: hidden;
        transition:
          border-color ${theme.motion.duration.normal} ${theme.motion.easing.out},
          box-shadow ${theme.motion.duration.normal} ${theme.motion.easing.out};
        &:hover {
          border-color: ${theme.color.borderHover};
          box-shadow: ${theme.shadow.sm};
        }
      `}
    >
      {/* Header — click toggles collapse */}
      <div
        onClick={toggle}
        aria-expanded={expanded}
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          background: ${theme.color.fill};
          border-bottom: 1px solid ${theme.color.borderSecondary};
          cursor: pointer;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
            min-width: 0;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 22px;
              height: 22px;
              border-radius: ${theme.radius.md};
              background: ${accent.bg};
              color: ${accent.text};
              flex-shrink: 0;
            `}
          >
            <Terminal size={13} />
          </div>
          <span
            css={css`
              font-size: ${theme.font.size.sm};
              font-weight: ${theme.font.weight.semibold};
              color: ${theme.color.text};
            `}
          >
            {t('shell.title')}
          </span>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            flex-shrink: 0;
          `}
        >
          <span
            css={css`
              font-size: ${theme.font.size.xs};
              font-weight: ${theme.font.weight.semibold};
              ${isRunning
                ? `color: ${theme.color.textTertiary};`
                : failed
                  ? `color: ${theme.color.error};`
                  : `color: ${theme.color.success};`}
            `}
          >
            {isRunning ? t('shell.running') : `exit ${exitCode ?? 0}`}
          </span>
          <CollapseChevron expanded={expanded} />
        </div>
      </div>

      {/* Terminal window */}
      <div
        css={css`
          background: ${term.bodyBg};
          padding: 0 ${theme.spacing[3]};
        `}
      >
        {/* Prompt + output */}
        <div
          css={css`
            padding: ${theme.spacing[2]} 0;
            font-family: ${theme.font.familyMono};
            font-size: ${theme.font.size.sm};
            line-height: ${theme.font.lineHeightRelaxed};
          `}
        >
          <div
            css={css`
              color: ${term.command};
              white-space: pre-wrap;
              word-break: break-all;
            `}
          >
            <span css={css({ color: term.prompt, userSelect: 'none' })}>❯ </span>
            {meta?.command ?? ''}
          </div>
          {expanded && (output || isRunning) && (
            <div
              ref={outputRef}
              css={css`
                margin-top: ${theme.spacing[1]};
                max-height: 220px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: ${term.scrollbar} transparent;
                color: ${term.text};
                white-space: pre-wrap;
                word-break: break-all;
              `}
            >
              {output}
              {isRunning && (
                <span
                  css={css`
                    display: inline-block;
                    width: 7px;
                    height: 14px;
                    margin-left: 2px;
                    vertical-align: text-bottom;
                    background: ${term.prompt};
                    animation: ${blinkKeyframes} 1s step-end infinite;
                    @media (prefers-reduced-motion: reduce) {
                      animation: none;
                    }
                  `}
                />
              )}
              {!isRunning && (
                <div
                  css={css`
                    margin-top: ${theme.spacing[1]};
                    color: ${failed ? term.exitFail : term.prompt};
                  `}
                >
                  ↳ exit {exitCode ?? 0}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
