<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const emailInputRef = ref(null)
const passwordInputRef = ref(null)
const submitting = ref(false)
const loginError = ref('')
const form = reactive({
  email: '',
  password: '',
})
const formErrors = reactive({
  email: '',
  password: '',
})

function safeRedirect(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    ? value
    : '/jobs'
}

if (authStore.isLoggedIn) {
  router.replace(safeRedirect(route.query.redirect))
}

async function handleSubmit() {
  if (submitting.value) return

  loginError.value = ''
  formErrors.email = form.email.trim() ? '' : '이메일을 입력해 주세요.'
  formErrors.password = form.password ? '' : '비밀번호를 입력해 주세요.'

  const firstInvalidField = [
    [formErrors.email, emailInputRef],
    [formErrors.password, passwordInputRef],
  ].find(([message]) => message)

  if (firstInvalidField) {
    await nextTick()
    firstInvalidField[1].value?.focus()
    return
  }

  submitting.value = true

  try {
    await authStore.login(form.email.trim(), form.password)
    await router.replace(safeRedirect(route.query.redirect))
  } catch {
    loginError.value = '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해 주세요.'
    form.password = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="login-view">
    <h1>로그인</h1>

    <p class="login-view__guide">
      테스트 계정: test@findjob.co.kr / 1234
    </p>

    <p v-if="loginError" class="login-view__error" role="alert">
      {{ loginError }}
    </p>

    <form class="login-form" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        ref="emailInputRef"
        v-model="form.email"
        label="이메일"
        type="email"
        autocomplete="username"
        :error="formErrors.email"
      />
      <BaseInput
        ref="passwordInputRef"
        v-model="form.password"
        label="비밀번호"
        type="password"
        autocomplete="current-password"
        :error="formErrors.password"
      />
      <BaseButton type="submit" block :loading="submitting">
        로그인
      </BaseButton>
    </form>
  </section>
</template>

<style scoped lang="scss">
.login-view {
  display: grid;
  gap: var(--space-5);
  width: min(100%, 480px);
  margin: 0 auto;
}

.login-view h1 {
  font-size: 1.75rem;
  line-height: 1.4;
}

.login-view__guide {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.login-view__error {
  color: var(--color-error);
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: var(--space-5);
}
</style>
