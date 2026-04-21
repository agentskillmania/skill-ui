/**
 * 可视化编辑器（基于 @milkdown/crepe）
 *
 * 使用 Crepe 提供的 WYSIWYG Markdown 编辑功能
 */
import '@milkdown/crepe/theme/frame.css';
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@agentskillmania/skill-ui-theme';
// @ts-ignore - @milkdown/crepe types are not properly exported in package.json
import { Crepe } from '@milkdown/crepe';
import type { EditorAreaProps } from '../../types.js';

// 定义 ListenerManager 类型（简化版）
interface ListenerManager {
  markdownUpdated: (
    callback: (ctx: unknown, markdown: string, prevMarkdown: string) => void,
  ) => ListenerManager;
}

export function VisualEditor({
  content,
  filePath,
  mode,
  readOnly = false,
  onChange,
  onSave,
  onCursorChange,
}: EditorAreaProps) {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [isInternalChange, setIsInternalChange] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    // 创建 Crepe 实例
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

    // 初始化编辑器
    const initEditor = async () => {
      await crepe.create();

      // 绑定 onChange 回调
      crepe.on((listener: ListenerManager) => {
        listener.markdownUpdated((_ctx: unknown, markdown: string, _prevMarkdown: string) => {
          // 防止循环：如果是内部触发的更新（通过 props），不调用 onChange
          if (isInternalChange) {
            return;
          }

          onChange(markdown);
        });
      });

      // 设置只读状态
      const editor = crepe.editor;
      if (editor.view) {
        const editableState = readOnly
          ? () => false
          : () => true;

        editor.view.setProps({
          editable: editableState,
        });
      }

      setIsEditorReady(true);
    };

    initEditor();

    // 清理函数
    return () => {
      const destroyPromise = crepe.destroy();
      if (destroyPromise && typeof destroyPromise.catch === 'function') {
        destroyPromise.catch((error: unknown) => {
          console.error('Failed to destroy Crepe editor:', error);
        });
      }
    };
    // 只在挂载时运行，不依赖 content 和 onChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理 content prop 变化（文件切换场景）
  useEffect(() => {
    if (!crepeRef.current || !isEditorReady || isInternalChange) {
      return;
    }

    const currentMarkdown = crepeRef.current.getMarkdown();
    if (currentMarkdown !== content) {
      // 标记为内部更新，防止触发 onChange
      setIsInternalChange(true);

      // 注意：Crepe 没有提供直接的 setContent 方法
      // 这里我们跳过内容同步，因为重新创建编辑器成本太高
      // 在实际使用中，文件切换时会重新挂载组件

      // 重置内部更新标记
      setTimeout(() => {
        setIsInternalChange(false);
      }, 0);
    }
  }, [content, isInternalChange, isEditorReady]);

  // 处理 readOnly prop 变化
  useEffect(() => {
    if (!crepeRef.current || !isEditorReady) {
      return;
    }

    const editor = crepeRef.current.editor;
    if (editor.view) {
      const editableState = readOnly
        ? () => false
        : () => true;

      editor.view.setProps({
        editable: editableState,
      });
    }
  }, [readOnly, isEditorReady]);

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        color: ${theme.color.text};
      `}
    >
      <div
        ref={rootRef}
        data-crepe-root="true"
        css={css`
          min-height: 200px;
          outline: none;
          font-size: ${theme.font.size.sm};
        `}
      />
    </div>
  );
}
