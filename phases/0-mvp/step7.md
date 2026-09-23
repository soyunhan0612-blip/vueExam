# Step 7: base-tabs-modal

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` (탭, 모달, 애니메이션)
- `docs/PRD.md` (5장 `BaseTabs.vue`, `BaseModal.vue` 행, 9장 시연 시나리오 1)
- `src/composables/useFocusTrap.js` (step 5: `useFocusTrap(containerRef) → { activate(), deactivate({ returnFocusTo }) }`)
- `src/components/base/BaseButton.vue` (step 6)
- `src/styles/_tokens.scss`, `src/styles/_mixins.scss` (`$z-modal`, `reduced-motion`, `focus-ring`, `tap-target`)

## 작업

### 1. `src/components/base/BaseTabs.vue` (PRD 5장 대상 파일)

```js
const selected = defineModel({ type: String, required: true }) // 선택된 탭 key
props: { tabs: Array<{ key: string, label: string, count?: number }> (필수), label: String (필수, tablist의 aria-label) }
slots: tab({ tab, selected }) — 탭 라벨 커스터마이즈(기본: label + count)
       default({ selected }) — 선택된 탭의 패널 내용
```

- 마크업: `role="tablist"` 안에 `<button role="tab">`을 둔다. 탭마다 `aria-selected`, `aria-controls`, `id`를 단다.
- 패널은 하나의 `role="tabpanel"`이다. `aria-labelledby`에 선택된 탭 id를 넣고 `tabindex="0"`을 둔다.
- id는 `useId()`로 접두사를 만든다.
- **roving tabindex**: 선택된 탭만 `tabindex="0"`, 나머지는 `-1`로 둔다.
- 키보드
  - ←/→로 이전/다음 탭(양 끝에서 순환)
  - Home/End로 처음/끝
  - 이동과 동시에 선택(자동 활성화)하고 해당 탭으로 포커스를 옮긴다. template ref 배열과 `nextTick`을 쓴다.
- 기본 탭 라벨은 `label`과 `count`(있을 때 `(12)` 형태)를 표시한다.
- 모바일에서 탭이 넘치면 **tablist만** 가로 스크롤한다. 페이지 전체가 가로 스크롤되면 안 된다.
- 활성 탭은 짙은 초록 밑줄과 글자로 표시한다. 탭 높이는 44px 이상이다.
- 상단 주석:
  - `[개념]`: scoped slot, roving tabindex, 방향키 패턴
  - `[Vue 2였다면]`: `<template slot="tab" slot-scope="{ tab }">`와 Vue 2.6의 `v-slot` 문법

### 2. `src/components/base/BaseModal.vue` (PRD 5장 대상 파일)

```js
const open = defineModel('open', { type: Boolean, default: false }) // 부모는 v-model:open 사용
props: { title: String (필수), returnFocusTo: Object (HTMLElement, 선택), closeOnBackdrop: { type: Boolean, default: true } }
slots: default, footer
```

- `<Teleport to="body">` 안에서 `<Transition>`으로 배경과 대화상자를 렌더한다.
- 대화상자 요소
  - `role="dialog"`, `aria-modal="true"`
  - `aria-labelledby`에 제목 id를 넣는다. 제목 `<h2>`는 `title`을 쓰고 id는 `useId()`로 만든다.
  - `tabindex="-1"`
- 헤더에 닫기 버튼을 둔다. `aria-label="닫기"`, 인라인 SVG(`aria-hidden="true"`), 44px 이상.
- 열림/닫힘 동작 (`watch(open)`)
  - 열릴 때
    - `useFocusTrap`의 `activate()`를 호출한다.
    - `document.documentElement`의 스크롤을 잠근다.
    - `document`에 ESC `keydown` 리스너를 등록한다. ESC를 누르면 `open = false`로 바꾼다.
  - 닫힐 때
    - 리스너를 해제하고 스크롤 잠금을 푼다.
    - `deactivate({ returnFocusTo: props.returnFocusTo })`로 포커스를 복귀한다. prop이 없으면 연 버튼으로 복귀한다.
  - 언마운트될 때도 같은 정리를 한다.
- 배경 클릭: `closeOnBackdrop`이면 닫는다. 대화상자 내부 클릭은 무시한다.
- Transition
  - 모바일에서는 하단 시트, 768px 이상에서는 가운데 대화상자로 둔다. fade와 짧은 이동만 쓴다.
  - `reduced-motion` mixin으로 전환을 끈다.
- z-index는 `$z-modal`을 쓴다. 대화상자 내용이 길면 대화상자 **내부**가 스크롤된다.
- 상단 주석:
  - `[개념]`: `Teleport`, `v-model:open`(`defineModel('open')`), `Transition`, 포커스 트랩·ESC·포커스 복귀
  - `[Vue 2였다면]`: `portal-vue` 라이브러리, `:open.sync` + `$emit('update:open', false)`, `<transition>`

## Acceptance Criteria

```bash
npm run build
node scripts/verify.mjs
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`src/components/base/`)
   - ADR 기술 스택을 벗어나지 않았는가?
   - AGENTS.md CRITICAL 접근성 규칙(모달 포커스 트랩·ESC·포커스 복귀, 44px)을 지켰는가?
   - 두 파일 모두에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 7을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 BaseTabs(model/props/slot 이름과 slot props)와 BaseModal(`v-model:open`, props, slots, 포커스 복귀 규칙) 시그니처를 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 모달 배경에 `backdrop-filter: blur()`를 쓰지 마라. 이유: UI_GUIDE 안티패턴(glass morphism)이다. 반투명 단색 배경을 쓴다.
- 탭을 `<a href>`나 `<div>`로 만들지 마라. 이유: `role="tab"`은 포커스 가능한 `<button>`이 기본이다. div는 키보드 접근과 역할 표시를 따로 구현해야 한다.
- 모든 탭에 `tabindex="0"`을 주지 마라. 이유: roving tabindex에서는 Tab 한 번으로 tablist를 빠져나가야 한다(시연 시나리오 1).
- ESC와 스크롤 잠금 리스너를 닫힘·언마운트 시 해제하지 않은 채로 두지 마라. 이유: 모달을 여러 번 열면 리스너가 쌓이고, 닫힌 뒤에도 스크롤이 잠긴다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
