/**
 * Public export verification for @agentskillmania/skill-ui-editor.
 */
import { describe, it, expect } from 'vitest';
import * as editorExports from '../../src/index.js';

describe('editor package exports', () => {
  const componentNames = [
    'ProjectEditor',
    'EditorArea',
    'CodeEditor',
    'VisualEditor',
    'FileTabs',
    'StatusBar',
    'FileTree',
    'CopilotPanel',
    'ReviewPanel',
  ] as const;

  it.each(componentNames)('exports %s as a component', (name) => {
    const value: unknown = editorExports[name];
    expect(value).toBeDefined();
    const isFunction = typeof value === 'function';
    const isMemoComponent = typeof value === 'object' && value !== null && '$$typeof' in value;
    expect(isFunction || isMemoComponent).toBe(true);
  });

  it('exports hook and utility functions', () => {
    expect(typeof editorExports.useEditorContext).toBe('function');
    expect(typeof editorExports.getFileInfo).toBe('function');
    expect(typeof editorExports.getFileLabel).toBe('function');
  });

  it('exports i18n resources for both locales', () => {
    expect(typeof editorExports.NAMESPACE).toBe('string');
    expect(editorExports.NAMESPACE.length).toBeGreaterThan(0);
    const resources = editorExports.resources as Record<string, Record<string, unknown>>;
    expect(Object.keys(resources)).toEqual(expect.arrayContaining(['zh-CN', 'en-US']));
  });
});
