/**
 * 可视化编辑器（基于 @milkdown/crepe）
 *
 * 使用 Crepe 提供的 WYSIWYG Markdown 编辑功能，
 * 包括格式工具栏、斜杠命令、块拖拽、表格、链接编辑等。
 */
import '@milkdown/crepe/theme/frame.css';
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
// @ts-expect-error — @milkdown/crepe 的 package.json exports 未正确声明类型
import { Crepe } from '@milkdown/crepe';
import { useTheme } from '@agentskillmania/skill-ui-theme';
import type { EditorAreaProps } from '../../types.js';

/** listenerCtx 的 ListenerManager 类型（简化版） */
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

  // 保持 onChange 引用最新，避免闭包过期
  onChangeRef.current = onChange;

  // 初始化 Crepe
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

      // 绑定 onChange 回调
      crepe.on((listener: ListenerManager) => {
        listener.markdownUpdated((_ctx: unknown, markdown: string, _prev: string) => {
          // isInternalChange 标记会在 content 同步 useEffect 中重置，
          // 这里用 setTimeout(0) 确保 replaceAll 完成后才重置
          if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
          }
          onChangeRef.current(markdown);
        });
      });

      // 设置初始只读状态
      crepe.setReadonly(readOnly);
    };

    initEditor();

    return () => {
      crepe.destroy().catch((err: unknown) => {
        console.error('销毁 Crepe 编辑器失败:', err);
      });
      crepeRef.current = null;
    };
    // 仅挂载时执行
  }, []);

  // content prop 变化 → 同步到 Crepe（文件切换场景）
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

  // readOnly 变化 → 同步到 Crepe
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
