/**
 * Chat input component
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { Sender } from '@ant-design/x';
import { Tooltip } from 'antd';
import { css } from '@emotion/react';
import { memo, useEffect, useRef } from 'react';
import type { ChangeEvent, ComponentRef, DragEvent, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, X } from 'lucide-react';

import { ContextUsage } from './ContextUsage.js';
import { ModelSelector } from './ModelSelector.js';
import { ThinkingToggle } from './ThinkingToggle.js';
import type { CommandAutocompleteRef } from '../commands/CommandAutocomplete.js';
import { CommandAutocomplete } from '../commands/CommandAutocomplete.js';
import { NAMESPACE } from '../locales/index.js';
import type {
  ChatAttachment,
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
  onSubmit?: (message: string, attachments?: ChatAttachment[]) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Focus the textarea while true (e.g. the centered empty-state composer).
   * Applies on mount and whenever it flips back to true. */
  autoFocus?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Full-width content on its own row above the input (mode banners, e.g.
   * an editing notice). Unlike prefix/suffix — which adorn the input inline,
   * left and right — the banner stacks above the whole input row. */
  banner?: ReactNode;

  /** Pending attachments (controlled — enables attach button/paste/drop/chips) */
  attachments?: ChatAttachment[];
  /** Pending-attachments change callback */
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  /** Disable attaching (e.g. current model lacks image input) */
  attachmentsDisabled?: boolean;
  /** Why attaching is disabled (attach-button tooltip) */
  attachmentsDisabledReason?: string;
  /** Max pending attachments (default 5) */
  maxAttachments?: number;
  /** Max size per attachment in MB (default 10) */
  maxAttachmentMB?: number;
  /** Rejected attach attempts (host surfaces its own toast/i18n) */
  onAttachmentsRejected?: (
    reason: 'disabled' | 'too-many' | 'too-large' | 'unsupported-type',
    files: File[]
  ) => void;

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
  autoFocus = false,
  prefix,
  suffix,
  banner,
  attachments,
  onAttachmentsChange,
  attachmentsDisabled = false,
  attachmentsDisabledReason,
  maxAttachments = 5,
  maxAttachmentMB = 10,
  onAttachmentsRejected,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sender does not accept an autoFocus prop (it picks only a few textarea
  // props), so focus programmatically via its ref — on mount and whenever
  // autoFocus flips back to true (e.g. the conversation becomes empty again).
  const senderRef = useRef<ComponentRef<typeof Sender>>(null);
  useEffect(() => {
    if (autoFocus) senderRef.current?.focus();
  }, [autoFocus]);

  // ── Attachments ──
  const attachEnabled = Boolean(onAttachmentsChange);

  const readAsAttachment = (file: File): Promise<ChatAttachment> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name || 'image',
          mimeType: file.type || 'image/png',
          url: reader.result as string,
          size: file.size,
        });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleFiles = (incoming: File[]) => {
    if (!onAttachmentsChange || incoming.length === 0) return;
    if (attachmentsDisabled) {
      onAttachmentsRejected?.('disabled', incoming);
      return;
    }
    const images = incoming.filter((f) => f.type.startsWith('image/'));
    const rejected = incoming.filter((f) => !f.type.startsWith('image/'));
    if (rejected.length > 0) onAttachmentsRejected?.('unsupported-type', rejected);
    if (images.length === 0) return;
    const room = maxAttachments - (attachments?.length ?? 0);
    if (images.length > room) {
      onAttachmentsRejected?.('too-many', images);
      return;
    }
    const tooLarge = images.filter((f) => f.size > maxAttachmentMB * 1024 * 1024);
    if (tooLarge.length > 0) {
      onAttachmentsRejected?.('too-large', tooLarge);
      return;
    }
    void Promise.all(images.map(readAsAttachment)).then((converted) => {
      onAttachmentsChange([...(attachments ?? []), ...converted]);
    });
  };

  const handlePasteFile = (files: FileList) => handleFiles(Array.from(files));

  const handleDrop = (e: DragEvent) => {
    if (!attachEnabled) return;
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []));
    // 允许连续选同一文件:清空 input 的选中态。
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange?.((attachments ?? []).filter((a) => a.id !== id));
  };

  const formatSize = (bytes?: number): string => {
    if (bytes == null) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

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
    // 空文本 + 有附件 = 合法的纯图消息;两者都空才忽略。
    if (!trimmed && !(attachments && attachments.length > 0)) {
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
    const pendingAttachments = attachments && attachments.length > 0 ? attachments : undefined;
    // 无附件时保持单参调用形态(向后兼容:宿主的 mock 断言不受影响)。
    if (pendingAttachments) onSubmit?.(trimmed, pendingAttachments);
    else onSubmit?.(trimmed);
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
  const showToolbar = showCommands || showModel || showThinking || showUsage || attachEnabled;

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

      {/* Right: attach / model / thinking / context */}
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: ${theme.spacing[2]};
          flex-shrink: 0;
        `}
      >
        {attachEnabled && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePick}
            />
            <Tooltip
              title={
                attachmentsDisabled
                  ? (attachmentsDisabledReason ?? t('chatInput.attachDisabled'))
                  : t('chatInput.attachImage')
              }
            >
              <span
                css={css`
                  display: inline-flex;
                `}
              >
                <button
                  type="button"
                  data-testid="attach-button"
                  aria-label={t('chatInput.attachImage')}
                  disabled={disabled || attachmentsDisabled}
                  onClick={() => fileInputRef.current?.click()}
                  css={css`
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    border: none;
                    border-radius: ${theme.radius.md};
                    background: transparent;
                    color: ${theme.color.textSecondary};
                    cursor: pointer;
                    transition: all ${theme.motion.duration.fast} ${theme.motion.easing.out};

                    &:hover:not(:disabled) {
                      background: ${theme.color.hoverOverlay};
                    }
                    &:disabled {
                      color: ${theme.color.textDisabled};
                      cursor: not-allowed;
                    }
                  `}
                >
                  <ImageIcon size={15} />
                </button>
              </span>
            </Tooltip>
          </>
        )}
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

  // ---- Attachment chips (Sender header slot — inside the input box top) ----
  const chipsElement =
    attachEnabled && attachments && attachments.length > 0 ? (
      <div
        data-testid="attachment-chips"
        css={css`
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.spacing[2]};
          padding: ${theme.spacing[2]} ${theme.spacing[3]} 0;
        `}
      >
        {attachments.map((a) => (
          <div
            key={a.id}
            css={css`
              display: flex;
              align-items: center;
              gap: ${theme.spacing[2]};
              background: ${theme.color.fillSubtle};
              border: 1px solid ${theme.color.borderSecondary};
              border-radius: ${theme.radius.md};
              padding: 5px 8px 5px 5px;
              position: relative;
            `}
          >
            <img
              src={a.url}
              alt={a.name}
              css={css`
                width: 34px;
                height: 34px;
                border-radius: ${theme.radius.sm};
                object-fit: cover;
                border: 1px solid ${theme.color.borderSecondary};
                flex-shrink: 0;
              `}
            />
            <span>
              <div
                css={css`
                  font-size: ${theme.font.size.sm};
                  color: ${theme.color.text};
                  line-height: 1.3;
                  max-width: 140px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                {a.name}
              </div>
              <div
                css={css`
                  font-size: ${theme.font.size.xs};
                  color: ${theme.color.textTertiary};
                  line-height: 1.3;
                `}
              >
                {formatSize(a.size)}
              </div>
            </span>
            <button
              type="button"
              aria-label={t('chatInput.removeAttachment')}
              onClick={() => removeAttachment(a.id)}
              css={css`
                position: absolute;
                top: -6px;
                right: -6px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: ${theme.color.bgContainer};
                border: 1px solid ${theme.color.border};
                color: ${theme.color.textTertiary};
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                cursor: pointer;
                &:hover {
                  color: ${theme.color.error};
                }
              `}
            >
              <X size={10} />
            </button>
          </div>
        ))}
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
        {banner}
        <div
          css={css`
            display: flex;
            align-items: flex-end;
            gap: ${theme.spacing[2]};
          `}
        >
          {prefix}
          <div
            data-testid="chat-input-dropzone"
            onDragOver={(e) => {
              if (attachEnabled) e.preventDefault();
            }}
            onDrop={handleDrop}
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
              ref={senderRef}
              value={value}
              onChange={onChange}
              onSubmit={handleSubmit}
              onCancel={onCancel}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              loading={loading}
              onKeyDown={handleKeyDown}
              onPasteFile={attachEnabled ? handlePasteFile : undefined}
              header={chipsElement ?? undefined}
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
