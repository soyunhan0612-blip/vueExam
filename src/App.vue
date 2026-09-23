<!--
  [개념]
  RouterView 슬롯으로 현재 화면 컴포넌트를 받아 KeepAlive로 감싼다. include는
  컴포넌트 name으로 매칭되므로 JobListView만 캐시해 필터와 화면 상태를 유지한다.

  [Vue 2였다면]
  <keep-alive include="JobListView"><router-view /></keep-alive>
-->
<script setup>
import { RouterView } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main">본문 바로가기</a>
  <AppHeader />
  <main id="main" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <KeepAlive include="JobListView">
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </main>
</template>

<style scoped lang="scss">
.skip-link {
  position: fixed;
  top: 0;
  left: var(--space-4);
  z-index: $z-header;
  padding: var(--space-3) var(--space-4);
  color: var(--color-bg);
  background: var(--color-action);
  text-decoration: none;
  transform: translateY(-100%);

  &:focus {
    transform: translateY(0);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

main {
  width: min(100%, $content-max-width);
  padding: var(--space-6) var(--space-4);
  margin: 0 auto;
}
</style>
