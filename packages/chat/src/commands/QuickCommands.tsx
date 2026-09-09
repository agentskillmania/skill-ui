/**
 * Quick command capsule tag component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Tag } from 'antd';
import { memo } from 'react';

import type { ChatCommand } from '../types.js';

export interface QuickCommandsProps {
  /** Command list */
  commands: ChatCommand[];
  /** Select command callback */
  onCommand: (command: ChatCommand) => void;
  /** Maximum number of tags to display (default 5) */
  maxCommands?: number;
  /** Whether disabled */
  disabled?: boolean;
  /** Single-row layout with horizontal scroll on overflow (for toolbars).
   * Default false: tags wrap onto multiple lines. */
  nowrap?: boolean;
}

export const QuickCommands = memo(function QuickCommands({
  commands,
  onCommand,
  maxCommands = 5,
  disabled = false,
  nowrap = false,
}: QuickCommandsProps) {
  const theme = useTheme();

  if (commands.length === 0) {
    return null;
  }

  const visible = commands.slice(0, maxCommands);

  return (
    <div
      css={css`
        display: flex;
        gap: ${theme.spacing[1]};
        opacity: ${disabled ? 0.5 : 1};
        pointer-events: ${disabled ? 'none' : 'auto'};
        ${nowrap
          ? css`
              align-items: center;
              flex-wrap: nowrap;
              overflow-x: auto;
              flex: 1;
              min-width: 0;

              /* hide scrollbar but keep scrollable */
              &::-webkit-scrollbar {
                display: none;
              }
              scrollbar-width: none;
            `
          : css`
              flex-wrap: wrap;
            `}
      `}
    >
      {visible.map((cmd) => (
        <Tag
          key={cmd.id}
          data-testid="quick-command"
          css={css`
            cursor: pointer;
            margin: 0;
            padding: ${theme.spacing[0.5]} ${theme.spacing[2]};
            border-radius: ${theme.radius.full};
            background: ${theme.color.primaryBg};
            color: ${theme.color.primary};
            border: 1px solid transparent;
            font-size: ${theme.font.size.sm};
            transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};
            ${nowrap && 'flex-shrink: 0; white-space: nowrap;'}

            &:hover {
              background: ${theme.color.primary};
              color: ${theme.color.textInverse};
            }
          `}
          onClick={() => {
            if (disabled) return;
            onCommand(cmd);
          }}
        >
          {cmd.label}
        </Tag>
      ))}
    </div>
  );
});
