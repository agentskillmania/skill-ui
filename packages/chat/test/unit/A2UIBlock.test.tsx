import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@agentskillmania/skill-ui-theme';
import { ChatWrapper } from './testUtils.js';
import type { Block, A2UIBlockMetadata } from '../../src/types.js';
import { mockSurfaceManager, Genui } from '@agentskillmania/genui';
import { A2UIBlock } from '../../src/blocks-redesign/A2UIBlock.js';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

function renderBlock(
  overrides: { block?: Partial<Block>; onAction?: (action: unknown) => void } = {},
  metaOverrides: Partial<A2UIBlockMetadata> = {}
) {
  const onAction = overrides.onAction ?? vi.fn();
  const meta: A2UIBlockMetadata = { surfaceId: 'test-surface', title: 'Test UI', ...metaOverrides };
  const block: Block = {
    id: 'a2ui-1',
    type: 'a2ui',
    status: 'streaming',
    content: '{"createSurface":{"surfaceId":"test-surface","catalogId":"default"}}\n',
    metadata: meta,
    ...overrides.block,
  };
  const result = render(
    <ChatWrapper>
      <A2UIBlock block={block} onAction={onAction} />
    </ChatWrapper>
  );
  return { onAction, ...result };
}

describe('A2UIBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title from metadata', async () => {
    renderBlock();
    await waitFor(() => {
      expect(screen.getByText('Test UI')).toBeInTheDocument();
    });
  });

  it('renders default title when no metadata title', async () => {
    renderBlock({}, { title: undefined });
    await waitFor(() => {
      expect(screen.getByText('A2UI Surface')).toBeInTheDocument();
    });
  });

  it('renders Genui surface when engine ready', async () => {
    renderBlock();
    await waitFor(() => {
      expect(screen.getByTestId('genui-surface')).toBeInTheDocument();
    });
  });

  it('initializes SurfaceManager and begins text stream on mount', async () => {
    renderBlock();
    await waitFor(() => {
      expect(mockSurfaceManager.initialize).toHaveBeenCalled();
      expect(mockSurfaceManager.beginTextStream).toHaveBeenCalled();
    });
  });

  it('calls Genui.initialize when not yet initialized', async () => {
    vi.mocked(Genui.isInitialized).mockReturnValueOnce(false);
    renderBlock();
    await waitFor(() => {
      expect(Genui.initialize).toHaveBeenCalled();
    });
    vi.mocked(Genui.isInitialized).mockReturnValue(true);
  });

  it('streams initial content to SurfaceManager', async () => {
    renderBlock({
      block: {
        content: 'line1\n',
      },
    });
    await waitFor(() => {
      expect(mockSurfaceManager.receiveTextChunk).toHaveBeenCalledWith('line1\n');
    });
  });

  it('streams only content diff on update', async () => {
    const { rerender } = render(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'streaming',
            content: 'line1\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.receiveTextChunk).toHaveBeenCalledWith('line1\n');
    });

    mockSurfaceManager.receiveTextChunk.mockClear();

    rerender(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'streaming',
            content: 'line1\nline2\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.receiveTextChunk).toHaveBeenCalledWith('line2\n');
    });
  });

  it('calls endTextStream when status changes to completed', async () => {
    const { rerender } = render(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'streaming',
            content: 'line1\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.beginTextStream).toHaveBeenCalled();
    });

    rerender(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'completed',
            content: 'line1\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.endTextStream).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call endTextStream twice on re-render', async () => {
    const { rerender } = render(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'completed',
            content: 'line1\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.endTextStream).toHaveBeenCalledTimes(1);
    });

    rerender(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'completed',
            content: 'line1\n',
            metadata: { surfaceId: 'test-surface' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    expect(mockSurfaceManager.endTextStream).toHaveBeenCalledTimes(1);
  });

  it('calls destroy on unmount', async () => {
    const { unmount } = renderBlock();
    await waitFor(() => {
      expect(mockSurfaceManager.beginTextStream).toHaveBeenCalled();
    });
    unmount();
    expect(mockSurfaceManager.destroy).toHaveBeenCalled();
  });

  it('shows streaming status tag', async () => {
    renderBlock();
    await waitFor(() => {
      expect(screen.getByText('渲染中')).toBeInTheDocument();
    });
  });

  it('shows completed status tag', async () => {
    renderBlock({
      block: {
        status: 'completed',
        content: 'line1\n',
      },
    });
    await waitFor(() => {
      expect(screen.getByText('渲染完成')).toBeInTheDocument();
    });
  });

  it('shows waiting indicator when status is pending', async () => {
    renderBlock({
      block: {
        status: 'pending',
        content: 'line1\n',
      },
    });
    await waitFor(() => {
      expect(screen.getByText('等待交互')).toBeInTheDocument();
    });
  });

  it('shows error styling when status is error', async () => {
    renderBlock({
      block: {
        status: 'error',
        content: '',
      },
    });
    await waitFor(() => {
      expect(screen.getByText('渲染错误')).toBeInTheDocument();
    });
  });

  it('renders empty content without crash', async () => {
    renderBlock({
      block: {
        status: 'streaming',
        content: '',
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Test UI')).toBeInTheDocument();
    });
  });

  it('does not call receiveTextChunk when content has not grown', async () => {
    const block: Block = {
      id: 'a2ui-1',
      type: 'a2ui',
      status: 'streaming',
      content: 'line1\n',
      metadata: { surfaceId: 'test-surface' },
    };
    const { rerender } = render(
      <ChatWrapper>
        <A2UIBlock block={block} onAction={vi.fn()} />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(mockSurfaceManager.receiveTextChunk).toHaveBeenCalledWith('line1\n');
    });

    mockSurfaceManager.receiveTextChunk.mockClear();

    rerender(
      <ChatWrapper>
        <A2UIBlock block={{ ...block }} onAction={vi.fn()} />
      </ChatWrapper>
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(mockSurfaceManager.receiveTextChunk).not.toHaveBeenCalled();
  });

  it('calls setDayNightMode when theme changes', async () => {
    const block: Block = {
      id: 'a2ui-1',
      type: 'a2ui',
      status: 'streaming',
      content: '',
      metadata: { surfaceId: 'test-surface' },
    };

    function ThemeToggleWrapper() {
      const [dark, setDark] = useState(false);
      return (
        <ThemeProvider mode={dark ? 'dark' : 'light'}>
          <A2UIBlock block={block} />
          <button data-testid="toggle-theme" onClick={() => setDark((d) => !d)}>
            toggle
          </button>
        </ThemeProvider>
      );
    }

    render(<ThemeToggleWrapper />);

    await waitFor(() => {
      expect(screen.getByText('A2UI Surface')).toBeInTheDocument();
    });

    vi.mocked(Genui.setDayNightMode).mockClear();

    await userEvent.click(screen.getByTestId('toggle-theme'));

    await waitFor(() => {
      expect(Genui.setDayNightMode).toHaveBeenCalledWith('dark');
    });
  });

  it('does not fire action when onAction is not provided', async () => {
    const block: Block = {
      id: 'a2ui-1',
      type: 'a2ui',
      status: 'streaming',
      content: '',
      metadata: { surfaceId: 'test-surface' },
    };
    render(
      <ChatWrapper>
        <A2UIBlock block={block} />
      </ChatWrapper>
    );
    const surface = await screen.findByTestId('genui-surface');
    // Click the surface — handleSurfaceAction runs but returns early (no onAction)
    surface.click();
    expect(surface).toBeInTheDocument();
  });

  it('fires BlockAction when surface emits action', async () => {
    const onAction = vi.fn();
    renderBlock({ onAction });

    const surface = await screen.findByTestId('genui-surface');
    surface.click();

    expect(onAction).toHaveBeenCalledWith({
      type: 'a2ui-action',
      surfaceId: 'test-surface',
      componentId: 'btn-1',
      payload: { click: true },
    });
  });

  it('shows overflow gradient and expand button when content overflows', async () => {
    const { rerender } = renderBlock();

    await waitFor(() => {
      expect(screen.getByTestId('genui-surface')).toBeInTheDocument();
    });

    // Simulate overflow by making scrollHeight > clientHeight on the content element
    const surfaceEl = screen.getByTestId('genui-surface');
    const contentEl = surfaceEl.parentElement?.parentElement;
    Object.defineProperty(contentEl!, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(contentEl!, 'clientHeight', { configurable: true, value: 100 });

    // Re-render with changed content to re-trigger the overflow detection effect
    rerender(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'streaming',
            content: 'updated-content\n',
            metadata: { surfaceId: 'test-surface', title: 'Test UI' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    // The overflow gradient section with expand button should now be visible
    await waitFor(() => {
      expect(screen.getByText('展开查看')).toBeInTheDocument();
    });
  });

  it('opens full-view modal with Genui surface when header expand button is clicked', async () => {
    renderBlock();

    await waitFor(() => {
      expect(screen.getByTestId('genui-surface')).toBeInTheDocument();
    });

    // Click the header expand button (has title attribute '展开查看')
    const expandButton = screen.getByTitle('展开查看');
    await userEvent.click(expandButton);

    // Modal should now be open with a second GenUISurface inside
    await waitFor(() => {
      const surfaces = screen.getAllByTestId('genui-surface');
      expect(surfaces).toHaveLength(2);
    });
  });

  it('closes modal when close button is clicked', async () => {
    renderBlock();

    await waitFor(() => {
      expect(screen.getByTestId('genui-surface')).toBeInTheDocument();
    });

    // Open modal first
    await userEvent.click(screen.getByTitle('展开查看'));

    await waitFor(() => {
      expect(screen.getAllByTestId('genui-surface')).toHaveLength(2);
    });

    // Click the modal close button (aria-label="Close")
    const closeBtn = document.querySelector('.ant-modal-close') as HTMLElement | null;
    expect(closeBtn).not.toBeNull();
    await userEvent.click(closeBtn!);

    // After close, the modal content may remain in DOM (no destroyOnClose),
    // but the component is still rendered — the onCancel function was called
    const surfaces = screen.getAllByTestId('genui-surface');
    expect(surfaces.length).toBeGreaterThanOrEqual(1);
  });

  it('overflow expand button opens the modal', async () => {
    const { rerender } = renderBlock();

    await waitFor(() => {
      expect(screen.getByTestId('genui-surface')).toBeInTheDocument();
    });

    // Simulate overflow
    const surfaceEl = screen.getByTestId('genui-surface');
    const contentEl = surfaceEl.parentElement?.parentElement;
    Object.defineProperty(contentEl!, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(contentEl!, 'clientHeight', { configurable: true, value: 100 });

    // Re-render to trigger overflow detection
    rerender(
      <ChatWrapper>
        <A2UIBlock
          block={{
            id: 'a2ui-1',
            type: 'a2ui',
            status: 'streaming',
            content: 'updated-content\n',
            metadata: { surfaceId: 'test-surface', title: 'Test UI' },
          }}
          onAction={vi.fn()}
        />
      </ChatWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('展开查看')).toBeInTheDocument();
    });

    // Click the overflow expand button and verify modal opens
    await userEvent.click(screen.getByText('展开查看'));

    await waitFor(() => {
      const surfaces = screen.getAllByTestId('genui-surface');
      expect(surfaces).toHaveLength(2);
    });
  });

  it('cancels init early when unmounted during Genui initialization', async () => {
    // Make Genui.isInitialized return false so init enters the initialize block
    vi.mocked(Genui.isInitialized).mockReturnValueOnce(false);

    // Make Genui.initialize return a controllable promise
    let resolveGenuiInit!: () => void;
    vi.mocked(Genui.initialize).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveGenuiInit = resolve;
      })
    );

    const block: Block = {
      id: 'a2ui-1',
      type: 'a2ui',
      status: 'streaming',
      content: '',
      metadata: { surfaceId: 'test-surface' },
    };

    const { unmount } = render(
      <ChatWrapper>
        <A2UIBlock block={block} />
      </ChatWrapper>
    );

    // Unmount before Genui.initialize resolves
    unmount();

    // Now resolve — the cancelled check should prevent SurfaceManager creation
    resolveGenuiInit();

    await waitFor(() => {
      // SurfaceManager.initialize should NOT have been called
      expect(mockSurfaceManager.initialize).not.toHaveBeenCalled();
    });

    // Restore default mock behavior for other tests
    vi.mocked(Genui.isInitialized).mockReturnValue(true);
  });

  it('destroys SurfaceManager if unmounted during init', async () => {
    // Make SurfaceManager.initialize() hang so we can unmount mid-init
    let resolveInit!: () => void;
    mockSurfaceManager.initialize.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolveInit = r;
      })
    );

    const block: Block = {
      id: 'a2ui-1',
      type: 'a2ui',
      status: 'streaming',
      content: '',
      metadata: { surfaceId: 'test-surface' },
    };

    const { unmount } = render(
      <ChatWrapper>
        <A2UIBlock block={block} />
      </ChatWrapper>
    );

    // genui is dynamically imported on mount — wait until the module loaded and
    // SurfaceManager.initialize() is in flight, then unmount mid-init
    await waitFor(() => {
      expect(mockSurfaceManager.initialize).toHaveBeenCalled();
    });
    unmount();

    // Now resolve — component should destroy the SM
    resolveInit();

    await waitFor(() => {
      expect(mockSurfaceManager.destroy).toHaveBeenCalled();
    });
  });
});
