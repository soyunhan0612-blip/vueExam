/*
 * [개념]
 * Pinia Setup 스토어는 reactive/ref를 state, computed를 getters, 함수를 actions처럼 반환한다.
 * Vue 3의 Proxy 반응성은 객체에 새 키를 직접 추가하거나 delete로 제거하는 변경도 추적한다.
 *
 * [Vue 2였다면]
 * Object.defineProperty는 객체를 처음 관찰할 때 존재한 키만 가로채므로 새 키 추가를 감지하지 못했다.
 * 따라서 this.$set(this.map, id, true) 또는 Vue.set과 Vue.delete를 사용해야 했다.
 */
import { computed, reactive, watch } from 'vue'
import { defineStore } from 'pinia'

import { STORAGE_KEYS } from '@/utils/constants.js'

function readStoredIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCRAPS) ?? '[]')
    if (!Array.isArray(parsed)) return []

    return parsed.map(Number).filter(Number.isFinite)
  } catch {
    return []
  }
}

export const useScrapStore = defineStore('scrap', () => {
  const map = reactive({})

  for (const id of readStoredIds()) {
    map[id] = true
  }

  const ids = computed(() => Object.keys(map).filter((id) => map[id]).map(Number))
  const count = computed(() => ids.value.length)

  function isScrapped(id) {
    return Boolean(map[id])
  }

  function toggle(id) {
    if (map[id]) {
      delete map[id]
    } else {
      map[id] = true
    }
  }

  function clear() {
    for (const id of Object.keys(map)) {
      delete map[id]
    }
  }

  watch(
    map,
    () => {
      try {
        localStorage.setItem(STORAGE_KEYS.SCRAPS, JSON.stringify(ids.value))
      } catch {
        // 저장소를 사용할 수 없어도 메모리의 스크랩 상태는 유지한다.
      }
    },
    { deep: true },
  )

  return { ids, count, isScrapped, toggle, clear }
})
