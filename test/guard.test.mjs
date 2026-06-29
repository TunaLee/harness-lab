import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GUARD = join(__dirname, '..', 'harness', 'hooks', 'guard.mjs');

function run(payload) {
  try { execFileSync('node', [GUARD], { input: JSON.stringify(payload) }); return 0; }
  catch (e) { return e.status; }
}

test('blocks .env', () => assert.equal(run({ tool_input: { file_path: 'x/.env' } }), 2));
test('blocks .git path', () => assert.equal(run({ tool_input: { file_path: 'repo/.git/config' } }), 2));
test('blocks id_rsa', () => assert.equal(run({ tool_input: { file_path: '~/.ssh/id_rsa' } }), 2));
test('blocks rm -rf /', () => assert.equal(run({ tool_input: { command: 'rm -rf /' } }), 2));
test('blocks windows backslash .env', () => assert.equal(run({ tool_input: { file_path: 'C:\\app\\.env' } }), 2));
test('allows normal file', () => assert.equal(run({ tool_input: { file_path: 'src/index.js' } }), 0));
test('allows safe command', () => assert.equal(run({ tool_input: { command: 'npm test' } }), 0));
