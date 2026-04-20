/**
 * Markdown 渲染器
 *
 * 基于 @ant-design/x-markdown（marked.js），与 skill-studio 保持一致。
 * 支持流式渲染、代码高亮、GFM 语法。
 */
import { css } from '@emotion/react';
import React from 'react';
import _XMarkdown from '@ant-design/x-markdown';
import type { ComponentProps, XMarkdownProps } from '@ant-design/x-markdown';
import { CodeHighlighter } from '@ant-design/x';
import { useTheme } from '@agentskillmania/skill-ui-theme';

// React 19 类型兼容：XMarkdown 声明为 FC 但 TS 无法识别为 JSX 组件
const XMarkdown = _XMarkdown as unknown as React.ComponentType<XMarkdownProps>;

export interface MarkdownRendererProps {
  children: string;
  /** 是否流式输出 */
  streaming?: boolean;
}

/** 代码块渲染：集成 CodeHighlighter */
function CodeComponent({ className, children, block }: ComponentProps) {
  if (!block) {
    return <code className={className}>{children}</code>;
  }

  const lang = className?.match(/language-(\w+)/)?.[1] ?? '';

  if (typeof children !== 'string') return null;

  return <CodeHighlighter lang={lang}>{children}</CodeHighlighter>;
}

export function MarkdownRenderer({ children, streaming }: MarkdownRendererProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        line-height: 1.6;

        /* 标题 */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin-top: ${theme.spacing[3]};
          margin-bottom: ${theme.spacing[1]};
          font-weight: 600;
          line-height: 1.4;
        }
        h1 {
          font-size: ${theme.font.size.xl};
        }
        h2 {
          font-size: ${theme.font.size.lg};
        }
        h3 {
          font-size: ${theme.font.size.lg};
        }
        h4 {
          font-size: ${theme.font.size.sm};
        }
        h5,
        h6 {
          font-size: ${theme.font.size.xs};
        }

        /* 段落 */
        p {
          margin: ${theme.spacing[1]} 0;
        }

        /* 列表 */
        ul,
        ol {
          margin: ${theme.spacing[1]} 0;
          padding-left: ${theme.spacing[5]};
        }
        li {
          margin-bottom: ${theme.spacing['0.5']};
        }
        ul ul,
        ol ol,
        ul ol,
        ol ul {
          margin: ${theme.spacing['0.5']} 0;
        }

        /* 引用 */
        blockquote {
          margin: ${theme.spacing[2]} 0;
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          border-left: 2px solid ${theme.color.borderSecondary};
          color: ${theme.color.textSecondary};
          background: ${theme.color.fillSubtle};
          border-radius: 0 ${theme.radius.sm} ${theme.radius.sm} 0;
          p {
            margin: 0;
          }
        }

        /* 分隔线 */
        hr {
          margin: ${theme.spacing[3]} 0;
          border: none;
          border-top: 1px solid ${theme.color.borderSecondary};
        }

        /* 链接 */
        a {
          color: ${theme.color.primary};
          text-decoration: none;
          &:hover {
            opacity: 0.8;
          }
        }

        /* 表格 */
        table {
          width: 100%;
          margin: ${theme.spacing[2]} 0;
          border-collapse: collapse;
          font-size: ${theme.font.size.xs};
        }
        th,
        td {
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          border: 1px solid ${theme.color.borderSecondary};
          text-align: left;
        }
        th {
          background: ${theme.color.fillSubtle};
          font-weight: 600;
        }

        /* 内联代码 */
        code:not(pre code) {
          padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
          background: ${theme.color.fillSubtle};
          border-radius: ${theme.radius.xs};
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.875em;
        }
      `}
    >
      <XMarkdown
        content={children}
        components={{ code: CodeComponent }}
        streaming={
          streaming
            ? {
                hasNextChunk: true,
                enableAnimation: true,
                animationConfig: { fadeDuration: 100, easing: 'ease-out' },
                tail: { content: '▊' },
              }
            : undefined
        }
        openLinksInNewTab
      />
    </div>
  );
}
