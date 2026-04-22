/**
 * Code editor (based on Monaco)
 *
 * Uses controlled mode (value + onChange), correctly updates content when switching files.
 * Forces Monaco to rebuild instance on file switch via key={filePath}.
 */
import React, { useRef } from 'react';
import _MonacoEditor from '@monaco-editor/react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';
import { getFileInfo } from '../../utils/file-utils.js';

// React 19 type compatibility
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

export function CodeEditor({ content, filePath, readOnly, onChange, onSave }: EditorAreaProps) {
  const theme = useTheme();
  const { language } = getFileInfo(filePath);
  const monacoTheme = theme.mode === 'dark' ? 'vs-dark' : 'vs';
  const editorRef = useRef<unknown>(null);

  // Use ref to keep onSave and content up-to-date, avoiding closure trap
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const contentRef = useRef(content);
  contentRef.current = content;

  const handleMount = (editor: unknown) => {
    editorRef.current = editor;
    // Register Ctrl+S save shortcut
    if (editor && typeof editor === 'object' && 'addCommand' in editor) {
      const e = editor as { addCommand: (keybinding: number, handler: () => void) => void };
      // KeyMod.CtrlCmd | KeyCode.KeyS = 2048 | 49 = 2097
      e.addCommand(2097, () => {
        onSaveRef.current?.(contentRef.current);
      });
    }
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
