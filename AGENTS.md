# AGENTS.md

Codex가 이 저장소에서 작업할 때 따르는 규칙이다. `scripts/execute.py`가 매 step 프롬프트에 이 파일과 `docs/*.md`를 가드레일로 넣는다.

# 프로젝트: 생활일자리 MVP (findjob-vue-mvp)

벼룩시장(findjob.co.kr) 개인회원 흐름을 축소한 Vue 3 앱. Vue 3 코드와 Vue 2 대응 코드를 주석으로 비교하는 면접 대비 학습 프로젝트다. 요구사항은 `docs/PRD.md`, 구조는 `docs/ARCHITECTURE.md`, 기술 결정은 `docs/ADR.md`, 디자인 규칙은 `docs/UI_GUIDE.md`를 본다.

## 기술 스택
- Vite 5 + Vue 3.5 (`<script setup>`, Composition API)
- JavaScript만 사용 (TypeScript 사용 안 함)
- Vue Router 4, Pinia, axios
- SCSS + CSS 변수, Pretendard Variable (CDN)
- json-server 0.17 목업 API (`--delay 400`, 포트 3001)

## 아키텍처 규칙
- CRITICAL: 컴포넌트에서 axios를 직접 호출하지 말 것. 호출 흐름은 반드시 컴포넌트 → composable / store → `src/api/` 모듈 → `api/http.js` axios 인스턴스 → json-server
- CRITICAL: `docs/PRD.md` 5장 표에 있는 파일은 상단에 `[개념]` 설명과 `[Vue 2였다면]` 대응 코드 주석을 반드시 넣을 것
- CRITICAL: 접근성을 깨지 말 것. 확대 차단 금지, label 연결, 입력 폰트 16px, 터치 타깃 44px 이상, 모달 포커스 트랩·ESC·포커스 복귀
- 공통 UI는 `components/base/`, 도메인 컴포넌트는 `components/job/`, 레이아웃은 `components/layout/`, 화면은 `views/`에 둔다
- 재사용 로직은 `composables/`, 전역 상태는 `stores/`(auth는 Options 스토어, scrap은 Setup 스토어)에 둔다
- 목록 필터는 URL 쿼리가 기준이다. 목록 화면은 `KeepAlive`로 캐시한다 (상세에서 뒤로 왔을 때 필터·스크롤 유지가 시연 시나리오 2)
- 스타일은 컴포넌트별 `<style scoped lang="scss">`로 쓴다. 자식 내부를 조정할 때는 `:deep()`을 쓴다. 토큰·믹스인은 `vite.config.js`에서 전역 주입한다

## 개발 프로세스
- 앱에는 테스트 코드를 작성하지 않는다 (PRD 비목표). 검증은 `npm run build` 통과와 시연 시나리오로 한다
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:)
- Harness step 안에서는 git 커밋을 하지 않는다. `execute.py`가 step이 끝난 뒤 커밋한다 (샌드박스에서 `.git`은 쓰기 불가)

## 명령어
```bash
npm install      # 의존성 설치
npm run dev      # json-server(3001) + Vite 동시 실행
npm run build    # 프로덕션 빌드 (Stop 훅이 package.json이 있을 때 자동 실행)
```

## Codex 훅 (`.codex/hooks.json`)
- `PreToolUse`(Bash): `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE`을 막는다 → `.codex/hooks/block_dangerous.py`
- `Stop`: `npm run build`를 돌리고, 실패하면 에러 로그를 다음 프롬프트로 돌려보내 한 번 더 고치게 한다 → `.codex/hooks/stop_build.py`
- 프로젝트 훅은 trust를 받아야 실행된다. 처음 한 번 대화형 `codex`에서 `/hooks`로 검토하고 trust한다. 훅 파일을 고치면 trust가 풀리므로 다시 trust한다

## Harness 워크플로우 (`scripts/`)
- `phases/index.json`(task 목록)과 `phases/{task}/index.json` + `step{N}.md`(step 정의)를 만든 뒤 `python scripts/execute.py {task} [--push]`로 실행한다. 절차는 `.claude/commands/harness.md`에 있다
- execute.py는 `feat-{task}` 브랜치를 만들고, pending step마다 `codex exec --sandbox workspace-write`(네트워크 허용)로 새 세션을 띄운다. 프롬프트는 stdin으로 넘긴다. 실패하면 최대 3회 재시도하고, 코드(`feat`)와 메타데이터(`chore`)를 따로 커밋한다
- 이 AGENTS.md와 `docs/*.md` 전체가 매 step 프롬프트에 들어간다. 그래서 이 파일들은 짧고 정확하게 유지하고, docs에 임시 메모를 두지 않는다
- step 세션은 끝날 때 `phases/{task}/index.json`의 자기 step을 `completed`+`summary` / `error`+`error_message` / `blocked`+`blocked_reason`으로 직접 갱신해야 한다. `summary`는 다음 step 프롬프트로 넘어가므로 생성한 파일과 핵심 결정을 담는다. 타임스탬프는 execute.py가 기록한다
- error·blocked 상태에서 재실행하려면 status를 `pending`으로 되돌리고 에러/사유 필드를 지운다

execute.py 자체 테스트 (pytest):
```bash
python -m pytest scripts/test_execute.py                          # 전체
python -m pytest scripts/test_execute.py -k TestLoadGuardrails    # 단일 클래스/테스트
```
