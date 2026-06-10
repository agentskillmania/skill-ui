/**
 * Message action bar — appears on hover, inside message bubble
 */
import { css } from '@emotion/react';
import { Tooltip } from 'antd';
import { Copy, RefreshCw, GitBranch, Send, Undo2 } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { Message } from '../types.js';

export type MessageActionsVariant = 'ghost' | 'pill';

export interface MessageActionsProps {
  message: Message;
  variant?: MessageActionsVariant;
  onCopy?: (message: Message) => void;
  onResend?: (message: Message) => void;
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

export function MessageActions({
  message,
  variant = 'pill',
  onCopy,
  onResend,
  onRegenerate,
  onRollback,
  onFork,
}: MessageActionsProps) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  // System / tool messages have no actions
  if (message.role === 'system' || message.role === 'tool') return null;

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

  const actions = [
    <ActionButton
      key="copy"
      icon={<Copy size={14} />}
      title="复制消息"
      onClick={() => onCopy?.(message)}
      variant={variant}
    />,
  ];

  if (isUser) {
    actions.push(
      <ActionButton
        key="resend"
        icon={<Send size={14} />}
        title="重新发送"
        onClick={() => onResend?.(message)}
        variant={variant}
      />
    );
  } else if (message.status === 'completed') {
    actions.push(
      <ActionButton
        key="regenerate"
        icon={<RefreshCw size={14} />}
        title="重新生成"
        onClick={() => onRegenerate?.(message)}
        variant={variant}
      />,
      <ActionButton
        key="rollback"
        icon={<Undo2 size={14} />}
        title="回退到当前位置"
        onClick={() => onRollback?.(message)}
        variant={variant}
      />,
      <ActionButton
        key="fork"
        icon={<GitBranch size={14} />}
        title="在当前位置 Fork"
        onClick={() => onFork?.(message)}
        variant={variant}
      />
    );
  }

  return <div css={containerStyles[variant]}>{actions}</div>;
}
