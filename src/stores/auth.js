/*
 * [개념]
 * Pinia Options 스토어는 state, getters, actions로 상태와 파생 값, 비동기 동작을 한곳에 모은다.
 * actions 안에서는 this로 state와 다른 action에 접근하며, mutations 없이 상태를 직접 변경할 수 있다.
 *
 * [Vue 2였다면]
 * Vuex 모듈의 state/getters/mutations/actions를 만들고 action에서 commit, 컴포넌트에서 dispatch를 호출한다.
 * getter는 ...mapGetters(['isLoggedIn'])로 연결한다. Pinia는 action의 직접 상태 변경도 추적하므로
 * 동기 변경만 담당하던 mutations 계층을 없애고 commit 없이 간결하게 상태를 갱신한다.
 */
import { defineStore } from 'pinia'

import { login as requestLogin } from '@/api/auth.js'
import { STORAGE_KEYS } from '@/utils/constants.js'

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH)
    if (!stored) return { user: null, token: null }

    const parsed = JSON.parse(stored)
    return {
      user: parsed?.user ?? null,
      token: parsed?.token ?? null,
    }
  } catch {
    return { user: null, token: null }
  }
}

function writeStoredAuth(auth) {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth))
  } catch {
    // 저장소를 사용할 수 없어도 현재 세션의 로그인 상태는 유지한다.
  }
}

function removeStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH)
  } catch {
    // 저장소 접근 실패가 로그아웃을 막지 않게 한다.
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => readStoredAuth(),

  getters: {
    isLoggedIn: (state) => Boolean(state.user && state.token),
    userName: (state) => state.user?.name ?? '',
  },

  actions: {
    async login(email, password) {
      const auth = await requestLogin(email, password)

      this.user = auth.user
      this.token = auth.token
      writeStoredAuth({ user: this.user, token: this.token })

      return auth
    },

    logout() {
      this.user = null
      this.token = null
      removeStoredAuth()
    },
  },
})
