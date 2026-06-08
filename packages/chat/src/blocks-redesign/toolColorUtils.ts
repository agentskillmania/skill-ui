/**
 * Shared tool color resolution — used by ToolCallBlock and ToolCallDetailModal
 * to ensure consistent accent colors across the card and detail modal.
 */

/** Known tool type to blockColor key mapping */
const toolColorMap: Record<string, string> = {
  mcp: 'toolMcp',
  script: 'toolScript',
  builtin: 'toolBuiltin',
};

const DEFAULT_COLOR_KEY = 'toolMcp';

/** Get corresponding blockColor key by toolType */
export function getToolColorKey(toolType?: string): string {
  if (!toolType) return DEFAULT_COLOR_KEY;
  return toolColorMap[toolType] ?? DEFAULT_COLOR_KEY;
}
