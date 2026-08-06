/**
 * Chat input component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Sender } from '@ant-design/x';
import { css } from '@emotion/react';
import { memo, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandAutocomplete } from '../commands/CommandAutocomplete.js';
import { NAMESPACE } from '../locales/index.js';
import type { ChatCommand } from '../types.js';

export interface ChatInputProps {
  /** Controlled input value */
  value: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
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

export const ChatInput = memo(function ChatInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  placeholder,
  prefix,
  suffix,
  commands,
  onCommand,
  commandTrigger = '/',
}: ChatInputProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const resolvedPlaceholder = placeholder ?? t('chat.placeholder');

  // IME guard: on Safari/WKWebView, pressing Enter to confirm a composition
  // candidate fires `compositionend` BEFORE the Enter `keydown`, so the
  // Sender's internal `isCompositionRef` is already reset and the Enter would
  // submit the message while the user merely confirms their input-method
  // candidate. Remember when the last composition ended and swallow the Enter
  // that immediately follows it.
  const lastCompositionEndRef = useRef(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && Date.now() - lastCompositionEndRef.current < 80) {
      // Confirm-candidate Enter: neither submit nor insert a newline.
      e.preventDefault();
      return false;
    }
  };

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
      onCompositionEndCapture={() => {
        lastCompositionEndRef.current = Date.now();
      }}
    >
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
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            loading={loading}
            onKeyDown={handleKeyDown}
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
});
