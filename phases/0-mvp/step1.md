# Step 1: mock-data

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` (4장 화면 요구사항, 7장 API)
- `docs/ARCHITECTURE.md`
- `docs/ADR.md` (ADR-003 json-server)
- `package.json` (step 0에서 만든 `dev`/`mock` 스크립트: `json-server --watch mock/db.json --port 3001 --delay 400`)

## 작업

`mock/db.json`을 만든다. json-server 0.17.4가 읽는 형식이며, 최상위 키는 `jobs`, `users`, `applications` 세 개다.

### 업직종 코드 (이후 step의 `src/utils/constants.js`가 이 값을 그대로 쓴다. 바꾸지 마라)

| category | 라벨 |
| --- | --- |
| `food` | 외식·음료 |
| `retail` | 매장관리·판매 |
| `service` | 서비스 |
| `production` | 생산·건설 |
| `delivery` | 운전·배달 |
| `office` | 사무·회계 |

### 지역 값 (서울 8개 구, `region` 필드에 이 문자열을 그대로 쓴다)

`강남구`, `마포구`, `송파구`, `영등포구`, `관악구`, `종로구`, `성동구`, `노원구`

### `jobs` — 24건

각 항목의 필드:

```json
{
  "id": 1,
  "title": "string (공고 제목, 20~40자)",
  "company": "string (가게·회사 이름)",
  "category": "food | retail | service | production | delivery | office",
  "region": "위 8개 구 중 하나",
  "wage": { "type": "시급 | 일급 | 월급", "amount": 12000 },
  "workDays": "string (예: 월~금, 주말, 주 3일 협의)",
  "workHours": "string (예: 09:00~18:00)",
  "employmentType": "아르바이트 | 계약직 | 정규직",
  "urgent": false,
  "description": "string (한국어 3~5문장. 줄바꿈은 \\n)",
  "postedAt": "ISO 8601 문자열 (2026-09-01 ~ 2026-09-23 사이)"
}
```

데이터 규칙:
- `id`는 1부터 24까지의 숫자다.
- 업직종 6개에 각 3~5건씩 고르게 나눈다.
- 지역 8개가 모두 한 번 이상 나오게 한다.
- `urgent: true`는 5~7건만 둔다. 급구는 유일한 강조 요소라 드물어야 한다.
- 시급은 2026년 최저임금 10,320원 이상으로 한다. 일급과 월급도 현실적인 금액으로 넣는다.
- 제목에 "서울"과 같은 공통 단어를 몇 개 넣어 키워드 검색(`q`) 결과가 여러 건 나오게 한다.
- `postedAt`은 서로 다르게 해서 `_sort=postedAt&_order=desc` 정렬 결과가 명확하게 한다.

### `users`

```json
[{ "id": 1, "email": "test@findjob.co.kr", "password": "1234", "name": "김벼룩" }]
```

### `applications`

빈 배열 `[]`

## Acceptance Criteria

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('mock/db.json','utf8'));const c=['food','retail','service','production','delivery','office'];const u=d.jobs.filter(j=>j.urgent).length;if(d.jobs.length!==24||!d.jobs.every(j=>c.includes(j.category))||u<5||u>7||!d.users.some(x=>x.email==='test@findjob.co.kr'&&x.password==='1234')||!Array.isArray(d.applications))process.exit(1);console.log('db ok')"
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`mock/db.json`)
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 규칙을 위반하지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 파일 경로, 업직종 코드 6개, 지역 8개, 급구 건수, job 필드 목록을 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 업직종 코드·지역 문자열을 위 표와 다르게 쓰지 마라. 이유: 이후 step의 `constants.js`와 json-server `region=` 완전일치 검색이 이 값에 의존한다.
- `scraps` 컬렉션을 만들지 마라. 이유: 스크랩은 API 없이 클라이언트(Pinia + localStorage)에만 둔다.
- `src/` 아래 파일을 만들거나 수정하지 마라. 이유: 이 step은 목업 데이터만 다룬다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
