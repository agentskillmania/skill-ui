/** @jsxImportSource @emotion/react */
import { vi } from 'vitest';
import { describe, it, expect } from 'vitest';

// Mock chat components
vi.mock('@agentskillmania/skill-ui-chat', () => ({
  MessageList: () => <div data-testid="message-list" />,
  ChatInput: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
}));
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './testUtils.js';
import { Sidebar } from '../../src/components/Sidebar/Sidebar.js';
import type { SkillFile, ReviewResult } from '../../src/types.js';

const sampleFiles: SkillFile[] = [
  { path: 'SKILL.md', content: '# Skill' },
  { path: 'package.json', content: '{}' },
];

const sampleReview: ReviewResult = {
  score: 90,
  items: [{ status: 'pass', label: '结构完整' }],
};

describe('Sidebar', () => {
  it('only shows ActivityBar when panel is collapsed', () => {
    renderWithProviders(
      <Sidebar
        activePanel={null}
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    // ActivityBar icons should exist
    expect(screen.getByTitle('文件')).toBeTruthy();
    // Should not have file tree content
    expect(screen.queryByText('SKILL.md')).toBeNull();
  });

  it('expanding file panel shows FileTree', () => {
    renderWithProviders(
      <Sidebar
        activePanel="files"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    expect(screen.getByText('SKILL.md')).toBeTruthy();
  });

  it('expanding review panel shows ReviewPanel', () => {
    renderWithProviders(
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

  it('expanding test panel shows TestCase', () => {
    renderWithProviders(
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

  it('clicking ActivityBar icon triggers panel switch', () => {
    const onPanel = vi.fn();
    renderWithProviders(
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

  it('expanding assistant panel shows AssistantPanel', () => {
    renderWithProviders(
      <Sidebar
        activePanel="assistant"
        files={sampleFiles}
        onPanelChange={vi.fn()}
        onFileSelect={vi.fn()}
      />
    );
    // AssistantPanel should display input placeholder text
    expect(screen.getByText('向助手提问...')).toBeTruthy();
  });
});
