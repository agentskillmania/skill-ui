/** @jsxImportSource @emotion/react */
/**
 * 只读文件预览器 — files 域通用件。
 *
 * 按 FileKind 路由：
 * - markdown → @ant-design/x-markdown 静态渲染
 * - code / file → 只读 <pre> 文本
 *
 * image（二进制）不进此组件 — 预览通道由宿主决定（如 antd Image / 静态 URL）。
 * streaming 光标/防闪烁高亮属于聊天语义，这里不需要。
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import _XMarkdown from '@ant-design/x-markdown';
import type { XMarkdownProps } from '@ant-design/x-markdown';
import { css } from '@emotion/react';
import React from 'react';

import { getFileKind } from './file-extensions.js';
import type { FilePreviewProps } from './types.js';

// React 19 type compatibility: XMarkdown declared as FC but TS cannot recognize it as JSX component
const XMarkdown = _XMarkdown as unknown as React.ComponentType<XMarkdownProps>;

/** 只读文件内容预览：markdown 渲染 / 文本原样展示。 */
export function FilePreview({ path, content, className, style }: FilePreviewProps) {
  const theme = useTheme();
  const kind = getFileKind(path);

  if (kind === 'markdown') {
    return (
      <div
        className={className}
        style={style}
        css={css`
          height: 100%;
          overflow-y: auto;
          padding: ${theme.spacing[3]};
          color: ${theme.color.text};
          font-size: ${theme.font.size.sm};
          line-height: 1.7;
        `}
      >
        <XMarkdown
          content={content}
          openLinksInNewTab
          // escape raw HTML in markdown as plain text to prevent XSS —
          // previewed content may come from untrusted workspaces.
          escapeRawHtml
        />
      </div>
    );
  }

  return (
    <pre
      className={className}
      style={style}
      css={css`
        margin: 0;
        height: 100%;
        overflow: auto;
        padding: ${theme.spacing[3]};
        background: ${theme.color.bgContainer};
        color: ${theme.color.text};
        font-family: ${theme.font.familyMono};
        font-size: ${theme.font.size.sm};
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      `}
    >
      {content}
    </pre>
  );
}
