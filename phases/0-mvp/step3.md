# Step 3: api-layer

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (데이터 흐름, API 표)
- `docs/PRD.md` (7장 API)
- `docs/ADR.md` (ADR-003)
- `vite.config.js` (`/api` → `http://localhost:3001` 프록시, 접두사 rewrite)
- `mock/db.json` (job/user 필드)

## 작업

호출 흐름은 **컴포넌트 → composable/store → `src/api/*` → `src/api/http.js` → json-server**다. 이 step은 api 레이어만 만든다.

### 1. `src/api/http.js` (PRD 5장 대상 파일)

- `const http = axios.create({ baseURL: '/api', timeout: 10000 })`를 `export default` 한다.
- `paramsSerializer: { indexes: null }`를 설정한다.
  - 배열 파라미터를 `id=1&id=2`로 보내야 json-server가 인식한다.
  - axios 기본값은 `id[]=1&id[]=2`다.
- 요청 인터셉터 자리는 만들어 두기만 한다. 인증 헤더는 step 4가 추가한다.
- 응답 인터셉터
  - 성공하면 응답을 그대로 반환한다.
  - 실패하면 사용자에게 보여 줄 한국어 메시지를 담은 `Error`로 바꿔 reject한다.
    - 네트워크 오류 / 404 / 5xx를 구분한다.
    - `error.status`에 HTTP 상태를 보존한다.
  - 취소된 요청(`axios.isCancel(err)`)은 가공하지 말고 원본 그대로 reject한다. composable이 취소를 구분해야 한다.
- 상단 주석:
  - `[개념]`: axios 인스턴스와 인터셉터가 하는 일
  - `[Vue 2였다면]`: Vuex에서 인터셉터 안의 `store.state.auth.token` 접근. `import store from '@/store'`와 순환 참조 문제

### 2. `src/api/jobs.js`

모든 함수는 `response.data`를 반환한다.

- `fetchJobs({ q, region } = {}, { signal } = {}) → Promise<Job[]>`
  - `GET /jobs`에 `_sort=postedAt&_order=desc`를 붙인다.
  - 값이 빈 파라미터는 보내지 않는다.
- `fetchJobsByIds(ids, { signal } = {}) → Promise<Job[]>`
  - `GET /jobs?id=..&id=..`
- `fetchJob(id, { signal } = {}) → Promise<Job>`
  - `GET /jobs/:id`
- `createApplication(payload) → Promise<Application>`
  - `POST /applications`
  - payload는 `{ jobId, userId, name, phone, startDate }`
  - `createdAt`(ISO)은 이 함수가 붙인다

### 3. `src/api/auth.js`

- `login(email, password) → Promise<{ user: { id, email, name }, token: string }>`
  - `GET /users?email=`로 조회해 비밀번호를 비교한다.
  - 일치하면 `password`를 뺀 user와 가짜 토큰 `mock-token-{id}`를 반환한다.
  - 일치하지 않으면 `new Error('이메일 또는 비밀번호가 올바르지 않습니다.')`를 throw한다.
- 파일 상단에 목업 인증이라는 한 줄 주석을 둔다. 실제 서비스에서는 서버가 검증한다는 점을 적는다.

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`src/api/http.js`, `jobs.js`, `auth.js`)
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가? (axios import는 `src/api/`에만)
   - `src/api/http.js`에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 생성 파일, export 함수 시그니처, 에러 정규화 규칙(`error.status`, 취소는 원본 reject), paramsSerializer 설정을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `fetchJobsByIds([])`에서 요청을 보내지 마라. 빈 배열이면 즉시 `[]`를 반환하라. 이유: id 파라미터 없이 `GET /jobs`를 호출하면 json-server가 전체 공고를 돌려줘 스크랩 목록이 전부 채워진다.
- baseURL에 `http://localhost:3001`을 직접 쓰지 마라. 이유: 개발 서버는 Vite 프록시(`/api`)로 연결하기로 했다.
- 이 step에서 `src/stores/`를 import하지 마라. 이유: 스토어는 step 4에서 만든다. 인증 헤더 연결도 step 4 범위다.
- axios를 `src/api/` 밖에서 import하지 마라. 이유: AGENTS.md CRITICAL 규칙이다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
