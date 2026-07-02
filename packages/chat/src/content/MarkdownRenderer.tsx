/**
 * Markdown renderer
 *
 * Based on @ant-design/x-markdown (marked.js), consistent with skill-studio.
 * Supports streaming rendering, code highlighting, GFM syntax.
 */
import { css, keyframes } from '@emotion/react';
import React from 'react';
import _XMarkdown from '@ant-design/x-markdown';
import type { ComponentProps, XMarkdownProps } from '@ant-design/x-markdown';
import { CodeHighlighter } from '@ant-design/x';
import { useTheme } from '@agentskillmania/skill-ui-theme';

// React 19 type compatibility: XMarkdown declared as FC but TS cannot recognize it as JSX component
const XMarkdown = _XMarkdown as unknown as React.ComponentType<XMarkdownProps>;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export interface MarkdownRendererProps {
  children: string;
  /** Whether streaming output */
  streaming?: boolean;
}

/** Code block rendering: integrates CodeHighlighter */
function CodeComponent({ className, children, block }: ComponentProps) {
  if (!block) {
    return <code className={className}>{children}</code>;
  }

  const lang = className?.match(/language-(\w+)/)?.[1] ?? '';

  if (typeof children !== 'string') {
    return <code className={className}>{children}</code>;
  }

  return <CodeHighlighter lang={lang}>{children}</CodeHighlighter>;
}

/** Streaming cursor rendered inside x-markdown tail */
function StreamingCursor() {
  const theme = useTheme();
  return (
    <span
      css={css`
        display: inline-block;
        width: 2px;
        height: 1.2em;
        background: ${theme.color.primary};
        vertical-align: text-bottom;
        margin-left: 2px;
        animation: ${blink} 1s step-end infinite;
      `}
    />
  );
}

export function MarkdownRenderer({ children, streaming }: MarkdownRendererProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        line-height: ${theme.font.lineHeightRelaxed};

        /* Headings */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin-top: ${theme.spacing[3]};
          margin-bottom: ${theme.spacing[1]};
          font-weight: ${theme.font.weight.semibold};
          line-height: ${theme.font.lineHeightHeading};
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

        /* Paragraphs */
        p {
          margin: ${theme.spacing[1]} 0;
        }

        /* Lists */
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

        /* Blockquotes */
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

        /* Horizontal rules */
        hr {
          margin: ${theme.spacing[3]} 0;
          border: none;
          border-top: 1px solid ${theme.color.borderSecondary};
        }

        /* Links */
        a {
          color: ${theme.color.primary};
          text-decoration: none;
          &:hover {
            opacity: 0.8;
          }
        }

        /* Tables */
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
          font-weight: ${theme.font.weight.semibold};
        }

        /* Inline code */
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
                tail: { content: '|', component: StreamingCursor },
              }
            : undefined
        }
        openLinksInNewTab
        // SEC13: escape raw HTML in markdown as plain text to prevent XSS.
        // LLM output is untrusted; <script>/<img onerror> must not execute.
        escapeRawHtml
      />
    </div>
  );
}
