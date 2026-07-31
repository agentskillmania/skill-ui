/**
 * @fileoverview normalizeSession unit tests — raw daemon session → SessionMeta
 */
import { describe, it, expect } from 'vitest';
import { normalizeSession } from '../../../src/core/resources/sessions.js';

describe('normalizeSession', () => {
  it('normalizes a raw daemon session object', () => {
    const raw = {
      id: 'sess-123',
      agentName: 'coder',
      model: 'deepseek-chat',
      workspacePath: '/project',
      title: 'My Session',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T12:00:00Z',
    };
    const result = normalizeSession(raw);
    expect(result.id).toBe('sess-123');
    expect(result.agentName).toBe('coder');
    expect(result.title).toBe('My Session');
    expect(result.status).toBe('idle');
  });

  it('defaults missing fields', () => {
    const result = normalizeSession({ id: 's1' });
    expect(result.agentName).toBe('');
    expect(result.model).toBe('');
    expect(result.workspacePath).toBe('');
    expect(result.status).toBe('idle');
    expect(result.messageCount).toBe(0);
  });

  it('preserves optional fields when present', () => {
    const result = normalizeSession({
      id: 's1',
      stepCount: 5,
      messageCount: 10,
      tokensIn: 100,
      tokensOut: 50,
    });
    expect(result.stepCount).toBe(5);
    expect(result.messageCount).toBe(10);
    expect(result.tokensIn).toBe(100);
    expect(result.tokensOut).toBe(50);
  });
});
