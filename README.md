# harness-lab — "오케스트레이터 직접 짓기" 레퍼런스

멀티에이전트 워크숍 **직접 만들기(BUILD YOUR OWN)** 랩의 *정답(레퍼런스)* 패키지입니다.
학생이 손으로 만드는 결과물 — 순서를 강제하는 지휘자 스킬 + 읽기전용 감사 서브에이전트 + `.env` 차단 hook — 을
하나의 Claude Code **플러그인(`harness`)** 으로 묶어둔 완성본이에요. 막히거나 다 만든 뒤 자기 버전과 대조하는 용도로 쓰세요.

## 무엇이 들어있나

```
harness-lab/
├── harness/                         ← Claude Code 플러그인 (이게 '정답')
│   ├── .claude-plugin/plugin.json     매니페스트 (name = harness)
│   ├── skills/
│   │   ├── orchestrate/SKILL.md        지휘자: spec→breakdown→tdd→@bug-hunter→@qa 순서 강제
│   │   ├── spec/SKILL.md               인수 조건 확정
│   │   ├── breakdown/SKILL.md          작업 분해
│   │   └── tdd/SKILL.md                테스트 우선 구현
│   ├── agents/
│   │   ├── bug-hunter.md               읽기전용 감사자 (tools: Read·Grep·Glob)
│   │   └── qa-tester.md                인수 조건 대비 최종 검증
│   └── hooks/
│       ├── hooks.json                  PreToolUse 등록
│       └── guard.mjs                   .env·위험 명령 차단 (exit 2)
├── test/
│   ├── guard.test.mjs                .env 차단 hook 동작 검증
│   └── structure.test.mjs            플러그인 구조 검증 (매니페스트·스킬·에이전트·hook)
└── TESTING.md                        테스트하는 법 (자동·수동·체크리스트)
```

## 로드해서 써보기

```bash
# 1) 구조 검증
claude plugin validate ./harness

# 2) 플러그인으로 로드
claude --plugin-dir ./harness

# 3) 세션에서 지휘자 호출 — 스킬은 plugin-name:skill 로 네임스페이스됨
/harness:orchestrate 로그인 기능 추가
#   → spec → breakdown → tdd → @bug-hunter → @qa-tester 순서대로 발동

# 게이트 확인: .env 접근을 시도하면 hook이 exit 2로 차단
```

## 오프라인 테스트 (git clone·npm 불필요)

```bash
node --test          # Node 18+ 내장 러너
```

`guard.mjs`가 `.env`·위험 명령을 exit 2로 막는지(`guard.test.mjs`)와, 플러그인 구조가 올바른지(`structure.test.mjs`)를 함께 검증합니다. 케이스 표·수동 테스트·본인 버전 대조 체크리스트는 **[TESTING.md](./TESTING.md)** 를 보세요.

## 표준 설치(.claude/) vs 플러그인 — hook 경로 차이

수업에서 단독으로 만들 땐 `.claude/settings.json`에 등록하고 경로에 `$CLAUDE_PROJECT_DIR`를 씁니다:

```json
"command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/guard.mjs"
```

플러그인으로 묶으면 설치 위치가 달라지므로 `hooks/hooks.json`에서 **`${CLAUDE_PLUGIN_ROOT}`** 를 씁니다:

```json
"command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/guard.mjs"
```

## 알아둘 것
- 단독 버전 슬라이드의 `guard.mjs`는 `require('fs')`로 적혀 있는데, `.mjs`(ESM)에는 `require`가 없어 **그대로는 실행되지 않습니다**(`ReferenceError: require is not defined`). 이 레퍼런스는 `import { readFileSync } from 'node:fs'`로 고쳐 실제로 동작합니다 — 슬라이드 코드도 같이 바꾸는 걸 권장해요.
- `plugin.json`의 `author`는 자리표시입니다. 본인 정보로 바꾸고 `github.com/<you>/harness-lab` 같은 레포로 올리면, 다른 실습(`buggy-request`·`nextjs-boilerplate`)처럼 슬라이드에 clone 링크를 달 수 있어요.
- 플러그인 컴포넌트 폴더(`skills/`·`agents/`·`hooks/`)는 반드시 **플러그인 루트**에 둡니다. `.claude-plugin/` 안에는 `plugin.json`만 들어갑니다.

## 라이선스
MIT
