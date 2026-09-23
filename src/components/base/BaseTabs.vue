<!--
  [개념]
  scoped slot으로 탭 라벨과 패널 내용을 부모가 꾸밀 수 있게 하고, 선택된 탭만 Tab 키로 진입 가능한
  roving tabindex를 적용한다. 방향키와 Home/End는 탭을 순환하며 이동과 동시에 선택하고 포커스한다.

  [Vue 2였다면]
  <template slot="tab" slot-scope="{ tab }">처럼 scoped slot을 작성했다.
  Vue 2.6부터는 <template v-slot:tab="{ tab }"> 문법도 사용할 수 있었다.
-->
<script setup>
import { nextTick, ref, useId } from 'vue'

const selected = defineModel({
  type: String,
  required: true,
})

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
})

const idPrefix = useId()
const panelId = `${idPrefix}-panel`
const tabRefs = ref([])

function getTabId(index) {
  return `${idPrefix}-tab-${index}`
}

function setTabRef(element, index) {
  tabRefs.value[index] = element
}

function selectTab(index) {
  const tab = props.tabs[index]
  if (!tab) return

  selected.value = tab.key
}

function selectAndFocus(index) {
  selectTab(index)
  nextTick(() => tabRefs.value[index]?.focus())
}

function handleKeydown(event, currentIndex) {
  if (props.tabs.length === 0) return

  let nextIndex

  switch (event.key) {
    case 'ArrowLeft':
      nextIndex = (currentIndex - 1 + props.tabs.length) % props.tabs.length
      break
    case 'ArrowRight':
      nextIndex = (currentIndex + 1) % props.tabs.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = props.tabs.length - 1
      break
    default:
      return
  }

  event.preventDefault()
  selectAndFocus(nextIndex)
}
</script>

<template>
  <div class="base-tabs">
    <div class="base-tabs__list" role="tablist" :aria-label="props.label">
      <button
        v-for="(tab, index) in props.tabs"
        :id="getTabId(index)"
        :ref="(element) => setTabRef(element, index)"
        :key="tab.key"
        class="base-tabs__tab"
        :class="{ 'base-tabs__tab--active': selected === tab.key }"
        type="button"
        role="tab"
        :aria-selected="selected === tab.key ? 'true' : 'false'"
        :aria-controls="panelId"
        :tabindex="selected === tab.key ? 0 : -1"
        @click="selectTab(index)"
        @keydown="handleKeydown($event, index)"
      >
        <slot name="tab" :tab="tab" :selected="selected === tab.key">
          <span>{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="base-tabs__count">({{ tab.count }})</span>
        </slot>
      </button>
    </div>

    <div
      :id="panelId"
      class="base-tabs__panel"
      role="tabpanel"
      :aria-labelledby="getTabId(Math.max(0, props.tabs.findIndex((tab) => tab.key === selected)))"
      tabindex="0"
    >
      <slot :selected="selected" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-tabs {
  width: 100%;
  min-width: 0;
}

.base-tabs__list {
  display: flex;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-line);
  scrollbar-width: thin;
  overscroll-behavior-inline: contain;
}

.base-tabs__tab {
  @include tap-target;

  flex: 0 0 auto;
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    @include focus-ring;

    position: relative;
    z-index: 1;
  }
}

.base-tabs__tab--active {
  color: var(--color-action);
  border-bottom-color: var(--color-action);
}

.base-tabs__count {
  margin-left: var(--space-1);
}

.base-tabs__panel {
  min-width: 0;

  &:focus-visible {
    @include focus-ring;
  }
}
</style>
