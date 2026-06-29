// 오프라인 테스트 — git clone·npm 불필요. 실행: `node --test`
// guard.mjs를 실제로 띄워 stdin(JSON) → exit code 계약(2=차단, 0=허용)을 검증한다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const guard = fileURLToPath(new URL('../harness/hooks/guard.mjs', import.meta.url));

function run(payload) {
  return spawnSync('node', [guard], { input: JSON.stringify(payload), encoding: 'utf8' });
}

test('.env 접근 → exit 2 (차단)', () => {
  assert.equal(run({ tool_input: { file_path: 'app/.env' } }).status, 2);
});

test('.git 내부 경로 → exit 2', () => {
  assert.equal(run({ tool_input: { file_path: 'repo/.git/config' } }).status, 2);
});

test('개인키 · 시크릿 · 인증서 → exit 2', () => {
  assert.equal(run({ tool_input: { file_path: '~/.ssh/id_rsa' } }).status, 2);
  assert.equal(run({ tool_input: { file_path: 'a/secrets.json' } }).status, 2);
  assert.equal(run({ tool_input: { file_path: 'certs/server.pem' } }).status, 2);
});

test('rm -rf / · rm -rf ~ 류 위험 명령 → exit 2', () => {
  assert.equal(run({ tool_input: { command: 'rm -rf /' } }).status, 2);
  assert.equal(run({ tool_input: { command: 'rm -rf ~/work' } }).status, 2);
});

test('Windows 역슬래시 경로의 .env 도 차단', () => {
  assert.equal(run({ tool_input: { file_path: 'C:\\app\\.env' } }).status, 2);
});

test('일반 파일 · 명령 → exit 0 (허용)', () => {
  assert.equal(run({ tool_input: { file_path: 'src/index.js' } }).status, 0);
  assert.equal(run({ tool_input: { command: 'npm test' } }).status, 0);
});
