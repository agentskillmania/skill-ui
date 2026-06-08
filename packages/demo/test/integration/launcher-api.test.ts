/**
 * Integration tests for Launcher API route — GET /api/launcher
 *
 * Tests the launcher data endpoint which returns agents, skills, and sessions
 * from the SessionManager. Uses mocked SessionManager to avoid filesystem
 * and external API dependencies.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { AgentInfo, SkillInfo, SessionInfo } from '../../server/types.js';

// Mock data
const mockAgents: AgentInfo[] = [
  {
    id: 'agent-1',
    name: 'Test Agent',
    description: 'A test agent',
    path: '/tmp/agents/agent-1',
    toolCount: 3,
    skillCount: 2,
  },
];

const mockSkills: SkillInfo[] = [
  {
    id: 'skill-1',
    name: 'Test Skill',
    description: 'A test skill',
    path: '/tmp/skills/skill-1',
  },
];

const mockSessions: SessionInfo[] = [
  {
    id: 'session-1',
    workspacePath: '/tmp/workspace',
    agentName: 'Test Agent',
    model: 'deepseek-chat',
    status: 'idle',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    messageCount: 0,
  },
];

// Mock functions — defined at module scope so they are accessible in tests
const mockListAgents = vi.fn().mockResolvedValue(mockAgents);
const mockListSkills = vi.fn().mockResolvedValue(mockSkills);
const mockListSessions = vi.fn().mockResolvedValue(mockSessions);
const mockEnsureDirectories = vi.fn().mockResolvedValue(undefined);

vi.mock('../../server/session-manager.js', () => ({
  SessionManager: vi.fn().mockImplementation(() => ({
    listAgents: mockListAgents,
    listSkills: mockListSkills,
    listSessions: mockListSessions,
    ensureDirectories: mockEnsureDirectories,
  })),
}));

import { createLauncherRouter } from '../../server/routes/launcher.js';
import { SessionManager } from '../../server/session-manager.js';

describe('Launcher API — GET /api/launcher', () => {
  let app: express.Express;
  let manager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default mock return values after each test
    mockListAgents.mockResolvedValue(mockAgents);
    mockListSkills.mockResolvedValue(mockSkills);
    mockListSessions.mockResolvedValue(mockSessions);
    mockEnsureDirectories.mockResolvedValue(undefined);

    app = express();
    app.use(express.json());
    manager = new SessionManager();
    app.use('/api', createLauncherRouter(manager));
  });

  it('returns agents, skills, and sessions', async () => {
    const res = await request(app).get('/api/launcher');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      agents: mockAgents,
      skills: mockSkills,
      sessions: mockSessions,
    });
  });

  it('calls ensureDirectories before fetching data', async () => {
    await request(app).get('/api/launcher');

    expect(mockEnsureDirectories).toHaveBeenCalledOnce();
  });

  it('fetches agents, skills, and sessions in parallel', async () => {
    await request(app).get('/api/launcher');

    expect(mockListAgents).toHaveBeenCalledOnce();
    expect(mockListSkills).toHaveBeenCalledOnce();
    expect(mockListSessions).toHaveBeenCalledOnce();
  });

  it('returns empty arrays when no data is available', async () => {
    mockListAgents.mockResolvedValue([]);
    mockListSkills.mockResolvedValue([]);
    mockListSessions.mockResolvedValue([]);

    const res = await request(app).get('/api/launcher');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      agents: [],
      skills: [],
      sessions: [],
    });
  });

  it('returns 500 when ensureDirectories throws', async () => {
    mockEnsureDirectories.mockRejectedValue(new Error('disk error'));

    const res = await request(app).get('/api/launcher');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('disk error');
  });

  it('returns 500 when listAgents throws', async () => {
    mockListAgents.mockRejectedValue(new Error('read failure'));

    const res = await request(app).get('/api/launcher');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('read failure');
  });
});
