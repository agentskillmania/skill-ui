import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../../../src/components/SectionHeader.js';
import { Cpu } from 'lucide-react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('SectionHeader', () => {
  it('renders icon and title', () => {
    render(<SectionHeader icon={Cpu} title="Agent State" />, { wrapper });
    expect(screen.getByText('AGENT STATE')).toBeInTheDocument();
  });

  it('renders extra content when provided', () => {
    render(<SectionHeader icon={Cpu} title="Skills" extra={<span>3 active</span>} />, { wrapper });
    expect(screen.getByText('3 active')).toBeInTheDocument();
  });

  it('does not render extra element when not provided', () => {
    const { container } = render(<SectionHeader icon={Cpu} title="Tools" />, { wrapper });
    expect(container.querySelector('[data-testid="section-extra"]')).toBeNull();
  });
});
