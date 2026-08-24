/**
 * Artifact derivation — pure scan of the session message history.
 *
 * 产物 = 本会话内被 `file_write`(新建/改写)与 `file_edit`(修改)触达过的
 * workspace 文件。数据源是 daemon `GET /api/chat/:id/messages` 返回的消息
 * 数组:assistant 消息带 `toolCalls`(camelCase),参数对象里的路径键为
 * `filePath`(同为 camelCase —— wrangler.rs 工具 schema 的既有约定)。
 *
 * 已知盲区:经 shell / 脚本间接写出的文件(如 `node gen.js --out x.png`)
 * 参数中没有结构化路径,推导覆盖不到,调用方文档需注明。
 */
import type { ArtifactEntry, FileBrowserMessage } from '../types.js';

/** Tools whose arguments carry a workspace path we treat as an artifact. */
const WRITE_TOOLS = new Set(['file_write', 'file_edit']);

/**
 * Derives the artifact list from session messages, newest-touch first.
 * Empty/missing `filePath` and non-write tools are ignored.
 */
export function deriveArtifacts(messages: FileBrowserMessage[]): ArtifactEntry[] {
  const byPath = new Map<string, ArtifactEntry>();
  messages.forEach((msg, index) => {
    for (const call of msg.toolCalls ?? []) {
      if (!WRITE_TOOLS.has(call.name)) continue;
      const raw = call.arguments?.['filePath'];
      if (typeof raw !== 'string' || raw.length === 0) continue;
      const existing = byPath.get(raw);
      if (existing) {
        existing.status = 'modified';
        existing.lastTouch = index;
        if (!existing.ops.includes(call.name)) existing.ops.push(call.name);
      } else {
        byPath.set(raw, { path: raw, status: 'created', lastTouch: index, ops: [call.name] });
      }
    }
  });
  return [...byPath.values()].sort((a, b) => b.lastTouch - a.lastTouch);
}
