import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { MetricTile } from '../../../src/components/MetricTile.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('MetricTile', () => {
  it('renders title and numeric value', () => {
    render(<MetricTile title="Steps" value={42} />, { wrapper });
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<MetricTile title="Tokens" value="3.4k" />, { wrapper });
    expect(screen.getByText('3.4k')).toBeInTheDocument();
  });

  it('applies valueStyle to statistic', () => {
    render(<MetricTile title="Removed" value={100} valueStyle={{ color: 'rgb(255, 0, 0)' }} />, {
      wrapper,
    });
    const valueEl = screen.getByText('100');
    expect(valueEl.closest('.ant-statistic-content')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders tile background via emotion', () => {
    const { container } = render(<MetricTile title="Count" value={5} />, { wrapper });
    const tile = container.firstChild as HTMLElement;
    expect(tile).toHaveStyle({ textAlign: 'center' });
  });
});
