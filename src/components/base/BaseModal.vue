<!--
  [개념]
  Teleport로 모달을 body 아래에 렌더하고 defineModel('open')의 v-model:open으로 열림 상태를 동기화한다.
  Transition은 배경과 대화상자의 진입·퇴장을 처리하며, 포커스 트랩·ESC 닫기·연 요소로 포커스 복귀를 함께 관리한다.

  [Vue 2였다면]
  portal-vue 라이브러리로 body에 렌더하고 :open.sync와 $emit('update:open', false)로 상태를 동기화했다.
  진입·퇴장 효과는 <transition>으로 감쌌다.
-->
<script setup>
import { onBeforeUnmount, ref, useId, watch } from 'vue'

import { useFocusTrap } from '@/composables/useFocusTrap'

const open = defineModel('open', {
  type: Boolean,
  default: false,
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  returnFocusTo: {
    type: Object,
    default: null,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

const dialogRef = ref(null)
const titleId = `${useId()}-title`
const { activate, deactivate } = useFocusTrap(dialogRef)

let isActive = false
let previousRootOverflow = ''

function handleEscape(event) {
  if (event.key === 'Escape') open.value = false
}

function lockScroll() {
  previousRootOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
}

function unlockScroll() {
  document.documentElement.style.overflow = previousRootOverflow
}

function activateModal() {
  if (isActive) return

  isActive = true
  activate()
  lockScroll()
  document.addEventListener('keydown', handleEscape)
}

function deactivateModal() {
  if (!isActive) return

  isActive = false
  document.removeEventListener('keydown', handleEscape)
  unlockScroll()
  deactivate({ returnFocusTo: props.returnFocusTo })
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    activateModal()
  } else {
    deactivateModal()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  deactivateModal()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="base-modal">
      <div
        v-if="open"
        class="base-modal"
        @click.self="handleBackdropClick"
      >
        <section
          ref="dialogRef"
          class="base-modal__dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <header class="base-modal__header">
            <h2 :id="titleId" class="base-modal__title">
              {{ props.title }}
            </h2>
            <button
              class="base-modal__close"
              type="button"
              aria-label="닫기"
              @click="open = false"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div class="base-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.base-modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 55%);
}

.base-modal__dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100dvh - var(--space-5));
  color: var(--color-text);
  background: var(--color-bg);
  border-radius: $radius-md $radius-md 0 0;
  overflow: hidden;
}

.base-modal__header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.base-modal__title {
  font-size: 1.25rem;
  line-height: 1.4;
}

.base-modal__close {
  @include tap-target;

  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--color-text);
  background: transparent;
  border: 0;
  border-radius: $radius-sm;
  cursor: pointer;

  &:focus-visible {
    @include focus-ring;
  }
}

.base-modal__body {
  min-height: 0;
  padding: var(--space-4);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.base-modal__footer {
  flex: 0 0 auto;
  padding: var(--space-4);
  border-top: 1px solid var(--color-line);
}

.base-modal-enter-active,
.base-modal-leave-active {
  transition: opacity 160ms ease;

  .base-modal__dialog {
    transition: transform 160ms ease;
  }
}

.base-modal-enter-from,
.base-modal-leave-to {
  opacity: 0;

  .base-modal__dialog {
    transform: translateY(var(--space-4));
  }
}

@include mq {
  .base-modal {
    align-items: center;
    padding: var(--space-5);
  }

  .base-modal__dialog {
    max-width: 560px;
    max-height: calc(100dvh - (var(--space-5) * 2));
    border-radius: $radius-md;
  }

  .base-modal-enter-from .base-modal__dialog,
  .base-modal-leave-to .base-modal__dialog {
    transform: translateY(var(--space-2));
  }
}

@include reduced-motion {
  .base-modal-enter-active,
  .base-modal-leave-active,
  .base-modal-enter-active .base-modal__dialog,
  .base-modal-leave-active .base-modal__dialog {
    transition: none;
  }
}
</style>
