/**
 * [개념]
 * containerRef는 컴포넌트 템플릿의 실제 DOM 요소를 가리키는 template ref다. 조건부 DOM이 화면에
 * 반영된 뒤에만 요소를 찾을 수 있으므로 nextTick 이후 첫 포커스 가능 요소로 포커스를 옮긴다.
 *
 * [Vue 2였다면]
 * const dialog = this.$refs.dialog로 요소를 얻고,
 * this.$nextTick(() => dialog.querySelector('button')?.focus())처럼 DOM 갱신을 기다렸다.
 */
import { nextTick, onBeforeUnmount } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',')

function isVisible(element) {
  const style = window.getComputedStyle(element)
  return !element.hidden
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && element.getClientRects().length > 0
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => (
    !element.hasAttribute('disabled')
    && element.getAttribute('tabindex') !== '-1'
    && isVisible(element)
  ))
}

export function useFocusTrap(containerRef) {
  let active = false
  let activationCount = 0
  let previouslyFocused = null

  function handleKeydown(event) {
    if (event.key !== 'Tab') return

    const container = containerRef.value
    if (!container) return

    const focusableElements = getFocusableElements(container)
    if (focusableElements.length === 0) {
      event.preventDefault()
      container.focus()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)
    const focusedElement = document.activeElement
    const focusIsOutside = !container.contains(focusedElement)

    if (event.shiftKey && (focusedElement === firstElement || focusIsOutside)) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && (focusedElement === lastElement || focusIsOutside)) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function activate() {
    activationCount += 1
    const currentActivation = activationCount

    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    active = true
    document.addEventListener('keydown', handleKeydown)

    nextTick(() => {
      if (!active || currentActivation !== activationCount) return

      const container = containerRef.value
      if (!container) return

      const [firstElement] = getFocusableElements(container)
      ;(firstElement ?? container).focus()
    })
  }

  function deactivate({ returnFocusTo } = {}) {
    activationCount += 1
    active = false
    document.removeEventListener('keydown', handleKeydown)

    const focusTarget = returnFocusTo instanceof HTMLElement
      ? returnFocusTo
      : previouslyFocused
    previouslyFocused = null
    focusTarget?.focus()
  }

  onBeforeUnmount(() => {
    if (active) deactivate()
  })

  return { activate, deactivate }
}
