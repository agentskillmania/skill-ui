/**
 * Visual editor (based on @milkdown/crepe)
 *
 * Uses WYSIWYG Markdown editing features provided by Crepe,
 * including format toolbar, slash commands, block drag-and-drop, tables, link editing, etc.
 */
import '@milkdown/crepe/theme/frame.css';
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
// @ts-expect-error — @milkdown/crepe's package.json exports do not correctly declare types
import { Crepe } from '@milkdown/crepe';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';

/** ListenerManager type for listenerCtx (simplified) */
interface ListenerManager {
  markdownUpdated: (
    callback: (ctx: unknown, markdown: string, prevMarkdown: string) => void
  ) => ListenerManager;
}

export function VisualEditor({
  content,
  filePath: _filePath,
  mode: _mode,
  readOnly = false,
  onChange,
  onSave: _onSave,
  onCursorChange: _onCursorChange,
}: EditorAreaProps) {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const isInternalChange = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange reference up-to-date to avoid stale closure
  onChangeRef.current = onChange;

  // Initialize Crepe
  useEffect(() => {
    if (!rootRef.current) return;

    const crepe = new Crepe({
      root: rootRef.current,
      defaultValue: content,
      featureConfigs: {
        placeholder: {
          text: '输入 / 唤起菜单，或直接开始写作...',
        },
      },
    });

    crepeRef.current = crepe;

    const initEditor = async () => {
      await crepe.create();

      // Bind onChange callback
      crepe.on((listener: ListenerManager) => {
        listener.markdownUpdated((_ctx: unknown, markdown: string, _prev: string) => {
          // isInternalChange flag will be reset in content sync useEffect,
          // uses setTimeout(0) here to ensure reset happens after replaceAll completes
          if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
          }
          onChangeRef.current(markdown);
        });
      });

      // Set initial read-only state
      crepe.setReadonly(readOnly);
    };

    initEditor();

    return () => {
      crepe.destroy().catch((err: unknown) => {
        console.error('销毁 Crepe 编辑器失败:', err);
      });
      crepeRef.current = null;
    };
    // Only execute on mount
  }, []);

  // content prop changes → sync to Crepe (file switch scenario)
  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe) return;

    const editor = crepe.editor;
    if (editor?.status !== 'Created') return;

    const currentMd = crepe.getMarkdown();
    if (currentMd !== content) {
      isInternalChange.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('@milkdown/utils').then((utils: any) => {
        editor.action(utils.replaceAll(content));
      });
    }
  }, [content]);

  // readOnly changes → sync to Crepe
  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe) return;
    crepe.setReadonly(!!readOnly);
  }, [readOnly]);

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
      `}
    >
      <div
        ref={rootRef}
        data-crepe-root="true"
        css={css`
          min-height: 200px;
          outline: none;
        `}
      />
    </div>
  );
}
