/**
 * 代码编辑器（基于 Monaco）
 *
 * 使用受控模式（value + onChange），切换文件时正确更新内容。
 * 通过 key={filePath} 强制 Monaco 在文件切换时重建实例。
 */
import React, { useRef } from 'react';
import _MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';
import { getFileInfo } from '../../utils/file-utils.js';

// React 19 类型兼容
const MonacoEditor = _MonacoEditor as unknown as React.ComponentType<{
  defaultLanguage?: string;
  defaultValue?: string;
  language?: string;
  value?: string;
  path?: string;
  theme?: string;
  height?: string | number;
  options?: Record<string, unknown>;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: unknown, monaco: unknown) => void;
}>;

export function CodeEditor({ content, filePath, readOnly, onChange }: EditorAreaProps) {
  const theme = useTheme();
  const { language } = getFileInfo(filePath);
  const monacoTheme = theme.mode === 'dark' ? 'vs-dark' : 'vs';
  const editorRef = useRef<unknown>(null);

  const handleMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  return (
    <MonacoEditor
      key={filePath}
      defaultLanguage={language}
      defaultValue={content}
      theme={monacoTheme}
      height="100%"
      options={{
        readOnly: readOnly ?? false,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 8 },
      }}
      onChange={(value) => onChange(value ?? '')}
      onMount={handleMount}
    />
  );
}
