import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import translations from '../src/locales/zh-CN.json' with { type: 'json' };

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
      let result = resolveTranslation(translations, key);
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
