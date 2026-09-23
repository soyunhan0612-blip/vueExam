/**
 * [개념]
 * axios 인스턴스는 API의 공통 주소, 제한 시간, 파라미터 직렬화 규칙을 한곳에서 관리한다.
 * 요청·응답 인터셉터는 모든 요청 전후에 공통 로직을 적용하고 오류 형태를 일관되게 만든다.
 *
 * [Vue 2였다면]
 * import store from '@/store'
 * const token = store.state.auth.token
 * Vuex는 보통 단일 store 인스턴스의 state를 직접 읽는다. Pinia는 useAuthStore()로 현재 앱에
 * 설치된 Pinia의 스토어를 얻으며, 순환 import 초기화 문제를 피하려고 요청 함수 안에서 호출한다.
 */
import axios from 'axios'

import { useAuthStore } from '@/stores/auth.js'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  paramsSerializer: {
    indexes: null,
  },
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err)

    const status = err.response?.status
    let message = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'

    if (!err.response) {
      message = '네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.'
    } else if (status === 404) {
      message = '요청한 정보를 찾을 수 없습니다.'
    } else if (status >= 500) {
      message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    }

    const error = new Error(message)
    error.status = status

    return Promise.reject(error)
  },
)

export default http
