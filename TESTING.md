# 테스트하는 법 (TESTING)

이 레퍼런스가 제대로 도는지, 그리고 **본인이 손으로 만든 버전**이 맞게 됐는지 확인하는 방법입니다.

## 0. 사전
- Node 18+ 만 있으면 됩니다 (`node --version`). 인터넷·npm·`git clone` 불필요.

---

## 1. 자동 테스트 (오프라인) — 한 줄

```bash
node --test
```

두 묶음이 함께 돌아갑니다:

| 파일 | 무엇을 검증 |
|------|------------|
| `test/guard.test.mjs` | `.env` 차단 hook이 **실제로** 막는지 (exit code 계약) |
| `test/structure.test.mjs` | 플러그인이 **올바른 모양**인지 (매니페스트·스킬·에이전트·hook) |

**통과 기준:** `# pass`가 전부, `# fail 0`.

### 1-1. guard hook 케이스 표

| 입력 (`tool_input`) | 기대 exit code |
|---|---|
| `.env` / `.git/` / `id_rsa` / `secrets` / `.pem` 경로 | **2 (차단)** |
| `rm -rf /` · `rm -rf ~` 류 명령 | **2 (차단)** |
| `C:\app\.env` (Windows 역슬래시) | **2 (차단)** |
| 일반 파일(`src/app.js`) · 일반 명령(`npm test`) | **0 (허용)** |

> exit **2 = 도구 호출 차단**, exit 0 = 허용. (exit 1은 차단이 아니라 '통과'로 처리됨)

### 1-2. 개별 케이스 손으로 돌려보기

```bash
echo '{"tool_input":{"file_path":"x/.env"}}'   | node harness/hooks/guard.mjs; echo "exit=$?"   # → 2
echo '{"tool_input":{"command":"rm -rf /"}}'    | node harness/hooks/guard.mjs; echo "exit=$?"   # → 2
echo '{"tool_input":{"file_path":"src/app.js"}}' | node harness/hooks/guard.mjs; echo "exit=$?"  # → 0
```

---

## 2. 플러그인 구조 검증

```bash
claude plugin validate ./harness
```

매니페스트·frontmatter 오류를 잡아줍니다. **통과 기준:** 에러 없음.
(참고: validate는 "구조가 well-formed"라는 뜻이지 "안전하다"는 보장이 아닙니다.)

---

## 3. Claude Code에서 동작 테스트 (수동)

```bash
claude --plugin-dir ./harness
```

세션이 열리면:
- `/` 또는 `/plugin` 입력 → `harness:orchestrate` 등 스킬이 보이는지
- `/agents` → `bug-hunter` · `qa-tester`가 보이는지

### 3-1. 지휘자가 순서를 강제하나

```
/harness:orchestrate 로그인 기능 추가
```

관찰 체크리스트:
- ☐ spec(인수 조건)을 먼저 확정하고, 그 전엔 코드부터 짜지 않는다
- ☐ **spec → breakdown → tdd → @bug-hunter → @qa-tester** 순서로 진행
- ☐ "그냥 바로 코드부터 짜줘"라고 떠밀어도 spec을 건너뛰지 않는다

> 순서를 무시하면 → `skills/orchestrate/SKILL.md`의 단계 문구를 더 단단히("~ 전에는 금지"). *모델이 무시하면 무시 못 하게 조이는 그 반복이 곧 학습.*

### 3-2. 감사자가 읽기전용인가
- `@bug-hunter`가 결함을 **보고만** 하고 파일을 수정·실행하지 않는지
- (`tools`가 Read·Grep·Glob라 쓰기 시도 자체가 구조적으로 불가)

### 3-3. 게이트가 실제로 막나
- 세션에서 `.env`를 읽거나 쓰려 시도 → hook이 차단(`차단: 민감 경로 / 위험 명령`)
- 일반 파일은 정상 동작

---

## 4. 본인 버전 vs 레퍼런스 대조 (학생용 체크리스트)

손으로 만든 걸 이 레퍼런스와 비교해 보세요:

- ☐ **orchestrate** — `description`만 읽어도 "언제 쓸지" 명확 / 단계가 순서 강제 / `$ARGUMENTS`로 입력 수신
- ☐ **bug-hunter** — `tools`가 Read·Grep·Glob로 제한 (쓰기 구조적 불가)
- ☐ **guard.mjs** — `.env`·위험 명령에서 exit 2 (`node --test`로 확인)
- ☐ **hooks.json** — matcher `Read|Edit|Write|Bash`, 경로 `${CLAUDE_PLUGIN_ROOT}`
- ☐ **배치** — 컴포넌트 폴더(`skills/`·`agents/`·`hooks/`)가 `.claude-plugin/` **밖(루트)** 에 있는지

---

## 5. 흔한 실패와 원인

| 증상 | 원인 / 해결 |
|---|---|
| 플러그인은 뜨는데 스킬·에이전트가 안 보임 | 컴포넌트 폴더를 `.claude-plugin/` **안**에 둠 → 루트로 옮길 것 |
| hook이 안 먹음 | `hooks.json` 경로·JSON 오류, 또는 node 미설치 → 먼저 `node --test`로 로직 확인 |
| `ReferenceError: require is not defined` | `.mjs`에서 `require` 사용 → `import`로 교체 (이 레포는 이미 적용) |
| `claude plugin validate` 경고 | 오타로 인식 안 되는 필드. `--strict`로 CI에서 잡기 |
