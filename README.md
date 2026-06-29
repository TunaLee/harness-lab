# harness — 멀티에이전트 오케스트레이터 (워크숍 정답 패키지)

덱 슬라이드 42의 오케스트레이터 모양을 그대로 만든 Claude Code 플러그인입니다.

```
Orchestrator (Supervisor)
   ├─ @planner   기획 · 분해        (Read, Grep)
   ├─ @coder ×N  병렬 구현 (worktree) (Read, Write, Edit, Bash)
   ├─ @reviewer  객관 리뷰 (읽기전용)  (Read, Grep, Glob)
   └─ @tester    검증 · 게이트        (Read, Bash)
사람은 spec 승인 · 최종 머지 게이트에서만 개입 · 검증 실패 → 되돌림
```

## 구조
```
harness/
├── .claude-plugin/plugin.json
├── skills/
│   ├── orchestrate/SKILL.md   리드 — 위 순서를 강제 + worktree 병렬
│   ├── spec/SKILL.md          인수조건 도출 (planner)
│   └── tdd/SKILL.md           RED→GREEN (coder)
├── agents/{planner, coder, reviewer, tester}.md
└── hooks/{hooks.json, guard.mjs}   .env·위험명령 차단
```

## 설치 (셋 중 하나)
```bash
# 1) 로컬 로드
claude --plugin-dir ./harness

# 2) 자동 로드 (gstack과 같은 방식)
cp -r harness ~/.claude/skills/harness   # harness@skills-dir

# 3) 마켓플레이스 — marketplace.json 추가 후 /plugin marketplace add
```

## 사용
```
/harness:orchestrate 로그인 기능 추가
# planner → coder(병렬 worktree, TDD) → reviewer → tester 순서로 발동
```

## 테스트
```bash
node --test        # guard + 구조 검사 (오프라인, git clone·npm 불요)
```

Superpowers를 카피한 강제 흐름(spec→TDD 병렬→리뷰→검증)을 직접 조립해보는 것이 목적입니다.
