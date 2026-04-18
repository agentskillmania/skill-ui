/**
 * 聊天输入框组件
 */
import { css } from '@emotion/react';
import { Sender } from '@ant-design/x';
import { Button } from 'antd';
import { Square } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';

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
}: ChatInputProps) {
  const theme = useTheme();

  const handleSubmit = (val: string) => {
    const trimmed = val.trim();
    if (trimmed) {
      onSubmit?.(trimmed);
    }
  };

  return (
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
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            border: 'none',
            background: 'transparent',
          }}
          footer={null}
        />
      </div>
      {loading ? (
        <Button
          type="primary"
          shape="circle"
          size="small"
          icon={<Square size={14} />}
          onClick={onCancel}
          css={css`
            flex-shrink: 0;
          `}
        />
      ) : (
        suffix
      )}
    </div>
  );
}
