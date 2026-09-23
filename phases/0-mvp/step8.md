# Step 8: job-components

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` (공고 목록 행, 아이콘, 레이아웃, 안티패턴)
- `docs/PRD.md` (5장 `JobCard.vue`, `JobFilter.vue` 행, 6장)
- `src/components/base/BaseInput.vue`, `BaseSelect.vue`, `BaseButton.vue` (step 6)
- `src/composables/useMediaQuery.js` (step 5)
- `src/stores/auth.js`, `src/stores/scrap.js` (step 4)
- `src/utils/format.js`, `src/utils/constants.js` (step 2)
- `mock/db.json` (job 필드)

## 작업

### 1. `src/components/job/JobCard.vue` (PRD 5장 대상 파일)

```js
props: { job: Object (필수), scrapped: Boolean }
emits: ['toggle-scrap']  // payload: job.id
```

- 루트는 `<article>`이다. 부모가 `<ul><li>`로 감싼다.
- **카드 그림자 없이** 아래쪽 구분선(`--color-line`)으로 행을 나눈다.
- 제목은 `<h2>`나 `<h3>` 안에 `RouterLink` `{ name: 'job-detail', params: { id: job.id } }`를 둔다.
  - `job.urgent`이면 제목 텍스트를 `<mark>`로 감싸 **형광펜 강조**한다(`--color-highlight`, 텍스트 뒤 하이라이트).
  - 급구일 때는 `<span class="sr-only">급구</span>`도 넣는다.
- 메타 정보: 회사, `formatWage(job.wage)`, 지역, `workDays` · `workHours`, 업직종 라벨. 강조색 없이 muted 텍스트로 쓴다.
- 스크랩 버튼
  - 인라인 SVG 북마크 아이콘(`aria-hidden="true"`)을 쓴다.
  - `aria-pressed`에 `scrapped`를 넣는다.
  - `aria-label`은 `` `${job.title} 스크랩` ``이다.
  - 44px 이상, `focus-ring`을 적용한다.
  - 클릭하면 `emit('toggle-scrap', job.id)`를 보낸다.
  - 스크랩 상태는 초록 채움 아이콘으로 표시한다. 형광펜은 쓰지 않는다.
- 제목 링크의 클릭 영역을 행 전체로 넓히려면 `::after` 확장을 쓴다. 스크랩 버튼은 그 위(`z-index`)에 둔다.
- 상단 주석:
  - `[개념]`: props/emit(`defineProps`/`defineEmits`), scoped style(data-v 속성)과 부모에서 `:deep()`으로 내부 조정
  - `[Vue 2였다면]`: `this.$emit`, `>>>` / `::v-deep`

### 2. `src/components/job/JobFilter.vue` (PRD 5장 대상 파일)

```js
const keyword = defineModel('keyword', { type: String, default: '' })
const region = defineModel('region', { type: String, default: '' })
// 부모: <JobFilter v-model:keyword="..." v-model:region="..." />
```

- `<form role="search">`이고 submit은 `preventDefault`한다.
- 내용물
  - BaseInput: `type="search"`, label "키워드", `autocomplete="off"`, `enterkeyhint="search"`
  - BaseSelect: label "지역", `placeholder="전체 지역"`, options는 `REGIONS`
- 모바일(768px 미만) 접기
  - 필터 영역 위에 토글 버튼을 둔다.
    - `aria-expanded`와 `aria-controls`(패널 id, `useId`)를 단다.
    - 라벨은 "검색 조건"이고, 적용된 조건 수를 `(1)`처럼 함께 표시한다.
  - 패널은 `v-show="isDesktop || expanded"`이고 `<Transition>`으로 펼친다. `reduced-motion`에서는 전환을 끈다.
  - `isDesktop = useMediaQuery('(min-width: 768px)')`. 768px 이상에서는 토글 버튼을 숨기고 항상 펼친다.
- 768px 이상에서는 입력과 셀렉트를 가로로 배치한다.
- 상단 주석:
  - `[개념]`: 다중 `v-model`(`defineModel('keyword')`), `v-show` + `Transition`(`v-if`와의 차이)
  - `[Vue 2였다면]`: `:keyword.sync` / `:region.sync`와 `$emit('update:keyword')`

### 3. `src/components/layout/AppHeader.vue`

- `<header>` 안에 로고 텍스트 링크 "생활일자리"(`/jobs`)와 `<nav aria-label="주 메뉴">`를 둔다.
- nav 링크
  - "공고"(`/jobs`)
  - "스크랩"(`/scraps`). 스크랩 수는 `scrapStore.count`를 글자로 함께 표시하고 배지 강조는 하지 않는다.
- 로그인 상태에 따라 오른쪽에 둘 중 하나를 둔다.
  - 로그인 상태: "{userName}님"과 로그아웃 버튼
  - 로그아웃 상태: "로그인" 링크(`{ name: 'login', query: { redirect: 현재 route.fullPath } }`)
- 로그아웃하면 `authStore.logout()`을 호출한다. 현재 route의 `meta.requiresAuth`가 참이면 `/jobs`로 이동한다.
- 링크와 버튼 모두 44px 이상이다. `RouterLink`가 붙이는 `aria-current="page"`를 활용해 활성 메뉴를 표시한다.
- 이 파일은 PRD 5장 대상이 아니므로 `[개념]` 주석은 필수가 아니다.

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`components/job/`, `components/layout/`)
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙(axios·api 직접 호출 금지, 44px, label)을 지켰는가?
   - `JobCard.vue`, `JobFilter.vue`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 8을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 세 컴포넌트의 props/emits/v-model 시그니처와 AppHeader가 의존하는 route 이름(`jobs`, `job-detail`, `login`, `scraps`)을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- JobCard에 `box-shadow` 카드나 큰 라운드 배경을 쓰지 마라. 이유: UI_GUIDE는 구분선 행 목록을 쓰며, 그림자 카드 나열은 안티패턴이다.
- 급구가 아닌 요소(스크랩 버튼, 배지, 업직종 등)에 형광펜이나 강조색 배경을 쓰지 마라. 이유: 급구 형광펜이 유일한 강조 요소다.
- JobCard 안에서 스크랩 스토어를 직접 바꾸지 마라. 이유: props down / events up 패턴을 보여 주는 컴포넌트다. 스토어 호출은 부모 화면이 한다.
- `src/router/`와 `src/views/`를 만들지 마라. 이유: step 9 범위다. 이 step에서 RouterLink가 가리키는 route 이름(`jobs`, `job-detail`, `login`, `scraps`)은 step 9가 그대로 정의한다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
