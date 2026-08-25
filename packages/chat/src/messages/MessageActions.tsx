/**
 * Message action bar — appears on hover, inside message bubble.
 *
 * The button set is baked into the package; hosts only wire callbacks.
 * A button renders only when its callback is provided (wiring is the
 * switch), so an unwired host never shows dead buttons. Position rules:
 * - copy: every user / completed assistant message
 * - edit (edit-and-resend): the last user message
 * - regenerate: the last completed assistant message
 * - rollback / fork: completed assistant messages that are not the last one
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Tooltip } from 'antd';
import { Copy, RefreshCw, GitBranch, Pencil, Undo2 } from 'lucide-react';
import { memo } from 'react';

import type { Message } from '../types.js';

export type MessageActionsVariant = 'ghost' | 'pill';

export interface MessageActionsProps {
  message: Message;
  variant?: MessageActionsVariant;
  /** Whether this message is the last user message in the list (edit target) */
  isLastUserMessage?: boolean;
  /** Whether this message is the last completed assistant message (regenerate target) */
  isLastCompletedAssistant?: boolean;
  /** Hide all actions (e.g. while the chat is streaming) */
  hideActions?: boolean;
  onCopy?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onRegenerate?: (message: Message) => void;
  onRollback?: (message: Message) => void;
  onFork?: (message: Message) => void;
}

function ActionButton({
  icon,
  title,
  onClick,
  variant = 'pill',
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  variant?: MessageActionsVariant;
}) {
  const theme = useTheme();

  const styles: Record<MessageActionsVariant, ReturnType<typeof css>> = {
    ghost: css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: ${theme.radius.sm};
      background: transparent;
      color: ${theme.color.textTertiary};
      cursor: pointer;
      font-size: 14px;
      transition: all ${theme.motion.duration.fast};
      &:hover {
        color: ${theme.color.text};
      }
    `,
    pill: css`
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: ${theme.radius.sm};
      background: transparent;
      color: ${theme.color.textTertiary};
      cursor: pointer;
      font-size: 14px;
      transition: all ${theme.motion.duration.fast};
      &:hover {
        background: ${theme.color.fillSubtle};
        color: ${theme.color.text};
      }
    `,
  };

  return (
    <Tooltip title={title}>
      <button type="button" onClick={onClick} css={styles[variant]}>
        {icon}
      </button>
    </Tooltip>
  );
}

export const MessageActions = memo(function MessageActions({
  message,
  variant = 'pill',
  isLastUserMessage = false,
  isLastCompletedAssistant = false,
  hideActions = false,
  onCopy,
  onEdit,
  onRegenerate,
  onRollback,
  onFork,
}: MessageActionsProps) {
  const theme = useTheme();

  // System / tool messages have no actions; streaming guard hides the bar entirely
  if (hideActions || message.role === 'system' || message.role === 'tool') return null;

  const containerStyles: Record<MessageActionsVariant, ReturnType<typeof css>> = {
    ghost: css`
      display: flex;
      align-items: center;
      gap: ${theme.spacing[1]};
      padding: 2px 0;
    `,
    pill: css`
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing[1]};
      padding: 2px 6px;
      background: ${theme.color.bgContainer};
      border: 1px solid ${theme.color.border};
      border-radius: ${theme.radius.md};
      box-shadow: ${theme.shadow.base};
    `,
  };

  const actions: React.ReactElement[] = [];
  if (onCopy) {
    actions.push(
      <ActionButton
        key="copy"
        icon={<Copy size={14} />}
        title="复制消息"
        onClick={() => onCopy(message)}
        variant={variant}
      />
    );
  }

  if (message.role === 'user') {
    if (onEdit && isLastUserMessage) {
      actions.push(
        <ActionButton
          key="edit"
          icon={<Pencil size={14} />}
          title="编辑消息"
          onClick={() => onEdit(message)}
          variant={variant}
        />
      );
    }
  } else if (message.status === 'completed') {
    if (onRegenerate && isLastCompletedAssistant) {
      actions.push(
        <ActionButton
          key="regenerate"
          icon={<RefreshCw size={14} />}
          title="重新生成"
          onClick={() => onRegenerate(message)}
          variant={variant}
        />
      );
    }
    if (!isLastCompletedAssistant) {
      if (onRollback) {
        actions.push(
          <ActionButton
            key="rollback"
            icon={<Undo2 size={14} />}
            title="回退到此处"
            onClick={() => onRollback(message)}
            variant={variant}
          />
        );
      }
      if (onFork) {
        actions.push(
          <ActionButton
            key="fork"
            icon={<GitBranch size={14} />}
            title="从此处 Fork"
            onClick={() => onFork(message)}
            variant={variant}
          />
        );
      }
    }
  }

  // Nothing wired for this message → no bar at all
  if (actions.length === 0) return null;

  return <div css={containerStyles[variant]}>{actions}</div>;
});
