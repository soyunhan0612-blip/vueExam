<!--
  [개념]
  쓰기 가능한 computed의 get/set으로 URL 쿼리를 필터의 유일한 상태로 사용하고,
  watch로 q와 region이 바뀔 때 목록을 조회한다. KeepAlive로 비활성화된 뒤에도 watch는
  살아 있으므로 현재 route가 jobs인지 확인하고, 마지막 조회 조건과 달라진 경우에만 요청한다.
  defineOptions({ name })로 지정한 이름은 KeepAlive의 include가 목록 화면을 찾는 기준이다.

  [Vue 2였다면]
  export default {
    name: 'JobListView',
    computed: {
      keyword: {
        get() { return this.$route.query.q || '' },
        set(v) { this.$router.replace({ query: { ...this.$route.query, q: v } }) },
      },
    },
    watch: { '$route.query': { handler() { this.loadJobs() }, immediate: true } },
    activated() { this.loadJobsIfNeeded() },
    deactivated() { this.debouncedLoad.cancel() },
  }
-->
<script setup>
import { computed, onDeactivated, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import JobCard from '@/components/job/JobCard.vue'
import JobFilter from '@/components/job/JobFilter.vue'
import { useJobs } from '@/composables/useJobs.js'
import { useScrapStore } from '@/stores/scrap.js'
import { CATEGORIES, REGIONS } from '@/utils/constants.js'
import { debounce } from '@/utils/debounce.js'

defineOptions({ name: 'JobListView' })

const route = useRoute()
const router = useRouter()
const scrapStore = useScrapStore()
const { jobs, loading, error, load } = useJobs()

function updateQuery(patch) {
  const query = { ...route.query, ...patch }

  for (const [key, value] of Object.entries(query)) {
    if (value === '') delete query[key]
  }

  router.replace({ query })
}

const keyword = computed({
  get: () => route.query.q ?? '',
  set: (value) => updateQuery({ q: value }),
})

const region = computed({
  get() {
    const value = route.query.region ?? ''
    return REGIONS.some((option) => option.value === value) ? value : ''
  },
  set: (value) => updateQuery({ region: value }),
})

const category = computed({
  get() {
    const value = route.query.category ?? ''
    return CATEGORIES.some((option) => option.value === value) ? value : ''
  },
  set: (value) => updateQuery({ category: value }),
})

const filteredJobs = computed(() => {
  if (!category.value) return jobs.value
  return jobs.value.filter((job) => job.category === category.value)
})

const tabs = computed(() => [
  { key: '', label: '전체', count: jobs.value.length },
  ...CATEGORIES.map((item) => ({
    key: item.value,
    label: item.label,
    count: jobs.value.filter((job) => job.category === item.value).length,
  })),
])

const announcedCount = ref(null)
let lastLoadedParams = null

function hasSameParams(params) {
  return lastLoadedParams?.q === params.q && lastLoadedParams?.region === params.region
}

function loadIfNeeded(params) {
  if (route.name !== 'jobs' || hasSameParams(params)) return

  lastLoadedParams = { ...params }
  load(params)
}

const debouncedLoad = debounce(loadIfNeeded, 300)

watch(
  keyword,
  (q) => {
    if (route.name !== 'jobs') return
    debouncedLoad({ q, region: region.value })
  },
  { immediate: true },
)

watch(
  region,
  (nextRegion) => {
    debouncedLoad.cancel()
    loadIfNeeded({ q: keyword.value, region: nextRegion })
  },
  { immediate: true },
)

watch([loading, () => filteredJobs.value.length], ([isLoading, count]) => {
  if (!isLoading) announcedCount.value = count
})

onDeactivated(() => {
  debouncedLoad.cancel()
})

function retry() {
  lastLoadedParams = null
  loadIfNeeded({ q: keyword.value, region: region.value })
}

function resetFilters() {
  updateQuery({ q: '', region: '', category: '' })
}
</script>

<template>
  <section class="job-list-view">
    <h1 class="sr-only">공고 목록</h1>

    <JobFilter v-model:keyword="keyword" v-model:region="region" />

    <div
      class="job-list-view__results"
      :aria-busy="loading ? 'true' : undefined"
    >
      <p class="job-list-view__count" aria-live="polite">
        <template v-if="announcedCount !== null">검색 결과 {{ announcedCount }}건</template>
      </p>

      <p v-if="loading" class="job-list-view__state" role="status">
        공고를 불러오는 중입니다.
      </p>

      <div v-else-if="error" class="job-list-view__state">
        <p role="alert">{{ error }}</p>
        <BaseButton variant="secondary" @click="retry">다시 시도</BaseButton>
      </div>

      <BaseTabs v-else v-model="category" :tabs="tabs" label="업직종">
        <ul v-if="filteredJobs.length" class="job-list">
          <li v-for="job in filteredJobs" :key="job.id" class="job-list__item">
            <JobCard
              :job="job"
              :scrapped="scrapStore.isScrapped(job.id)"
              @toggle-scrap="scrapStore.toggle"
            />
          </li>
        </ul>

        <div v-else class="job-list-view__state">
          <p>조건에 맞는 공고가 없습니다</p>
          <BaseButton variant="secondary" @click="resetFilters">조건 초기화</BaseButton>
        </div>
      </BaseTabs>
    </div>
  </section>
</template>

<style scoped lang="scss">
.job-list-view {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

.job-list-view__results {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.job-list-view__count {
  min-height: 1.5em;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.job-list-view__state {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
  padding: var(--space-7) 0;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.job-list {
  padding: 0;
  border-top: 1px solid var(--color-line);
  list-style: none;
}

.job-list__item:last-child :deep(.job-card) {
  border-bottom: 0;
}
</style>
