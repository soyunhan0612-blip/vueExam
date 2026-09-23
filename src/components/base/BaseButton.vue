<!--
  [개념]
  variant와 type을 validator로 검증하고, 배열과 객체를 함께 쓴 :class로 모양과 상태를 조합한다.
  단일 루트 button이므로 @click 같은 리스너와 disabled 같은 비-prop 속성은 $attrs로 자동 폴스루된다.

  [Vue 2였다면]
  컴포넌트 루트의 네이티브 이벤트를 듣기 위해 부모에서 @click.native를 쓰는 경우가 있었다.
  Vue 3에서는 이벤트 리스너가 $attrs에 합쳐졌고, Vue 2의 별도 $listeners 객체는 삭제되었다.
-->
<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  block: Boolean,
  loading: Boolean,
})
</script>

<template>
  <button
    :type="props.type"
    :class="[
      'base-button',
      `base-button--${props.variant}`,
      {
        'base-button--block': props.block,
        'is-loading': props.loading,
      },
    ]"
    :disabled="props.loading"
    :aria-busy="props.loading ? 'true' : undefined"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  @include tap-target;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: $radius-sm;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  cursor: pointer;

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.base-button--primary {
  color: var(--color-bg);
  background: var(--color-action);

  &:not(:disabled):hover {
    background: var(--color-action-hover);
  }
}

.base-button--secondary {
  color: var(--color-action);
  background: var(--color-bg);
  border-color: var(--color-action);

  &:not(:disabled):hover {
    color: var(--color-action-hover);
    border-color: var(--color-action-hover);
  }
}

.base-button--text {
  color: var(--color-action);
  background: transparent;

  &:not(:disabled):hover {
    color: var(--color-action-hover);
  }
}

.base-button--block {
  width: 100%;
}
</style>
