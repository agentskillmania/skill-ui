/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighlightText } from '../../src/components/shared/HighlightText.js';

describe('HighlightText', () => {
  it('renders plain text when no query is provided', () => {
    render(<HighlightText text="Hello World" query="" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders plain text when query is empty string', () => {
    render(<HighlightText text="Hello World" query="" />);
    // No <mark> elements should be present
    expect(document.querySelector('mark')).toBeNull();
  });

  it('highlights matching portion of text', () => {
    render(<HighlightText text="Hello World" query="World" />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0]).toHaveTextContent('World');
  });

  it('highlights case-insensitively', () => {
    render(<HighlightText text="Hello World" query="world" />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0]).toHaveTextContent('World');
  });

  it('highlights multiple occurrences', () => {
    render(<HighlightText text="test test test" query="test" />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(3);
  });

  it('renders text segments around highlighted parts', () => {
    const { container } = render(<HighlightText text="Hello World" query="World" />);
    // Should have text before and the highlighted part
    expect(container.textContent).toBe('Hello World');
  });

  it('escapes regex special characters in query', () => {
    render(<HighlightText text="price is $10.00" query="$10.00" />);
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0]).toHaveTextContent('$10.00');
  });

  it('does not highlight when query does not match', () => {
    render(<HighlightText text="Hello World" query="xyz" />);
    expect(document.querySelector('mark')).toBeNull();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
