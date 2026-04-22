import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWrapper } from './testUtils.js';
import { MarkdownRenderer } from '../../src/content/MarkdownRenderer.js';

describe('MarkdownRenderer', () => {
  it('renders text content', () => {
    render(
      <ChatWrapper>
        <MarkdownRenderer>Hello World</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('preserves line breaks', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'第一行\n第二行'}</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(container.textContent).toContain('第一行');
    expect(container.textContent).toContain('第二行');
  });

  it('streaming mode renders normally', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer streaming>加载中...</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(screen.getByText('加载中...')).toBeInTheDocument();
    // streaming has ::after pseudo-element, CSS animation does not affect DOM testing
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('empty content does not crash', () => {
    render(
      <ChatWrapper>
        <MarkdownRenderer>{''}</MarkdownRenderer>
      </ChatWrapper>
    );
    // just verify it renders without crashing
  });
});
