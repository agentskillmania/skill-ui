/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { AgentSection } from '../../src/components/AgentSection/AgentSection.js';
import type { AgentItem } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockAgents: AgentItem[] = [
  { id: 'agent-1', name: 'Agent One', description: 'First agent', source: 'custom', skillCount: 3 },
  { id: 'agent-2', name: 'Agent Two', description: 'Second agent', source: 'builtin', skillCount: 5 },
];

describe('AgentSection', () => {
  const baseProps = {
    page: 1,
    total: 2,
    onPageChange: vi.fn(),
    onChat: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreate: vi.fn(),
  };

  it('renders section header', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} />, { wrapper });
    expect(screen.getByText('智能体')).toBeInTheDocument();
  });

  it('renders new agent button', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} />, { wrapper });
    expect(screen.getByText('新建智能体')).toBeInTheDocument();
  });

  it('shows empty state when agents array is empty', () => {
    render(<AgentSection agents={[]} {...baseProps} total={0} />, { wrapper });
    expect(screen.getByText('暂无智能体')).toBeInTheDocument();
    expect(screen.queryByText('Agent One')).not.toBeInTheDocument();
  });

  it('renders agent cards when agents exist', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} />, { wrapper });
    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('Agent Two')).toBeInTheDocument();
  });

  it('renders pagination when total > pageSize', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} total={24} pageSize={12} />, { wrapper });
    expect(screen.getByTitle('2')).toBeInTheDocument();
  });

  it('does not render pagination when total <= pageSize', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} total={12} pageSize={12} />, { wrapper });
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });

  it('calls onPageChange when pagination changes', () => {
    const onPageChange = vi.fn();
    render(
      <AgentSection agents={mockAgents} {...baseProps} total={24} pageSize={12} onPageChange={onPageChange} />,
      { wrapper },
    );
    // Click the <a> element inside the pagination item (native click needed for antd)
    const pageLink = document.querySelector('.ant-pagination-item-2 a') as HTMLElement;
    expect(pageLink).toBeTruthy();
    pageLink.click();
    expect(onPageChange).toHaveBeenCalledWith(2, 12);
  });

  it('calls onChat with agent id when chat button clicked', () => {
    const onChat = vi.fn();
    render(<AgentSection agents={[mockAgents[0]]} {...baseProps} total={1} onChat={onChat} />, { wrapper });
    fireEvent.click(screen.getByText('对话'));
    expect(onChat).toHaveBeenCalledWith('agent-1');
  });

  it('calls onEdit with agent id when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<AgentSection agents={[mockAgents[0]]} {...baseProps} total={1} onEdit={onEdit} />, { wrapper });
    fireEvent.click(screen.getByText('编辑'));
    expect(onEdit).toHaveBeenCalledWith('agent-1');
  });

  it('calls onDelete with agent id when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(<AgentSection agents={[mockAgents[0]]} {...baseProps} total={1} onDelete={onDelete} />, { wrapper });

    // Use native click to trigger Popconfirm
    const deleteBtn = document.querySelector('.ant-btn-dangerous') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledWith('agent-1');
  });

  it('opens modal when new agent button is clicked', async () => {
    render(<AgentSection agents={mockAgents} {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByText('新建智能体'));
    expect(await screen.findByPlaceholderText('请输入名称')).toBeInTheDocument();
  });

  it('calls onCreate with name when modal is submitted', async () => {
    const onCreate = vi.fn();
    render(<AgentSection agents={mockAgents} {...baseProps} onCreate={onCreate} />, { wrapper });

    // Open modal
    fireEvent.click(screen.getByText('新建智能体'));

    // Fill name
    const input = await screen.findByPlaceholderText('请输入名称');
    fireEvent.change(input, { target: { value: 'My New Agent' } });

    // Click the primary button in modal footer to submit
    const createBtn = document.querySelector('.ant-modal-wrap .ant-btn-primary') as HTMLElement;
    expect(createBtn).toBeTruthy();
    createBtn.click();

    // Wait for async form validation
    await new Promise((r) => setTimeout(r, 50));
    expect(onCreate).toHaveBeenCalledWith('My New Agent');
  });

  it('closes modal when cancel is clicked', async () => {
    const onCreate = vi.fn();
    render(<AgentSection agents={mockAgents} {...baseProps} onCreate={onCreate} />, { wrapper });

    // Open modal
    fireEvent.click(screen.getByText('新建智能体'));
    await screen.findByPlaceholderText('请输入名称');

    // Click cancel button inside modal footer
    const cancelBtn = document.querySelector('.ant-modal-wrap .ant-btn:not(.ant-btn-primary)') as HTMLElement;
    if (cancelBtn) {
      cancelBtn.click();
    }

    await new Promise((r) => setTimeout(r, 50));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('supports custom pageSize', () => {
    render(<AgentSection agents={mockAgents} {...baseProps} total={5} pageSize={5} />, { wrapper });
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });
});
