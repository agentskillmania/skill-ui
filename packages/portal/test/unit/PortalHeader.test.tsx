/**
 * PortalHeader tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { PortalHeader } from '../../src/components/PortalHeader/PortalHeader.js';
import type { SearchResults } from '../../src/types.js';

// Wrapper component for theme context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// Mock search results
const mockResults: SearchResults = {
  agents: [],
  skills: [
    { id: 'skill-1', title: 'Test Skill', subtitle: 'A test skill' },
  ],
  sessions: [],
};

describe('PortalHeader', () => {
  it('renders search input', () => {
    render(
      <TestWrapper>
        <PortalHeader
          query=""
          onQueryChange={() => {}}
          results={mockResults}
          onSearch={() => {}}
          onSelect={() => {}}
          onEdit={() => {}}
        />
      </TestWrapper>
    );
    expect(screen.getByPlaceholderText('搜索技能、智能体或会话记录…')).toBeInTheDocument();
  });

  it('displays controlled query value', () => {
    render(
      <TestWrapper>
        <PortalHeader
          query="test query"
          onQueryChange={() => {}}
          results={mockResults}
          onSearch={() => {}}
          onSelect={() => {}}
          onEdit={() => {}}
        />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('calls onQueryChange when input changes', () => {
    const onQueryChange = vi.fn();
    render(
      <TestWrapper>
        <PortalHeader
          query=""
          onQueryChange={onQueryChange}
          results={mockResults}
          onSearch={() => {}}
          onSelect={() => {}}
          onEdit={() => {}}
        />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.change(input, { target: { value: 'new query' } });
    expect(onQueryChange).toHaveBeenCalledWith('new query');
  });

  it('calls onSearch when Enter is pressed', () => {
    const onSearch = vi.fn();
    render(
      <TestWrapper>
        <PortalHeader
          query="search term"
          onQueryChange={() => {}}
          results={mockResults}
          onSearch={onSearch}
          onSelect={() => {}}
          onEdit={() => {}}
        />
      </TestWrapper>
    );
    const input = screen.getByPlaceholderText('搜索技能、智能体或会话记录…');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('search term');
  });
});
