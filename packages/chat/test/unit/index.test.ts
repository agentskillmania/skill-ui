/**
 * Public export verification for @agentskillmania/skill-ui-chat
 */
import { describe, it, expect } from 'vitest';
import * as chatExports from '../../src/index.js';

describe('chat package exports', () => {
  const componentNames = ['Chat', 'MessageList', 'ChatInput', 'BlocksRenderer', 'QuickCommands'];

  it.each(componentNames)('exports %s as a component', (name) => {
    expect(chatExports[name]).toBeDefined();
    // Components can be functions or memo-wrapped components (objects with $$typeof)
    const isFunction = typeof chatExports[name] === 'function';
    const isMemoComponent =
      typeof chatExports[name] === 'object' && chatExports[name].$$typeof !== undefined;
    expect(isFunction || isMemoComponent).toBe(true);
  });

  it('does NOT export internal default implementations', () => {
    const internal = [
      'MessageItem',
      'MessageWrapper',
      'UserMessage',
      'AssistantMessage',
      'SystemMessage',
      'TextBlock',
      'ThinkingBlock',
      'ToolCallBlock',
      'PlanBlock',
      'ErrorBlock',
      'HumanInputBlock',
      'SkillBlock',
      'A2UIBlock',
      'SubAgentBlock',
      'SubAgentModal',
      'ModelSelector',
      'ThinkingToggle',
      'ContextUsage',
      'CommandAutocomplete',
      'MarkdownRenderer',
      'formatTokens',
      'extractSearchTerm',
      'filterCommands',
      'groupCommands',
    ] as const;
    for (const name of internal) {
      expect(
        (chatExports as Record<string, unknown>)[name],
        `${name} must not be part of the public surface`
      ).toBeUndefined();
    }
  });

  it('exports i18n resources', () => {
    expect(typeof chatExports.NAMESPACE).toBe('string');
    expect(chatExports.resources).toBeDefined();
  });
});
