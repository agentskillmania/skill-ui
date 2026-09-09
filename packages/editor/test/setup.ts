import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import translations from '../src/locales/zh-CN.json' with { type: 'json' };
import { resources as sharedResources } from '@agentskillmania/skill-ui-shared';

// editor 组件与 shared 组件（FileTree/FileTabs）共用此 mock ——
// shared 的 zh-CN 一并合并进来，namespace 顶层 key 不冲突。
const sharedZhCN = (
  sharedResources as unknown as Record<string, Record<string, Record<string, unknown>>>
)['zh-CN']['skill-ui-shared'];
const mergedTranslations: Record<string, unknown> = { ...translations, ...sharedZhCN };

// mock react-i18next — loads real zh-CN translations for testing
function resolveTranslation(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const k of keys) {
    if (current?.[k] == null) return path;
    current = current[k];
  }
  return typeof current === 'string' ? current : path;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      let result = resolveTranslation(mergedTranslations, key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          result = result.replace(`{{${k}}}`, String(v));
        }
      }
      return result;
    },
    i18n: { language: 'zh-CN' },
  }),
}));

// lottie-web requires canvas context not available in jsdom
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: () => ({ destroy: () => {}, addEventListener: () => {} }),
  },
}));

// antd components depend on ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// matchMedia that antd may depend on
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// genui's bundled lottie grabs a 2D context at import time; jsdom has none
HTMLCanvasElement.prototype.getContext = vi.fn(
  () =>
    ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      measureText: () => ({ width: 0 }),
      getImageData: () => ({ data: new Uint8ClampedArray(0) }),
    }) as unknown as CanvasRenderingContext2D
) as unknown as typeof HTMLCanvasElement.prototype.getContext;
