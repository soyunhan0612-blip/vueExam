# Step 6: base-form

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/UI_GUIDE.md` (버튼, 입력 필드, 안티패턴)
- `docs/PRD.md` (5장 `BaseButton.vue`, `BaseInput.vue`, `BaseSelect.vue` 행, 6장 퍼블리싱 요구사항)
- `docs/ADR.md` (ADR-006 네이티브 select)
- `src/styles/_tokens.scss`, `src/styles/_mixins.scss`, `src/styles/base.scss` (step 2: mixin과 CSS 변수 이름)

## 작업

세 컴포넌트를 `src/components/base/`에 만든다.
- 모두 `<script setup>` + `<style scoped lang="scss">`로 작성한다.
- 토큰과 mixin은 자동 주입되므로 import하지 않는다.
- 색과 간격은 CSS 변수로 쓴다.

### 1. `BaseButton.vue` (PRD 5장 대상 파일)

- props
  - `variant`: `'primary' | 'secondary' | 'text'`, 기본값 `primary`. `validator`로 검증한다.
  - `type`: `'button' | 'submit' | 'reset'`, 기본값 `'button'`
  - `block`: Boolean
  - `loading`: Boolean. 로딩 중에는 `disabled`와 `aria-busy="true"`를 건다.
- 기본 slot으로 라벨을 받는다.
- `:class`는 배열 + 객체 문법으로 variant와 상태를 조합한다.
- `@click` 등 리스너와 속성은 `$attrs` 폴스루로 루트 `<button>`에 붙게 둔다.
- 스타일
  - 높이 44px 이상
  - primary는 짙은 초록 배경에 흰 글자, secondary와 text는 초록 글자
  - `:focus-visible` 외곽선(`focus-ring` mixin)
  - disabled 스타일
- 상단 주석:
  - `[개념]`: props 검증, `:class` 배열·객체, `$attrs` 폴스루
  - `[Vue 2였다면]`: `@click.native`가 필요했던 이유, `$listeners`가 `$attrs`로 합쳐져 삭제됨

### 2. `BaseInput.vue` (PRD 5장 대상 파일)

- `const model = defineModel({ type: [String, Number], default: '' })`
- props
  - `label`(String, **필수**)
  - `type`(기본값 `'text'`)
  - `error`(String)
  - `hint`(String)
- `defineOptions({ inheritAttrs: false })`로 두고 `$attrs`(`inputmode`, `autocomplete`, `placeholder`, `required`, `name` 등)를 **`<input>`에** 바인딩한다.
- `useId()`로 input id, 에러 id, 힌트 id를 만든다.
  - `<label for>`로 연결한다.
  - `aria-describedby`에 힌트와 에러 id를 넣는다.
  - `error`가 있으면 `aria-invalid="true"`를 걸고 에러 문구를 표시한다.
- **한글 IME 즉시 반응**: 네이티브 `<input>`에 `v-model`을 쓰지 말고 `:value="model"` + `@input="model = $event.target.value"`로 처리한다.
- `defineExpose({ focus })`: 부모가 첫 번째 에러 필드로 포커스를 옮길 때 쓴다.
- 스타일
  - input `font-size: 16px` 이상
  - 높이 44px 이상
  - 에러 시 테두리와 문구를 `--color-error`로 표시
- 상단 주석:
  - `[개념]`: `defineModel`, IME 조합 중에는 `v-model`이 갱신을 미루는 문제와 해결법, `useId`
  - `[Vue 2였다면]`: `props: ['value']` + `$emit('input')`. `inheritAttrs: false`여도 `class`/`style`은 루트에 남던 Vue 2와의 차이. Vue 3에서는 `$attrs`에 `class`/`style`도 포함된다

### 3. `BaseSelect.vue` (PRD 5장 대상 파일)

- `const model = defineModel({ type: String, default: '' })`
- props
  - `label`(필수)
  - `options`(`Array<{ value, label }>`, 필수)
  - `placeholder`(String. 있으면 `value=""` 첫 옵션으로 렌더)
  - `error`(String)
- BaseInput과 같은 방식으로 label, 에러, `aria-*`를 연결하고 `useId`를 쓴다.
- **네이티브 `<select>`를 그대로 쓴다.**
  - `appearance: none`과 인라인 SVG 배경 화살표로 모양만 입힌다.
  - `font-size: 16px`, 높이 44px 이상으로 한다.
- 상단 주석:
  - `[개념]`: `defineModel`, 네이티브 select를 유지하는 이유(ADR-006)
  - `[Vue 2였다면]`: `value` + `$emit('change')`, `model: { prop, event }` 옵션

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
   - AGENTS.md CRITICAL 접근성 규칙(label 연결, 16px, 44px)을 지켰는가?
   - 세 파일 모두에 `[개념]` / `[Vue 2였다면]` 주석이 있는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 6을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 세 컴포넌트의 props/model/slot/expose 시그니처를 한 줄로 요약
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- BaseInput 내부 `<input>`에 `v-model`을 쓰지 마라. 이유: 한글 IME 조합이 끝날 때까지 값이 갱신되지 않아 "한글 즉시 반응" 요구사항이 깨진다.
- `placeholder`로 label을 대신하지 마라. 이유: label 연결은 AGENTS.md CRITICAL 접근성 규칙이다.
- select를 커스텀 드롭다운(div + listbox)으로 바꾸지 마라. 이유: ADR-006.
- `outline: none`만 쓰고 대체 포커스 표시를 빼지 마라. 이유: 키보드 사용자가 현재 위치를 볼 수 없다(시연 시나리오 1).
- `src/components/base/` 밖의 파일을 만들지 마라. 이유: 이 step 범위는 폼 Base 컴포넌트 세 개다.
- 테스트 코드를 작성하지 마라. 이유: PRD 비목표이며, 검증은 `npm run build`와 시연 시나리오로 한다.
