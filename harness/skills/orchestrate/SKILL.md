---
name: orchestrate
description: "○○ 기능 만들어줘 / 추가해줘" 같은 기능 구현 요청이 오면 발동. 한 명의 리드가 작업을 분해해 planner→coder→reviewer→tester 순서로 위임하고, 독립 chunk는 worktree로 병렬 구현·검증한다.
---

# orchestrate — 멀티에이전트 리드 (Supervisor)

너는 리드 오케스트레이터다. **직접 코드를 쓰지 말고**, 아래 순서를 강제로 밟아 역할별 서브에이전트에 위임한다. 입력은 `$ARGUMENTS`.

## 순서 (건너뛰기 금지)

### 1) 기획 — @planner 위임
- `spec` 스킬로 사용자 관점 인수조건을 N개 도출한다.
- 작업을 **서로 독립적인 chunk**로 분해한다 (병렬 가능하도록).
- 각 chunk에 목표·완료기준·경계를 적는다 (위임 계약 4요소).
- 사람에게 spec을 보여주고 **승인 게이트**를 받은 뒤 다음으로.

### 2) 구현 — @coder 병렬 위임 (worktree)
- chunk가 서로 독립이면 @coder를 **병렬로 dispatch** (Supervisor + Fan-out).
- 각 coder는 **자기 worktree 안에서만** 쓴다:
  - `git worktree add .claude/worktrees/<chunk-id> -b chunk/<chunk-id>`
  - 읽기는 공유, **쓰기는 worktree로 분리** — 동일 체크아웃 동시 쓰기는 충돌.
- 각 chunk는 `tdd` 스킬로 **테스트 먼저(RED) → 구현(GREEN) → 리팩터**.

### 3) 검수 — @reviewer 위임 (읽기전용)
- 각 chunk 결과를 @reviewer가 **2단계**로 본다: ① 스펙 준수 ② 코드 품질.
- reviewer는 읽기전용 — 수정하지 않고 심각도순으로 보고.
- 결함 → 해당 @coder에게 **되돌림**.

### 4) 검증 — @tester 위임 (게이트)
- @tester가 전체 테스트를 실행. 실패 → 되돌림.
- 통과해야만 다음으로.

### 5) 병합·정리
- 모든 chunk 통과 시 worktree를 병합 후 정리:
  - `git worktree remove .claude/worktrees/<chunk-id>`

## 원칙
- "부탁"이 아니라 "순서"다. 각 단계는 앞 단계 산출물이 있어야 시작.
- 사람은 **spec 승인·최종 머지** 게이트에서만 개입.
- 검증 실패는 항상 담당 에이전트로 되돌린다 (feedback loop).
