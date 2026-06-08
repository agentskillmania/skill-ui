/**
 * Multi-session lifecycle management for AgentSession instances
 */
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { AgentSession } from './agent.js';
import type { AgentSessionOptions, SessionInfo, AgentInfo, SkillInfo } from './types.js';
import { AgentLoader } from '@agentskillmania/wrangler';

const ASM_DIR = path.join(os.homedir(), '.agentskillmania');
const AGENTS_DIR = path.join(ASM_DIR, 'agents');
const SKILLS_DIR = path.join(ASM_DIR, 'skills');

/**
 * Manages multiple AgentSession instances with lifecycle tracking.
 *
 * Provides CRUD for sessions plus discovery of available agents and skills
 * from the ~/.agentskillmania directory.
 */
export class SessionManager {
  private sessions = new Map<string, AgentSession>();
  private sessionInfos = new Map<string, SessionInfo>();

  /**
   * Create a new agent session and register it
   *
   * @param options - Configuration for the agent session
   * @returns The session ID
   */
  async createSession(options: AgentSessionOptions): Promise<string> {
    const session = await AgentSession.create(options);
    const id = session.sessionId;
    this.sessions.set(id, session);
    this.sessionInfos.set(id, {
      id,
      workspacePath: options.workspacePath,
      agentName: options.agentName,
      model: options.model ?? process.env.LLM_MODEL ?? 'deepseek-chat',
      status: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    });
    return id;
  }

  /**
   * Get an AgentSession by ID
   *
   * @param id - Session identifier
   * @returns The AgentSession instance
   * @throws Error if session not found
   */
  getAgentSession(id: string): AgentSession {
    const session = this.sessions.get(id);
    if (!session) throw new Error(`Session not found: ${id}`);
    return session;
  }

  /**
   * Get session metadata by ID
   *
   * @param id - Session identifier
   * @returns Session info or undefined if not found
   */
  getSessionInfo(id: string): SessionInfo | undefined {
    return this.sessionInfos.get(id);
  }

  /**
   * Update session metadata fields
   *
   * @param id - Session identifier
   * @param updates - Partial fields to update
   */
  updateSessionInfo(id: string, updates: Partial<SessionInfo>): void {
    const info = this.sessionInfos.get(id);
    if (info) {
      Object.assign(info, updates, { updatedAt: new Date().toISOString() });
    }
  }

  /**
   * List all sessions sorted by most recently updated first
   *
   * @returns Array of SessionInfo
   */
  async listSessions(): Promise<SessionInfo[]> {
    return Array.from(this.sessionInfos.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Delete a session by ID
   *
   * @param id - Session identifier
   */
  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
    this.sessionInfos.delete(id);
  }

  /** Number of active sessions */
  get activeCount(): number {
    return this.sessions.size;
  }

  /**
   * Discover available agents from ~/.agentskillmania/agents/
   *
   * @returns Array of agent info
   */
  async listAgents(): Promise<AgentInfo[]> {
    const agents: AgentInfo[] = [];
    try {
      const entries = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const agentDir = path.join(AGENTS_DIR, entry.name);
        try {
          const loaded = await AgentLoader.loadFrom(agentDir);
          agents.push({
            id: entry.name,
            name: loaded.name ?? entry.name,
            description: loaded.instructions?.slice(0, 100) ?? '',
            path: agentDir,
            toolCount: 0,
            skillCount: loaded.skillDirs?.length ?? 0,
          });
        } catch {
          /* skip invalid agent directories */
        }
      }
    } catch {
      /* agents directory doesn't exist */
    }
    return agents;
  }

  /**
   * Discover available skills from ~/.agentskillmania/skills/
   *
   * @returns Array of skill info
   */
  async listSkills(): Promise<SkillInfo[]> {
    const skills: SkillInfo[] = [];
    try {
      const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillDir = path.join(SKILLS_DIR, entry.name);
        try {
          const stat = await fs.stat(path.join(skillDir, 'SKILL.md'));
          if (stat.isFile()) {
            skills.push({
              id: entry.name,
              name: entry.name,
              description: '',
              path: skillDir,
            });
          }
        } catch {
          /* skip directories without SKILL.md */
        }
      }
    } catch {
      /* skills directory doesn't exist */
    }
    return skills;
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories(): Promise<void> {
    await fs.mkdir(AGENTS_DIR, { recursive: true });
    await fs.mkdir(SKILLS_DIR, { recursive: true });
  }
}
