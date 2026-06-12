/**
 * Public export verification for @agentskillmania/skill-ui-chat
 */
import { describe, it, expect } from 'vitest';
import * as chatExports from '../../src/index.js';

describe('chat package exports', () => {
  const componentNames = [
    'Chat',
    'MessageList',
    'ChatInput',
    'MessageItem',
    'MessageWrapper',
    'UserMessage',
    'AssistantMessage',
    'SystemMessage',
    'BlocksRenderer',
    'ThinkingBlock',
    'ToolCallBlock',
    'PlanBlock',
    'ErrorBlock',
    'HumanInputBlock',
    'SkillBlock',
    'MarkdownRenderer',
    'QuickCommands',
    'CommandAutocomplete',
  ];

  it.each(componentNames)('exports %s as a component', (name) => {
    expect(chatExports[name]).toBeDefined();
    // Components can be functions or memo-wrapped components (objects with $$typeof)
    const isFunction = typeof chatExports[name] === 'function';
    const isMemoComponent =
      typeof chatExports[name] === 'object' && chatExports[name].$$typeof !== undefined;
    expect(isFunction || isMemoComponent).toBe(true);
  });

  it('exports utility functions', () => {
    expect(typeof chatExports.extractSearchTerm).toBe('function');
    expect(typeof chatExports.filterCommands).toBe('function');
    expect(typeof chatExports.groupCommands).toBe('function');
  });

  it('exports i18n resources', () => {
    expect(typeof chatExports.NAMESPACE).toBe('string');
    expect(chatExports.resources).toBeDefined();
  });
});
