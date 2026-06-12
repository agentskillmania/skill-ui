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

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(<AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />, {
      wrapper,
    });

    // Use native click to trigger Popconfirm (fireEvent.click doesn't work for antd Popconfirm)
    const deleteBtn = document.querySelector('.ant-btn-dangerous') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    // Confirm the popconfirm with fuzzy text match (antd may render with character spacing)
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows custom source tag', () => {
    render(<AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('自定义')).toBeInTheDocument();
  });

  it('shows builtin source tag', () => {
    const builtinAgent = { ...mockAgent, source: 'builtin' as const };
    render(<AgentCard agent={builtinAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('内置')).toBeInTheDocument();
  });

  it('shows skill count', () => {
    render(<AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('2 个技能')).toBeInTheDocument();
  });

  it('renders with undefined description', () => {
    const agentNoDesc = { ...mockAgent, description: undefined };
    render(<AgentCard agent={agentNoDesc} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('handles mouse enter and leave events', () => {
    const { container } = render(
      <AgentCard agent={mockAgent} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper },
    );
    const card = container.querySelector('.ant-card');
    expect(card).toBeTruthy();

    // Trigger mouse enter
    fireEvent.mouseEnter(card!);
    // The delete button should become visible (opacity 1)
    // In jsdom we can't check computed styles, but we can verify no error is thrown

    // Trigger mouse leave
    fireEvent.mouseLeave(card!);
  });
});
