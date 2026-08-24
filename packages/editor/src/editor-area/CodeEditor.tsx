/** @jsxImportSource @emotion/react */
/**
 * Code editor (based on Monaco)
 *
 * The engine is loaded LAZILY from the local `monaco-editor` package — never
 * the CDN: `@monaco-editor/react` defaults to jsdelivr, which hangs forever in
 * offline/restricted webviews (e.g. the Tauri host). Deferring the import also
 * keeps jsdom tests and app startup away from monaco's multi-MB engine.
 *
 * Uses controlled mode (value + onChange), correctly updates content when
 * switching files. Forces Monaco to rebuild instance on file switch via
 * key={filePath}.
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { EditorAreaProps } from '../types.js';
import { getFileInfo } from '../utils/file-utils.js';

// React 19 type compatibility
type MonacoEditorComponent = React.ComponentType<{
  defaultLanguage?: string;
  defaultValue?: string;
  theme?: string;
  height?: string | number;
  options?: Record<string, unknown>;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: unknown, monaco: unknown) => void;
}>;

export function CodeEditor({ content, filePath, readOnly, onChange, onSave }: EditorAreaProps) {
  const theme = useTheme();
  const { t } = useTranslation(NAMESPACE);
  const { language } = getFileInfo(filePath);
  const monacoTheme = theme.mode === 'dark' ? 'vs-dark' : 'vs';
  const editorRef = useRef<unknown>(null);
  const [Editor, setEditor] = useState<MonacoEditorComponent | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // Use ref to keep onSave and content up-to-date, avoiding closure trap
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    if (Editor) return;
    let cancelled = false;
    Promise.all([import('@monaco-editor/react'), import('monaco-editor')])
      .then(([mod, monaco]) => {
        // Point @monaco-editor/react's loader at the local engine (no CDN).
        mod.loader.config({ monaco });
        const ctor = (mod as unknown as { default: MonacoEditorComponent }).default;
        if (!cancelled) setEditor(() => ctor);
      })
      .catch((e) => {
        if (!cancelled) setFailed(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [Editor]);

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

  if (failed) {
    return (
      <div
        css={css`
          padding: ${theme.spacing[3]};
          font-size: ${theme.font.size.sm};
          color: ${theme.color.error};
        `}
      >
        {t('codeEditor.loadError')}: {failed}
      </div>
    );
  }
  if (!Editor) {
    return (
      <div
        css={css`
          padding: ${theme.spacing[3]};
          font-size: ${theme.font.size.sm};
          color: ${theme.color.textTertiary};
        `}
      >
        {t('codeEditor.loading')}
      </div>
    );
  }

  return (
    <Editor
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
