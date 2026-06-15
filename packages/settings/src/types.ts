/**
 * @fileoverview Type definitions for settings components.
 *
 * @module
 */

/**
 * Single LLM model entry.
 *
 * @remarks
 * Mirrors the model shape used by `@agentskillmania/colts` / `wrangler-daemon`.
 */
export interface LlmModelEntry {
  /** Model identifier (e.g. gpt-4o, deepseek-chat) */
  modelId: string;
  /** Model context window override (null = auto) */
  contextWindow?: number | null;
  /** Model max output tokens override (null = auto) */
  maxTokens?: number | null;
  /** Reasoning capability override (null = auto) */
  reasoning?: boolean | null;
}

/**
 * Single LLM provider entry (one API key per provider).
 *
 * @remarks
 * Mirrors the provider shape used by `@agentskillmania/colts` / `wrangler-daemon`.
 */
export interface LlmProviderEntry {
  /** Provider name (e.g. openai, anthropic, deepseek) */
  name: string;
  /** API key for authentication */
  apiKey: string;
  /** API base URL (e.g. https://api.openai.com/v1) */
  baseUrl?: string;
  /** Provider-level max concurrency override (null = auto) */
  maxConcurrency?: number | null;
  /** Models served by this provider */
  models: LlmModelEntry[];
}

/**
 * Multi-provider LLM quick init configuration.
 *
 * @remarks
 * Mirrors `LLMQuickInit` from `@agentskillmania/colts`.
 */
export interface LlmQuickInit {
  /** Ordered list of providers */
  providers: LlmProviderEntry[];
}

/**
 * Daemon server configuration.
 *
 * @remarks
 * Maps to `config.yaml` server section.
 */
export interface DaemonServerConfig {
  /** Server host address */
  host: string;
  /** Server port number */
  port: number;
}

/**
 * Full daemon configuration.
 *
 * @remarks
 * Corresponds to `~/.agentskillmania/skill-studio/config.yaml`.
 */
export interface DaemonConfig {
  /** LLM connection settings */
  llm: LlmQuickInit;
  /** Server binding settings */
  server: DaemonServerConfig;
}

/**
 * MCP server definition.
 *
 * @remarks
 * Represents a single entry from `~/.mcporter/mcporter.json` or agent-level `mcp.json`.
 */
export interface McpServer {
  /** Unique server name */
  name: string;
  /** Command to start the server */
  command: string;
  /** Command arguments */
  args?: string[];
  /** Environment variables for the server process */
  env?: Record<string, string>;
}

/**
 * MCP configuration state.
 *
 * @remarks
 * Combines the global toggle, available servers (read-only from mcporter),
 * and the user's selection of which servers to enable.
 * Per-server enable/disable will be enforced by wrangler in future versions.
 */
export interface McpConfig {
  /** Whether to load global MCP servers from mcporter config */
  loadGlobal: boolean;
  /** Names of enabled servers (subset of availableServers) */
  enabledServers: string[];
  /** All available servers from mcporter global config (read-only) */
  availableServers: McpServer[];
}

/**
 * Application preferences.
 *
 * @remarks
 * Managed by skill-studio itself, stored in preferences.yaml.
 */
export interface AppPreferences {
  /** UI theme mode */
  theme: 'light' | 'dark' | 'system';
  /** Interface language */
  language: 'zh-CN' | 'en-US';
  /** Default workspace directory path */
  defaultWorkspacePath: string;
  /** Default agents directory path */
  defaultAgentsPath: string;
  /** Default skills directory path */
  defaultSkillsPath: string;
}

/**
 * Props for the DaemonConfigPanel component.
 */
export interface DaemonConfigPanelProps {
  /** Current daemon configuration */
  value: DaemonConfig;
  /** Callback fired when any field changes; receives a partial update */
  onChange: (partial: Partial<DaemonConfig>) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for the McpConfigPanel component.
 */
export interface McpConfigPanelProps {
  /** Current MCP configuration */
  value: McpConfig;
  /** Callback fired when configuration changes */
  onChange: (config: McpConfig) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for the PreferencesPanel component.
 */
export interface PreferencesPanelProps {
  /** Current application preferences */
  value: AppPreferences;
  /** Callback fired when any field changes; receives a partial update */
  onChange: (partial: Partial<AppPreferences>) => void;
  /**
   * Callback to open a native directory picker dialog.
   *
   * @remarks
   * Receives the field key being edited so the consumer can customise the
   * dialog title. Must return the selected absolute path, or `undefined`
   * if the user cancelled. When not provided, browse buttons are disabled.
   *
   * In Electron the consumer typically calls
   * `window.studio.dialog.showOpenDialog({ properties: ['openDirectory'] })`.
   */
  onBrowseDirectory?: (field: keyof AppPreferences) => Promise<string | undefined>;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for the top-level SettingsPanel component.
 *
 * @remarks
 * Combines all three sub-panel configs into a single component with tab navigation.
 * MCP config is applied live; daemon config and preferences require an explicit
 * submit and can be reset to the last prop snapshot.
 */
export interface SettingsPanelProps {
  /** Current daemon configuration (last saved / initial snapshot) */
  daemonConfig: DaemonConfig;
  /** Callback when daemon config is submitted */
  onDaemonConfigSubmit: (config: DaemonConfig) => void;
  /** Callback when daemon config is reset (optional, e.g. for logging) */
  onDaemonConfigReset?: () => void;
  /** Current MCP configuration */
  mcpConfig: McpConfig;
  /** Callback when MCP configuration changes (live) */
  onMcpConfigChange: (config: McpConfig) => void;
  /** Current application preferences (last saved / initial snapshot) */
  preferences: AppPreferences;
  /** Callback when preferences are submitted */
  onPreferencesSubmit: (prefs: AppPreferences) => void;
  /** Callback when preferences are reset (optional, e.g. for logging) */
  onPreferencesReset?: () => void;
  /**
   * Callback to open a native directory picker dialog.
   * Forwarded to the inner PreferencesPanel. See PreferencesPanelProps for details.
   */
  onBrowseDirectory?: (field: keyof AppPreferences) => Promise<string | undefined>;
  /** Additional CSS class name */
  className?: string;
}
