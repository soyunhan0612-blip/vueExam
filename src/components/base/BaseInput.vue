<!--
  [개념]
  defineModel로 양방향 값을 선언하고 useId로 label, 도움말, 오류 메시지의 접근성 연결을 만든다.
  네이티브 input의 v-model은 IME 조합 중 갱신을 미루므로 :value와 @input을 직접 연결해 한글 입력에 즉시 반응한다.

  [Vue 2였다면]
  value prop을 받고 $emit('input', event.target.value)로 갱신했다.
  Vue 2에서는 inheritAttrs: false여도 class와 style이 컴포넌트 루트에 남았지만,
  Vue 3에서는 class와 style도 $attrs에 포함되므로 v-bind="$attrs"로 input에 전달할 수 있다.
-->
<script setup>
import { computed, ref, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: [String, Number], default: '' })

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})

const inputRef = ref(null)
const inputId = useId()
const hintId = `${inputId}-hint`
const errorId = `${inputId}-error`

const describedBy = computed(() => {
  const ids = []

  if (props.hint) ids.push(hintId)
  if (props.error) ids.push(errorId)

  return ids.length > 0 ? ids.join(' ') : undefined
})

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="base-field">
    <label class="base-field__label" :for="inputId">{{ props.label }}</label>
    <input
      v-bind="$attrs"
      :id="inputId"
      ref="inputRef"
      class="base-field__control"
      :class="{ 'base-field__control--error': props.error }"
      :type="props.type"
      :value="model"
      :aria-invalid="props.error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="model = $event.target.value"
    />
    <p v-if="props.hint" :id="hintId" class="base-field__hint">
      {{ props.hint }}
    </p>
    <p v-if="props.error" :id="errorId" class="base-field__error">
      {{ props.error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-field {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.base-field__label {
  font-weight: 700;
  line-height: 1.4;
}

.base-field__control {
  min-height: 44px;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: $radius-sm;
  font-size: 16px;
  line-height: 1.4;

  &:focus-visible {
    @include focus-ring;
  }
}

.base-field__control--error {
  border-color: var(--color-error);
}

.base-field__hint,
.base-field__error {
  font-size: 0.875rem;
  line-height: 1.5;
}

.base-field__hint {
  color: var(--color-text-muted);
}

.base-field__error {
  color: var(--color-error);
}
</style>
