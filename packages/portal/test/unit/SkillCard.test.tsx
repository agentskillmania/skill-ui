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
});
