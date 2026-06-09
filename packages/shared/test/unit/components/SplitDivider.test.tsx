import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { SplitDivider } from '../../../src/components/SplitDivider.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

/** Renders SplitDivider with a mock sidebar sibling for drag simulation. */
function renderWithSidebar(onResize: ReturnType<typeof vi.fn>, disabled = false) {
  return render(
    <div data-testid="flex-container" style={{ display: 'flex' }}>
      <SplitDivider onResize={onResize} disabled={disabled} minWidth={100} maxWidth={600} />
      <div data-testid="sidebar" style={{ width: '380px' }} />
    </div>,
    { wrapper },
  );
}

/** Gets the actual divider element (first child of flex container). */
function getDividerElement(container: HTMLElement): HTMLElement {
  const flexContainer = container.firstChild as HTMLElement;
  return flexContainer.firstChild as HTMLElement;
}

describe('SplitDivider', () => {
  it('renders a 4px wide divider', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ width: '4px' });
  });

  it('shows col-resize cursor when enabled', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ cursor: 'col-resize' });
  });

  it('shows default cursor when disabled', () => {
    const { container } = render(<SplitDivider onResize={vi.fn()} disabled />, { wrapper });
    const divider = container.firstChild as HTMLElement;
    expect(divider).toHaveStyle({ cursor: 'default' });
  });

  it('does not start drag when disabled', () => {
    const onResize = vi.fn();
    const { container } = renderWithSidebar(onResize, true);
    const divider = getDividerElement(container);

    fireEvent.mouseDown(divider, { clientX: 100 });
    expect(document.body.style.cursor).toBe('');
    expect(onResize).not.toHaveBeenCalled();
  });

  it('handles drag interaction: mousedown, mousemove, mouseup', () => {
    const onResize = vi.fn();
    const { container } = renderWithSidebar(onResize);
    const divider = getDividerElement(container);

    // Start drag
    fireEvent.mouseDown(divider, { clientX: 200 });
    expect(document.body.style.cursor).toBe('col-resize');

    // Drag left (increases sidebar width since delta = startX - clientX)
    fireEvent.mouseMove(document, { clientX: 150 });

    // End drag
    fireEvent.mouseUp(document);

    expect(onResize).toHaveBeenCalled();
    expect(document.body.style.cursor).toBe('');
  });

  it('does nothing when mousedown has no sidebar sibling', () => {
    const onResize = vi.fn();
    const { container } = render(<SplitDivider onResize={onResize} />, { wrapper });
    const divider = container.firstChild as HTMLElement;

    fireEvent.mouseDown(divider, { clientX: 100 });
    // No sidebar sibling — cursor should not be set
    expect(document.body.style.cursor).toBe('');
    expect(onResize).not.toHaveBeenCalled();
  });

  it('clamps width to minWidth during drag', () => {
    const onResize = vi.fn();
    const { container } = renderWithSidebar(onResize);
    const divider = getDividerElement(container);
    const sidebar = screen.getByTestId('sidebar');

    // Start drag
    fireEvent.mouseDown(divider, { clientX: 200 });

    // Drag far right — reduces sidebar width, clamped to minWidth (100)
    fireEvent.mouseMove(document, { clientX: 9999 });

    // Verify inline style is clamped to minWidth (jsdom offsetWidth is 0)
    expect(sidebar.style.width).toBe('100px');

    fireEvent.mouseUp(document);
    expect(onResize).toHaveBeenCalled();
  });

  it('clamps width to maxWidth during drag', () => {
    const onResize = vi.fn();
    const { container } = renderWithSidebar(onResize);
    const divider = getDividerElement(container);
    const sidebar = screen.getByTestId('sidebar');

    // Start drag
    fireEvent.mouseDown(divider, { clientX: 200 });

    // Drag far left — increases sidebar width, clamped to maxWidth (600)
    fireEvent.mouseMove(document, { clientX: -9999 });

    // Verify inline style is clamped to maxWidth
    expect(sidebar.style.width).toBe('600px');

    fireEvent.mouseUp(document);
    expect(onResize).toHaveBeenCalled();
  });
});
