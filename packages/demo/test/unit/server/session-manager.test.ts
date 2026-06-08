/**
 * Unit tests for SessionManager — multi-session lifecycle management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AgentSessionOptions } from '../../../server/types.js';

// Mock all external dependencies. All mock definitions must be self-contained
// inside the factory functions because vi.mock is hoisted to the top of the file.
vi.mock('@agentskillmania/wrangler', () => ({
  EnhancedRunner: {
    create: vi.fn().mockResolvedValue({
      runStream: vi.fn(),
    }),
  },
  AgentLoader: {
    loadFrom: vi.fn().mockResolvedValue({
      name: 'test-agent',
      instructions: 'test instructions',
      skillDirs: [],
    }),
  },
}));

vi.mock('@agentskillmania/colts', () => {
  let counter = 0;
  return {
    createAgentState: vi.fn().mockImplementation(() => {
      counter++;
      return {
        id: `state-${counter}`,
        config: { name: 'test-agent', tools: [], instructions: 'test' },
        context: {
          messages: [],
          stepCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
    }),
    addUserMessage: vi.fn().mockImplementation((state: { id: string }) => ({
      ...state,
      context: {
        ...state.context,
        messages: [{ role: 'user', content: 'hello' }],
      },
    })),
  };
});

vi.mock('@agentskillmania/llm-client', () => ({
  LLMClient: vi.fn().mockImplementation(() => ({
    registerProvider: vi.fn(),
    registerApiKey: vi.fn(),
  })),
}));

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn().mockRejectedValue(new Error('dir not found')),
    mkdir: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockRejectedValue(new Error('file not found')),
  },
}));

// Also mock dotenv/config to prevent side effects
vi.mock('dotenv/config', () => ({}));

import { SessionManager } from '../../../server/session-manager.js';

const defaultOptions: AgentSessionOptions = {
  workspacePath: '/tmp/test-workspace',
  agentName: 'test-agent',
  agentInstructions: 'You are a test agent.',
  model: 'test-model',
};

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new SessionManager();
  });

  describe('createSession', () => {
    it('should create a session and return its id', async () => {
      const id = await manager.createSession(defaultOptions);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should track created sessions', async () => {
      await manager.createSession(defaultOptions);

      expect(manager.activeCount).toBe(1);
    });

    it('should allow creating multiple sessions', async () => {
      const id1 = await manager.createSession(defaultOptions);
      const id2 = await manager.createSession({
        ...defaultOptions,
        agentName: 'second-agent',
      });

      expect(id1).not.toBe(id2);
      expect(manager.activeCount).toBe(2);
    });

    it('should use provided sessionId when specified', async () => {
      const customId = 'my-custom-session-id';
      const id = await manager.createSession({
        ...defaultOptions,
        sessionId: customId,
      });

      expect(id).toBe(customId);
    });

    it('should default model to process.env.LLM_MODEL when not provided', async () => {
      const originalEnv = process.env.LLM_MODEL;
      process.env.LLM_MODEL = 'env-model';

      const id = await manager.createSession({
        ...defaultOptions,
        model: undefined,
      });

      const info = manager.getSessionInfo(id);
      expect(info?.model).toBe('env-model');

      process.env.LLM_MODEL = originalEnv;
    });

    it('should default model to deepseek-chat when nothing is specified', async () => {
      const originalEnv = process.env.LLM_MODEL;
      delete process.env.LLM_MODEL;

      const id = await manager.createSession({
        ...defaultOptions,
        model: undefined,
      });

      const info = manager.getSessionInfo(id);
      expect(info?.model).toBe('deepseek-chat');

      process.env.LLM_MODEL = originalEnv;
    });

    it('should set initial status to idle', async () => {
      const id = await manager.createSession(defaultOptions);
      const info = manager.getSessionInfo(id);

      expect(info?.status).toBe('idle');
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const id = await manager.createSession(defaultOptions);
      const info = manager.getSessionInfo(id);

      expect(info?.createdAt).toBeDefined();
      expect(info?.updatedAt).toBeDefined();
      expect(new Date(info!.createdAt).getTime()).not.toBeNaN();
      expect(new Date(info!.updatedAt).getTime()).not.toBeNaN();
    });

    it('should initialize messageCount to 0', async () => {
      const id = await manager.createSession(defaultOptions);
      const info = manager.getSessionInfo(id);

      expect(info?.messageCount).toBe(0);
    });
  });

  describe('getAgentSession', () => {
    it('should return the session for a valid id', async () => {
      const id = await manager.createSession(defaultOptions);
      const session = manager.getAgentSession(id);

      expect(session).toBeDefined();
      expect(session.sessionId).toBe(id);
    });

    it('should throw for a non-existent session id', () => {
      expect(() => manager.getAgentSession('nonexistent')).toThrow('Session not found');
    });
  });

  describe('getSessionInfo', () => {
    it('should return session info for a valid id', async () => {
      const id = await manager.createSession(defaultOptions);
      const info = manager.getSessionInfo(id);

      expect(info).toBeDefined();
      expect(info?.id).toBe(id);
      expect(info?.workspacePath).toBe(defaultOptions.workspacePath);
      expect(info?.agentName).toBe(defaultOptions.agentName);
      expect(info?.model).toBe(defaultOptions.model);
    });

    it('should return undefined for a non-existent session id', () => {
      const info = manager.getSessionInfo('nonexistent');
      expect(info).toBeUndefined();
    });
  });

  describe('updateSessionInfo', () => {
    it('should update session info fields', async () => {
      const id = await manager.createSession(defaultOptions);
      manager.updateSessionInfo(id, { status: 'running', messageCount: 5 });

      const info = manager.getSessionInfo(id);
      expect(info?.status).toBe('running');
      expect(info?.messageCount).toBe(5);
    });

    it('should update updatedAt timestamp on mutation', async () => {
      const id = await manager.createSession(defaultOptions);
      const before = manager.getSessionInfo(id)?.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise((r) => setTimeout(r, 10));
      manager.updateSessionInfo(id, { status: 'running' });

      const after = manager.getSessionInfo(id)?.updatedAt;
      expect(after).not.toBe(before);
    });

    it('should not throw for a non-existent session id', () => {
      expect(() => manager.updateSessionInfo('nonexistent', { status: 'running' })).not.toThrow();
    });
  });

  describe('listSessions', () => {
    it('should return empty array when no sessions exist', async () => {
      const sessions = await manager.listSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all sessions sorted by updatedAt descending', async () => {
      const id1 = await manager.createSession({ ...defaultOptions, agentName: 'agent-1' });

      // Ensure different timestamps for stable sort order
      await new Promise((r) => setTimeout(r, 10));
      // updateSessionInfo bumps updatedAt so id1 is distinguishable
      const id2 = await manager.createSession({ ...defaultOptions, agentName: 'agent-2' });

      const sessions = await manager.listSessions();
      expect(sessions).toHaveLength(2);
      // Most recently created session should appear first
      expect(sessions[0].id).toBe(id2);
      expect(sessions[1].id).toBe(id1);
    });
  });

  describe('deleteSession', () => {
    it('should remove a session', async () => {
      const id = await manager.createSession(defaultOptions);
      expect(manager.activeCount).toBe(1);

      await manager.deleteSession(id);
      expect(manager.activeCount).toBe(0);
    });

    it('should make getAgentSession throw after deletion', async () => {
      const id = await manager.createSession(defaultOptions);
      await manager.deleteSession(id);

      expect(() => manager.getAgentSession(id)).toThrow('Session not found');
    });

    it('should remove session info after deletion', async () => {
      const id = await manager.createSession(defaultOptions);
      await manager.deleteSession(id);

      expect(manager.getSessionInfo(id)).toBeUndefined();
    });

    it('should not affect other sessions', async () => {
      const id1 = await manager.createSession({ ...defaultOptions, agentName: 'a1' });
      const id2 = await manager.createSession({ ...defaultOptions, agentName: 'a2' });

      await manager.deleteSession(id1);
      expect(manager.activeCount).toBe(1);
      expect(() => manager.getAgentSession(id2)).not.toThrow();
    });
  });

  describe('activeCount', () => {
    it('should be 0 for a new manager', () => {
      expect(manager.activeCount).toBe(0);
    });

    it('should reflect the number of active sessions', async () => {
      await manager.createSession(defaultOptions);
      expect(manager.activeCount).toBe(1);

      await manager.createSession({ ...defaultOptions, agentName: 'a2' });
      expect(manager.activeCount).toBe(2);
    });
  });

  describe('listAgents', () => {
    it('should return empty array when agents dir does not exist', async () => {
      const agents = await manager.listAgents();
      expect(agents).toEqual([]);
    });
  });

  describe('listSkills', () => {
    it('should return empty array when skills dir does not exist', async () => {
      const skills = await manager.listSkills();
      expect(skills).toEqual([]);
    });
  });

  describe('ensureDirectories', () => {
    it('should call mkdir for agents and skills dirs', async () => {
      const fsMock = await import('fs/promises');
      await manager.ensureDirectories();
      expect(fsMock.default.mkdir).toHaveBeenCalled();
    });
  });
});
