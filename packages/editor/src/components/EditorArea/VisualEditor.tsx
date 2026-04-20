/**
 * 可视化编辑器（基于 Milkdown）
 *
 * 当前实现：Markdown 预览渲染（使用 dangerouslySetInnerHTML 解析基础格式）。
 * 后续集成 Milkdown 后替换为真正的 WYSIWYG 编辑。
 */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';

/** 基础 Markdown → HTML 转换（预览用途，后续由 Milkdown 替代） */
function markdownToHtml(md: string): string {
  let html = md
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体 / 斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 无序列表
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // 分隔线
    .replace(/^---$/gm, '<hr/>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    // 换行
    .replace(/\n/g, '<br/>');

  // 包裹段落标签
  html = `<p>${html}</p>`;
  // 清理空段落
  html = html.replace(/<p><\/p>/g, '');
  // 列表包裹
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  return html;
}

export function VisualEditor({ content, onChange }: EditorAreaProps) {
  const theme = useTheme();
  const editing = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (!editing.current && editorRef.current) {
      // contentEditable 场景下取纯文本作为 fallback
      onChange(editorRef.current.innerText);
    }
  }, [onChange]);

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        color: ${theme.color.text};

        h1,
        h2,
        h3 {
          margin: ${theme.spacing[2]} 0 ${theme.spacing[1]};
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

        p {
          margin: ${theme.spacing[1]} 0;
          line-height: 1.6;
        }

        ul {
          margin: ${theme.spacing[1]} 0;
          padding-left: ${theme.spacing[5]};
        }
        li {
          margin-bottom: ${theme.spacing['0.5']};
        }

        pre {
          margin: ${theme.spacing[2]} 0;
          padding: ${theme.spacing[2]};
          background: ${theme.color.fillSubtle};
          border-radius: ${theme.radius.sm};
          overflow-x: auto;
        }

        code {
          padding: ${theme.spacing['0.5']} ${theme.spacing[1]};
          background: ${theme.color.fillSubtle};
          border-radius: ${theme.radius.xs};
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.875em;
        }

        pre code {
          padding: 0;
          background: none;
        }

        hr {
          margin: ${theme.spacing[3]} 0;
          border: none;
          border-top: 1px solid ${theme.color.borderSecondary};
        }

        strong {
          font-weight: 600;
        }
      `}
    >
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
        css={css`
          min-height: 200px;
          outline: none;
          font-size: ${theme.font.size.sm};
        `}
      />
    </div>
  );
}
