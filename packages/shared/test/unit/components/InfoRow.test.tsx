import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, lightTheme } from '@agentskillmania/skill-ui-theme';
import { InfoRow } from '../../../src/components/InfoRow.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>;
}

describe('InfoRow', () => {
  it('renders label and children', () => {
    render(
      <InfoRow label="Session ID" text="abc-123">
        abc-123
      </InfoRow>,
      { wrapper }
    );
    expect(screen.getByText('Session ID')).toBeInTheDocument();
    expect(screen.getByText('abc-123')).toBeInTheDocument();
  });

  it('renders as flex row with justify-between', () => {
    const { container } = render(
      <InfoRow label="Model" text="gpt-4">
        gpt-4
      </InfoRow>,
      { wrapper }
    );
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveStyle({ display: 'flex' });
  });
});
