import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const h = (...p) => join(root, 'harness', ...p);

test('plugin manifest exists', () => assert.ok(existsSync(h('.claude-plugin', 'plugin.json'))));
test('orchestrate skill exists', () => assert.ok(existsSync(h('skills', 'orchestrate', 'SKILL.md'))));
test('spec + tdd skills exist', () => {
  assert.ok(existsSync(h('skills', 'spec', 'SKILL.md')));
  assert.ok(existsSync(h('skills', 'tdd', 'SKILL.md')));
});
test('four agents exist', () => {
  for (const a of ['planner', 'coder', 'reviewer', 'tester'])
    assert.ok(existsSync(h('agents', `${a}.md`)), `missing ${a}`);
});
test('hook exists', () => assert.ok(existsSync(h('hooks', 'guard.mjs'))));
test('orchestrate delegates to all four agents in order', () => {
  const md = readFileSync(h('skills', 'orchestrate', 'SKILL.md'), 'utf8');
  const order = ['planner', 'coder', 'reviewer', 'tester'].map(a => md.indexOf(a));
  assert.ok(order.every(i => i >= 0), 'missing an agent');
  assert.deepEqual(order, [...order].sort((a, b) => a - b), 'agents out of order');
});
test('orchestrate uses worktree for parallel coders', () => {
  const md = readFileSync(h('skills', 'orchestrate', 'SKILL.md'), 'utf8');
  assert.match(md, /worktree/);
  assert.match(md, /\.claude\/worktrees\//);
});
test('reviewer is read-only (no Write/Edit/Bash)', () => {
  const fm = readFileSync(h('agents', 'reviewer.md'), 'utf8').split('---')[1];
  assert.doesNotMatch(fm, /Write|Edit|Bash/);
});
test('coder can write (has Write + Bash)', () => {
  const fm = readFileSync(h('agents', 'coder.md'), 'utf8').split('---')[1];
  assert.match(fm, /Write/);
  assert.match(fm, /Bash/);
});
