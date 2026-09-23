# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `AGENTS.md`
- `docs/PRD.md` (3장 기술 스택, 5장 파일별 개념 매핑, 6장 퍼블리싱 요구사항)
- `docs/ARCHITECTURE.md`
- `docs/ADR.md`
- `.gitignore`

저장소에는 아직 앱 코드가 없다(`src/`, `package.json` 없음). 이 step이 Vite + Vue 3 프로젝트의 뼈대를 만든다.

## 작업

### 1. `package.json`

- `"name": "findjob-vue-mvp"`, `"private": true`, `"type": "module"`
- dependencies: `vue` ^3.5, `vue-router` ^4.4, `pinia` ^3, `axios` ^1
- devDependencies: `vite` ^5.4, `@vitejs/plugin-vue` ^5, `sass` ^1.80, `concurrently` ^9, **`json-server` 정확히 `0.17.4`** (캐럿 없이 고정)
- scripts:
  - `"dev"`: concurrently로 json-server와 vite를 함께 실행. json-server 부분은 `json-server --watch mock/db.json --port 3001 --delay 400`
  - `"mock"`: json-server 단독 실행 (위와 같은 옵션)
  - `"build"`: `vite build`
  - `"preview"`: `vite preview`
- 작성 후 `npm install`을 실행해 `package-lock.json`을 만든다.

### 2. `vite.config.js` (PRD 5장 대상 파일)

- `@vitejs/plugin-vue` 사용
- `resolve.alias`: `@` → `src` (`fileURLToPath(new URL('./src', import.meta.url))`)
- `css.preprocessorOptions.scss`:
  - `api: 'modern-compiler'`
  - `additionalData`: `@use "@/styles/tokens" as *;` 와 `@use "@/styles/mixins" as *;` 를 모든 SFC에 주입
- `server.proxy`: `/api` → `http://localhost:3001`, `rewrite`로 `/api` 접두사를 제거
- 파일 상단 주석:
  - `[개념]`: SCSS 전역 주입(additionalData)과 개발 프록시가 왜 필요한지
  - `[Vue 2였다면]`: Vue CLI의 `vue.config.js`에서 `css.loaderOptions.scss.additionalData`, `devServer.proxy`를 쓰던 코드

### 3. `index.html`

- `<html lang="ko">`
- viewport는 `width=device-width, initial-scale=1, viewport-fit=cover`만 쓴다
- Pretendard Variable CDN 스타일시트:
  `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`
- `<title>생활일자리</title>`, `<div id="app"></div>`, `<script type="module" src="/src/main.js"></script>`

### 4. 빌드용 최소 파일 (이후 step에서 확장)

- `src/styles/_tokens.scss`, `src/styles/_mixins.scss`: 파일 역할을 설명하는 주석만 둔다. 내용은 step 2가 채운다.
- `src/main.js` (PRD 5장 대상 파일)
  - `createApp(App).mount('#app')`만 한다.
  - 상단에 `[개념]`(createApp, 앱 인스턴스 단위 설정)과 `[Vue 2였다면]`(`new Vue({ render: h => h(App) }).$mount('#app')`, 전역 `Vue.use`) 주석을 둔다.
  - Pinia·Router 연결은 step 9가 한다.
- `src/App.vue` (PRD 5장 대상 파일)
  - `<h1>생활일자리</h1>` 수준의 자리표시자로 만든다.
  - 상단에 `[개념]`(KeepAlive + RouterView 슬롯 — step 9에서 구현 예정)과 `[Vue 2였다면]`(`<keep-alive><router-view/></keep-alive>`) 주석을 둔다.

### 5. `scripts/verify.mjs` — 프로젝트 규칙 검사 스크립트

모든 step의 AC에서 쓰는 Node 스크립트다. 앱 테스트가 아니라 AGENTS.md의 CRITICAL 규칙을 기계적으로 검사한다. 의존성 없이 `node:fs`/`node:path`만 쓴다.

- 검사 1: `src/components/**`, `src/views/**`의 `.vue`/`.js` 파일이 `axios`를 import하거나 `@/api/`를 직접 import하지 않는지
  - 컴포넌트는 composable/store를 거쳐야 한다
- 검사 2: 아래 20개 파일 중 **존재하는 파일**에 `[개념]`과 `[Vue 2였다면]` 문자열이 모두 있는지
  - `--strict` 플래그를 주면 파일이 없는 것도 실패로 처리한다
  - 대상 파일:
    ```
    src/main.js, vite.config.js, src/router/index.js, src/stores/auth.js, src/stores/scrap.js,
    src/api/http.js, src/composables/useJobs.js, src/composables/useMediaQuery.js,
    src/composables/useFocusTrap.js, src/utils/format.js,
    src/components/base/BaseButton.vue, src/components/base/BaseInput.vue,
    src/components/base/BaseSelect.vue, src/components/base/BaseTabs.vue,
    src/components/base/BaseModal.vue, src/components/job/JobCard.vue,
    src/components/job/JobFilter.vue, src/views/JobListView.vue,
    src/views/JobDetailView.vue, src/App.vue
    ```
- 검사 3: `index.html`에 `user-scalable=no`, `maximum-scale`이 없는지 (확대 차단 금지)
- 위반 항목을 파일 경로와 함께 모두 출력한다. 위반이 있으면 `process.exit(1)`, 없으면 `verify: OK`를 출력하고 0으로 종료한다.

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가?
   - ADR 기술 스택을 벗어나지 않았는가? (TypeScript, 테스트 러너, UI 라이브러리를 추가하지 않았는가)
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - `vite.config.js`, `src/main.js`, `src/App.vue`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 생성 파일과 핵심 결정(json-server 0.17.4 고정, `/api` 프록시 rewrite, SCSS 주입 경로, verify.mjs 사용법)을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 (npm 레지스트리 접근 불가 등) → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- json-server를 1.x(beta)로 설치하지 마라. 이유: 1.x는 `--delay`와 `_sort`/`_order` 쿼리를 지원하지 않아 PRD 7장 API가 동작하지 않는다.
- viewport에 `user-scalable=no`나 `maximum-scale`을 넣지 마라. 이유: 확대 차단은 AGENTS.md CRITICAL 접근성 규칙 위반이다.
- TypeScript, ESLint, 테스트 러너, UI 컴포넌트 라이브러리를 추가하지 마라. 이유: ADR-005와 "의존성 최소" 철학에 어긋난다.
- `src/api`, `src/stores`, `src/router`, `src/components`, `src/views`, `mock/` 파일을 만들지 마라. 이유: 이후 step의 범위다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
