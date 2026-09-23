# Step 9: router-app

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (라우터 가드, 상태 유지)
- `docs/ADR.md` (ADR-004 URL 쿼리 + KeepAlive)
- `docs/PRD.md` (4장 화면 표, 5장 `router/index.js`·`App.vue`·`main.js`·`JobListView.vue`·`JobDetailView.vue` 행, 9장 시연 시나리오 2)
- `src/main.js` (step 0, 4: createApp + Pinia)
- `src/App.vue` (step 0 자리표시자)
- `src/stores/auth.js` (step 4: `isLoggedIn`)
- `src/components/layout/AppHeader.vue`, `src/components/job/JobCard.vue` (step 8: route 이름 `jobs`, `job-detail`, `login`, `scraps` 사용)

## 작업

### 1. `src/router/index.js` (PRD 5장 대상 파일)

`createRouter({ history: createWebHistory(), routes, scrollBehavior })`를 만든다.

| path | name | component | 비고 |
| --- | --- | --- | --- |
| `/` | — | — | `redirect: '/jobs'` |
| `/jobs` | `jobs` | `JobListView` (정적 import) | `meta.title: '공고 목록'` |
| `/jobs/:id(\\d+)` | `job-detail` | `() => import(JobDetailView)` | `props: route => ({ id: Number(route.params.id) })` |
| `/login` | `login` | `() => import(LoginView)` | |
| `/scraps` | `scraps` | `() => import(ScrapView)` | `meta.requiresAuth: true` |
| `/:pathMatch(.*)*` | — | — | `redirect: '/jobs'` |

- 전역 가드 `router.beforeEach(to => ...)`: **return 방식**이다.
  - `to.meta.requiresAuth`이고 `useAuthStore().isLoggedIn`이 아니면 `{ name: 'login', query: { redirect: to.fullPath } }`를 return한다.
  - 스토어는 가드 함수 **안에서** 호출한다.
- `router.afterEach`: `document.title`을 `` `${meta.title} | 생활일자리` `` 형식으로 갱신한다. title이 없으면 `생활일자리`로 둔다.
- `scrollBehavior(to, from, savedPosition)` (시연 시나리오 2의 핵심)
  - `savedPosition`이 있으면(뒤로가기) 그 위치를 반환한다.
    - KeepAlive로 캐시된 목록 DOM이 다시 붙은 뒤에 복원되도록 `Promise`와 짧은 지연(예: `requestAnimationFrame`이나 `setTimeout`)으로 감싸도 된다.
  - **`to.name === from.name`이면(같은 화면에서 쿼리만 바뀜) `false`를 반환해 스크롤을 유지한다.**
  - 그 외에는 `{ top: 0 }`을 반환한다.
- 상단 주석:
  - `[개념]`: 가드 return 값, `scrollBehavior`, route `props`
  - `[Vue 2였다면]`: Vue Router 3의 `next()` 필수 호출, `mode: 'history'`, `path: '*'` catch-all, `new VueRouter()`

### 2. 화면 자리표시자 4개 (`src/views/`)

step 10~12에서 채운다. 지금은 `<h1>`과 한 줄 설명만 둔다.

- `JobListView.vue`
  - **`defineOptions({ name: 'JobListView' })`를 반드시 넣는다.**
  - 상단에 `[개념]`(`defineOptions({ name })`과 KeepAlive `include` 매칭)과 `[Vue 2였다면]`(`export default { name: 'JobListView' }`) 주석을 둔다.
- `JobDetailView.vue`
  - `defineProps({ id: { type: Number, required: true } })`를 두고 id를 표시한다.
  - 상단에 `[개념]`(route props)과 `[Vue 2였다면]`(`this.$route.params.id`, 문자열이라 `Number()` 변환 필요) 주석을 둔다.
- `LoginView.vue`, `ScrapView.vue`: `<h1>`만 둔다.

### 3. `src/main.js`

- `app.use(router)`를 추가한다. 순서는 Pinia 다음이다.
- 상단 주석을 보강한다. 플러그인 등록 순서를 적는다: Pinia를 먼저 등록해야 가드에서 스토어를 쓸 수 있다.

### 4. `src/App.vue` (PRD 5장 대상 파일)

- 첫 요소는 스킵 링크 `<a class="skip-link" href="#main">본문 바로가기</a>`다.
  - 평소에는 화면 밖에 두고 포커스를 받으면 보이게 한다.
- `<AppHeader />`
- `<main id="main" tabindex="-1">` 안에:
  ```vue
  <RouterView v-slot="{ Component }">
    <KeepAlive include="JobListView">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
  ```
- 본문 폭은 `$content-max-width` 가운데 정렬로 두고, 좌우 여백은 CSS 변수로 준다. 360px에서 가로 스크롤이 생기면 안 된다.
- 상단 주석을 완성한다:
  - `[개념]`: `KeepAlive` + `RouterView` 슬롯, include가 컴포넌트 `name`으로 매칭됨
  - `[Vue 2였다면]`: `<keep-alive include="JobListView"><router-view /></keep-alive>`

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`src/router/index.js`, `src/views/` 4개)
   - ADR-004(URL 쿼리 + KeepAlive + scrollBehavior)를 따르는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - `router/index.js`, `main.js`, `App.vue`, `JobListView.vue`, `JobDetailView.vue`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 9를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 route 표(이름/경로/props/meta), 가드 규칙, scrollBehavior 규칙, App.vue 구조, 자리표시자로 둔 view 파일을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- JobListView에서 `defineOptions({ name: 'JobListView' })`를 빼지 마라. 이유: `<script setup>` 컴포넌트는 파일명으로 이름이 추론되지만, 명시하지 않으면 KeepAlive `include` 매칭을 설명할 수 없고 시연 시나리오 2가 이 이름에 의존한다.
- 가드에서 `next()` 콜백을 쓰지 마라. 이유: Vue Router 4의 return 방식을 Vue 2 `next()`와 비교하는 것이 학습 포인트다.
- 쿼리만 바뀌는 이동에서 `{ top: 0 }`을 반환하지 마라. 이유: 검색어를 한 글자 칠 때마다 목록이 맨 위로 튄다.
- KeepAlive에 JobListView 말고 다른 화면을 넣지 마라. 이유: 상세·스크랩을 캐시하면 오래된 데이터가 남는다(ADR-004 트레이드오프를 목록에만 한정).
- 이 step에서 view의 실제 기능(목록 조회, 지원 모달, 로그인 폼)을 구현하지 마라. 이유: step 10~12 범위다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
