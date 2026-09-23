# UI 디자인 가이드

## 디자인 원칙
1. 일자리를 빨리 훑어보는 목록이다. 장식보다 정보 밀도와 읽기 쉬움이 먼저다.
2. 강조는 하나만 쓴다. 급구 공고의 형광펜 강조가 유일한 강조 요소다.
3. 모바일 퍼스트로 만든다. 360px 폭에서도 깨지지 않고, 키보드만으로 모든 기능을 쓸 수 있어야 한다.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| backdrop-filter: blur() | glass morphism은 AI 템플릿의 가장 흔한 징후 |
| gradient-text (배경 그라데이션 텍스트) | AI가 만든 SaaS 랜딩의 1번 특징 |
| "Powered by AI" 배지 | 기능이 아니라 장식. 사용자에게 가치 없음 |
| box-shadow 글로우 애니메이션 | 네온 글로우 = AI 슬롭 |
| 보라/인디고 브랜드 색상 | "AI = 보라색" 클리셰 |
| 모든 카드에 동일한 rounded-2xl | 균일한 둥근 모서리는 템플릿 느낌 |
| 배경 gradient orb (blur-3xl 원형) | 모든 AI 랜딩 페이지에 있는 장식 |
| 공고를 그림자 카드로 나열 | 이 프로젝트는 구분선 행 목록을 쓴다 |
| 급구 외 요소에 형광펜·강조색 사용 | 강조가 여러 개면 급구가 묻힌다 |

## 토큰 구조
- **빌드타임 토큰** (`styles/_tokens.scss`, SCSS 변수): 브레이크포인트, 라운드, z-index
- **런타임 토큰** (`:root` CSS 변수): 색, 간격
- `_tokens.scss`와 `_mixins.scss`는 `vite.config.js`의 `css.preprocessorOptions`로 모든 SFC에 전역 주입한다

## 색상
구체적인 값은 구현할 때 `styles/_tokens.scss` / `base.scss`의 CSS 변수로 정한다. 역할은 다음과 같다.

| 용도 | 값 |
|------|------|
| 페이지 배경 | 흰색 |
| 액션(버튼, 링크, 활성 탭) | 짙은 초록 |
| 급구 강조 | 형광펜(텍스트 뒤 하이라이트). 급구 공고에만 사용 |
| 행 구분선 | 옅은 회색 |
| 에러 | 빨간 계열. `aria-invalid` 입력과 에러 메시지에 사용 |

## 컴포넌트
### 공고 목록 행 (JobCard)
```
카드 대신 구분선으로 나눈 행. 제목(급구면 형광펜) → 급여·지역·근무시간 → 스크랩 토글(44px 이상)
```

### 버튼 (BaseButton)
```
Primary: 짙은 초록 배경 + 흰 글자
Secondary / Text: 초록 글자, 배경 없음
모든 버튼: 높이 44px 이상, :focus-visible 외곽선 표시
```

### 입력 필드 (BaseInput, BaseSelect)
```
font-size 16px (iOS 확대 방지), label 연결, 에러 시 aria-invalid + aria-describedby
연락처는 inputmode="numeric", 셀렉트는 네이티브 <select>
```

### 탭 (BaseTabs)
```
role="tablist" / "tab" / "tabpanel", 방향키로 이동, roving tabindex, 탭마다 건수 표시
```

### 모달 (BaseModal)
```
Teleport로 body에 렌더링, role="dialog" + aria-modal, 포커스 트랩, ESC로 닫기, 닫으면 여는 버튼으로 포커스 복귀
```

## 레이아웃
- 모바일 퍼스트. `mq()` 믹스인으로 768px 이상에서 확장한다
- 모바일에서는 필터를 접는다. 상세 화면은 하단에 지원 바를 고정한다 (`env(safe-area-inset-bottom)` 대응)
- 360px 폭에서 가로 스크롤이 생기지 않아야 한다
- 스킵 링크를 두고, 검색 결과 건수는 `aria-live`로 알린다

## 타이포그래피
| 용도 | 스타일 |
|------|--------|
| 전체 | Pretendard Variable (CDN), 한글은 `word-break: keep-all` |
| 입력 | 16px 이상 |
| 공고 제목 | 본문보다 굵게. 급구면 형광펜 강조 |

## 애니메이션
- 사용자 동작에 반응하는 전환만 허용한다: 모달 열고 닫기, 필터 펼치고 접기 (`Transition`)
- `prefers-reduced-motion: reduce`이면 전환을 끈다
- 그 외 모든 애니메이션 금지

## 아이콘
- SVG 인라인. 장식용 아이콘은 `aria-hidden="true"`
- 아이콘만 있는 버튼(스크랩 등)은 `aria-label`과 `aria-pressed`를 단다
