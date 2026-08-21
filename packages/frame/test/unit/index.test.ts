/**
 * Public export verification for @agentskillmania/skill-ui-frame.
 */
import { describe, it, expect } from 'vitest';
import * as frameExports from '../../src/index.js';

describe('frame package exports', () => {
  const componentNames = [
    'AppFrame',
    'Titlebar',
    'TrafficLights',
    'WindowControls',
    'AppBrand',
  ] as const;

  it.each(componentNames)('exports %s as a component', (name) => {
    const value: unknown = frameExports[name];
    expect(value).toBeDefined();
    const isFunction = typeof value === 'function';
    const isMemoComponent = typeof value === 'object' && value !== null && '$$typeof' in value;
    expect(isFunction || isMemoComponent).toBe(true);
  });

  it('exports i18n resources for both locales', () => {
    expect(typeof frameExports.NAMESPACE).toBe('string');
    expect(frameExports.NAMESPACE.length).toBeGreaterThan(0);
    const resources = frameExports.resources as Record<string, Record<string, unknown>>;
    expect(Object.keys(resources)).toEqual(expect.arrayContaining(['zh-CN', 'en-US']));
  });
});
