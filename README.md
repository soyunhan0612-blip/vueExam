# 생활일자리 MVP

벼룩시장 개인회원 흐름을 축소해 만든 Vue 3 면접 시연용 프로젝트입니다. 공고 검색·상세·스크랩·로그인·지원 흐름을 구현하고, 접근성 있는 공통 UI와 모바일 퍼스트 퍼블리싱을 중심으로 구성했습니다.

실행 코드는 Vue 3.5로 작성했으며, 주요 파일의 `[Vue 2였다면]` 주석과 비교 문서에서 Vue 2 대응 방식을 함께 확인할 수 있습니다.

## 실행 방법

Node.js 환경에서 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

- 앱: Vite 기본 개발 주소인 `http://localhost:5173`
- 목업 API: `http://localhost:3001`

`npm run dev`는 Vite와 json-server를 함께 실행합니다. json-server에는 400ms 지연이 적용되어 로딩 상태와 요청 경쟁 처리를 확인할 수 있습니다.

## 테스트 계정

- 이메일: `test@findjob.co.kr`
- 비밀번호: `1234`

## 시연 시나리오

### 1. 키보드만으로 공고 지원하기

1. `/jobs`에서 `Tab` 키로 업직종 탭에 진입합니다.
2. 왼쪽·오른쪽 방향키로 탭을 전환하고, 공고 제목 링크를 열어 상세 화면으로 이동합니다.
3. `지원하기` 버튼을 누릅니다. 로그인하지 않았다면 로그인 화면으로 이동하므로 테스트 계정으로 로그인합니다.
4. 원래 공고로 돌아와 지원 모달이 열리면 `Tab`과 `Shift+Tab`을 눌러 포커스가 모달 내부에서 순환하는지 확인합니다.
5. `Esc`로 닫고 포커스가 `지원하기` 버튼으로 돌아오는지 확인합니다.

### 2. 상세 화면 왕복 후 필터와 스크롤 유지하기

1. `/jobs`에서 지역과 업직종을 선택합니다.
2. 결과 목록을 아래로 스크롤한 뒤 공고 상세로 이동합니다.
3. 브라우저 뒤로가기를 실행합니다.
4. URL 쿼리의 필터 조건과 이전 스크롤 위치가 그대로 복원되는지 확인합니다.

이 시나리오는 URL 쿼리 동기화, `KeepAlive`, Vue Router의 `scrollBehavior`를 함께 사용합니다.

## 폴더 구조

```text
findjob-vue-mvp/
├─ mock/
│  └─ db.json
├─ docs/
│  ├─ ADR.md
│  ├─ ARCHITECTURE.md
│  ├─ PRD.md
│  └─ UI_GUIDE.md
├─ src/
│  ├─ api/
│  │  ├─ auth.js
│  │  ├─ http.js
│  │  └─ jobs.js
│  ├─ components/
│  │  ├─ base/
│  │  │  ├─ BaseButton.vue
│  │  │  ├─ BaseInput.vue
│  │  │  ├─ BaseModal.vue
│  │  │  ├─ BaseSelect.vue
│  │  │  └─ BaseTabs.vue
│  │  ├─ job/
│  │  │  ├─ JobCard.vue
│  │  │  └─ JobFilter.vue
│  │  └─ layout/
│  │     └─ AppHeader.vue
│  ├─ composables/
│  │  ├─ useFocusTrap.js
│  │  ├─ useJobs.js
│  │  └─ useMediaQuery.js
│  ├─ router/
│  │  └─ index.js
│  ├─ stores/
│  │  ├─ auth.js
│  │  └─ scrap.js
│  ├─ styles/
│  │  ├─ _mixins.scss
│  │  ├─ _tokens.scss
│  │  └─ base.scss
│  ├─ utils/
│  │  ├─ constants.js
│  │  ├─ debounce.js
│  │  └─ format.js
│  ├─ views/
│  │  ├─ JobDetailView.vue
│  │  ├─ JobListView.vue
│  │  ├─ LoginView.vue
│  │  └─ ScrapView.vue
│  ├─ App.vue
│  └─ main.js
├─ index.html
├─ package.json
└─ vite.config.js
```

## 문서

- [제품 요구사항](docs/PRD.md)
- [아키텍처](docs/ARCHITECTURE.md)
- [기술 결정 기록](docs/ADR.md)
- [UI 디자인 가이드](docs/UI_GUIDE.md)
- [Vue 2와 Vue 3 개념 비교](VUE2-VS-VUE3.md)
