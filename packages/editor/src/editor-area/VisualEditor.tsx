/** @jsxImportSource @emotion/react */
/**
 * Visual editor (based on @milkdown/crepe)
 *
 * Uses WYSIWYG Markdown editing features provided by Crepe,
 * including format toolbar, slash commands, block drag-and-drop, tables, link editing, etc.
 *
 * milkdown（数 MB）在 mount 时动态 import —— 不用可视化编辑器时首屏 bundle 不含 milkdown。
 */
import { useTheme } from '@agentskillmania/skill-ui-theme';
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACE } from '../locales/index.js';
import type { EditorAreaProps } from '../types.js';

/** ListenerManager type for listenerCtx (simplified) */
interface ListenerManager {
  markdownUpdated: (
    callback: (ctx: unknown, markdown: string, prevMarkdown: string) => void
  ) => ListenerManager;
}

/** Minimal Crepe surface (milkdown's package types are not cleanly exported) */
interface CrepeLike {
  create(): Promise<void>;
  destroy(): Promise<void>;
  on(cb: (listener: ListenerManager) => void): unknown;
  setReadonly(readonly: boolean): void;
  getMarkdown(): string;
  editor: { status?: string; action(cmd: unknown): void };
}

/** replaceAll command from @milkdown/utils — loaded dynamically, kept in a ref */
type ReplaceAllFn = (content: string) => unknown;

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
  const { t } = useTranslation(NAMESPACE);
  const rootRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<CrepeLike | null>(null);
  const replaceAllRef = useRef<ReplaceAllFn | null>(null);
  const isInternalChange = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange reference up-to-date to avoid stale closure
  onChangeRef.current = onChange;

  // Load milkdown engine + styles, then initialize Crepe
  useEffect(() => {
    if (!rootRef.current) return;

    // UI1: track whether the effect has been cleaned up before the async
    // crepe.create() resolves. Without this, a fast unmount would run
    // crepe.destroy() first, then create() resolves and we'd bind listeners
    // onto a destroyed editor (orphan + console errors).
    let cancelled = false;
    let crepe: CrepeLike | null = null;

    (async () => {
      // @ts-expect-error — @milkdown/crepe's package.json exports do not correctly declare types
      const { Crepe } = await import('@milkdown/crepe');
      // @ts-expect-error — @milkdown/utils's package.json exports do not correctly declare types
      const { replaceAll } = await import('@milkdown/utils');
      // Styles are a side-effect import, loaded together with the engine
      // @ts-expect-error — css has no type declarations (static import form only works via the exports map)
      await import('@milkdown/crepe/theme/frame.css');
      if (cancelled || !rootRef.current) return;

      const crepeLocal = new Crepe({
        root: rootRef.current,
        defaultValue: content,
        featureConfigs: {
          placeholder: {
            text: t('editor.placeholder'),
          },
        },
      }) as CrepeLike;
      crepe = crepeLocal;
      crepeRef.current = crepeLocal;
      replaceAllRef.current = replaceAll as ReplaceAllFn;

      try {
        await crepeLocal.create();
      } catch (err) {
        if (!cancelled) console.error('Crepe create failed:', err);
        return;
      }

      // If the component unmounted during await, destroy already ran — bail.
      if (cancelled) return;

      // Bind onChange callback
      crepeLocal.on((listener: ListenerManager) => {
        listener.markdownUpdated((_ctx: unknown, markdown: string, _prev: string) => {
          if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
          }
          onChangeRef.current(markdown);
        });
      });

      crepeLocal.setReadonly(readOnly);
    })();

    return () => {
      cancelled = true;
      if (crepe) {
        crepe.destroy().catch((err: unknown) => {
          console.error('销毁 Crepe 编辑器失败:', err);
        });
      }
      crepeRef.current = null;
    };
    // Only execute on mount
  }, []);

  // content prop changes → sync to Crepe (file switch scenario)
  useEffect(() => {
    const crepe = crepeRef.current;
    const replaceAll = replaceAllRef.current;
    if (!crepe || !replaceAll) return;

    const editor = crepe.editor;
    if (editor?.status !== 'Created') return;

    const currentMd = crepe.getMarkdown();
    if (currentMd !== content) {
      isInternalChange.current = true;
      editor.action(replaceAll(content));
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
