# Step 5: composables

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (패턴: composable, 응답 경쟁 상태 방지 / 상태 관리)
- `docs/PRD.md` (5장 `useJobs.js`, `useMediaQuery.js`, `useFocusTrap.js` 행, 9장 시연 시나리오 1)
- `docs/UI_GUIDE.md` (모달)
- `src/api/jobs.js`, `src/api/http.js` (step 3: 취소 요청은 원본 에러로 reject, 그 외는 `error.message` 한국어)
- `src/stores/auth.js` (step 4)

## 작업

### 1. `src/composables/useJobs.js` (PRD 5장 대상 파일)

세 함수를 export한다. 컴포넌트는 api 모듈 대신 이 함수들을 쓴다.

```js
export function useJobs()  // → { jobs: Ref<Job[]>, loading: Ref<boolean>, error: Ref<string|null>, load(params) }
                           //   params: { q?, region? } 또는 { ids: number[] }
export function useJob()   // → { job: Ref<Job|null>, loading, error, load(id) }
export function useApply() // → { submitting: Ref<boolean>, error: Ref<string|null>, done: Ref<boolean>, submit(payload), reset() }
```

- **응답 경쟁 상태 방지 (핵심 규칙)**
  - `load`가 연달아 불리면 이전 요청을 `AbortController`로 취소한다.
  - 요청 순번(카운터)도 비교해 **마지막 요청의 응답만** `jobs`에 반영한다.
  - json-server에 `--delay 400`을 걸어 두었으므로, 빠르게 타이핑하면 응답이 뒤섞일 수 있다.
- 취소된 요청(`axios.isCancel` 대신 `err.name === 'CanceledError'` 또는 `err.code === 'ERR_CANCELED'`로 판별)은 `error`를 설정하지 않고 `loading`도 건드리지 않는다.
  - composable에서 axios를 import하지 않기 위해 이렇게 판별한다.
- `{ ids }`로 부르면 `fetchJobsByIds`를, 그 밖에는 `fetchJobs`를 호출한다.
- `useApply().submit(payload)`
  - `createApplication`을 호출하고 성공하면 `done = true`로 바꾼다.
  - 실패하면 `error`에 메시지를 넣는다.
  - `useAuthStore()`에서 `userId`를 채운다.
- 컴포넌트가 언마운트되면(`onScopeDispose`) 진행 중인 요청을 취소한다.
- 상단 주석:
  - `[개념]`: composable, 응답 경쟁 상태와 해결법
  - `[Vue 2였다면]`: 같은 로직을 mixin으로 작성한 코드. mixin의 문제점 3가지(데이터 출처 불명확, 이름 충돌, 인자로 재사용 설정 불가)

### 2. `src/composables/useMediaQuery.js` (PRD 5장 대상 파일)

```js
export function useMediaQuery(query) // → Ref<boolean>
```

- 초기값은 `window.matchMedia(query).matches`로 즉시 계산한다. 첫 렌더에서 깜박이지 않게 하려는 것이다.
- `onMounted`에서 `change` 리스너를 등록하고 `onUnmounted`에서 해제한다.
- 상단 주석:
  - `[개념]`: composable 안에서 라이프사이클 훅을 쓰면 호출한 컴포넌트에 등록된다
  - `[Vue 2였다면]`: `mounted`/`beforeDestroy`에 리스너 코드를 두고 mixin으로 공유하던 방식

### 3. `src/composables/useFocusTrap.js` (PRD 5장 대상 파일)

```js
export function useFocusTrap(containerRef) // → { activate(), deactivate({ returnFocusTo } = {}) }
```

- `activate()`
  - 호출 시점의 `document.activeElement`를 저장한다.
  - `nextTick` 뒤 컨테이너 안의 첫 포커스 가능 요소로 포커스를 옮긴다. 그런 요소가 없으면 컨테이너 자체로 옮긴다.
  - `keydown` 리스너로 Tab과 Shift+Tab이 컨테이너 안에서만 순환하게 한다.
- `deactivate({ returnFocusTo })`
  - 리스너를 해제한다.
  - `returnFocusTo`(HTMLElement)가 있으면 그곳으로, 없으면 저장해 둔 요소로 포커스를 복귀한다.
- 포커스 가능 요소 선택자에서 `disabled`, `[tabindex="-1"]`, 숨겨진 요소는 제외한다.
- `onBeforeUnmount`에서 활성 상태라면 정리한다.
- ESC 처리는 이 composable이 아니라 BaseModal(step 7)이 맡는다.
- 상단 주석:
  - `[개념]`: template ref, `nextTick`이 필요한 이유(DOM 갱신 뒤 포커스)
  - `[Vue 2였다면]`: `this.$refs.dialog`, `this.$nextTick(() => ...)`

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (composables는 세 파일만)
   - ADR 기술 스택을 벗어나지 않았는가? (VueUse 등 추가 금지)
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - 세 파일 모두에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 5를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 세 파일의 export 시그니처(useJobs/useJob/useApply 반환값 포함)와 경쟁 상태 방지 방식을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `@vueuse/core` 등 composable 라이브러리를 설치하지 마라. 이유: 직접 구현이 학습·면접 설명 대상이다.
- composable에서 axios를 import하지 마라. 이유: 호출 흐름은 composable → `src/api/` 모듈이다.
- 지원 로직을 위해 `useApply.js` 같은 새 파일을 만들지 마라. 이유: ARCHITECTURE.md의 composables 목록(useJobs, useMediaQuery, useFocusTrap)을 유지하기로 했다. `useJobs.js` 안에 둔다.
- 취소된 요청을 에러 메시지로 화면에 띄우지 마라. 이유: 검색어를 빠르게 입력할 때마다 "요청 실패"가 깜박이게 된다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
