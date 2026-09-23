<!--
  [개념]
  defineModel로 선택값을 양방향 연결하고 useId로 label과 오류 메시지의 접근성 관계를 만든다.
  ADR-006에 따라 모바일 OS 선택 UI와 스크린리더 접근성을 보존하는 네이티브 select를 유지한다.

  [Vue 2였다면]
  value prop과 $emit('change', event.target.value)를 사용하고,
  필요하면 model: { prop: 'value', event: 'change' } 옵션으로 v-model의 prop과 이벤트를 지정했다.
-->
<script setup>
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
})

const selectId = useId()
const errorId = `${selectId}-error`
</script>

<template>
  <div class="base-select">
    <label class="base-select__label" :for="selectId">{{ props.label }}</label>
    <select
      v-bind="$attrs"
      :id="selectId"
      v-model="model"
      class="base-select__control"
      :class="{ 'base-select__control--error': props.error }"
      :aria-invalid="props.error ? 'true' : undefined"
      :aria-describedby="props.error ? errorId : undefined"
    >
      <option v-if="props.placeholder" value="">
        {{ props.placeholder }}
      </option>
      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="props.error" :id="errorId" class="base-select__error">
      {{ props.error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-select {
  display: grid;
  gap: var(--space-2);
  width: 100%;
}

.base-select__label {
  font-weight: 700;
  line-height: 1.4;
}

.base-select__control {
  min-height: 44px;
  width: 100%;
  padding: var(--space-2) var(--space-7) var(--space-2) var(--space-3);
  color: var(--color-text);
  background-color: var(--color-bg);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='m4 6 4 4 4-4' stroke='%235f6862' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  border: 1px solid var(--color-line);
  border-radius: $radius-sm;
  appearance: none;
  font-size: 16px;
  line-height: 1.4;

  &:focus-visible {
    @include focus-ring;
  }
}

.base-select__control--error {
  border-color: var(--color-error);
}

.base-select__error {
  color: var(--color-error);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
