import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const p = (input.tool_input?.file_path || '').replace(/\\/g, '/').toLowerCase();
const cmd = input.tool_input?.command || '';
const BLOCK = ['.env', '/.git/', 'id_rsa', 'secrets', '.pem'];

if (BLOCK.some(b => p.includes(b)) || /rm\s+-rf\s+[\/~]/.test(cmd)) {
  console.error('차단: 민감 경로 / 위험 명령');
  process.exit(2); // 2 = 도구 호출 차단
}
process.exit(0);
