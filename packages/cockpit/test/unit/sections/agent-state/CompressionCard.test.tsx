/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { CompressionCard } from '../../../../src/sections/agent-state/CompressionCard.js';
import type { CompressionData } from '../../../../src/sections/agent-state/types.js';

/** Helper: wrap component with ThemeProvider. */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

/** Helper: create minimal valid CompressionData. */
function createCompression(overrides: Partial<CompressionData> = {}): CompressionData {
  return {
    summary: 'Compressed messages about code review.',
    anchor: 42,
    ...overrides,
  };
}

describe('CompressionCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders "Not compressed" when compression is null', () => {
    renderWithTheme(<CompressionCard compression={null} />);
    expect(screen.getByText('未压缩')).toBeInTheDocument();
  });

  it('renders "Not compressed" when compression is undefined', () => {
    renderWithTheme(<CompressionCard />);
    expect(screen.getByText('未压缩')).toBeInTheDocument();
  });

  it('renders anchor value when compressed', () => {
    renderWithTheme(<CompressionCard compression={createCompression({ anchor: 42 })} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders removed token count with compact formatting', () => {
    renderWithTheme(
      <CompressionCard compression={createCompression({ removedTokenCount: 8200 })} />
    );
    expect(screen.getByText('8.2k')).toBeInTheDocument();
  });

  it('renders summary token count with compact formatting', () => {
    renderWithTheme(
      <CompressionCard compression={createCompression({ summaryTokenCount: 320 })} />
    );
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('renders relative time for compressedAt', () => {
    renderWithTheme(
      <CompressionCard compression={createCompression({ compressedAt: Date.now() - 180_000 })} />
    );
    expect(screen.getByText('3m ago')).toBeInTheDocument();
  });

  it('shows dash for missing optional fields', () => {
    renderWithTheme(
      <CompressionCard
        compression={createCompression({
          removedTokenCount: undefined,
          summaryTokenCount: undefined,
          compressedAt: undefined,
        })}
      />
    );
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('renders summary text directly, click to expand', () => {
    const summary = 'This is a compression summary of old messages.';
    renderWithTheme(<CompressionCard compression={createCompression({ summary })} />);

    // Summary visible immediately (truncated by default)
    const toggle = screen.getByTestId('summary-toggle');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByText(summary)).toBeInTheDocument();

    // Click to expand
    fireEvent.click(toggle);
    expect(screen.getByText(summary)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(toggle);
    expect(screen.getByText(summary)).toBeInTheDocument();
  });

  it('formats large token counts in millions', () => {
    renderWithTheme(
      <CompressionCard compression={createCompression({ removedTokenCount: 2_500_000 })} />
    );
    expect(screen.getByText('2.5M')).toBeInTheDocument();
  });

  it('collapses card body when toggle button is clicked', () => {
    renderWithTheme(<CompressionCard compression={createCompression()} />);

    // Metrics visible
    expect(screen.getByText('42')).toBeInTheDocument();

    // Click collapse toggle
    fireEvent.click(screen.getByTestId('collapse-toggle'));
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
