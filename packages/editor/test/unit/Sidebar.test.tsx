/** @jsxImportSource @emotion/react */
import { beforeAll, vi } from 'vitest';
import { describe, it, expect } from 'vitest';

// jsdom 没有 ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock chat 组件
vi.mock('@agentskillmania/skill-ui-chat', () => ({
  MessageList: () => <div data-testid="message-list" />,
  ChatInput: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { Sidebar } from '../../src/components/Sidebar/Sidebar.js';
import type { SkillFile, ReviewResult } from '../../src/types.js';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const sampleFiles: SkillFile[] = [
  { path: 'SKILL.md', content: '# Skill' },
  { path: 'package.json', content: '{}' },
];

const sampleReview: ReviewResult = {
  score: 90,
  items: [{ status: 'pass', label: '结构完整' }],
};

describe('Sidebar', () => {
  it('面板收起时只显示 ActivityBar', () => {
    renderWithTheme(
      <Sidebar
        activePanel={null}
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    // ActivityBar 图标应存在
    expect(screen.getByTitle('文件')).toBeTruthy();
    // 不应有文件树内容
    expect(screen.queryByText('SKILL.md')).toBeNull();
  });

  it('展开文件面板显示 FileTree', () => {
    renderWithTheme(
      <Sidebar
        activePanel="files"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('SKILL.md')).toBeTruthy();
  });

  it('展开审核面板显示 ReviewPanel', () => {
    renderWithTheme(
      <Sidebar
        activePanel="review"
        files={sampleFiles}
        reviewResult={sampleReview}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('90')).toBeTruthy();
    expect(screen.getByText('结构完整')).toBeTruthy();
  });

  it('展开测试面板显示 TestCase', () => {
    renderWithTheme(
      <Sidebar
        activePanel="test"
        files={sampleFiles}
        testCases={[{ id: 'tc1', name: '测试1', input: 'hi' }]}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('测试1')).toBeTruthy();
  });

  it('点击 ActivityBar 图标触发面板切换', () => {
    const onPanel = vi.fn();
    renderWithTheme(
      <Sidebar
        activePanel={null}
        files={sampleFiles}
        onPanelChange={onPanel}
        onFileSelect={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTitle('文件'));
    expect(onPanel).toHaveBeenCalledWith('files');
  });

  it('展开助手面板显示 AssistantPanel', () => {
    renderWithTheme(
      <Sidebar
        activePanel="assistant"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    // AssistantPanel 应显示输入框占位文本
    expect(screen.getByText('向助手提问...')).toBeTruthy();
  });
});
