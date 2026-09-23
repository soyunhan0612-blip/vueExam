# Step 11: detail-apply

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` (4장 `/jobs/:id`·지원하기 모달 행, 5장 `JobDetailView.vue` 행, 6장, 9장 시연 시나리오 1)
- `docs/UI_GUIDE.md` (레이아웃: 하단 고정 지원 바, 입력 필드, 모달)
- `docs/ARCHITECTURE.md` (라우터 가드: 로그인 후 원래 경로 복귀)
- `src/views/JobDetailView.vue` (step 9 자리표시자, `id` prop)
- `src/router/index.js` (route name `job-detail`, `login`, `jobs`)
- `src/composables/useJobs.js` (step 5: `useJob() → { job, loading, error, load(id) }`, `useApply() → { submitting, error, done, submit(payload), reset() }`)
- `src/components/base/BaseModal.vue` (step 7: `v-model:open`, `title`, `returnFocusTo`, slots default/footer)
- `src/components/base/BaseInput.vue`, `BaseButton.vue` (step 6: BaseInput `defineExpose({ focus })`)
- `src/stores/auth.js` (`isLoggedIn`, `user`)
- `src/utils/format.js`, `src/utils/constants.js`

## 작업

`src/views/JobDetailView.vue`를 완성한다.

### 1. 상세 조회와 표시

- `props.id`를 `watch`(`immediate: true`)해서 `useJob().load(id)`를 호출한다.
- 로딩 중에는 `aria-busy`를 건다. 에러는 `role="alert"`로 표시한다. 404일 때(`error.status === 404`)는 "공고를 찾을 수 없습니다"와 목록 링크를 보여 준다.
- 표시 항목
  - 제목 `<h1>`: 급구면 `<mark>` 형광펜과 sr-only "급구"
  - 회사
  - `<dl>`: 급여(`formatWage`), 지역, 근무요일·시간, 고용형태, 업직종, 등록일(`formatDate`)
  - 상세 설명: `white-space: pre-line`
- "목록으로" 버튼
  - `window.history.state?.back`이 있으면 `router.back()`, 없으면 `router.push({ name: 'jobs' })`를 한다.
  - `back()`을 써야 KeepAlive 목록의 필터와 스크롤이 유지된다(시연 시나리오 2).

### 2. 지원 바

- 지원 버튼은 BaseButton primary 하나다. template ref로 잡는다.
- 모바일(768px 미만)
  - 화면 하단에 고정한다(`position: fixed`, `$z-apply-bar`).
  - `padding-bottom: calc(여백 + env(safe-area-inset-bottom))`를 준다.
  - 본문 하단에 바 높이만큼 여백을 두어 내용이 가려지지 않게 한다.
- 768px 이상에서는 본문 흐름 안에 둔다(static).

### 3. 지원하기 흐름 (인증 필요)

- 지원 버튼을 누를 때
  - 로그인 상태가 아니면 `router.push({ name: 'login', query: { redirect: '/jobs/' + id + '?apply=1' } })`로 보낸다.
  - 로그인 상태면 모달을 연다.
- 로그인 후 돌아왔을 때
  - `route.query.apply === '1'`이고 로그인 상태이며 job을 불러왔다면 모달을 자동으로 연다.
  - 그리고 `router.replace`로 `apply` 쿼리를 제거한다.
- `BaseModal v-model:open="applyOpen"`, `title="지원하기"`, `:return-focus-to="지원 버튼 DOM 요소"`
  - 닫히면 항상 지원 버튼으로 포커스가 돌아간다(시연 시나리오 1).

### 4. 지원 폼 (모달 안, 이 파일에 작성)

- `<form novalidate @submit.prevent>`
- 필드
  - 이름: BaseInput, `autocomplete="name"`, 초기값은 `auth.user.name`
  - 연락처: BaseInput, `type="tel"`, `inputmode="numeric"`, `autocomplete="tel"`, 힌트 "숫자만 입력"
  - 근무 시작일: BaseInput, `type="date"`, `min`은 오늘
- 제출 시 검증. 에러는 BaseInput `error` prop으로 넘겨 `aria-invalid`와 `aria-describedby`가 연결되게 한다.
  - 이름: 필수
  - 연락처: 숫자만 추려 `01`로 시작하는 10~11자리
  - 시작일: 필수, 오늘 이후
- 에러가 있으면 첫 번째 에러 필드로 `focus()`를 옮긴다(BaseInput expose).
- 통과하면 `useApply().submit({ jobId, name, phone, startDate })`를 호출한다. 제출 중에는 버튼을 `loading`으로 둔다.
- 서버 에러는 `role="alert"`로 표시한다.
- 성공(`done`)하면 폼 대신 완료 상태를 보여 준다.
  - "지원이 완료되었습니다" 메시지를 넣고 이 메시지 요소에 `tabindex="-1"`을 준 뒤 포커스를 옮긴다.
  - "닫기" 버튼을 둔다.
- 모달이 닫히면 폼 값(이름 제외), 에러, `reset()`을 초기화한다.

### 5. 상단 주석 (자리표시자 주석을 확장)

- `[개념]`: route props(`id`가 Number로 들어옴), 조건부 모달(`v-model:open`), 로그인 후 복귀(`redirect` + `apply` 쿼리)
- `[Vue 2였다면]`: `this.$route.params.id`, `watch: { '$route.params.id': ... }`, `:open.sync`

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 데이터 흐름(컴포넌트 → composable → api)을 따르는가?
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 접근성 규칙(label, 16px, 44px, 모달 포커스 복귀)을 지켰는가?
   - `JobDetailView.vue`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 11을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 상세 표시 항목, 목록 복귀 방식, 로그인 복귀 쿼리(`redirect=/jobs/:id?apply=1`), 지원 폼 검증 규칙, 포커스 복귀 방식을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- "목록으로"를 항상 `router.push('/jobs')`로 처리하지 마라. 이유: 쿼리 없는 새 목록으로 이동해 필터와 스크롤이 초기화된다(시연 시나리오 2 실패).
- `src/api/jobs.js`를 view에서 직접 import하지 마라. 이유: AGENTS.md CRITICAL 규칙이다. `useJob`과 `useApply`를 쓴다.
- 연락처 입력에 `type="number"`를 쓰지 마라. 이유: 앞자리 0이 사라지고 스핀 버튼이 생긴다. `type="tel"` + `inputmode="numeric"`을 쓴다.
- 검증 에러를 `alert()`로 띄우지 마라. 이유: 필드별 `aria-invalid` + `aria-describedby`가 요구사항이다.
- 새 컴포넌트 파일(예: `ApplyForm.vue`)을 만들지 마라. 이유: ARCHITECTURE.md 디렉토리 구조에 없는 파일이다. 이 view 안에 작성한다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
