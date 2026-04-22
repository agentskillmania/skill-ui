/** @jsxImportSource @emotion/react */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '@agentskillmania/skill-ui-theme';
import { AppBrand } from '../../src/components/AppBrand/AppBrand.js';
import { Zap } from 'lucide-react';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('AppBrand', () => {
  it('displays "Skill Studio" by default', () => {
    render(<AppBrand />, { wrapper });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('custom title splits words correctly', () => {
    render(<AppBrand title="Agent IDE" />, { wrapper });
    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('IDE')).toBeInTheDocument();
  });

  it('single word does not render second part', () => {
    render(<AppBrand title="Studio" />, { wrapper });
    expect(screen.getByText('Studio')).toBeInTheDocument();
    // should not have primary color span
    const container = screen.getByText('Studio').parentElement!;
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(1);
  });

  it('last two words merge when there are three words', () => {
    render(<AppBrand title="My App Name" />, { wrapper });
    expect(screen.getByText('My')).toBeInTheDocument();
    expect(screen.getByText('App Name')).toBeInTheDocument();
  });

  it('renders icon when passed', () => {
    const { container } = render(<AppBrand icon={<Zap size={16} data-testid="icon" />} />, {
      wrapper,
    });
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument();
  });

  it('does not render icon container when not passed', () => {
    const { container } = render(<AppBrand />, { wrapper });
    // icon container has width: 18px inline style
    const iconContainer = container.querySelector('div > div:first-child');
    // only root div, should not have icon child div
    const root = container.firstChild as HTMLElement;
    expect(root.children).toHaveLength(1); // 只有文字 span
  });
});
