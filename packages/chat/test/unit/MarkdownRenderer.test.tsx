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

  it('empty content renders wrapper with no visible text', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{''}</MarkdownRenderer>
      </ChatWrapper>
    );
    // The outer div wrapper should exist
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    // XMarkdown may render an empty div or whitespace, but no meaningful text
    expect(wrapper.textContent?.trim()).toBe('');
  });

  it('renders inline code as <code> element', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'Use `console.log` to debug'}</MarkdownRenderer>
      </ChatWrapper>
    );
    const codeEl = container.querySelector('code');
    expect(codeEl).toBeInTheDocument();
    expect(codeEl?.textContent).toBe('console.log');
  });

  it('renders fenced code block', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'```ts\nconst x = 1;\n```'}</MarkdownRenderer>
      </ChatWrapper>
    );
    // Fenced code block renders inside <pre><code> with language class
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toContain('const x = 1;');
  });

  it('renders code block without language as plain code', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'```\nsome output\n```'}</MarkdownRenderer>
      </ChatWrapper>
    );
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    // Content must be visible — never silently disappears
    expect(pre?.textContent).toContain('some output');
  });
});
