import { describe, it, expect } from 'vitest';
import type { SessionOverviewData, SessionInfoData } from '../../../../src/sections/session/types.js';

describe('Session Frontend Types', () => {
  it('SessionOverviewData accepts minimal required fields', () => {
    const data: SessionOverviewData = {
      agentName: 'debug-agent',
      model: 'claude-sonnet-4-6',
      stepCount: 0,
      messageCount: 0,
      status: 'idle',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };
    expect(data.title).toBeUndefined();
    expect(data.tokensIn).toBeUndefined();
    expect(data.contextWindow).toBeUndefined();
  });

  it('SessionInfoData accepts minimal required fields', () => {
    const data: SessionInfoData = {
      sessionId: '123-abc',
      agentName: 'debug-agent',
      model: 'gpt-4',
      workspacePath: '/tmp',
      skillDirs: [],
      mcpConfigPaths: [],
    };
    expect(data.agentConfigPath).toBeUndefined();
  });
});
