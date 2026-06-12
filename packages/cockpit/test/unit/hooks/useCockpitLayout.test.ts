/**
 * useCockpitLayout hook tests
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCockpitLayout } from '../../../src/hooks/useCockpitLayout.js';

describe('useCockpitLayout', () => {
  it('returns default state', () => {
    const { result } = renderHook(() => useCockpitLayout());
    expect(result.current.sidebarWidth).toBe(440);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.activePanel).toBe('event-log');
  });

  it('uses custom default panel', () => {
    const { result } = renderHook(() => useCockpitLayout('sessions'));
    expect(result.current.activePanel).toBe('sessions');
  });

  it('toggleCollapse flips isCollapsed', () => {
    const { result } = renderHook(() => useCockpitLayout());
    expect(result.current.isCollapsed).toBe(false);
    act(() => result.current.toggleCollapse());
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.toggleCollapse());
    expect(result.current.isCollapsed).toBe(false);
  });

  it('switchPanel changes active panel and expands when collapsed', () => {
    const { result } = renderHook(() => useCockpitLayout('event-log'));
    // First collapse
    act(() => result.current.toggleCollapse());
    expect(result.current.isCollapsed).toBe(true);
    // Switch to sessions — should expand
    act(() => result.current.switchPanel('sessions'));
    expect(result.current.activePanel).toBe('sessions');
    expect(result.current.isCollapsed).toBe(false);
  });

  it('switchPanel to current panel toggles collapse', () => {
    const { result } = renderHook(() => useCockpitLayout('event-log'));
    expect(result.current.isCollapsed).toBe(false);
    // Switch to same panel — should collapse
    act(() => result.current.switchPanel('event-log'));
    expect(result.current.isCollapsed).toBe(true);
    // Switch again — should expand
    act(() => result.current.switchPanel('event-log'));
    expect(result.current.isCollapsed).toBe(false);
  });

  it('setSidebarWidth clamps to min 160', () => {
    const { result } = renderHook(() => useCockpitLayout());
    act(() => result.current.setSidebarWidth(50));
    expect(result.current.sidebarWidth).toBe(160);
  });

  it('setSidebarWidth clamps to max 85% of window', () => {
    const { result } = renderHook(() => useCockpitLayout());
    act(() => result.current.setSidebarWidth(10000));
    // window.innerWidth is 1024 in jsdom by default, 85% = 870.4
    // Math.max with 160, so result is floor(870.4) = 870
    expect(result.current.sidebarWidth).toBeCloseTo(870.4);
  });

  it('setSidebarWidth accepts valid width', () => {
    const { result } = renderHook(() => useCockpitLayout());
    act(() => result.current.setSidebarWidth(300));
    expect(result.current.sidebarWidth).toBe(300);
  });
});
