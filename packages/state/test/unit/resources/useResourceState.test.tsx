import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResourceState } from '../../../src/hooks/useResourceState.js';
import { normalizeSession } from '../../../src/core/resources/sessions.js';
import type { SessionMeta } from '../../../src/core/resources/types.js';

describe('useResourceState', () => {
  it('starts with empty data and loading=false', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setData replaces the entire list', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    act(() => {
      result.current.setData([
        { id: 's1', agentName: 'a' },
        { id: 's2', agentName: 'b' },
      ]);
    });
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].id).toBe('s1');
    expect(result.current.data[0].agentName).toBe('a');
  });

  it('upsertItem adds new item', () => {
    const { result } = renderHook(() =>
      useResourceState<SessionMeta>(normalizeSession, (item) => item.id)
    );
    act(() => {
      result.current.upsertItem({ id: 's1', agentName: 'a' });
    });
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('s1');
  });

  it('upsertItem updates existing item by key', () => {
    const { result } = renderHook(() =>
      useResourceState<SessionMeta>(normalizeSession, (item) => item.id)
    );
    act(() => {
      result.current.upsertItem({ id: 's1', agentName: 'a' });
      result.current.upsertItem({ id: 's1', agentName: 'updated', model: 'm' });
    });
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].agentName).toBe('updated');
    expect(result.current.data[0].model).toBe('m');
  });

  it('removeItem removes by key', () => {
    const { result } = renderHook(() =>
      useResourceState<SessionMeta>(normalizeSession, (item) => item.id)
    );
    act(() => {
      result.current.upsertItem({ id: 's1' });
      result.current.upsertItem({ id: 's2' });
      result.current.removeItem('s1');
    });
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('s2');
  });

  it('setError sets error state', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    act(() => {
      result.current.setError('fetch failed');
    });
    expect(result.current.error).toBe('fetch failed');
  });

  it('setLoading sets loading state', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.loading).toBe(true);
  });

  it('clear resets to initial state', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    act(() => {
      result.current.setData([{ id: 's1' }]);
      result.current.setError('err');
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('upsertItem and removeItem are no-ops when no getKey provided', () => {
    const { result } = renderHook(() => useResourceState<SessionMeta>(normalizeSession));
    // No getKey — upsert/remove should be no-ops
    act(() => {
      result.current.upsertItem({ id: 's1' });
      result.current.removeItem('s1');
    });
    expect(result.current.data).toEqual([]);
  });
});
