<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import JobCard from '@/components/job/JobCard.vue'
import { useJobs } from '@/composables/useJobs.js'
import { useScrapStore } from '@/stores/scrap.js'

const scrapStore = useScrapStore()
const { jobs, loading, error, load } = useJobs()

const displayedJobs = computed(() => (
  jobs.value.filter((job) => scrapStore.isScrapped(job.id))
))

function loadScrappedJobs() {
  load({ ids: scrapStore.ids })
}

onMounted(loadScrappedJobs)
</script>

<template>
  <section class="scrap-view">
    <h1>
      스크랩한 공고
      <span class="scrap-view__heading-count" aria-live="polite">
        {{ scrapStore.count }}건
      </span>
    </h1>

    <div
      class="scrap-view__results"
      :aria-busy="loading ? 'true' : undefined"
    >
      <p v-if="loading" class="scrap-view__state" role="status">
        스크랩한 공고를 불러오는 중입니다.
      </p>

      <div v-else-if="error" class="scrap-view__state">
        <p role="alert">{{ error }}</p>
        <BaseButton variant="secondary" @click="loadScrappedJobs">
          다시 시도
        </BaseButton>
      </div>

      <ul v-else-if="displayedJobs.length" class="job-list">
        <li v-for="job in displayedJobs" :key="job.id" class="job-list__item">
          <JobCard
            :job="job"
            :scrapped="scrapStore.isScrapped(job.id)"
            @toggle-scrap="scrapStore.toggle"
          />
        </li>
      </ul>

      <div v-else class="scrap-view__state">
        <p>아직 스크랩한 공고가 없습니다</p>
        <RouterLink class="scrap-view__link" :to="{ name: 'jobs' }">
          공고 보러 가기
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.scrap-view,
.scrap-view__results {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
}

.scrap-view h1 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: 1.75rem;
  line-height: 1.4;
}

.scrap-view__heading-count {
  color: var(--color-text-muted);
  font-size: 1rem;
  font-weight: 500;
}

.scrap-view__state {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
  padding: var(--space-7) 0;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.scrap-view__link {
  @include tap-target;

  display: inline-flex;
  align-items: center;
  color: var(--color-action);
  font-weight: 700;

  &:focus-visible {
    @include focus-ring;
  }
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
