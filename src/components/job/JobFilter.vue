<!--
  [개념]
  defineModel('keyword')와 defineModel('region')으로 한 컴포넌트에서 여러 v-model을
  선언한다. v-show는 패널 DOM과 입력 상태를 유지한 채 display만 전환하므로,
  조건이 참일 때마다 DOM을 만들고 제거하는 v-if와 다르며 Transition과 함께 쓸 수 있다.

  [Vue 2였다면]
  부모에서 :keyword.sync / :region.sync를 사용하고 자식은
  $emit('update:keyword', value), $emit('update:region', value)를 각각 호출했다.
-->
<script setup>
import { computed, ref, useId } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import { useMediaQuery } from '@/composables/useMediaQuery.js'
import { REGIONS } from '@/utils/constants.js'

const keyword = defineModel('keyword', { type: String, default: '' })
const region = defineModel('region', { type: String, default: '' })

const expanded = ref(false)
const panelId = useId()
const isDesktop = useMediaQuery('(min-width: 768px)')

const appliedCount = computed(
  () => Number(Boolean(keyword.value.trim())) + Number(Boolean(region.value)),
)

function toggleExpanded() {
  expanded.value = !expanded.value
}
</script>

<template>
  <form class="job-filter" role="search" @submit.prevent>
    <BaseButton
      class="job-filter__toggle"
      variant="secondary"
      block
      :aria-expanded="isDesktop || expanded"
      :aria-controls="panelId"
      @click="toggleExpanded"
    >
      검색 조건<span v-if="appliedCount"> ({{ appliedCount }})</span>
    </BaseButton>

    <Transition name="filter-panel">
      <div
        v-show="isDesktop || expanded"
        :id="panelId"
        class="job-filter__panel"
      >
        <BaseInput
          v-model="keyword"
          type="search"
          label="키워드"
          autocomplete="off"
          enterkeyhint="search"
        />
        <BaseSelect
          v-model="region"
          label="지역"
          placeholder="전체 지역"
          :options="REGIONS"
        />
      </div>
    </Transition>
  </form>
</template>

<style scoped lang="scss">
.job-filter {
  display: grid;
  gap: var(--space-3);
}

.job-filter__toggle {
  @include mq {
    display: none;
  }
}

.job-filter__panel {
  display: grid;
  gap: var(--space-4);

  @include mq {
    grid-template-columns: minmax(0, 2fr) minmax(200px, 1fr);
    align-items: end;
  }
}

.filter-panel-enter-active,
.filter-panel-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@include reduced-motion {
  .filter-panel-enter-active,
  .filter-panel-leave-active {
    transition: none;
  }
}
</style>
