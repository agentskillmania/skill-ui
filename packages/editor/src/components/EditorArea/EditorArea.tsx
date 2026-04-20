/**
 * 编辑区域组件 — 根据模式切换代码/可视化编辑器
 */
import { css } from '@emotion/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';
import { CodeEditor } from './CodeEditor.js';
import { VisualEditor } from './VisualEditor.js';

export function EditorArea(props: EditorAreaProps) {
  const theme = useTheme();

  return (
    <div
      css={css`
        height: 100%;
        width: 100%;
        background: ${theme.color.bgContainer};
        overflow: hidden;
      `}
    >
      {props.mode === 'wysiwyg' ? <VisualEditor {...props} /> : <CodeEditor {...props} />}
    </div>
  );
}
