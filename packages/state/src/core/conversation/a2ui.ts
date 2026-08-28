/**
 * @fileoverview a2ui.ts — a2ui_* tool calls → genui protocol lines
 *
 * The wrangler a2ui tools are ack-only: the surface data lives entirely in
 * the tool-start args and there is no dedicated SSE event for it. This module
 * turns those args into NDJSON lines of the genui stream protocol
 * (`{"createSurface":…}` / `{"updateComponents":…}` / …, one JSON object per
 * line) that the chat A2UIBlock feeds into its SurfaceManager, while
 * maintaining the materialized per-surface state needed to keep every block
 * self-contained (a block opened in a later turn replays full state).
 *
 * Everything here is pure: (surfaces, toolName, args) → result, with
 * clone-on-write surface registries — safe under React StrictMode's
 * double-invoked reducers. Unparseable args yield `null` and the caller
 * degrades to a plain tool_call block; an unrecognizable op is dropped,
 * never thrown: the chat stream must not crash on protocol drift.
 */

import type { A2uiSurfaceState, A2uiSurfaces } from './types.js';

/** The four display-only a2ui tools (input goes through ask_human). */
export const A2UI_TOOLS: ReadonlySet<string> = new Set([
  'a2ui_create_surface',
  'a2ui_update_components',
  'a2ui_update_data_model',
  'a2ui_delete_surface',
]);

/** Result of folding one a2ui tool call into the surface registry. */
export interface A2uiApplyResult {
  /** Next registry (clone-on-write; input untouched). */
  surfaces: A2uiSurfaces;
  surfaceId: string;
  /** Protocol lines to append to the surface's block content. */
  lines: string[];
  /** True iff the registry held this surface BEFORE the call — a block
   * created now must open with the replay prefix (see a2uiBlockOpeningLines). */
  hadPriorState: boolean;
  /** Surface title, when known (from create_surface metadata). */
  title?: string;
}

// ─── Protocol line serializers (field names match genui SurfaceManager) ──

function createSurfaceLine(surfaceId: string): string {
  return JSON.stringify({ createSurface: { surfaceId, catalogId: 'default', theme: {} } });
}

function updateComponentsLine(surfaceId: string, components: unknown[]): string {
  return JSON.stringify({ updateComponents: { surfaceId, components } });
}

function updateDataModelLine(surfaceId: string, path: string, value: unknown): string {
  return JSON.stringify({ updateDataModel: { surfaceId, path, value } });
}

function deleteSurfaceLine(surfaceId: string): string {
  return JSON.stringify({ deleteSurface: { surfaceId } });
}

// ─── Small helpers ────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Components are plain JSON — a round trip is the cheapest faithful clone. */
function cloneJson<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function isComponent(v: unknown): v is Record<string, unknown> {
  return isRecord(v) && typeof v.id === 'string' && typeof v.component === 'string';
}

function findById(components: unknown[], id: unknown): number {
  if (typeof id !== 'string') return -1;
  return components.findIndex((c) => isRecord(c) && c.id === id);
}

// ─── Component operations (two coexisting dialects) ───────────────
//
// update_components args carry an `operations` array that appears in two
// shapes in the wild:
// 1. skill dialect (what the a2ui-generation skill teaches): one
//    `{op:'replace', path:'/components', value:[full array]}` carrying the
//    whole tree — the overwhelmingly common case.
// 2. wrangler struct dialect (ComponentOperation in operations.rs):
//    insert/update/delete/replace addressed by component/parent ids.
// Both are normalized below; anything else is dropped per the no-throw rule.

function applyOperations(components: unknown[], ops: unknown[]): unknown[] {
  const list = cloneJson(components);
  for (const raw of ops) {
    if (!isRecord(raw)) continue;
    const op = typeof raw.op === 'string' ? raw.op : '';
    // Skill dialect: full-tree payload addressed by JSON-Pointer. The verb is
    // NOT part of the semantics — models emit replace/insert/set alike with
    // path '/components' + a full array (observed live: op:'insert' carrying
    // the whole tree). Anything matching that shape is a full replacement.
    const isFullTreePath = raw.path === '/components' || raw.path === '/' || raw.path === '';
    if (isFullTreePath && Array.isArray(raw.value)) {
      list.length = 0;
      list.push(...cloneJson(raw.value));
      continue;
    }
    switch (op) {
      case 'insert': {
        if (!isComponent(raw.component)) break;
        const parentIdx = findById(list, raw.parentId);
        let idx = parentIdx >= 0 ? parentIdx + 1 : list.length;
        const afterIdx = findById(list, raw.afterId);
        if (afterIdx >= 0) idx = afterIdx + 1;
        list.splice(Math.min(idx, list.length), 0, cloneJson(raw.component));
        break;
      }
      case 'update': {
        const i = findById(list, raw.componentId);
        if (i < 0) break;
        const node = list[i] as Record<string, unknown>;
        // genui nodes are flat (props at the top level, style nested) —
        // the wrangler properties/styles split folds onto that shape.
        if (isRecord(raw.properties)) Object.assign(node, raw.properties);
        if (isRecord(raw.styles)) {
          node.style = { ...(isRecord(node.style) ? node.style : {}), ...raw.styles };
        }
        break;
      }
      case 'delete': {
        const i = findById(list, raw.componentId);
        if (i >= 0) list.splice(i, 1);
        break;
      }
      case 'replace': {
        if (!isComponent(raw.component)) break;
        const comp = cloneJson(raw.component);
        const i = findById(list, comp.id);
        if (i >= 0) list[i] = comp;
        else list.push(comp);
        break;
      }
      default:
        break;
    }
  }
  return list;
}

// ─── Data model updates ───────────────────────────────────────────

/** JSON-Pointer segment unescape (~1 → /, ~0 → ~). */
function decodeSegment(seg: string): string {
  return seg.replace(/~1/g, '/').replace(/~0/g, '~');
}

/** Set `value` at JSON-Pointer `path` inside a JSON tree, immutably.
 * '' and '/' replace the root; numeric segments index into arrays. */
function setByPath(root: unknown, path: string, value: unknown): unknown {
  const segs = path.split('/').filter(Boolean).map(decodeSegment);
  if (segs.length === 0) return value;
  const nextRoot = cloneJson(root ?? {});
  if (!isRecord(nextRoot) && !Array.isArray(nextRoot)) return value;
  let cur: Record<string, unknown> | unknown[] = nextRoot;
  for (let i = 0; i < segs.length - 1; i++) {
    const k = segs[i];
    const container = cur as Record<string, unknown>;
    const child = container[k];
    if (!isRecord(child) && !Array.isArray(child)) {
      container[k] = /^\d+$/.test(segs[i + 1]) ? [] : {};
    }
    cur = container[k] as Record<string, unknown> | unknown[];
  }
  (cur as Record<string, unknown>)[segs[segs.length - 1]] = value;
  return nextRoot;
}

// ─── Entry point ──────────────────────────────────────────────────

/**
 * Fold one a2ui_* tool call into the surface registry and produce the
 * protocol lines for it. Returns null when the args are unusable (missing
 * surfaceId / wrong shape) — the caller degrades to a generic tool_call
 * block instead of dropping the call silently.
 */
export function applyA2uiCall(
  surfaces: A2uiSurfaces,
  toolName: string,
  args: unknown
): A2uiApplyResult | null {
  if (!isRecord(args)) return null;
  const surfaceId = typeof args.surfaceId === 'string' ? args.surfaceId : '';
  if (!surfaceId) return null;
  const prior = surfaces[surfaceId];
  const next = { ...surfaces };

  switch (toolName) {
    case 'a2ui_create_surface': {
      const meta = isRecord(args.metadata) ? args.metadata : {};
      const title = typeof meta.title === 'string' && meta.title ? meta.title : undefined;
      next[surfaceId] = { components: [], dataModel: {}, ...(title ? { title } : {}) };
      return {
        surfaces: next,
        surfaceId,
        lines: [createSurfaceLine(surfaceId)],
        hadPriorState: prior !== undefined,
        ...(title ? { title } : {}),
      };
    }
    case 'a2ui_update_components': {
      if (!Array.isArray(args.operations)) return null;
      const prev: A2uiSurfaceState = prior ?? { components: [], dataModel: {} };
      const components = applyOperations(prev.components, args.operations);
      next[surfaceId] = { ...prev, components };
      return {
        surfaces: next,
        surfaceId,
        lines: [updateComponentsLine(surfaceId, components)],
        hadPriorState: prior !== undefined,
        ...(prev.title !== undefined ? { title: prev.title } : {}),
      };
    }
    case 'a2ui_update_data_model': {
      if (!Array.isArray(args.updates)) return null;
      const prev: A2uiSurfaceState = prior ?? { components: [], dataModel: {} };
      let dataModel: unknown = prev.dataModel ?? {};
      const lines: string[] = [];
      for (const u of args.updates) {
        if (!isRecord(u) || typeof u.path !== 'string' || !('value' in u)) continue;
        dataModel = setByPath(dataModel, u.path, u.value);
        lines.push(updateDataModelLine(surfaceId, u.path, u.value));
      }
      next[surfaceId] = { ...prev, dataModel };
      return {
        surfaces: next,
        surfaceId,
        lines,
        hadPriorState: prior !== undefined,
        ...(prev.title !== undefined ? { title: prev.title } : {}),
      };
    }
    case 'a2ui_delete_surface': {
      delete next[surfaceId];
      return {
        surfaces: next,
        surfaceId,
        lines: [deleteSurfaceLine(surfaceId)],
        hadPriorState: prior !== undefined,
      };
    }
    default:
      return null;
  }
}

/**
 * Opening lines for a NEWLY created a2ui block. Every block must start with
 * a createSurface line (each block owns an isolated genui engine). When the
 * surface had prior state (later-turn reopen), the full component tree and
 * data model are replayed too — except the parts this very call already
 * carries — so the reopened block renders the complete surface on its own.
 */
export function a2uiBlockOpeningLines(toolName: string, r: A2uiApplyResult): string[] {
  if (toolName === 'a2ui_create_surface') return [];
  const out = [createSurfaceLine(r.surfaceId)];
  if (!r.hadPriorState) return out;
  const st = r.surfaces[r.surfaceId];
  if (!st) return out; // delete_surface on a tracked surface
  if (toolName !== 'a2ui_update_components' && st.components.length > 0) {
    out.push(updateComponentsLine(r.surfaceId, st.components));
  }
  if (
    toolName !== 'a2ui_update_data_model' &&
    isRecord(st.dataModel) &&
    Object.keys(st.dataModel).length > 0
  ) {
    out.push(updateDataModelLine(r.surfaceId, '', st.dataModel));
  }
  return out;
}
