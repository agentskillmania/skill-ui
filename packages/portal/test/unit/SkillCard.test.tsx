/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SkillCard } from '../../src/components/SkillCard/SkillCard.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

const mockSkill = {
  id: 'skill-1',
  name: 'Web Search',
  description: 'Search the web',
};

describe('SkillCard', () => {
  it('renders skill name and description', () => {
    render(<SkillCard skill={mockSkill} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('Search the web')).toBeInTheDocument();
  });

  it('calls onChat when chat button clicked', () => {
    const onChat = vi.fn();
    render(<SkillCard skill={mockSkill} onChat={onChat} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('对话'));
    expect(onChat).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<SkillCard skill={mockSkill} onChat={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />, {
      wrapper,
    });
    fireEvent.click(screen.getByText('编辑'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn();
    render(<SkillCard skill={mockSkill} onChat={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />, {
      wrapper,
    });

    // Use native click to trigger Popconfirm
    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    // Confirm the popconfirm with fuzzy text match
    const confirmBtn = await screen.findByText((content) => content.replace(/\s+/g, '') === '删除');
    confirmBtn.click();

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders with undefined description', () => {
    const skillNoDesc = { ...mockSkill, description: undefined };
    render(<SkillCard skill={skillNoDesc} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
  });

  it('handles mouse enter and leave events', () => {
    const { container } = render(
      <SkillCard skill={mockSkill} onChat={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper }
    );
    const card = container.querySelector('.ant-card');
    expect(card).toBeTruthy();

    // Trigger mouse enter to set hovered state
    fireEvent.mouseEnter(card!);

    // Trigger mouse leave
    fireEvent.mouseLeave(card!);
  });
});
