/**
 * Root vitest setup — shared browser-API polyfills for jsdom.
 *
 * Each package has its own `test/setup.ts` (wired via that package's
 * `vitest.config.ts`), but running `vitest` from the repo root uses THIS
 * config, which previously lacked the polyfills — so every antd/rc-component
 * test crashed with `ResizeObserver is not defined`. The polyfills below are
 * the common subset every package setup needs; package setups keep their
 * package-specific mocks (i18n translations, tanstack-virtual, ...).
 */
import '@testing-library/jest-dom/vitest';
import { expect, vi } from 'vitest';

// Settings/shared tests assert on RAW i18n keys (`t: key => key` convention,
// no locale files); the other packages resolve zh-CN translations. A single
// root mock serves both by keying off the current test file's package.
const testPath = (expect.getState() as { testPath?: string }).testPath ?? '';
const KEYS_AS_TEXT = /packages\/(settings|shared)\//.test(testPath);

// antd / rc-component depend on ResizeObserver
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

// ── react-i18next mock ─────────────────────────────────────────
// Each package setup mocks react-i18next with its OWN zh-CN translations.
// For root-level runs we merge every package's locale file so keys resolve
// regardless of which package's components the test imports.
const translationModules = import.meta.glob('../packages/*/src/locales/zh-CN.json', {
  eager: true,
}) as Record<string, Record<string, unknown>>;
const mergedTranslations: Record<string, unknown> = {};
for (const mod of Object.values(translationModules)) {
  Object.assign(mergedTranslations, mod);
}

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
  useTranslation: (ns?: string) => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (KEYS_AS_TEXT) return key;
      // Portal keys live under a `portal` namespace (useTranslation('skill-ui-portal')).
      const base =
        ns === 'skill-ui-portal' ? (mergedTranslations.portal ?? {}) : mergedTranslations;
      let result = resolveTranslation(base, key);
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

// ── Package-specific mocks (shared by several package setups) ────────────────
// @tanstack/react-virtual — jsdom has no real layout (cockpit setup)
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (opts: { count: number; estimateSize?: (i: number) => number }) => {
    const estimateSize = opts.estimateSize ?? (() => 48);
    const count = opts.count;
    const virtualItems = Array.from({ length: count }, (_, i) => {
      const size = estimateSize(i);
      const start = Array.from({ length: i }, (_, j) => estimateSize(j)).reduce((a, b) => a + b, 0);
      return { key: i, index: i, start, end: start + size, size, lane: 0 };
    });
    return {
      getVirtualItems: () => virtualItems,
      getTotalSize: () => virtualItems.reduce((sum, v) => sum + v.size, 0),
      measureElement: vi.fn(),
      scrollToIndex: vi.fn(),
      scrollOffset: 0,
    };
  },
}));

// skill-ui-chat: keep the real module (editor's CopilotPanel imports
// MessageList/ChatInput) but stub `Chat` for cockpit's setup, which cannot
// render it in jsdom.
vi.mock('@agentskillmania/skill-ui-chat', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Chat: function MockChat({ children }: { children?: React.ReactNode }) {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'mock-chat' }, children);
    },
  };
});

// genui (and lottie code paths it pulls in) renders to a 2d canvas context,
// which jsdom does not implement — provide a minimal no-op context.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  fillRect() {},
  strokeRect() {},
  clearRect() {},
  beginPath() {},
  closePath() {},
  moveTo() {},
  lineTo() {},
  arc() {},
  fill() {},
  stroke() {},
  save() {},
  restore() {},
  translate() {},
  scale() {},
  measureText: () => ({ width: 0 }),
  createLinearGradient: () => ({ addColorStop() {} }),
  getImageData: () => ({ data: new Uint8ClampedArray(0) }),
})) as never;

// lottie-web needs canvas context unavailable in jsdom (editor setup)
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: () => ({ destroy: () => {}, addEventListener: () => {} }),
  },
}));
