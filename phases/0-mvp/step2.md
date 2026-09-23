# Step 2: styles-utils

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` (토큰 구조, 색상, 레이아웃, 애니메이션 전체)
- `docs/PRD.md` (6장 퍼블리싱 요구사항)
- `docs/ARCHITECTURE.md`
- `vite.config.js` (step 0: `_tokens`/`_mixins`를 모든 SFC에 `@use ... as *`로 주입)
- `src/styles/_tokens.scss`, `src/styles/_mixins.scss` (step 0의 빈 파일)
- `src/main.js`
- `mock/db.json` (step 1: 업직종 코드·지역 값·job 필드)

## 작업

### 1. `src/styles/_tokens.scss` — 빌드타임 토큰 (SCSS 변수만)

- 브레이크포인트: `$bp-md: 768px`, `$bp-lg: 1024px`
- 라운드: `$radius-sm`, `$radius-md`. 작게 쓴다. 모든 요소에 같은 큰 라운드를 쓰지 않는다.
- z-index: `$z-header`, `$z-apply-bar`, `$z-modal`
- 레이아웃: `$content-max-width`

### 2. `src/styles/_mixins.scss`

- 파일 첫 줄에서 `@use "tokens" as *;`로 토큰을 가져온다.
- `@mixin mq($bp: $bp-md)`: 모바일 퍼스트 `@media (min-width: $bp)`
- `@mixin focus-ring`: `:focus-visible`에 쓸 외곽선
- `@mixin sr-only`: 시각적으로만 숨기기
- `@mixin tap-target`: `min-width`와 `min-height` 44px
- `@mixin reduced-motion`: `@media (prefers-reduced-motion: reduce)` 블록에 `@content`를 넣는다

### 3. `src/styles/base.scss` — 런타임 토큰과 전역 스타일

- `:root` CSS 변수
  - 색: `--color-bg`(흰색), `--color-text`, `--color-text-muted`, `--color-line`(옅은 회색 구분선), `--color-action`(짙은 초록), `--color-action-hover`, `--color-highlight`(형광펜 노랑), `--color-error`(빨강 계열), `--color-focus`
  - 간격: `--space-1` ~ `--space-8`
  - **텍스트 색과 액션색은 흰 배경 대비 4.5:1 이상**이어야 한다
- 최소 reset
  - `box-sizing`, margin 제거
  - `img`/`svg` block
  - `button`과 `input`의 `font: inherit`
- `body`
  - `font-family: "Pretendard Variable", Pretendard, system-ui, sans-serif`
  - `word-break: keep-all`, `overflow-wrap: anywhere`
  - `background: var(--color-bg)`
- 전역 `.sr-only` 클래스 (mixin 사용)
- `@media (prefers-reduced-motion: reduce)`에서 transition과 animation을 끈다
- `src/main.js` 상단에 `import '@/styles/base.scss'`를 추가한다

### 4. `src/utils/constants.js`

- `CATEGORIES`: `[{ value: 'food', label: '외식·음료' }, ...]`
  - 6개 모두 넣는다. 값과 라벨은 `mock/db.json` 및 아래 표와 동일해야 한다.
  - food 외식·음료, retail 매장관리·판매, service 서비스, production 생산·건설, delivery 운전·배달, office 사무·회계
- `REGIONS`: `[{ value: '강남구', label: '강남구' }, ...]`
  - 8개 모두 넣는다: 강남구, 마포구, 송파구, 영등포구, 관악구, 종로구, 성동구, 노원구
- `getCategoryLabel(value) → string`
- `STORAGE_KEYS = { AUTH: 'findjob:auth', SCRAPS: 'findjob:scraps' }`

### 5. `src/utils/format.js` (PRD 5장 대상 파일)

- `formatWage(wage) → string`: `{ type: '시급', amount: 12000 }` → `'시급 12,000원'`
- `formatDate(iso) → string`: `'9월 23일'` 형식
- `formatPhone(value) → string`: 숫자만 남긴 뒤 `010-1234-5678` 형식으로 만든다
- 상단 주석:
  - `[개념]`: 템플릿 포맷을 일반 함수로 처리하는 이유
  - `[Vue 2였다면]`: `filters: { currency }`와 `{{ price | currency }}` 문법. Vue 3에서 filters가 삭제됐다

### 6. `src/utils/debounce.js`

- `debounce(fn, wait) → debounced`
- 반환 함수에 `.cancel()`을 둔다

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`src/styles/`, `src/utils/`)
   - ADR 기술 스택을 벗어나지 않았는가? (CSS 프레임워크 추가 금지)
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - `src/utils/format.js`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 생성 파일, mixin 이름 목록, CSS 변수 이름 목록, constants/format export 이름을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `_tokens.scss`와 `_mixins.scss`에 CSS를 출력하는 규칙(선택자, `:root`, `@font-face` 등)을 두지 마라. 이유: 두 파일은 모든 SFC에 주입되므로 출력이 있으면 컴포넌트마다 중복된다. 변수·mixin·function만 둔다.
- 색·간격을 SCSS 변수로 만들지 마라. 이유: UI_GUIDE는 색·간격을 런타임 CSS 변수로, 브레이크포인트·라운드·z-index를 빌드타임 SCSS 변수로 나눈다.
- 보라·인디고 색, 그라데이션 텍스트, `backdrop-filter`, 글로우 그림자를 쓰지 마라. 이유: UI_GUIDE 안티패턴이다.
- `@import`를 쓰지 마라. 이유: Dart Sass에서 deprecated다. `@use`를 쓴다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
