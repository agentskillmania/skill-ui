/**
 * Chat input component
 */
import { css } from '@emotion/react';
import { Sender } from '@ant-design/x';
import type { ReactNode } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { ChatCommand } from '../types.js';
import { CommandAutocomplete } from '../commands/CommandAutocomplete.js';

export interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (message: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Command list (enables slash autocomplete) */
  commands?: ChatCommand[];
  /** Select command callback */
  onCommand?: (command: ChatCommand) => void;
  /** Slash trigger character (default "/") */
  commandTrigger?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  placeholder = '输入消息...',
  prefix,
  suffix,
  commands,
  onCommand,
  commandTrigger = '/',
}: ChatInputProps) {
  const theme = useTheme();

  const handleSubmit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed) {
      onSubmit?.(trimmed);
    }
  };

  const handleCommandSelect = (command: ChatCommand) => {
    onCommand?.(command);
    // Clear input
    onChange?.('');
  };

  const senderElement = (
    <div
      css={css`
        display: flex;
        align-items: flex-end;
        gap: ${theme.spacing[2]};
      `}
    >
      {prefix}
      <div
        css={css`
          flex: 1;
          min-width: 0;
          border: 1px solid ${theme.color.border};
          border-radius: ${theme.radius.lg};
          background: ${theme.color.bgContainer};
          overflow: hidden;
          transition: border-color ${theme.motion.duration.normal} ${theme.motion.easing.out};

          &:focus-within {
            border-color: ${theme.color.primary};
          }
        `}
      >
        <Sender
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          placeholder={placeholder}
          disabled={disabled}
          loading={loading}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            border: 'none',
            background: 'transparent',
          }}
          footer={null}
        />
      </div>
      {suffix}
    </div>
  );

  // Wrap with CommandAutocomplete when command autocomplete is enabled
  if (commands && commands.length > 0 && onCommand) {
    return (
      <CommandAutocomplete
        commands={commands}
        onCommand={handleCommandSelect}
        inputValue={value ?? ''}
        trigger={commandTrigger}
      >
        {senderElement}
      </CommandAutocomplete>
    );
  }

  return senderElement;
}
