<!--
  [개념]
  defineProps로 부모가 내려주는 공고와 스크랩 상태를 선언하고, defineEmits로
  스크랩 변경 의도만 부모에 전달해 props down / events up 흐름을 유지한다.
  scoped style은 컴파일 시 data-v 속성으로 이 컴포넌트에만 적용되며,
  부모가 내부 요소를 조정해야 할 때는 :deep()을 사용한다.

  [Vue 2였다면]
  props 옵션으로 값을 받고 this.$emit('toggle-scrap', this.job.id)로 이벤트를 보낸다.
  scoped style의 자식 컴포넌트 내부 선택에는 >>> 또는 ::v-deep을 사용했다.
-->
<script setup>
import { RouterLink } from 'vue-router'

import { formatWage } from '@/utils/format.js'
import { getCategoryLabel } from '@/utils/constants.js'

const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
  scrapped: Boolean,
})

const emit = defineEmits(['toggle-scrap'])

function toggleScrap() {
  emit('toggle-scrap', props.job.id)
}
</script>

<template>
  <article class="job-card">
    <h2 class="job-card__title">
      <RouterLink
        class="job-card__title-link"
        :to="{ name: 'job-detail', params: { id: props.job.id } }"
      >
        <span v-if="props.job.urgent" class="sr-only">급구</span>
        <mark v-if="props.job.urgent" class="job-card__highlight">
          {{ props.job.title }}
        </mark>
        <span v-else>{{ props.job.title }}</span>
      </RouterLink>
    </h2>

    <button
      class="job-card__scrap"
      :class="{ 'job-card__scrap--active': props.scrapped }"
      type="button"
      :aria-pressed="props.scrapped"
      :aria-label="`${props.job.title} 스크랩`"
      @click="toggleScrap"
    >
      <svg
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.75 4.75c0-.97.78-1.75 1.75-1.75h7c.97 0 1.75.78 1.75 1.75v15.1L12 16.35l-5.25 3.5V4.75Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="job-card__details">
      <p class="job-card__company">{{ props.job.company }}</p>
      <div class="job-card__meta">
        <span>{{ formatWage(props.job.wage) }}</span>
        <span>{{ props.job.region }}</span>
        <span>{{ props.job.workDays }} · {{ props.job.workHours }}</span>
        <span>{{ getCategoryLabel(props.job.category) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.job-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: var(--space-3);
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-line);
}

.job-card__title {
  align-self: center;
  min-width: 0;
  font-size: 1.125rem;
  line-height: 1.5;
}

.job-card__title-link {
  color: var(--color-text);
  text-decoration: none;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
  }

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  &:focus-visible {
    outline: 0;
  }

  &:focus-visible::after {
    @include focus-ring;
  }
}

.job-card__highlight {
  padding: 0 0.1em;
  color: inherit;
  background: var(--color-highlight);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.job-card__scrap {
  @include tap-target;

  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: start;
  padding: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  cursor: pointer;

  svg {
    fill: none;
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.job-card__scrap--active {
  color: var(--color-action);

  svg {
    fill: currentColor;
  }
}

.job-card__details {
  display: grid;
  grid-column: 1 / -1;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.job-card__company {
  font-weight: 600;
}

.job-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
}
</style>
