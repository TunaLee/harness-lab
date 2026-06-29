# 테스트

## 자동
```bash
node --test
```
- `test/guard.test.mjs` — hook이 .env·.git·id_rsa·rm -rf·윈도우 역슬래시 경로를 exit 2로 차단, 정상 파일/명령은 0.
- `test/structure.test.mjs` — 매니페스트·orchestrate·spec·tdd·4 에이전트·hook 존재, orchestrate가 planner→coder→reviewer→tester **순서**로 위임하고 worktree를 쓰는지, reviewer는 읽기전용·coder는 쓰기허용인지.

## 수동 (Claude Code)
1. `claude --plugin-dir ./harness`
2. `/harness:orchestrate 작업 상태 전이 추가`
3. 관찰: planner가 spec/분해 → coder가 worktree에서 병렬 TDD → reviewer 읽기전용 검수 → tester 게이트.
4. `.env` 접근 시 hook이 차단(exit 2)되는지.

## 자가 비교
덱 LAB에서 직접 만든 결과를 이 패키지와 대조 — 빠진 단계·권한·worktree 지시가 있는지.
