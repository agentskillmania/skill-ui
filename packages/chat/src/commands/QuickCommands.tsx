/**
 * 快捷指令胶囊标签组件
 */
import { css } from '@emotion/react';
import { Tag } from 'antd';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ChatCommand } from '../types.js';

export interface QuickCommandsProps {
  /** 指令列表 */
  commands: ChatCommand[];
  /** 选择指令回调 */
  onCommand: (command: ChatCommand) => void;
  /** 最多显示几个标签（默认 5） */
  maxCommands?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

export function QuickCommands({
  commands,
  onCommand,
  maxCommands = 5,
  disabled = false,
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
        flex-wrap: wrap;
        gap: ${theme.spacing[1]};
        opacity: ${disabled ? 0.5 : 1};
        pointer-events: ${disabled ? 'none' : 'auto'};
      `}
    >
      {visible.map((cmd) => (
        <Tag
          key={cmd.id}
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

            &:hover {
              background: ${theme.color.primary};
              color: ${theme.color.textInverse};
            }
          `}
          onClick={() => onCommand(cmd)}
        >
          {cmd.label}
        </Tag>
      ))}
    </div>
  );
}
