# 아키텍처

## 디렉토리 구조
```
findjob-vue-mvp/
├── mock/db.json               # json-server 목업 데이터
├── docs/                      # PRD, VUE2-VS-VUE3.md 등
├── src/
│   ├── main.js · App.vue      # createApp, KeepAlive + RouterView
│   ├── api/                   # http.js(axios 인스턴스), jobs.js, auth.js
│   ├── composables/           # useJobs, useMediaQuery, useFocusTrap
│   ├── stores/                # auth.js (Options 스토어), scrap.js (Setup 스토어)
│   ├── router/                # index.js (가드, scrollBehavior, route props)
│   ├── styles/                # _tokens.scss, _mixins.scss, base.scss
│   ├── utils/                 # format.js, debounce.js, constants.js
│   ├── components/
│   │   ├── base/              # BaseButton, BaseInput, BaseSelect, BaseTabs, BaseModal
│   │   ├── job/               # JobCard, JobFilter
│   │   └── layout/            # AppHeader
│   └── views/                 # JobListView, JobDetailView, LoginView, ScrapView
├── vite.config.js · index.html · package.json
└── README.md
```

## 패턴
- **slot 기반 Base 컴포넌트**: 버튼·입력·셀렉트·탭·모달은 `components/base/`에서 접근성까지 갖춰 만들고, 화면에서는 조합만 한다
- **v-model 컴포넌트**: `defineModel`로 양방향 바인딩을 만든다 (BaseInput, BaseSelect, 다중 v-model을 쓰는 JobFilter, `v-model:open`을 쓰는 BaseModal)
- **composable**: 재사용 로직은 mixin 대신 `useXxx()` 함수로 만든다. 목록 조회(useJobs)는 응답 경쟁 상태를 막는다(마지막 요청의 응답만 반영)
- **Pinia 두 방식**: auth는 Options 스토어, scrap은 Setup 스토어로 만들어 두 방식을 비교한다
- **라우터 가드**: `/scraps`와 지원하기는 인증이 필요하다. 로그인하지 않았으면 `/login?redirect=원래경로`로 보내고, 로그인하면 원래 경로로 돌아온다
- **상태 유지**: 목록 필터는 URL 쿼리와 동기화하고, 목록 화면은 `KeepAlive`로 캐시한다. 스크롤 위치는 `scrollBehavior`로 되살린다

## 데이터 흐름
```
사용자 입력 → 컴포넌트 → composable / store → api 모듈 → axios 인스턴스(인터셉터) → json-server → 응답 → 반응형 상태 → UI 업데이트
```

| 메서드 | 엔드포인트 | 용도 |
| --- | --- | --- |
| GET | `/jobs?q=&region=&_sort=postedAt&_order=desc` | 목록·검색 (업직종은 클라이언트 computed로 필터 + 탭 건수 계산) |
| GET | `/jobs?id=1&id=2` | 스크랩 목록 |
| GET | `/jobs/:id` | 상세 |
| GET | `/users?email=` | 로그인 목업 |
| POST | `/applications` | 지원하기 |

개발 서버는 `vite.config.js` 프록시로 json-server(3001)에 연결한다.

## 상태 관리
- **서버 데이터**(공고 목록·상세): composable(`useJobs`)이 로딩·에러와 함께 관리한다
- **전역 상태**: Pinia. `auth`(로그인 사용자, 인증 여부), `scrap`(스크랩한 공고 id 목록). 둘 다 `localStorage`에 저장해 새로고침 후에도 유지한다 (스크랩은 API 엔드포인트 없이 클라이언트에만 둔다)
- **필터 상태**(키워드·지역·업직종): URL 쿼리가 기준이다. 쓰기 가능한 computed와 watch로 쿼리와 동기화한다
- **화면 내부 상태**(모달 열림, 폼 입력, 검증 에러): 컴포넌트의 `ref` / `reactive`
