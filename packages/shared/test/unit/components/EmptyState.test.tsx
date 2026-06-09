import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../../src/components/EmptyState.js';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No Files" description="Upload a file to get started." />, { wrapper });
    expect(screen.getByText('No Files')).toBeInTheDocument();
    expect(screen.getByText('Upload a file to get started.')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(<EmptyState title="No Sessions" action={<button>New Session</button>} />, { wrapper });
    expect(screen.getByText('New Session')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<EmptyState title="No Results" icon={<span data-testid="custom-icon">🔍</span>} />, { wrapper });
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<EmptyState description="Nothing to show" />, { wrapper });
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('applies compact styles', () => {
    const { container } = render(<EmptyState description="No data" compact />, { wrapper });
    expect(container.firstChild).toHaveStyle({ padding: '16px 8px' });
  });
});
