<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useScrapStore } from '@/stores/scrap.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const scrapStore = useScrapStore()

async function logout() {
  authStore.logout()

  if (route.meta.requiresAuth) {
    await router.push({ name: 'jobs' })
  }
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink class="app-header__logo" :to="{ name: 'jobs' }">
        생활일자리
      </RouterLink>

      <nav class="app-header__nav" aria-label="주 메뉴">
        <RouterLink class="app-header__link" :to="{ name: 'jobs' }">
          공고
        </RouterLink>
        <RouterLink class="app-header__link" :to="{ name: 'scraps' }">
          스크랩 ({{ scrapStore.count }})
        </RouterLink>
      </nav>

      <div class="app-header__account">
        <template v-if="authStore.isLoggedIn">
          <span class="app-header__user">{{ authStore.userName }}님</span>
          <BaseButton variant="text" @click="logout">로그아웃</BaseButton>
        </template>
        <RouterLink
          v-else
          class="app-header__link"
          :to="{ name: 'login', query: { redirect: route.fullPath } }"
        >
          로그인
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  border-bottom: 1px solid var(--color-line);
  background: var(--color-bg);
}

.app-header__inner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 var(--space-2);
  width: min(100%, $content-max-width);
  min-height: 64px;
  padding: 0 var(--space-4);
  margin: 0 auto;
}

.app-header__logo,
.app-header__link {
  @include tap-target;

  display: inline-flex;
  align-items: center;
  color: var(--color-text);
  text-decoration: none;

  &:focus-visible {
    @include focus-ring;
  }
}

.app-header__logo {
  color: var(--color-action);
  font-weight: 800;
}

.app-header__nav,
.app-header__account {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.app-header__account {
  margin-left: auto;
}

.app-header__link[aria-current='page'] {
  color: var(--color-action);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

.app-header__user {
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
