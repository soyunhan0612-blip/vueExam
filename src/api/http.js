/*
 * [개념]
 * axios 인스턴스는 API의 공통 주소, 제한 시간, 파라미터 직렬화 규칙을 한곳에서 관리한다.
 * 요청·응답 인터셉터는 모든 요청 전후에 공통 로직을 적용하고 오류 형태를 일관되게 만든다.
 *
 * [Vue 2였다면]
 * import store from '@/store'
 * const token = store.state.auth.token
 * Vuex 상태를 인터셉터에서 직접 읽을 수 있지만, store가 API 모듈을 import하면
 * HTTP 모듈과 store 사이에 순환 참조가 생길 수 있어 의존성 방향을 주의해야 한다.
 */
import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  paramsSerializer: {
    indexes: null,
  },
})

http.interceptors.request.use((config) => config)

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
