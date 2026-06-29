// PreToolUse hook: stdin(JSON) → 민감 경로·위험 명령 검사 → exit code.
//   exit 2 = 도구 호출 차단 / exit 0 = 허용  (exit 1은 차단이 아니라 '통과'로 처리됨)
//
// 주의: 단독(.claude) 버전 슬라이드는 require('fs')로 적혀 있으나,
//       .mjs(ESM)에는 require가 없어 실행되지 않는다 → import로 고쳐 실제 동작하게 함.
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const p = (input.tool_input?.file_path || '').replace(/\\/g, '/').toLowerCase();
const cmd = input.tool_input?.command || '';
const BLOCK = ['.env', '/.git/', 'id_rsa', 'secrets', '.pem'];

if (BLOCK.some(b => p.includes(b)) || /rm\s+-rf\s+[\/~]/.test(cmd)) {
  console.error('차단: 민감 경로 / 위험 명령');
  process.exit(2);   // ← 2 면 도구 호출 차단
}
process.exit(0);
