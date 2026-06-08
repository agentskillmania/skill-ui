import { describe, it, expect } from 'vitest';
import { getToolColorKey } from '../../src/blocks-redesign/toolColorUtils.js';

describe('getToolColorKey', () => {
  it('maps known types to their blockColor keys', () => {
    expect(getToolColorKey('mcp')).toBe('toolMcp');
    expect(getToolColorKey('script')).toBe('toolScript');
    expect(getToolColorKey('builtin')).toBe('toolBuiltin');
  });

  it('returns a valid fallback for unknown toolType', () => {
    const key = getToolColorKey('custom');
    // Must be one of the defined blockColor keys, not a dynamically constructed invalid key
    expect(['toolMcp', 'toolScript', 'toolBuiltin']).toContain(key);
  });

  it('returns a valid fallback for undefined toolType', () => {
    const key = getToolColorKey(undefined);
    expect(['toolMcp', 'toolScript', 'toolBuiltin']).toContain(key);
  });

  it('returns a valid fallback for empty string toolType', () => {
    const key = getToolColorKey('');
    expect(['toolMcp', 'toolScript', 'toolBuiltin']).toContain(key);
  });
});
