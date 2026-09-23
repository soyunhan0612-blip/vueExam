# Step 10: list-view

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (상태 관리: 필터 상태는 URL 쿼리가 기준)
- `docs/ADR.md` (ADR-004)
- `docs/PRD.md` (4장 `/jobs` 행, 5장 `JobListView.vue` 행, 9장 시연 시나리오 1·2)
- `docs/UI_GUIDE.md` (레이아웃, `aria-live`)
- `src/views/JobListView.vue` (step 9 자리표시자, `defineOptions({ name: 'JobListView' })`)
- `src/router/index.js` (step 9: route name `jobs`, 같은 이름 route 간 이동은 스크롤 유지)
- `src/App.vue` (KeepAlive include)
- `src/composables/useJobs.js` (step 5: `useJobs() → { jobs, loading, error, load({ q, region }) }`)
- `src/components/job/JobFilter.vue`, `JobCard.vue` (step 8)
- `src/components/base/BaseTabs.vue` (step 7), `BaseButton.vue` (step 6)
- `src/stores/scrap.js` (step 4), `src/utils/constants.js`, `src/utils/debounce.js` (step 2)

## 작업

`src/views/JobListView.vue`를 완성한다. `defineOptions({ name: 'JobListView' })`는 유지한다.

### 1. URL 쿼리 ↔ 필터 (쓰기 가능한 computed)

```js
const keyword  = computed({ get: () => route.query.q ?? '',        set: v => updateQuery({ q: v }) })
const region   = computed({ get: () => route.query.region ?? '',   set: v => updateQuery({ region: v }) })
const category = computed({ get: () => route.query.category ?? '', set: v => updateQuery({ category: v }) })
```

- `updateQuery(patch)`
  - `router.replace({ query: { ...route.query, ...patch } })`로 갱신한다.
  - 빈 문자열 값은 쿼리에서 제거한다.
- `category`가 `CATEGORIES`에 없는 값이면 `''`(전체)로 취급한다. `region`도 `REGIONS`에 없으면 `''`로 취급한다.

### 2. 조회 (핵심 규칙: KeepAlive 캐시 중 오작동 방지)

- `watch`로 `q`와 `region`을 감시해 `load({ q, region })`를 호출한다.
  - 키워드 변경은 `debounce`(300ms)를 거친다.
  - 지역 변경과 최초 진입은 즉시 호출한다.
- **목록 화면이 활성 상태(`route.name === 'jobs'`)일 때만 조회하라.**
  - KeepAlive로 캐시된 동안에도 이 컴포넌트의 computed와 watch는 살아 있다.
  - 상세로 이동하면 `route.query`가 비므로, 가드가 없으면 빈 조건으로 재조회해 필터와 목록이 초기화된다.
- **마지막으로 불러온 `{ q, region }`을 기억하고 값이 실제로 달라졌을 때만 조회하라.**
  - 상세에서 뒤로 오면 쿼리가 같으므로 재조회하지 않는다.
  - 그래야 목록 DOM이 그대로 남아 scrollBehavior가 스크롤을 복원한다(시연 시나리오 2).
- `onDeactivated`에서 대기 중인 debounce를 `cancel()`한다.
- `category`는 서버에 보내지 않는다. 클라이언트 computed로 거른다(PRD 7장).

### 3. 업직종 탭과 목록

- `tabs` computed
  - `[{ key: '', label: '전체', count: jobs.length }, ...CATEGORIES.map(c => ({ key: c.value, label: c.label, count: 해당 건수 }))]`
  - 건수는 q와 region으로 불러온 `jobs` 기준이다.
- `BaseTabs v-model="category"`, `label="업직종"`
  - 패널 슬롯 안에 결과 목록 `<ul>`을 두고, 각 `<li>`에 `JobCard`를 넣는다.
- `JobCard`
  - `:scrapped="scrapStore.isScrapped(job.id)"`
  - `@toggle-scrap="scrapStore.toggle"`
- 부모에서 JobCard 내부 여백 등을 조정해야 하면 `:deep()`을 쓴다(AGENTS.md 스타일 규칙).

### 4. 화면 구성과 상태

- `<h1>`은 "공고 목록"이다. 시각적으로 숨겨도 되지만 문서 구조에는 남긴다.
- `JobFilter v-model:keyword="keyword" v-model:region="region"`
- 결과 건수: `<p aria-live="polite">`에 "검색 결과 N건"을 표시한다. N은 카테고리 필터 후 건수다. 로딩 중에는 갱신하지 않는다.
- 로딩
  - 목록 컨테이너에 `aria-busy="true"`를 건다.
  - 로딩 문구는 이전 목록 위에 겹치지 않게 간단히 표시한다. 스켈레톤 애니메이션은 쓰지 않는다.
- 에러: 메시지(`role="alert"`)와 "다시 시도" BaseButton을 둔다.
- 빈 결과: "조건에 맞는 공고가 없습니다"와 "조건 초기화" 버튼을 둔다. 초기화는 q, region, category를 모두 제거한다.

### 5. 상단 주석 (자리표시자 주석을 확장)

- `[개념]`: 쓰기 가능한 computed, watch + URL 쿼리 동기화, KeepAlive 캐시 중 watch가 살아 있는 문제와 활성 가드, `defineOptions({ name })`
- `[Vue 2였다면]`: `computed: { keyword: { get() { return this.$route.query.q }, set(v) { this.$router.replace(...) } } }`, `watch: { '$route.query': { handler, immediate: true } }`, `name: 'JobListView'`, `activated`/`deactivated` 훅

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 상태 관리 규칙(필터는 URL 쿼리가 기준)을 따르는가?
   - ADR-004를 따르는가?
   - AGENTS.md CRITICAL 규칙(axios·api 직접 호출 금지, 접근성)을 지켰는가?
   - `JobListView.vue`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 10을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 쿼리 키(`q`/`region`/`category`), 재조회 조건(활성 + 값 변경), 탭 건수 계산 방식, 사용한 컴포넌트를 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 필터 값을 컴포넌트 `ref`에 따로 들고 URL과 양방향으로 맞추지 마라. 이유: URL 쿼리가 유일한 기준이다(ARCHITECTURE.md). 두 곳에 두면 동기화 루프와 불일치가 생긴다.
- 필터 변경에 `router.push`를 쓰지 마라. 이유: 키 입력마다 히스토리가 쌓여 뒤로가기로 상세 → 목록 → 이전 화면 흐름이 깨진다. `replace`를 쓴다.
- `onActivated`에서 무조건 재조회하지 마라. 이유: 목록이 다시 그려지면서 뒤로가기 스크롤 복원이 깨진다(시연 시나리오 2).
- 페이지네이션이나 무한 스크롤을 넣지 마라. 이유: PRD 비목표다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
