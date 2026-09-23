/**
 * [개념]
 * composable 안에서 onMounted/onUnmounted를 호출하면 이 composable을 사용한 컴포넌트의 생명주기에
 * 리스너 등록과 해제가 연결된다. 초기 matches 값은 즉시 계산해 첫 렌더의 반응형 UI 깜박임을 막는다.
 *
 * [Vue 2였다면]
 * mounted()에서 window.matchMedia(query).addEventListener('change', handler)를 호출하고,
 * beforeDestroy()에서 리스너를 해제하는 코드를 mixin으로 공유했다.
 */
import { onMounted, onUnmounted, ref } from 'vue'

export function useMediaQuery(query) {
  const mediaQuery = window.matchMedia(query)
  const matches = ref(mediaQuery.matches)

  function updateMatches(event) {
    matches.value = event.matches
  }

  onMounted(() => {
    mediaQuery.addEventListener('change', updateMatches)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateMatches)
  })

  return matches
}
