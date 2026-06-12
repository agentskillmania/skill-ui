/**
 * avatar-color utility tests
 */
import { describe, it, expect } from 'vitest';
import {
  PALETTE,
  hashId,
  getAvatarColor,
  getInitial,
} from '../../src/components/shared/avatar-color.js';

describe('avatar-color', () => {
  describe('hashId', () => {
    it('returns deterministic hash for same id', () => {
      expect(hashId('test')).toBe(hashId('test'));
    });

    it('returns different hash for different ids', () => {
      expect(hashId('abc')).not.toBe(hashId('xyz'));
    });

    it('returns number >= 0', () => {
      expect(hashId('anything')).toBeGreaterThanOrEqual(0);
    });

    it('handles empty string', () => {
      expect(hashId('')).toBe(5381);
    });

    it('handles unicode characters', () => {
      expect(hashId('你好')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAvatarColor', () => {
    it('returns a valid palette entry', () => {
      const color = getAvatarColor('test');
      expect(PALETTE).toContainEqual(color);
    });

    it('returns deterministic color for same id', () => {
      expect(getAvatarColor('user-1')).toEqual(getAvatarColor('user-1'));
    });

    it('distributes across palette indices', () => {
      // Multiple ids should hit different palette entries
      const colors = new Set(['a', 'b', 'c', 'd', 'e'].map((id) => getAvatarColor(id).bg));
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('getInitial', () => {
    it('returns first letter uppercase', () => {
      expect(getInitial('hello')).toBe('H');
    });

    it('handles single character', () => {
      expect(getInitial('a')).toBe('A');
    });

    it('handles empty string', () => {
      expect(getInitial('')).toBe('');
    });

    it('handles uppercase input', () => {
      expect(getInitial('TEST')).toBe('T');
    });
  });
});
