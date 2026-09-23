# Step 4: stores

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (상태 관리: auth·scrap은 localStorage에 저장)
- `docs/ADR.md` (ADR-002 Pinia Options/Setup 스토어)
- `docs/PRD.md` (5장 `stores/auth.js`, `stores/scrap.js`, `api/http.js` 행)
- `src/api/auth.js`, `src/api/http.js` (step 3)
- `src/utils/constants.js` (`STORAGE_KEYS`)
- `src/main.js`

## 작업

### 1. `src/stores/auth.js` — **Options 스토어** (PRD 5장 대상 파일)

```js
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, token: null }),  // localStorage(STORAGE_KEYS.AUTH)에서 초기값 복원
  getters: { isLoggedIn, userName },
  actions: { async login(email, password), logout() },
})
```

- `login`: `src/api/auth.js`의 `login`을 호출하고 결과를 state와 localStorage에 저장한다. 에러는 그대로 throw해 화면이 메시지를 보여 주게 한다.
- `logout`: state와 localStorage를 비운다.
- localStorage 읽기와 쓰기는 `try/catch`로 감싼다. JSON이 깨져 있거나 저장소를 쓸 수 없어도 앱이 죽으면 안 된다.
- 상단 주석:
  - `[개념]`: Options 스토어 구조
  - `[Vue 2였다면]`: Vuex의 `state/getters/mutations/actions` 모듈, `commit`/`dispatch`, 컴포넌트의 `...mapGetters(['isLoggedIn'])`. Pinia에서는 mutations가 없어진 이유도 설명한다

### 2. `src/stores/scrap.js` — **Setup 스토어** (PRD 5장 대상 파일)

```js
export const useScrapStore = defineStore('scrap', () => {
  // 반환: ids(computed, number[]), count(computed), isScrapped(id), toggle(id), clear()
})
```

- 내부 상태는 `reactive({})` 객체 맵(`{ [id]: true }`)으로 둔다.
  - `toggle`은 **새 키를 직접 추가(`map[id] = true`)하고 `delete map[id]`로 제거**한다.
  - Vue 2라면 `Vue.set`/`Vue.delete`가 필요했던 패턴을 Proxy 반응성으로 그대로 쓰는 것을 보여 주려는 의도다.
- 초기값은 localStorage(`STORAGE_KEYS.SCRAPS`, id 배열)에서 복원한다.
- `watch`(deep)로 변경을 다시 저장한다. 읽기와 쓰기는 `try/catch`로 감싼다.
- 스크랩 토글은 로그인 여부와 관계없이 동작한다. `/scraps` 화면 진입만 로그인이 필요하다.
- 상단 주석:
  - `[개념]`: Setup 스토어(ref=state, computed=getters, function=actions), Proxy 반응성
  - `[Vue 2였다면]`: `this.$set(this.map, id, true)` / `Vue.delete`. `Object.defineProperty`로는 새 키 추가를 감지하지 못하는 이유

### 3. `src/api/http.js` 요청 인터셉터 연결

- 요청 인터셉터 **함수 안에서** `useAuthStore()`를 호출한다.
- 토큰이 있으면 `Authorization: Bearer {token}` 헤더를 붙인다. json-server는 이 헤더를 무시하지만 실제 구조를 보여 주려는 것이다.
- 기존 `[Vue 2였다면]` 주석에 Pinia 방식과의 차이를 한두 줄 보강한다.

### 4. `src/main.js`

- `createPinia()`를 만들어 `app.use(pinia)`로 등록한다.
- 이 변경에 맞춰 main.js 상단 주석을 보강한다. 앱 인스턴스 단위로 플러그인을 등록한다는 점을 적는다.

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가?
   - ADR-002대로 auth는 Options, scrap은 Setup 스토어인가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
   - `src/stores/auth.js`, `src/stores/scrap.js`, `src/api/http.js`, `src/main.js`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 두 스토어의 공개 API(state/getters/actions, ids/count/isScrapped/toggle/clear), localStorage 키, http.js 인터셉터 변경, main.js Pinia 등록을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `http.js` 모듈 최상단에서 `useAuthStore()`를 호출하지 마라. 이유: 모듈을 평가하는 시점에는 Pinia가 아직 설치되지 않았고, `auth.js → api/auth.js → http.js → stores/auth.js` 순환 import에서 초기화 순서 오류가 난다. 인터셉터 함수 안에서 지연 호출하라.
- `pinia-plugin-persistedstate` 같은 영속화 플러그인을 설치하지 마라. 이유: 의존성 최소 원칙이며, `watch` + localStorage 직접 구현이 학습 목적에 맞다.
- scrap 상태를 `ref([])` 배열로 바꾸지 마라. 이유: 객체 맵에 새 키를 추가하는 코드가 `Vue.set` 비교 시연 포인트다.
- 스토어에서 axios를 직접 import하지 마라. 이유: 스토어는 `src/api/` 모듈을 거친다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
