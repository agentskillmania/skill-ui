/**
 * Markdown 渲染器
 *
 * 内置简单渲染：保留换行的纯文本 + 流式光标。
 * 消费方可通过 ChatProps.renderers 注入自定义 markdown 渲染器。
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';

export interface MarkdownRendererProps {
  children: string;
  /** 是否流式输出 */
  streaming?: boolean;
}

export function MarkdownRenderer({ children, streaming }: MarkdownRendererProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        font-size: ${theme.font.size.base};
        line-height: ${theme.font.lineHeight};
        color: ${theme.color.text};
        white-space: pre-wrap;
        word-break: break-word;

        ${streaming
          ? css`
              &::after {
                content: '▊';
                animation: blink 1s step-end infinite;
                color: ${theme.color.primary};
              }

              @keyframes blink {
                50% {
                  opacity: 0;
                }
              }
            `
          : ''}
      `}
    >
      {children}
    </div>
  );
}
