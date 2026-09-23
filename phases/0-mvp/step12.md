# Step 12: login-scrap

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` (4장 `/login`·`/scraps` 행, 테스트 계정, 12장 완료 기준)
- `docs/ARCHITECTURE.md` (라우터 가드)
- `docs/UI_GUIDE.md`
- `src/views/LoginView.vue`, `src/views/ScrapView.vue` (step 9 자리표시자)
- `src/router/index.js` (`/scraps` requiresAuth, 가드가 `redirect` 쿼리에 `to.fullPath`를 넣음)
- `src/stores/auth.js` (`login`, `isLoggedIn`), `src/stores/scrap.js` (`ids`, `count`, `isScrapped`, `toggle`)
- `src/composables/useJobs.js` (`useJobs().load({ ids })`)
- `src/components/base/BaseInput.vue`, `BaseButton.vue`, `src/components/job/JobCard.vue`
- `src/views/JobListView.vue` (목록 마크업·스타일 참고)

## 작업

### 1. `src/views/LoginView.vue`

- `<h1>로그인</h1>`
- `<form novalidate @submit.prevent>`
  - 이메일: BaseInput, `type="email"`, `autocomplete="username"`
  - 비밀번호: BaseInput, `type="password"`, `autocomplete="current-password"`
- 시연용 안내 문구: "테스트 계정: test@findjob.co.kr / 1234" (muted 텍스트)
- 제출
  - 빈 값은 필드 에러로 표시하고 첫 에러 필드로 포커스를 옮긴다.
  - `authStore.login(email, password)`를 호출한다. 제출 중에는 버튼을 `loading`으로 둔다.
  - 실패하면 폼 위에 `role="alert"` 메시지를 표시하고 비밀번호를 비운다.
  - 성공하면 `router.replace(safeRedirect(route.query.redirect))`로 이동한다.
- `safeRedirect(value) → string` (보안 핵심 규칙)
  - 문자열이고 `/`로 시작하며 `//`로 시작하지 않을 때만 그 값을 쓴다.
  - 그 밖에는 `'/jobs'`를 반환한다.
- 이미 로그인한 상태로 `/login`에 들어오면 곧바로 `safeRedirect` 경로로 `replace`한다.

### 2. `src/views/ScrapView.vue`

- `<h1>`은 "스크랩한 공고"이고 건수를 함께 표시한다.
- 진입 시(`onMounted`) `useJobs().load({ ids: scrapStore.ids })`를 호출한다.
- 표시 목록은 `jobs` 중 `scrapStore.isScrapped(job.id)`인 것만 거른 computed다.
  - 스크랩을 해제하면 재조회 없이 즉시 목록에서 빠진다.
- `JobCard`와 `@toggle-scrap="scrapStore.toggle"`로 목록을 구성한다. 마크업(`<ul><li>`)은 JobListView와 같게 한다.
- 로딩 시 `aria-busy`, 에러 시 `role="alert"` + 다시 시도를 둔다.
- 빈 상태: "아직 스크랩한 공고가 없습니다"와 `RouterLink`로 "공고 보러 가기"(`/jobs`)를 둔다.
- 건수 변화는 `aria-live="polite"`로 알린다.

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 라우터 가드 흐름(`/login?redirect=원래경로` → 로그인 → 복귀)을 따르는가?
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙(axios·api 직접 호출 금지, label, 16px, 44px)을 지켰는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 12를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 LoginView의 redirect 검증 규칙, ScrapView의 조회·필터 방식, 빈 상태 처리를 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `route.query.redirect`를 검증 없이 `router.replace`나 `location.href`에 넣지 마라. 이유: `//evil.com` 같은 값으로 외부 사이트로 보내는 open redirect 취약점이 된다.
- 로그인 실패 메시지에서 이메일 존재 여부를 구분하지 마라. 이유: 계정 존재 여부가 노출된다. 하나의 메시지를 쓴다.
- ScrapView에서 `scrapStore.ids`가 바뀔 때마다 재조회하지 마라. 이유: 해제할 때마다 로딩이 깜박인다. 받아 온 목록을 computed로 거른다.
- ScrapView를 KeepAlive에 넣지 마라. 이유: 목록 화면에서 스크랩한 결과가 반영되지 않는다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
