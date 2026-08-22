#!/usr/bin/env node
/**
 * Release tool for the skill-ui monorepo.
 *
 * One command per package release: version bump → release commit → annotated
 * `<name>@<version>` git tag → `pnpm publish` (tests + build run via
 * prepublishOnly) → push. Tags use the full package name
 * (`@agentskillmania/skill-ui-chat@0.2.1`) because package versions evolve
 * independently and a single global `v*` tag cannot represent them.
 *
 * Also audits (`--check`) and backfills (`--backfill`) git tags for versions
 * already on npm — releases made before this tool often shipped without tags.
 *
 * Usage:
 *   pnpm release <pkg> [patch|minor|major|x.y.z] [--note "..."]   release a package
 *   pnpm release --check                                          npm versions ↔ git tags audit
 *   pnpm release --backfill [--apply]                             tag published versions at their bump commits
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = join(ROOT, 'packages');

/// Run a command, capture stdout. Throws on non-zero exit.
function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

/// Run an interactive command (publish/push), inheriting stdio for prompts/OTP.
function runInteractive(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

function shellQuote(s) {
  return `'${String(s).replaceAll("'", `'\\''`)}'`;
}

/** @returns {{ dir: string, short: string, name: string, version: string, private: boolean }[]} */
function loadPackages() {
  return readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(PACKAGES_DIR, e.name, 'package.json')))
    .map((e) => {
      const json = JSON.parse(readFileSync(join(PACKAGES_DIR, e.name, 'package.json'), 'utf8'));
      return {
        dir: `packages/${e.name}`,
        short: e.name,
        name: json.name,
        version: json.version,
        private: Boolean(json.private),
      };
    });
}

function bumpVersion(version, bump) {
  if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(bump)) return bump;
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) throw new Error(`cannot parse current version "${version}"`);
  const [, major, minor, patch] = m;
  if (bump === 'major') return `${Number(major) + 1}.0.0`;
  if (bump === 'minor') return `${major}.${Number(minor) + 1}.0`;
  if (bump === 'patch') return `${major}.${minor}.${Number(patch) + 1}`;
  throw new Error(`unknown bump "${bump}" (expected patch | minor | major | x.y.z)`);
}

/** Published versions + publish times from the npm registry. */
function npmInfo(name) {
  try {
    const versions = JSON.parse(run(`npm view ${name} versions --json`));
    const time = JSON.parse(run(`npm view ${name} time --json`));
    return { versions: versions ?? [], time: time ?? {} };
  } catch {
    return { versions: [], time: {} }; // not published yet (E404)
  }
}

function localTags() {
  return run('git tag -l')
    .trim()
    .split('\n')
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// pnpm release <pkg> [bump] [--note "..."]
// ---------------------------------------------------------------------------
function release([pkg, bump = 'patch', ...rest]) {
  const noteIdx = rest.indexOf('--note');
  const note = noteIdx >= 0 ? rest[noteIdx + 1] : undefined;

  const target = loadPackages().find((p) => p.short === pkg || p.name === pkg);
  if (!target) {
    const known = loadPackages()
      .map((p) => p.short)
      .join(', ');
    console.error(`package "${pkg}" not found under packages/ (${known})`);
    process.exit(1);
  }
  if (target.private) {
    console.error(`package "${pkg}" is private — nothing to publish`);
    process.exit(1);
  }
  if (run('git status --porcelain').trim()) {
    console.error('git worktree is dirty — commit your changes first (what you publish must be what you committed)');
    process.exit(1);
  }
  const branch = run('git branch --show-current').trim();
  if (branch !== 'main') {
    console.error(`on branch "${branch}" — releases must come from main`);
    process.exit(1);
  }

  const next = bumpVersion(target.version, bump);
  const tag = `${target.name}@${next}`;
  if (localTags().includes(tag)) {
    console.error(`tag ${tag} already exists`);
    process.exit(1);
  }
  if (npmInfo(target.name).versions.includes(next)) {
    console.error(`${next} is already on npm for ${target.name}`);
    process.exit(1);
  }

  console.log(`\n→ ${target.name} ${target.version} → ${next}${note ? ` — ${note}` : ''}\n`);

  // 1. bump package.json
  const pkgPath = join(PACKAGES_DIR, target.short, 'package.json');
  const json = JSON.parse(readFileSync(pkgPath, 'utf8'));
  json.version = next;
  writeFileSync(pkgPath, `${JSON.stringify(json, null, 2)}\n`);

  // 2. release commit (pre-commit hook runs tests/build/format/lint)
  const message = note ? `chore(release): ${target.short} ${next}——${note}` : `chore(release): ${target.short} ${next}`;
  runInteractive(`git commit -am ${shellQuote(message)}`);

  // 3. publish (prepublishOnly runs unit tests + build; workspace:* pinned to exact versions)
  try {
    runInteractive(`pnpm --filter ${target.name} publish`);
  } catch {
    console.error(
      `\npublish failed — undo the bump commit with:\n  git reset --hard HEAD~1\n` +
        `(if the publish actually went through, keep the commit and tag manually: git tag -a ${shellQuote(tag)})`,
    );
    process.exit(1);
  }

  // 4. annotated tag on the bump commit
  run(`git tag -a ${shellQuote(tag)} -m ${shellQuote(message)}`);

  // 5. push branch + tag
  runInteractive('git push origin main');
  runInteractive(`git push origin ${shellQuote(tag)}`);

  console.log(`\n✓ released ${tag}`);
}

// ---------------------------------------------------------------------------
// pnpm release --check
// ---------------------------------------------------------------------------
function check() {
  const tags = localTags();
  let missing = 0;
  for (const p of loadPackages().filter((p) => !p.private)) {
    const { versions, time } = npmInfo(p.name);
    if (!versions.length) {
      console.log(`${p.short}: not on npm`);
      continue;
    }
    const missingTags = versions.filter((v) => !tags.includes(`${p.name}@${v}`));
    const extraTags = tags.filter((t) => t.startsWith(`${p.name}@`) && !versions.includes(t.slice(p.name.length + 1)));
    const latest = Object.entries(time)
      .filter(([k]) => k !== 'created' && k !== 'modified')
      .sort((a, b) => a[1].localeCompare(b[1]))
      .at(-1)?.[0];
    console.log(
      `${p.short}: npm ${versions.length} versions (latest ${latest}, workspace ${p.version}) — ` +
        `${missingTags.length ? `MISSING TAGS: ${missingTags.join(', ')}` : 'all tagged'}` +
        `${extraTags.length ? ` | tags not on npm: ${extraTags.join(', ')}` : ''}`,
    );
    missing += missingTags.length;
  }
  if (missing) {
    console.log(`\n${missing} published version(s) without tags — run: pnpm release --backfill`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// pnpm release --backfill [--apply]
// ---------------------------------------------------------------------------
/**
 * For every published version, find the commit where packages/<p>/package.json
 * version FIRST became that value (walking the file's history newest→oldest),
 * then pick the candidate closest before the npm publish time — version numbers
 * were re-used across the repo's history, so a version can have several bump
 * commits. Versions never committed (published from a dirty tree) fall back to
 * the nearest commit before publish time and are flagged approximate.
 */
function findBumpCommit(pkg, version, publishTime) {
  const log = run(`git log '--format=%H|%cI' -- ${pkg.dir}/package.json`)
    .trim()
    .split('\n')
    .filter(Boolean);
  const states = log.map((line) => {
    const [hash, date] = line.split('|');
    let v = null;
    try {
      const raw = run(`git show ${hash}:${pkg.dir}/package.json`);
      v = /"version":\s*"([^"]+)"/.exec(raw)?.[1] ?? null;
    } catch {
      v = null; // path did not exist yet at this commit
    }
    return { hash, date, version: v };
  });
  // states runs newest→oldest; commit i "became" its version relative to i+1
  const candidates = [];
  for (let i = 0; i < states.length; i++) {
    const older = states[i + 1];
    if (states[i].version === version && (!older || older.version !== version)) candidates.push(states[i]);
  }
  const ts = (s) => new Date(s).getTime(); // commit dates are +08:00, npm times Z — never compare as strings
  // newest bump commit that predates the publish
  const exact = candidates.filter((c) => ts(c.date) <= ts(publishTime));
  if (exact.length) return { ...exact[0], approx: false };
  // published before the bump was committed (dirty tree) — nearest commit before publish instead
  const fallback = states.find((s) => ts(s.date) <= ts(publishTime)) ?? candidates[0];
  return fallback ? { ...fallback, approx: true } : null;
}

function backfill(apply) {
  let created = 0;
  const skipped = [];
  const tags = localTags();
  for (const p of loadPackages().filter((p) => !p.private)) {
    const { versions, time } = npmInfo(p.name);
    for (const v of versions) {
      const tag = `${p.name}@${v}`;
      if (tags.includes(tag)) continue;
      const publishTime = time[v];
      if (!publishTime) {
        skipped.push(`${tag} (no publish time on npm)`);
        continue;
      }
      const hit = findBumpCommit(p, v, publishTime);
      if (!hit) {
        skipped.push(`${tag} (no commit found)`);
        continue;
      }
      console.log(
        `${apply ? 'TAG' : 'would tag'} ${tag} → ${hit.hash.slice(0, 8)} ${hit.date}` +
          `${hit.approx ? '  [approximate — version never committed]' : ''}`,
      );
      if (apply) {
        run(`git tag -a ${shellQuote(tag)} -m ${shellQuote(`backfill: ${tag} (published ${publishTime})`)}`);
        created++;
      }
    }
  }
  if (skipped.length) console.log(`\nskipped:\n  ${skipped.join('\n  ')}`);
  if (apply) {
    console.log(`\ncreated ${created} tag(s) — review with git tag -l '*@*', then push:\n  git push origin --tags`);
  } else {
    console.log('\ndry run — pass --apply to create the tags');
  }
}

// ---------------------------------------------------------------------------

const [command, ...args] = process.argv.slice(2);
if (command === '--check') {
  check();
} else if (command === '--backfill') {
  backfill(args.includes('--apply'));
} else if (command && !command.startsWith('-')) {
  release([command, ...args]);
} else {
  console.log(
    'Usage:\n  pnpm release <pkg> [patch|minor|major|x.y.z] [--note "..."]\n  pnpm release --check\n  pnpm release --backfill [--apply]',
  );
  process.exit(command ? 1 : 0);
}
