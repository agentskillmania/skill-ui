/**
 * Editor context
 */
import { createContext, useContext } from 'react';
import type { EditorContextValue } from '../types.js';

/** @internal */
export const EditorContext = createContext<EditorContextValue | null>(null);

/** Get editor context */
export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within a SkillEditor');
  }
  return ctx;
}
