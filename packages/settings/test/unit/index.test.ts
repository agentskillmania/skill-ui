/**
 * Public export verification for @agentskillmania/skill-ui-settings.
 * Guards the package root entry — an empty index.ts once shipped zero
 * exports while a placeholder test kept the suite green.
 */
import { describe, it, expect } from 'vitest';
import * as settingsExports from '../../src/index.js';

describe('settings package exports', () => {
  const componentNames = [
    'SettingsPanel',
    'DaemonConfigPanel',
    'McpConfigPanel',
    'PreferencesPanel',
  ] as const;

  it.each(componentNames)('exports %s as a component', (name) => {
    const value: unknown = settingsExports[name];
    expect(value).toBeDefined();
    const isFunction = typeof value === 'function';
    const isMemoComponent = typeof value === 'object' && value !== null && '$$typeof' in value;
    expect(isFunction || isMemoComponent).toBe(true);
  });

  it('exports i18n resources for both locales', () => {
    expect(settingsExports.NAMESPACE).toBe('skill-ui-settings');
    const resources = settingsExports.resources as Record<string, Record<string, unknown>>;
    expect(Object.keys(resources)).toEqual(expect.arrayContaining(['zh-CN', 'en-US']));
    // 每个语言包都装在 namespace 下且非空
    for (const locale of ['zh-CN', 'en-US']) {
      const bundle = resources[locale]?.[settingsExports.NAMESPACE];
      expect(bundle).toBeDefined();
      expect(Object.keys(bundle as object).length).toBeGreaterThan(0);
    }
  });
});
