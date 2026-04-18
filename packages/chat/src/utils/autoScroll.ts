/**
 * 自动滚动 hook
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * 监听容器内容变化，自动滚动到底部。
 * 用户主动上滚时暂停自动滚动，滚到底部后恢复。
 */
export function useAutoScroll<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 50;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
    // deps 是动态传入的依赖数组，无法静态分析
  }, deps);

  return { ref, handleScroll };
}
