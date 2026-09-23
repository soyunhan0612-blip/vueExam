# Step 13: docs

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` (전체. 특히 5장 파일별 개념 매핑, 8장 폴더 구조, 9장 시연 시나리오, 11장 실행 방법, 12장 완료 기준)
- `docs/ARCHITECTURE.md`, `docs/ADR.md`, `docs/UI_GUIDE.md`
- `package.json` (scripts)
- PRD 5장 표의 파일 20개 전부. 각 파일 상단의 `[개념]` / `[Vue 2였다면]` 주석을 모두 읽는다.
- `scripts/verify.mjs` (`--strict` 옵션)

## 작업

### 1. 주석 점검과 보강

- PRD 5장 표의 20개 파일을 하나씩 열어 확인한다.
  - `[개념]`과 `[Vue 2였다면]` 주석이 **표의 "Vue 3 개념" 열과 "Vue 2 대응" 열 내용을 모두 다루는지** 본다.
  - 빠졌거나 실제 코드와 어긋나면 **주석만** 고친다.
- 주석 형식을 통일한다.
  - `.js`는 `/** ... */`, `.vue`는 파일 첫 `<!-- ... -->` 블록이나 `<script setup>` 첫 주석 중 하나로 맞춘다.
  - 파일마다 어느 쪽을 썼는지는 기존 방식을 유지한다.

### 2. `VUE2-VS-VUE3.md` (저장소 루트)

- 파일 단위가 아니라 **개념 단위**로 정리한다. 섹션마다 다음을 둔다.
  - Vue 3 코드 조각
  - Vue 2 코드 조각
  - 차이 1~3줄
  - 이 프로젝트에서 해당 코드가 있는 파일 경로
- 최소 섹션: 앱 생성과 플러그인, 반응성(Proxy vs defineProperty와 `Vue.set`), props/emit, v-model(`defineModel` / `.sync` / `model` 옵션), slot(scoped slot), `$attrs`/`$listeners`/`.native`, 라이프사이클과 composable vs mixin, template ref와 `nextTick`, 상태 관리(Pinia vs Vuex), 라우터(가드 return, catch-all, history), Teleport, KeepAlive, filters 삭제
- 끝에 "면접에서 설명할 포인트"를 5~8개의 짧은 목록으로 둔다.

### 3. `README.md` (저장소 루트)

- 프로젝트 소개 2~3줄
- 실행 방법: `npm install`, `npm run dev`. 앱은 Vite 기본 주소, json-server는 3001이다.
- 테스트 계정: `test@findjob.co.kr` / `1234`
- 시연 시나리오 1·2: PRD 9장을 바탕으로 사용자가 따라 할 수 있는 단계로 쓴다.
- 폴더 구조: 실제 `src/` 구조와 일치해야 한다.
- 문서 링크: `docs/*.md`, `VUE2-VS-VUE3.md`

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs --strict
node -e "const fs=require('fs');for(const f of ['README.md','VUE2-VS-VUE3.md'])if(!fs.existsSync(f)||fs.readFileSync(f,'utf8').length<500)process.exit(1);console.log('docs ok')"
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조와 README의 폴더 구조가 일치하는가?
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - PRD 5장 표의 20개 파일 모두에 `[개념]` / `[Vue 2였다면]` 주석이 있는가? (`--strict`로 확인)
3. 결과에 따라 `phases/0-mvp/index.json`의 step 13을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 생성 문서, 보강한 주석 파일 목록, verify --strict 결과를 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `VUE2-VS-VUE3.md`나 다른 새 문서를 `docs/` 안에 만들지 마라. 이유: `docs/*.md`는 Harness가 매 step 프롬프트에 통째로 주입하므로 짧게 유지해야 한다(PRD 8장).
- `docs/*.md`와 `AGENTS.md`를 수정하지 마라. 이유: 가드레일 문서는 사람이 관리한다.
- 주석 점검 중에 앱 동작 코드(로직·마크업·스타일)를 바꾸지 마라. 이유: 이 step은 문서 step이다. 버그를 발견하면 summary에 적어 사람이 판단하게 한다.
- README에 존재하지 않는 스크립트나 기능을 적지 마라. 이유: 면접관이 README대로 실행한다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
