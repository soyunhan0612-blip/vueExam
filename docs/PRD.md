# 생활일자리 MVP — Vue 3 + Vue 2 비교 학습 프로젝트 PRD

작성일: 2026-09-23 · 면접일: 2026-09-28(월)

## 1. 개요

벼룩시장(findjob.co.kr) 개인회원 흐름을 축소한 Vue 3 앱을 만든다. 모든 주요 파일 상단에 **[개념]** 설명과 **[Vue 2였다면]** 대응 코드를 주석으로 넣어, 한 파일 안에서 Vue 3 실제 코드와 Vue 2 코드를 함께 볼 수 있게 한다.

지원 포지션은 **퍼블리싱 + Vue를 잘 다루는 사람**이므로, Vue 로직보다 "퍼블 결과물을 Vue 컴포넌트로 잘 만드는 역량"이 드러나도록 비중을 둔다. (퍼블 60 : Vue 로직 40)

## 2. 목표와 비목표

**목표**

- slot 기반 공통 UI 컴포넌트(버튼, 입력, 셀렉트, 탭, 모달)를 접근성까지 갖춰 구현한다
- SCSS 토큰·믹스인 구조와 모바일 퍼스트 반응형을 Vue SFC 안에서 적용한다
- Vue 3 핵심 개념(반응성, props/emit, v-model, watch, composable, Pinia, Router, KeepAlive)을 실제 화면에 적용한다
- 각 개념의 Vue 2 대응 문법과 차이를 코드 주석으로 비교할 수 있다
- 면접에서 시연 가능한 시나리오 2개를 완성한다

**비목표**

- 실제 백엔드·인증 서버 (json-server 목업으로 대체)
- 기업회원 기능(지원자 관리), 페이지네이션, 테스트 코드, 배포, TypeScript
- 별도 Vue 2 앱 구축 (주석 비교로 대체)

## 3. 기술 스택

| 영역 | 사용 | Vue 2 시절 대응 |
| --- | --- | --- |
| 빌드 | Vite 5 | Vue CLI (webpack) |
| 프레임워크 | Vue 3.5 (`<script setup>`, Composition API) | Vue 2.7 (Options API) |
| 라우팅 | Vue Router 4 | Vue Router 3 |
| 전역 상태 | Pinia (Options/Setup 스토어 각 1개) | Vuex 3 |
| HTTP | axios | axios |
| 스타일 | SCSS + CSS 변수 | 동일 |
| 목업 API | json-server 0.17 (`--delay 400`) | 동일 |
| 폰트 | Pretendard Variable (CDN) | 동일 |

## 4. 화면과 기능 요구사항

| 경로 | 화면 | 기능 | 인증 |
| --- | --- | --- | --- |
| `/jobs` | 공고 목록 | 키워드 검색(한글 즉시 반응), 지역 선택, 업직종 탭(건수 표시), 급구 강조, 스크랩 토글, 필터 URL 동기화 | 불필요 |
| `/jobs/:id` | 공고 상세 | 급여·지역·근무시간·고용형태, 상세 설명, 모바일 하단 고정 지원 버튼, 목록으로 돌아가기 | 불필요 |
| (모달) | 지원하기 | 이름·연락처·근무 시작일 입력, 제출 시 검증, 완료 상태 표시 | 필요 (미로그인 시 로그인 이동 후 복귀) |
| `/login` | 로그인 | 이메일·비밀번호, 에러 표시, redirect 쿼리로 복귀 | — |
| `/scraps` | 스크랩 목록 | 스크랩한 공고 목록, 빈 상태 안내 | 필요 (라우터 가드) |

테스트 계정: `test@findjob.co.kr` / `1234`

## 5. 파일별 개념 매핑

| 파일 | Vue 3 개념 | 주석으로 비교하는 Vue 2 대응 |
| --- | --- | --- |
| `main.js` | `createApp`, 앱 인스턴스 단위 플러그인 | `new Vue`, 전역 `Vue.use` |
| `vite.config.js` | SCSS 전역 주입, 개발 프록시 | `vue.config.js` |
| `router/index.js` | 가드 return 값, `scrollBehavior`, route `props` | `next()` 필수, `mode: 'history'`, `path: '*'` |
| `stores/auth.js` | Pinia Options 스토어 | Vuex `state/getters/mutations/actions`, `mapGetters` |
| `stores/scrap.js` | Pinia Setup 스토어, Proxy 반응성 | `$set` / `Vue.set` 반응성 함정 |
| `api/http.js` | axios 인스턴스, 요청·응답 인터셉터 | 스토어 접근 방식(`store.state`) |
| `composables/useJobs.js` | composable, 응답 경쟁 상태 방지 | mixin과 그 문제점 3가지 |
| `composables/useMediaQuery.js` | composable 안의 라이프사이클 훅 | `mounted` / `beforeDestroy` |
| `composables/useFocusTrap.js` | template ref, `nextTick` | `this.$refs`, `this.$nextTick` |
| `utils/format.js` | 일반 함수로 포맷 | `filters` 삭제 |
| `BaseButton.vue` | props 검증, `:class` 배열·객체, `$attrs` 폴스루 | `.native`, `$listeners` 삭제 |
| `BaseInput.vue` | `defineModel`, 한글 IME 처리, `useId` | `value` + `input`, `inheritAttrs` 차이 |
| `BaseSelect.vue` | `defineModel`, 네이티브 select 유지 | `value` + `change` |
| `BaseTabs.vue` | scoped slot, 방향키 이동, roving tabindex | `slot-scope` |
| `BaseModal.vue` | `Teleport`, `v-model:open`, `Transition` | `portal-vue`, `.sync` |
| `JobCard.vue` | props/emit, scoped style | `$emit`, `::v-deep` |
| `JobFilter.vue` | 다중 v-model, `v-show` + `Transition` | `.sync` 여러 개 |
| `JobListView.vue` | 쓰기 가능한 computed, watch + URL 쿼리, `defineOptions({ name })` | `watch: { '$route.query' }`, `name` 옵션 |
| `JobDetailView.vue` | route props, 조건부 모달 | `this.$route.params` |
| `App.vue` | `KeepAlive` + `RouterView` 슬롯 | `<keep-alive><router-view>` |

## 6. 퍼블리싱 요구사항

| 항목 | 구현 |
| --- | --- |
| 스타일 구조 | 빌드타임 토큰(SCSS 변수: 브레이크포인트, 라운드, z-index)과 런타임 토큰(CSS 변수: 색, 간격) 분리. `vite.config.js`에서 토큰·믹스인 전역 주입 |
| 반응형 | 모바일 퍼스트 `mq()` 믹스인, 768px 기준. 모바일에서 필터 접기, 상세 하단 고정 지원 바(`safe-area-inset` 대응) |
| 스타일 캡슐화 | 컴포넌트별 `<style scoped lang="scss">`, 부모에서 자식 내부 조정 시 `:deep()` |
| 모바일 입력 | 입력 폰트 16px(iOS 확대 방지), 연락처 `inputmode="numeric"`, 터치 타깃 44px 이상 |
| 한글 | `word-break: keep-all`, 검색 입력 IME 즉시 반응 |
| 접근성 | 확대 차단 안 함, label 연결, `aria-invalid`·`aria-describedby`, 탭 `role="tablist"` + 방향키, 모달 `role="dialog"` + 포커스 트랩·ESC·포커스 복귀, 스킵 링크, 결과 건수 `aria-live` |
| 모션 | 사용자 동작에 반응하는 전환만 사용(모달, 필터 펼침), `prefers-reduced-motion` 대응 |
| 디자인 | 흰 배경 + 짙은 초록 액션색, 급구 공고에만 형광펜 강조(유일한 강조 요소), 카드 나열 대신 구분선 행 목록 |

## 7. API (json-server)

| 메서드 | 엔드포인트 | 용도 |
| --- | --- | --- |
| GET | `/jobs?q=&region=&_sort=postedAt&_order=desc` | 목록·검색 (업직종은 클라이언트 computed로 필터 + 탭 건수 계산) |
| GET | `/jobs?id=1&id=2` | 스크랩 목록 |
| GET | `/jobs/:id` | 상세 |
| GET | `/users?email=` | 로그인 목업 |
| POST | `/applications` | 지원하기 |

호출 흐름: 컴포넌트 → composable / store → api 모듈 → axios 인스턴스 → json-server

## 8. 폴더 구조

```
findjob-vue-mvp/
├─ mock/db.json
├─ docs/
│  ├─ prd.md
│  └─ VUE2-VS-VUE3.md
├─ src/
│  ├─ main.js · App.vue
│  ├─ api/           http.js, jobs.js, auth.js
│  ├─ composables/   useJobs.js, useMediaQuery.js, useFocusTrap.js
│  ├─ stores/        auth.js (Options), scrap.js (Setup)
│  ├─ router/        index.js
│  ├─ styles/        _tokens.scss, _mixins.scss, base.scss
│  ├─ utils/         format.js, debounce.js, constants.js
│  ├─ components/
│  │  ├─ base/       BaseButton, BaseInput, BaseSelect, BaseTabs, BaseModal
│  │  ├─ job/        JobCard, JobFilter
│  │  └─ layout/     AppHeader
│  └─ views/         JobListView, JobDetailView, LoginView, ScrapView
├─ vite.config.js · index.html · package.json
└─ README.md
```

## 9. 면접 시연 시나리오

1. **키보드 전용 조작 (퍼블 역량)**
   Tab으로 업직종 탭 진입 → 방향키로 탭 전환 → 공고 상세 이동 → 지원 모달 열기 → Tab 순환 확인 → ESC로 닫기 → 지원 버튼으로 포커스 복귀
2. **필터·스크롤 유지 (사이트 개선 제안)**
   지역·업직종 선택 → 스크롤 → 공고 상세 → 뒤로가기 → 필터·스크롤 그대로 유지
   근거: 플레이스토어 리뷰의 "상세 들어갔다 나오면 조건 초기화" 불만을 URL 쿼리 동기화 + KeepAlive로 해결

## 10. 진행 상태

| 구분 | 항목 | 상태 |
| --- | --- | --- |
| 설정 | package.json, vite.config.js, index.html, mock/db.json | 완료 |
| 기반 | styles, utils, main.js, api, stores, router, composables | 완료 |
| 공통 UI | BaseButton, BaseInput, BaseSelect | 완료 |
| 공통 UI | BaseTabs, BaseModal | 남음 |
| 도메인 | JobCard, JobFilter, AppHeader | 남음 |
| 화면 | JobListView, JobDetailView, LoginView, ScrapView, App.vue | 남음 |
| 마무리 | 빌드 검증, VUE2-VS-VUE3.md, README.md, zip 전달 | 남음 |

진행 순서: BaseTabs → BaseModal → JobCard → JobFilter → 목록 → 상세 → 로그인·스크랩 → App → 빌드 검증 → 문서 → 전달

## 11. 실행 방법

```bash
npm install
npm run dev     # json-server(3001) + Vite 동시 실행
```

## 12. 완료 기준

- [ ] `npm run build`가 에러 없이 통과
- [ ] 4개 화면과 지원 모달이 json-server와 연동되어 동작
- [ ] 컴포넌트에서 axios 직접 호출 없음
- [ ] 비로그인 상태로 `/scraps` 접근 시 로그인 후 원래 경로로 복귀
- [ ] 시연 시나리오 1, 2가 끊김 없이 동작
- [ ] 360px 폭에서 레이아웃 깨짐 없음
- [ ] Lighthouse 접근성 90점 이상
- [ ] 5장 표의 모든 파일에 [개념] / [Vue 2였다면] 주석 포함
