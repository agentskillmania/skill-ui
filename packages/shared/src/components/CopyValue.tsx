/** @jsxImportSource @emotion/react */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { Tooltip, message } from 'antd';

/** Props for the CopyValue component. */
export interface CopyValueProps {
  /** The text to copy to clipboard when clicked. */
  text: string;
  children: React.ReactNode;
}

/** Click-to-copy value style. */
const valueStyle = (theme: ReturnType<typeof useTheme>) => css`
  color: ${theme.color.text};
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
  &:hover {
    color: ${theme.color.primary};
  }
`;

/**
 * CopyValue — click-to-copy value with tooltip and antd message feedback.
 * Wraps the displayed value; clicking copies the `text` prop to clipboard.
 */
export function CopyValue({ text, children }: CopyValueProps) {
  const theme = useTheme();
  const [messageApi, contextHolder] = message.useMessage();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      messageApi.success('Copied', 1.2);
    } catch {
      messageApi.error('Copy failed');
    }
  };

  return (
    <>
      {contextHolder}
      <Tooltip title={text} placement="topRight">
        <span css={valueStyle(theme)} onClick={handleClick}>
          {children}
        </span>
      </Tooltip>
    </>
  );
}
