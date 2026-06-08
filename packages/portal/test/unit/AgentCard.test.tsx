/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { AgentCard } from '../../src/components/AgentCard/AgentCard.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockAgent = {
  id: 'agent-1',
  name: 'Test Agent',
  description: 'A test agent',
  source: 'custom' as const,
  skillCount: 2,
};

describe('AgentCard', () => {
  it('renders agent name and description', () => {
    render(<AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent')).toBeInTheDocument();
  });

  it('calls onChat when chat button clicked', () => {
    const onChat = vi.fn();
    render(<AgentCard agent={mockAgent} onChat={onChat} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('对话'));
    expect(onChat).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('编辑'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
