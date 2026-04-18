import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MarkdownRenderer } from '../../src/content/MarkdownRenderer.js';

describe('MarkdownRenderer', () => {
  it('渲染文本内容', () => {
    render(
      <ChatWrapper>
        <MarkdownRenderer>Hello World</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('保留换行', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'第一行\n第二行'}</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(container.textContent).toContain('第一行');
    expect(container.textContent).toContain('第二行');
  });

  it('streaming 模式正常渲染', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer streaming>加载中...</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
    // streaming 有 ::after 伪元素，CSS 动画不影响 DOM 测试
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('空内容不崩溃', () => {
    render(
      <ChatWrapper>
        <MarkdownRenderer>{''}</MarkdownRenderer>
      </ChatWrapper>
    );
    // 渲染不崩溃即可
  });
});
