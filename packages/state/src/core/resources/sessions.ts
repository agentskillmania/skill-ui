/**
 * @fileoverview Session normalizer — raw daemon session payload → SessionMeta
 */
import type { SessionMeta, RawResource } from './types.js';

export function normalizeSession(raw: RawResource): SessionMeta {
  return {
    id: String(raw.id ?? ''),
    title: raw.title as string | undefined,
    agentName: String(raw.agentName ?? ''),
    model: String(raw.model ?? ''),
    workspacePath: String(raw.workspacePath ?? ''),
    status: (raw.status as SessionMeta['status']) ?? 'idle',
    messageCount: Number(raw.messageCount ?? 0),
    stepCount: Number(raw.stepCount ?? 0),
    tokensIn: raw.tokensIn != null ? Number(raw.tokensIn) : undefined,
    tokensOut: raw.tokensOut != null ? Number(raw.tokensOut) : undefined,
    tokensTotal: raw.tokensTotal != null ? Number(raw.tokensTotal) : undefined,
    contextWindow: raw.contextWindow != null ? Number(raw.contextWindow) : undefined,
    estimatedContextSize:
      raw.estimatedContextSize != null ? Number(raw.estimatedContextSize) : undefined,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  };
}

export function normalizeSessionList(rawList: RawResource[]): SessionMeta[] {
  return rawList.map(normalizeSession);
}

export function findSession(sessions: SessionMeta[], id: string): SessionMeta | undefined {
  return sessions.find((s) => s.id === id);
}
