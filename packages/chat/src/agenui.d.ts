/**
 * Type declarations for @agentskillmania/agenui peer dependency.
 * The package is resolved at runtime by consumers (e.g. demo via link: protocol).
 */
declare module '@agentskillmania/agenui' {
  export interface AGenUIStatic {
    initialize(): Promise<void>;
    isInitialized(): boolean;
    setDayNightMode(mode: string): void;
  }

  export const AGenUI: AGenUIStatic;

  export class SurfaceManager {
    initialize(): Promise<void>;
    beginTextStream(): void;
    receiveTextChunk(chunk: string): void;
    endTextStream(): void;
    destroy(): void;
  }

  export interface AGenUISurfaceProps {
    surfaceManager: SurfaceManager;
    width?: string;
    height?: string;
    onAction?: (action: { sourceComponentId?: string; context?: unknown }) => void;
  }

  export function AGenUISurface(props: AGenUISurfaceProps): JSX.Element;
}
