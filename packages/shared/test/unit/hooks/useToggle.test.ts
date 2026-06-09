import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToggle } from '../../../src/hooks/useToggle.js';

describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it('accepts custom initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it('sets value explicitly', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.set(true));
    expect(result.current.value).toBe(true);
    act(() => result.current.set(false));
    expect(result.current.value).toBe(false);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);
    act(() => result.current.reset());
    expect(result.current.value).toBe(false);
  });

  it('reset uses initial value of true', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current.set(false));
    expect(result.current.value).toBe(false);
    act(() => result.current.reset());
    expect(result.current.value).toBe(true);
  });
});
