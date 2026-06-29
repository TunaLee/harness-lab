// 구조 검증 — 플러그인이 '올바른 모양'인지 오프라인으로 확인. 실행: `node --test`
// guard 로직(guard.test.mjs)과 별개로, 매니페스트·스킬·에이전트·hook 설정을 점검한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../harness/', import.meta.url));

// 아주 단순한 frontmatter 파서 (key: value 한 줄씩)
function frontmatter(path) {
  const txt = readFileSync(path, 'utf8');
  const m = txt.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, `${path}: frontmatter(--- ---) 없음`);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

test('plugin.json — 유효 JSON · name=harness', () => {
  const j = JSON.parse(readFileSync(root + '.claude-plugin/plugin.json', 'utf8'));
  assert.equal(j.name, 'harness');
  assert.ok(j.description && j.version, 'description·version 필요');
});

test('skills — orchestrate/spec/breakdown/tdd 모두 SKILL.md + name', () => {
  for (const s of ['orchestrate', 'spec', 'breakdown', 'tdd']) {
    const p = `${root}skills/${s}/SKILL.md`;
    assert.ok(existsSync(p), `${p} 없음`);
    assert.equal(frontmatter(p).name, s, `${s} frontmatter name 불일치`);
  }
});

test('orchestrate — 5단계 순서 + $ARGUMENTS 명시', () => {
  const txt = readFileSync(root + 'skills/orchestrate/SKILL.md', 'utf8');
  for (const step of ['spec', 'breakdown', 'tdd', 'bug-hunter', 'qa-tester']) {
    assert.match(txt, new RegExp(step), `orchestrate에 ${step} 단계 없음`);
  }
  assert.match(txt, /\$ARGUMENTS/, '$ARGUMENTS 입력 수신 없음');
});

test('bug-hunter — 읽기전용: tools가 Read·Grep·Glob 뿐 (쓰기·실행 불가)', () => {
  const fm = frontmatter(root + 'agents/bug-hunter.md');
  assert.equal(fm.name, 'bug-hunter');
  const tools = fm.tools.split(',').map(t => t.trim()).sort();
  assert.deepEqual(tools, ['Glob', 'Grep', 'Read']);
  for (const banned of ['Write', 'Edit', 'Bash']) {
    assert.ok(!fm.tools.includes(banned), `bug-hunter에 ${banned}가 있으면 안 됨`);
  }
});

test('qa-tester — 존재 · name 일치', () => {
  assert.equal(frontmatter(root + 'agents/qa-tester.md').name, 'qa-tester');
});

test('hooks.json — PreToolUse + ${CLAUDE_PLUGIN_ROOT}/guard.mjs', () => {
  const j = JSON.parse(readFileSync(root + 'hooks/hooks.json', 'utf8'));
  assert.ok(j.hooks?.PreToolUse?.length, 'PreToolUse 없음');
  const cmd = j.hooks.PreToolUse[0].hooks[0].command;
  assert.match(cmd, /\$\{CLAUDE_PLUGIN_ROOT\}/, '플러그인 경로 변수(${CLAUDE_PLUGIN_ROOT}) 사용해야 함');
  assert.match(cmd, /guard\.mjs/, 'guard.mjs 참조 없음');
});
