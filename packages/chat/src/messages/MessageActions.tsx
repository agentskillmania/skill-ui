/**
 * Message action bar — appears on hover, inside message bubble
 */
import { css } from '@emotion/react';
import { Tooltip } from 'antd';
import { Copy, RefreshCw, GitBranch, Send, Undo2 } from 'lucide-react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { Message } from '../types.js';

export interface MessageActionsProps {
  message: Message;
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
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
}) {
  const theme = useTheme();
  return (
    <Tooltip title={title}>
      <button
        type="button"
        onClick={onClick}
        css={css`
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
        `}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

export function MessageActions({
  message,
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

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing[1]};
        padding: 2px 0;
      `}
    >
      <ActionButton icon={<Copy size={14} />} title="复制消息" onClick={() => onCopy?.(message)} />
      {isUser ? (
        <ActionButton
          icon={<Send size={14} />}
          title="重新发送"
          onClick={() => onResend?.(message)}
        />
      ) : (
        message.status === 'completed' && (
          <>
            <ActionButton
              icon={<RefreshCw size={14} />}
              title="重新生成"
              onClick={() => onRegenerate?.(message)}
            />
            <ActionButton
              icon={<Undo2 size={14} />}
              title="回退到当前位置"
              onClick={() => onRollback?.(message)}
            />
            <ActionButton
              icon={<GitBranch size={14} />}
              title="在当前位置 Fork"
              onClick={() => onFork?.(message)}
            />
          </>
        )
      )}
    </div>
  );
}
