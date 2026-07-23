/** @jsxImportSource @emotion/react */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { ConfigProvider } from 'antd';
import { lightTheme, lightAntdConfig } from '@agentskillmania/skill-ui-theme';
import { SearchResultItem } from '../../src/components/SearchResultItem/index.js';
import type { SearchResultItemData } from '../../src/types.js';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdConfig}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </ConfigProvider>
  );
}

describe('SearchResultItem', () => {
  const skillItem: SearchResultItemData = {
    type: 'skill',
    id: 'skill-1',
    title: 'Web Search',
    subtitle: 'Search the web',
  };

  it('renders skill title and subtitle', () => {
    render(<SearchResultItem item={skillItem} query="" />, { wrapper });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.getByText('Search the web')).toBeInTheDocument();
  });

  it('renders item without subtitle', () => {
    const itemNoSub = { ...skillItem, subtitle: undefined };
    render(<SearchResultItem item={itemNoSub} query="" />, { wrapper });
    expect(screen.getByText('Web Search')).toBeInTheDocument();
    expect(screen.queryByText('Search the web')).not.toBeInTheDocument();
  });

  it('renders agent type item', () => {
    const agentItem: SearchResultItemData = {
      type: 'agent',
      id: 'agent-1',
      title: 'Code Reviewer',
    };
    render(<SearchResultItem item={agentItem} query="" />, { wrapper });
    expect(screen.getByText('Code Reviewer')).toBeInTheDocument();
  });

  it('renders session type item', () => {
    const sessionItem: SearchResultItemData = {
      type: 'session',
      id: 'session-1',
      title: 'Session One',
    };
    render(<SearchResultItem item={sessionItem} query="" />, { wrapper });
    expect(screen.getByText('Session One')).toBeInTheDocument();
  });

  it('highlights title with query', () => {
    render(<SearchResultItem item={skillItem} query="Web" />, { wrapper });
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0]).toHaveTextContent('Web');
  });

  it('shows edit button when onEdit is provided for skill type', () => {
    const onEdit = vi.fn();
    render(<SearchResultItem item={skillItem} query="" onEdit={onEdit} />, { wrapper });
    const editBtn = document.querySelector('.lucide-pencil')?.closest('button');
    expect(editBtn).toBeTruthy();
    fireEvent.click(editBtn!);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows delete button when onEdit is provided for session type', () => {
    const onEdit = vi.fn();
    const sessionItem: SearchResultItemData = {
      type: 'session',
      id: 'session-1',
      title: 'Session One',
    };
    render(<SearchResultItem item={sessionItem} query="" onEdit={onEdit} />, { wrapper });
    const deleteBtn = document.querySelector('.lucide-trash-2')?.closest('button');
    // Note: Trash2 might render with class lucide-trash-2 or lucide-trash2 depending on version
    const btn = document.querySelector('.lucide-trash-2')?.closest('button')
      || document.querySelector('.lucide-trash2')?.closest('button');
    expect(btn).toBeTruthy();
    btn?.click();
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not show edit button when onEdit is not provided', () => {
    render(<SearchResultItem item={skillItem} query="" />, { wrapper });
    expect(document.querySelector('.ant-btn')).toBeNull();
  });

  it('stops event propagation when edit button is clicked', () => {
    const onEdit = vi.fn();
    const parentClick = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onClick={parentClick}>
        <SearchResultItem item={skillItem} query="" onEdit={onEdit} />
      </div>,
      { wrapper },
    );
    const editBtn = document.querySelector('.lucide-pencil')?.closest('button');
    expect(editBtn).toBeTruthy();
    fireEvent.click(editBtn!);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });
});
