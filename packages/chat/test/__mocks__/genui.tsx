/**
 * Mock for @agentskillmania/genui used in tests.
 * Vitest resolve.alias redirects the static import to this file.
 */

export const mockSurfaceManager = {
  initialize: vi.fn().mockResolvedValue(undefined),
  beginTextStream: vi.fn(),
  receiveTextChunk: vi.fn(),
  endTextStream: vi.fn(),
  destroy: vi.fn(),
};

export const Genui = {
  initialize: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  setDayNightMode: vi.fn(),
};

export class SurfaceManager {
  initialize = mockSurfaceManager.initialize;
  beginTextStream = mockSurfaceManager.beginTextStream;
  receiveTextChunk = mockSurfaceManager.receiveTextChunk;
  endTextStream = mockSurfaceManager.endTextStream;
  destroy = mockSurfaceManager.destroy;
}

export function GenUISurface({
  surfaceManager,
  onAction,
}: {
  surfaceManager: SurfaceManager;
  width?: string;
  height?: string;
  onAction?: (action: { sourceComponentId?: string; context?: unknown }) => void;
}) {
  return (
    <div
      data-testid="genui-surface"
      data-onaction={!!onAction}
      onClick={() => onAction?.({ sourceComponentId: 'btn-1', context: { click: true } })}
    >
      GenUI Surface Mock
    </div>
  );
}
