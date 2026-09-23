/**
 * [개념]
 * composable은 상태와 비동기 로직을 함수로 묶어 여러 컴포넌트에서 재사용한다.
 * 검색 요청이 겹치면 이전 요청을 AbortController로 취소하고 요청 순번을 비교해 마지막 응답만 반영한다.
 * 취소가 늦게 전달되거나 응답 순서가 바뀌어도 오래된 결과가 최신 화면을 덮어쓰지 않는다.
 *
 * [Vue 2였다면]
 * const jobsMixin = {
 *   data: () => ({ jobs: [], loading: false, error: null }),
 *   methods: { async loadJobs(params) { /* API 호출과 상태 변경 *\/ } },
 *   beforeDestroy() { this.controller?.abort() },
 * }
 * 같은 로직을 mixin으로 공유했다. 하지만 컴포넌트에서 데이터 출처가 불명확하고, 같은 이름의 data/method가
 * 충돌하며, 호출 인자로 재사용 설정을 넘길 수 없다는 문제가 있다.
 */
import { onScopeDispose, ref } from 'vue'

import {
  createApplication,
  fetchJob,
  fetchJobs,
  fetchJobsByIds,
} from '@/api/jobs.js'
import { useAuthStore } from '@/stores/auth.js'

function isCanceledRequest(err) {
  return err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'
}

function getErrorMessage(err) {
  return err instanceof Error
    ? err.message
    : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export function useJobs() {
  const jobs = ref([])
  const loading = ref(false)
  const error = ref(null)

  let controller = null
  let requestCount = 0

  async function load(params = {}) {
    controller?.abort()

    const currentRequest = ++requestCount
    const currentController = new AbortController()
    controller = currentController
    loading.value = true
    error.value = null

    try {
      const result = Array.isArray(params.ids)
        ? await fetchJobsByIds(params.ids, { signal: currentController.signal })
        : await fetchJobs(params, { signal: currentController.signal })

      if (currentRequest === requestCount) {
        jobs.value = result
      }
    } catch (err) {
      if (isCanceledRequest(err)) return

      if (currentRequest === requestCount) {
        error.value = getErrorMessage(err)
      }
    } finally {
      if (currentRequest === requestCount && !currentController.signal.aborted) {
        loading.value = false
        controller = null
      }
    }
  }

  onScopeDispose(() => {
    requestCount += 1
    controller?.abort()
    controller = null
  })

  return { jobs, loading, error, load }
}

export function useJob() {
  const job = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let controller = null
  let requestCount = 0

  async function load(id) {
    controller?.abort()

    const currentRequest = ++requestCount
    const currentController = new AbortController()
    controller = currentController
    loading.value = true
    error.value = null

    try {
      const result = await fetchJob(id, { signal: currentController.signal })

      if (currentRequest === requestCount) {
        job.value = result
      }
    } catch (err) {
      if (isCanceledRequest(err)) return

      if (currentRequest === requestCount) {
        error.value = err instanceof Error
          ? err
          : new Error(getErrorMessage(err))
      }
    } finally {
      if (currentRequest === requestCount && !currentController.signal.aborted) {
        loading.value = false
        controller = null
      }
    }
  }

  onScopeDispose(() => {
    requestCount += 1
    controller?.abort()
    controller = null
  })

  return { job, loading, error, load }
}

export function useApply() {
  const authStore = useAuthStore()
  const submitting = ref(false)
  const error = ref(null)
  const done = ref(false)

  async function submit(payload) {
    submitting.value = true
    error.value = null
    done.value = false

    try {
      await createApplication({
        ...payload,
        userId: authStore.user?.id,
      })
      done.value = true
    } catch (err) {
      error.value = getErrorMessage(err)
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    submitting.value = false
    error.value = null
    done.value = false
  }

  return { submitting, error, done, submit, reset }
}
