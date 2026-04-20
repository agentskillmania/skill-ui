/**
 * 编辑器上下文
 */
import { createContext, useContext } from 'react';
import type { EditorContextValue } from '../types.js';

/** @internal */
export const EditorContext = createContext<EditorContextValue | null>(null);

/** 获取编辑器上下文 */
export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within a SkillEditor');
  }
  return ctx;
}
