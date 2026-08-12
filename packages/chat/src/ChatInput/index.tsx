/**
 * Chat input component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Sender } from '@ant-design/x';
import { css } from '@emotion/react';
import { memo, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ContextUsage } from './ContextUsage.js';
import { ModelSelector } from './ModelSelector.js';
import { ThinkingToggle } from './ThinkingToggle.js';
import type { CommandAutocompleteRef } from '../commands/CommandAutocomplete.js';
import { CommandAutocomplete } from '../commands/CommandAutocomplete.js';
import { NAMESPACE } from '../locales/index.js';
import type {
  ChatCommand,
  ChatContextUsage as ChatContextUsageData,
  ChatModelGroup,
  ChatModelOption,
} from '../types.js';

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

  /** Command list (enables slash autocomplete + toolbar capsules) */
  commands?: ChatCommand[];
  /** Select command callback */
  onCommand?: (command: ChatCommand) => void;
  /** Slash trigger character (default "/") */
  commandTrigger?: string;
  /** Max quick-command capsules in the toolbar (default 5) */
  maxQuickCommands?: number;

  // Model / thinking / context — input toolbar (all optional & controlled)
  /** Available model groups (enables model selector when paired with onModelChange) */
  models?: ChatModelGroup[];
  /** Currently selected model */
  selectedModel?: ChatModelOption;
  /** Select model callback */
  onModelChange?: (model: ChatModelOption) => void;
  /** Thinking state: null=Auto, true=on, false=off */
  thinking?: boolean | null;
  /** Thinking state change callback (enables thinking toggle) */
  onThinkingChange?: (value: boolean | null) => void;
  /** Context window usage (enables context indicator) */
  contextUsage?: ChatContextUsageData;
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
  maxQuickCommands = 5,
  models,
  selectedModel,
  onModelChange,
  thinking,
  onThinkingChange,
  contextUsage,
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

  // Command autocomplete panel control. The panel keeps focus in the input and
  // exposes a keydown handler for navigation; we delegate to it here so
  // ArrowUp/Down/Enter/Escape drive the panel while the user keeps typing.
  const cmdRef = useRef<CommandAutocompleteRef>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && Date.now() - lastCompositionEndRef.current < 80) {
      // Confirm-candidate Enter: neither submit nor insert a newline.
      e.preventDefault();
      return false;
    }
    // Delegate to the command autocomplete. Returns false on Enter-select so
    // the Sender skips its submit (see TextArea.js `eventRes === false`).
    return cmdRef.current?.handleKeyDown(e);
  };

  const handleSubmit = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return;
    }
    // A leading trigger (e.g. "/") means a command message: resolve it to a
    // ChatCommand and fire onCommand instead of sending it as plain text.
    // This keeps onCommand's "execute the command" semantics — it fires when
    // the user actually sends the slash prompt, not when they select it.
    if (trimmed.startsWith(commandTrigger) && commands && commands.length > 0 && onCommand) {
      const token = trimmed.slice(commandTrigger.length).trim().split(/\s+/)[0];
      const cmd = commands.find((c) => c.command === token);
      if (cmd) {
        onCommand(cmd);
        onChange?.('');
        return;
      }
    }
    onSubmit?.(trimmed);
  };

  const handleCommandSelect = (command: ChatCommand) => {
    // Selecting only writes the command into the input (e.g. "/search") — it
    // does NOT execute it. Execution happens when the user sends the slash
    // message: handleSubmit resolves it and fires onCommand.
    onChange?.(`${commandTrigger}${command.command}`);
  };

  // ---- Toolbar (above the input) ----
  const showCommands = Boolean(commands && commands.length > 0 && onCommand);
  const showModel = Boolean(models && models.length > 0 && onModelChange);
  const showThinking = Boolean(onThinkingChange);
  const showUsage = Boolean(contextUsage);
  const showToolbar = showCommands || showModel || showThinking || showUsage;

  const toolbarElement = showToolbar ? (
    <div
      data-testid="chat-input-toolbar"
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing[2]};
      `}
    >
      {/* Left: quick-command capsules (single row, horizontal scroll on overflow) */}
      {showCommands && (
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: ${theme.spacing[1]};
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            opacity: ${disabled ? 0.5 : 1};
            pointer-events: ${disabled ? 'none' : 'auto'};

            /* hide scrollbar but keep scrollable */
            &::-webkit-scrollbar {
              display: none;
            }
            scrollbar-width: none;
          `}
        >
          {commands!.slice(0, maxQuickCommands).map((cmd) => (
            <button
              key={cmd.id}
              type="button"
              data-testid="quick-command"
              onClick={() => handleCommandSelect(cmd)}
              css={css`
                flex-shrink: 0;
                padding: ${theme.spacing[0.5]} ${theme.spacing[2]};
                border-radius: ${theme.radius.full};
                background: ${theme.color.primaryBg};
                color: ${theme.color.primary};
                border: 1px solid transparent;
                font-size: ${theme.font.size.sm};
                line-height: 1.4;
                cursor: pointer;
                white-space: nowrap;
                transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};

                &:hover {
                  background: ${theme.color.primary};
                  color: ${theme.color.textInverse};
                }
              `}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}

      {/* Right: model / thinking / context */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          flex-shrink: 0;
        `}
      >
        {showModel && (
          <ModelSelector
            groups={models!}
            selectedModel={selectedModel}
            onChange={onModelChange!}
            disabled={disabled}
          />
        )}
        {showThinking && (
          <ThinkingToggle value={thinking} onChange={onThinkingChange!} disabled={disabled} />
        )}
        {showUsage && <ContextUsage usage={contextUsage!} />}
      </div>
    </div>
  ) : null;

  const senderElement = (
    <div
      onCompositionEndCapture={() => {
        lastCompositionEndRef.current = Date.now();
      }}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing[2]};
        `}
      >
        {toolbarElement}
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
    </div>
  );

  // Wrap with CommandAutocomplete when command autocomplete is enabled
  if (commands && commands.length > 0 && onCommand) {
    return (
      <CommandAutocomplete
        ref={cmdRef}
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
