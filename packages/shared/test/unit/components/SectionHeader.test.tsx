import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../../../src/components/SectionHeader.js';
import { Cpu } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SectionHeader', () => {
  it('renders icon and title as plain text', () => {
    render(<SectionHeader icon={Cpu} title="Agent State" />, { wrapper });
    // Title rendered as-is; CSS text-transform handles uppercase
    expect(screen.getByText('Agent State')).toBeInTheDocument();
  });

  it('renders extra content when provided', () => {
    render(<SectionHeader icon={Cpu} title="Skills" extra={<span>3 active</span>} />, { wrapper });
    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('does not render extra element when not provided', () => {
    const { container } = render(<SectionHeader icon={Cpu} title="Tools" />, { wrapper });
    expect(container.querySelector('[data-testid="section-extra"]')).toBeNull();
  });

  it('renders a divider line extending right from the title', () => {
    const { container } = render(<SectionHeader icon={Cpu} title="Test" />, { wrapper });
    // Find the divider: a div inside the header that has height: 1px and flex: 1
    const headerDiv = container.firstChild as HTMLElement;
    const children = Array.from(headerDiv.children);
    // The divider is the div with flex: 1 (not the icon SVG, not the text node, not the span)
    const divider = children.find(
      (el) => el.tagName === 'DIV' && el.textContent === '',
    );
    expect(divider).toBeTruthy();
  });
});
