import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkspacePage } from '../../../src/pages/WorkspacePage.js';
import { ThemeWrapper } from '../testUtils.js';
import type { SessionInfo } from '../../../server/types.js';

vi.mock('../../../src/hooks/useChatAgent.js', () => ({
  useChatAgent: vi.fn(),
}));

vi.mock('../../../src/hooks/useCockpitEvents.js', () => ({
  useCockpitEvents: vi.fn(),
}));

vi.mock('../../../src/hooks/useEditor.js', () => ({
  useEditor: vi.fn(),
}));

import { useChatAgent } from '../../../src/hooks/useChatAgent.js';
import { useCockpitEvents } from '../../../src/hooks/useCockpitEvents.js';
import { useEditor } from '../../../src/hooks/useEditor.js';

const mockUseChatAgent = vi.mocked(useChatAgent);
const mockUseCockpitEvents = vi.mocked(useCockpitEvents);
const mockUseEditor = vi.mocked(useEditor);

describe('WorkspacePage', () => {
  const mockSession: SessionInfo = {
    id: 'sess-1',
    workspacePath: '/test/workspace',
    agentPath: undefined,
    createdAt: Date.now(),
  };

  const mockChatReturn = {
    messages: [],
    status: 'idle' as const,
    inputValue: '',
    onInputChange: vi.fn(),
    sendMessage: vi.fn(),
    stop: vi.fn(),
    commands: [],
    respondHumanInput: vi.fn(),
  };

  const mockEditorReturn = {
    files: [],
    activeFilePath: null,
    activeFileContent: '',
    isDirty: false,
    loading: false,
    loadTree: vi.fn(),
    openFile: vi.fn(),
    saveFile: vi.fn(),
    createFile: vi.fn(),
    deleteFile: vi.fn(),
    updateContent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChatAgent.mockReturnValue(mockChatReturn);
    mockUseCockpitEvents.mockReturnValue({
      events: [],
      agentState: null,
      clearEvents: vi.fn(),
    });
    mockUseEditor.mockReturnValue(mockEditorReturn);
  });

  it('renders Cockpit in cockpit view mode', () => {
    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="cockpit"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    expect(mockUseChatAgent).toHaveBeenCalledWith('sess-1');
    expect(mockUseCockpitEvents).toHaveBeenCalledWith('sess-1');
  });

  it('renders ProjectEditor in editor view mode', () => {
    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="editor"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    expect(mockUseEditor).toHaveBeenCalledWith('sess-1');
  });

  it('reloads file tree when tool-end event occurs in editor mode', () => {
    const mockLoadTree = vi.fn();
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      loadTree: mockLoadTree,
    });
    mockUseCockpitEvents.mockReturnValue({
      events: [
        {
          id: 'evt-1',
          timestamp: Date.now(),
          type: 'tool',
          subtype: 'end',
          label: 'read_file',
          payload: null,
        },
      ],
      agentState: null,
      clearEvents: vi.fn(),
    });

    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="editor"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    // The useEffect should call loadTree when there's a tool-end event in editor mode
    expect(mockLoadTree).toHaveBeenCalled();
  });

  it('does not reload file tree in cockpit mode', () => {
    const mockLoadTree = vi.fn();
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      loadTree: mockLoadTree,
    });
    mockUseCockpitEvents.mockReturnValue({
      events: [
        {
          id: 'evt-1',
          timestamp: Date.now(),
          type: 'tool',
          subtype: 'end',
          label: 'test',
          payload: null,
        },
      ],
      agentState: null,
      clearEvents: vi.fn(),
    });

    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="cockpit"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    expect(mockLoadTree).not.toHaveBeenCalled();
  });

  it('does not reload file tree for non-tool-end events', () => {
    const mockLoadTree = vi.fn();
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      loadTree: mockLoadTree,
    });
    mockUseCockpitEvents.mockReturnValue({
      events: [
        {
          id: 'evt-1',
          timestamp: Date.now(),
          type: 'lifecycle',
          subtype: 'start',
          label: 'init',
          payload: null,
        },
      ],
      agentState: null,
      clearEvents: vi.fn(),
    });

    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="editor"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    expect(mockLoadTree).not.toHaveBeenCalled();
  });

  it('does not reload file tree when events are empty in editor mode', () => {
    const mockLoadTree = vi.fn();
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      loadTree: mockLoadTree,
    });

    render(
      <ThemeWrapper>
        <WorkspacePage
          session={mockSession}
          viewMode="editor"
          onViewModeChange={vi.fn()}
          onGoHome={vi.fn()}
        />
      </ThemeWrapper>
    );

    expect(mockLoadTree).not.toHaveBeenCalled();
  });
});
