/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { CodeEditor } from '../../src/editor-area/CodeEditor.js';

// 本文件专测引擎 import 失败分支:factory 抛错 → 动态 import 拒绝 → 错误降级 UI。
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: () => null,
  loader: { config: vi.fn() },
}));

vi.mock('monaco-editor', () => {
  throw new Error('monaco unavailable');
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

describe('CodeEditor engine load failure', () => {
  it('renders the error fallback instead of crashing', async () => {
    render(<CodeEditor content="x" filePath="a.ts" onChange={() => {}} />, { wrapper });
    // mock 工厂抛错 → 动态 import 拒绝 → 错误降级 UI(文案为 zh-CN 翻译,
    // 与错误串同节点渲染,需子串匹配)
    expect(await screen.findByText('编辑器加载失败', { exact: false })).toBeInTheDocument();
  });
});
