import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorLayout } from '../../../src/hooks/useEditorLayout.js';

describe('useEditorLayout', () => {
  it('returns default values with files panel active', () => {
    const { result } = renderHook(() => useEditorLayout());

    expect(result.current.sidebarWidth).toBe(280);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.activePanel).toBe('files');
  });

  it('toggleCollapse flips isCollapsed', () => {
    const { result } = renderHook(() => useEditorLayout());

    act(() => {
      result.current.toggleCollapse();
    });
    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggleCollapse();
    });
    expect(result.current.isCollapsed).toBe(false);
  });

  it('switchPanel to different panel switches', () => {
    const { result } = renderHook(() => useEditorLayout());

    act(() => {
      result.current.switchPanel('copilot');
    });

    expect(result.current.activePanel).toBe('copilot');
    expect(result.current.isCollapsed).toBe(false);
  });

  it('switchPanel to same panel is a no-op (does not collapse)', () => {
    const { result } = renderHook(() => useEditorLayout());

    // Default panel is 'files'
    act(() => {
      result.current.switchPanel('files');
    });

    expect(result.current.activePanel).toBe('files');
    expect(result.current.isCollapsed).toBe(false);
  });

  it('switchPanel expands when sidebar is collapsed', () => {
    const { result } = renderHook(() => useEditorLayout());

    // Collapse first
    act(() => {
      result.current.toggleCollapse();
    });
    expect(result.current.isCollapsed).toBe(true);

    // Click any panel icon should expand
    act(() => {
      result.current.switchPanel('copilot');
    });

    expect(result.current.activePanel).toBe('copilot');
    expect(result.current.isCollapsed).toBe(false);
  });

  it('setSidebarWidth clamps to min 160', () => {
    const { result } = renderHook(() => useEditorLayout());

    act(() => {
      result.current.setSidebarWidth(50);
    });

    expect(result.current.sidebarWidth).toBe(160);
  });

  it('setSidebarWidth clamps to max 85% of window width', () => {
    const originalInnerWidth = window.innerWidth;
    const maxWidth = window.innerWidth * 0.85;

    const { result } = renderHook(() => useEditorLayout());

    act(() => {
      result.current.setSidebarWidth(2000);
    });

    expect(result.current.sidebarWidth).toBeCloseTo(maxWidth, 10);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('setSidebarWidth accepts valid width', () => {
    const { result } = renderHook(() => useEditorLayout());

    act(() => {
      result.current.setSidebarWidth(400);
    });

    expect(result.current.sidebarWidth).toBe(400);
  });
});
