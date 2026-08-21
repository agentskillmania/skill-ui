/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SkillSection } from '../../src/components/SkillSection/SkillSection.js';
import type { SkillItem } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockSkills: SkillItem[] = [
  { id: 'skill-1', name: 'Web Search', description: 'Search the web' },
  { id: 'skill-2', name: 'Code Review', description: 'Review code changes' },
];

describe('SkillSection', () => {
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
    render(<SkillSection skills={mockSkills} {...baseProps} />, { wrapper });
    expect(screen.getByText('技能')).toBeInTheDocument();
  });

  it('renders new skill button', () => {
    render(<SkillSection skills={mockSkills} {...baseProps} />, { wrapper });
    expect(screen.getByText('新建技能')).toBeInTheDocument();
  });

  it('shows empty state when skills array is empty', () => {
    render(<SkillSection skills={[]} {...baseProps} total={0} />, { wrapper });
    expect(screen.getByText('暂无技能')).toBeInTheDocument();
    expect(screen.queryByText('Web Search')).not.toBeInTheDocument();
  });

  it('renders skill cards when skills exist', () => {
    render(<SkillSection skills={mockSkills} {...baseProps} />, { wrapper });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('Code Review')).toBeInTheDocument();
  });

  it('renders pagination when total > pageSize', () => {
    render(<SkillSection skills={mockSkills} {...baseProps} total={24} pageSize={12} />, {
      wrapper,
    });
    expect(screen.getByTitle('2')).toBeInTheDocument();
  });

  it('does not render pagination when total <= pageSize', () => {
    render(<SkillSection skills={mockSkills} {...baseProps} total={12} pageSize={12} />, {
      wrapper,
    });
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });

  it('calls onPageChange when pagination changes', () => {
    const onPageChange = vi.fn();
    render(
      <SkillSection
        skills={mockSkills}
        {...baseProps}
        total={24}
        pageSize={12}
        onPageChange={onPageChange}
      />,
      { wrapper }
    );
    // Click the <a> element inside the pagination item (native click needed for antd)
    fireEvent.click(screen.getByTitle('2'));
    expect(onPageChange).toHaveBeenCalledWith(2, 12);
  });

  it('calls onChat with skill id when chat button clicked', () => {
    const onChat = vi.fn();
    render(<SkillSection skills={[mockSkills[0]]} {...baseProps} total={1} onChat={onChat} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('对话'));
    expect(onChat).toHaveBeenCalledWith('skill-1');
  });

  it('calls onEdit with skill id when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<SkillSection skills={[mockSkills[0]]} {...baseProps} total={1} onEdit={onEdit} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('编辑'));
    expect(onEdit).toHaveBeenCalledWith('skill-1');
  });

  it('calls onDelete with skill id when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(<SkillSection skills={[mockSkills[0]]} {...baseProps} total={1} onDelete={onDelete} />, {
      wrapper,
    });

    // Use native click to trigger Popconfirm
    const deleteBtn = document.querySelector('.ant-btn-dangerous') as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    deleteBtn.click();

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledWith('skill-1');
  });

  it('opens modal when new skill button is clicked', async () => {
    render(<SkillSection skills={mockSkills} {...baseProps} />, { wrapper });
    fireEvent.click(screen.getByText('新建技能'));
    expect(await screen.findByPlaceholderText('请输入名称')).toBeInTheDocument();
  });

  it('calls onCreate with name when modal is submitted', async () => {
    const onCreate = vi.fn();
    render(<SkillSection skills={mockSkills} {...baseProps} onCreate={onCreate} />, { wrapper });

    // Open modal
    fireEvent.click(screen.getByText('新建技能'));

    // Fill name
    const input = await screen.findByPlaceholderText('请输入名称');
    fireEvent.change(input, { target: { value: 'My New Skill' } });

    // Click the primary button in modal footer to submit
    const createBtn = document.querySelector('.ant-modal-wrap .ant-btn-primary') as HTMLElement;
    expect(createBtn).toBeTruthy();
    createBtn.click();

    // Wait for async form validation
    await new Promise((r) => setTimeout(r, 50));
    expect(onCreate).toHaveBeenCalledWith('My New Skill');
  });

  it('closes modal when cancel is clicked', async () => {
    const onCreate = vi.fn();
    render(<SkillSection skills={mockSkills} {...baseProps} onCreate={onCreate} />, { wrapper });

    // Open modal
    fireEvent.click(screen.getByText('新建技能'));
    await screen.findByPlaceholderText('请输入名称');

    // Click cancel button inside modal footer
    const cancelBtn = document.querySelector(
      '.ant-modal-wrap .ant-btn:not(.ant-btn-primary)'
    ) as HTMLElement;
    if (cancelBtn) {
      cancelBtn.click();
    }

    await new Promise((r) => setTimeout(r, 50));
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('supports custom pageSize', () => {
    render(<SkillSection skills={mockSkills} {...baseProps} total={5} pageSize={5} />, { wrapper });
    expect(screen.queryByTitle('2')).not.toBeInTheDocument();
  });
});
