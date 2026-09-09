import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownConfigContext } from '../../src/content/markdownConfig.js';
import { MarkdownRenderer } from '../../src/content/MarkdownRenderer.js';
import { ChatWrapper } from './testUtils.js';

/** Wrap with a markdown config — the same channel Chat uses via
 * ChatProps.markdownConfig. */
function MarkdownConfigWrapper({
  config,
  children,
}: {
  config: Parameters<typeof MarkdownConfigContext.Provider>[0]['value'];
  children: React.ReactNode;
}) {
  return (
    <ChatWrapper>
      <MarkdownConfigContext.Provider value={config}>{children}</MarkdownConfigContext.Provider>
    </ChatWrapper>
  );
}

describe('markdownConfig context (onLinkClick)', () => {
  it('renders links unchanged when no config is provided', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'see [docs](https://example.com/a)'}</MarkdownRenderer>
      </ChatWrapper>
    );
    const anchor = container.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('https://example.com/a');
  });

  it('intercepts link clicks via the delegated root listener', () => {
    const onLinkClick = vi.fn(() => true);
    const { container } = render(
      <MarkdownConfigWrapper config={{ onLinkClick }}>
        <MarkdownRenderer>{'see [docs](https://example.com/a)'}</MarkdownRenderer>
      </MarkdownConfigWrapper>
    );
    fireEvent.click(container.querySelector('a')!);
    expect(onLinkClick).toHaveBeenCalledWith('https://example.com/a', expect.anything());
  });

  it('falls through to the default when the handler returns false', () => {
    const onLinkClick = vi.fn(() => false);
    const { container } = render(
      <MarkdownConfigWrapper config={{ onLinkClick }}>
        <MarkdownRenderer>{'see [docs](https://example.com/a)'}</MarkdownRenderer>
      </MarkdownConfigWrapper>
    );
    const click = fireEvent.click(container.querySelector('a')!);
    // jsdom reports whether preventDefault ran (via the event's defaultPrevented)
    expect(click).toBe(true);
    expect(onLinkClick).toHaveBeenCalled();
  });
});

describe('markdownConfig context (linkCard)', () => {
  it('takes over a standalone link paragraph and keeps inline links untouched', () => {
    const linkCard = vi.fn(({ href, text }: { href: string; text: string }) => (
      <span data-testid="file-card">{`${text}→${href}`}</span>
    ));
    const { container } = render(
      <MarkdownConfigWrapper config={{ linkCard }}>
        <MarkdownRenderer>
          {'A citation in [prose](https://example.com) first.\n\n[report](output/report.md)'}
        </MarkdownRenderer>
      </MarkdownConfigWrapper>
    );
    // Standalone link → host card
    expect(screen.getByTestId('file-card').textContent).toBe('report→output/report.md');
    // Inline link stays a plain anchor
    const anchors = container.querySelectorAll('a');
    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute('href')).toBe('https://example.com');
  });

  it('null from linkCard falls back to the default anchor', () => {
    const { container } = render(
      <MarkdownConfigWrapper config={{ linkCard: () => null }}>
        <MarkdownRenderer>{'[report](output/report.md)'}</MarkdownRenderer>
      </MarkdownConfigWrapper>
    );
    const anchor = container.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('output/report.md');
  });
});

describe('markdownConfig context (dompurify defaults)', () => {
  it('keeps file: hrefs alive by default (kit default extends the URI allowlist)', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'[note](file:///tmp/report.md)'}</MarkdownRenderer>
      </ChatWrapper>
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('file:///tmp/report.md');
  });

  it('keeps relative hrefs alive by default', () => {
    const { container } = render(
      <ChatWrapper>
        <MarkdownRenderer>{'[report](output/report.md)'}</MarkdownRenderer>
      </ChatWrapper>
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe('output/report.md');
  });

  it('host config can override the URI regexp (stricter than the default)', () => {
    const { container } = render(
      <MarkdownConfigWrapper
        config={{ dompurifyConfig: { ALLOWED_URI_REGEXP: /^(https?:|[^a-z])/i } }}
      >
        <MarkdownRenderer>{'[note](file:///tmp/report.md)'}</MarkdownRenderer>
      </MarkdownConfigWrapper>
    );
    // With file: disallowed again, the href is stripped by DOMPurify
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBeNull();
  });
});
