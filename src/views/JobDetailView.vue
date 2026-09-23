<!--
  [개념]
  라우터의 route props가 경로 파라미터 id를 Number로 변환해 전달하므로 화면은 라우터 객체 대신 명시적인 prop을 감시한다.
  지원 모달은 v-model:open으로 조건부 렌더링하고, 비로그인 사용자는 redirect와 apply 쿼리로 로그인 뒤 원래 공고에
  돌아와 모달을 이어서 열 수 있다.

  [Vue 2였다면]
  this.$route.params.id를 Number()로 변환하고 watch: { '$route.params.id': ... }로 변경을 감시했다.
  모달 열림 상태는 :open.sync와 $emit('update:open', false)로 동기화했다.
-->
<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { useApply, useJob } from '@/composables/useJobs.js'
import { useAuthStore } from '@/stores/auth.js'
import { getCategoryLabel } from '@/utils/constants.js'
import { formatDate, formatWage } from '@/utils/format.js'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { job, loading, error, load } = useJob()
const {
  submitting,
  error: applyError,
  done,
  submit,
  reset,
} = useApply()

const applyOpen = ref(false)
const applyButtonRef = ref(null)
const nameInputRef = ref(null)
const phoneInputRef = ref(null)
const startDateInputRef = ref(null)
const successMessageRef = ref(null)

const applyButtonElement = computed(() => applyButtonRef.value?.$el ?? null)

function getToday() {
  const now = new Date()
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localNow.toISOString().slice(0, 10)
}

const today = getToday()
const form = reactive({
  name: auth.user?.name ?? '',
  phone: '',
  startDate: '',
})
const formErrors = reactive({
  name: '',
  phone: '',
  startDate: '',
})

function clearFormErrors() {
  formErrors.name = ''
  formErrors.phone = ''
  formErrors.startDate = ''
}

watch(
  () => props.id,
  (id) => load(id),
  { immediate: true },
)

watch(
  [
    () => route.query.apply,
    () => auth.isLoggedIn,
    () => job.value?.id,
    loading,
  ],
  async ([apply, isLoggedIn, loadedJobId, isLoading]) => {
    if (
      apply !== '1'
      || !isLoggedIn
      || isLoading
      || loadedJobId !== props.id
    ) return

    applyOpen.value = true

    const query = { ...route.query }
    delete query.apply
    await router.replace({ query })
  },
)

watch(applyOpen, (isOpen) => {
  if (isOpen) {
    if (!form.name) form.name = auth.user?.name ?? ''
    return
  }

  form.phone = ''
  form.startDate = ''
  clearFormErrors()
  reset()
})

function goBackToList() {
  if (window.history.state?.back) {
    router.back()
    return
  }

  router.push({ name: 'jobs' })
}

function openApply() {
  if (!auth.isLoggedIn) {
    router.push({
      name: 'login',
      query: { redirect: `/jobs/${props.id}?apply=1` },
    })
    return
  }

  applyOpen.value = true
}

function retryLoad() {
  load(props.id)
}

async function handleSubmit() {
  // 제출 버튼이 disabled가 아니므로 입력란 Enter로 인한 중복 제출을 여기서 막는다
  if (submitting.value) return

  clearFormErrors()
  reset()

  const name = form.name.trim()
  const phone = form.phone.replace(/\D/g, '')

  if (!name) formErrors.name = '이름을 입력해 주세요.'
  if (!/^01\d{8,9}$/.test(phone)) {
    formErrors.phone = '01로 시작하는 휴대전화 번호 10~11자리를 입력해 주세요.'
  }
  if (!form.startDate) {
    formErrors.startDate = '근무 시작일을 선택해 주세요.'
  } else if (form.startDate < today) {
    formErrors.startDate = '오늘 이후 날짜를 선택해 주세요.'
  }

  const firstInvalidField = [
    [formErrors.name, nameInputRef],
    [formErrors.phone, phoneInputRef],
    [formErrors.startDate, startDateInputRef],
  ].find(([message]) => message)

  if (firstInvalidField) {
    await nextTick()
    firstInvalidField[1].value?.focus()
    return
  }

  await submit({
    jobId: props.id,
    name,
    phone,
    startDate: form.startDate,
  })

  if (done.value) {
    await nextTick()
    successMessageRef.value?.focus()
  }
}
</script>

<template>
  <section
    class="job-detail-view"
    :aria-busy="loading ? 'true' : undefined"
  >
    <p v-if="loading" class="job-detail-view__state" role="status">
      공고를 불러오는 중입니다.
    </p>

    <div v-else-if="error" class="job-detail-view__state" role="alert">
      <template v-if="error.status === 404">
        <h1>공고를 찾을 수 없습니다</h1>
        <RouterLink class="job-detail-view__link" :to="{ name: 'jobs' }">
          공고 목록으로
        </RouterLink>
      </template>
      <template v-else>
        <p>{{ error.message }}</p>
        <BaseButton variant="secondary" @click="retryLoad">다시 시도</BaseButton>
      </template>
    </div>

    <template v-else-if="job">
      <BaseButton class="job-detail-view__back" variant="text" @click="goBackToList">
        목록으로
      </BaseButton>

      <article class="job-detail">
        <header class="job-detail__header">
          <h1 class="job-detail__title">
            <mark v-if="job.urgent">
              <span class="sr-only">급구 </span>{{ job.title }}
            </mark>
            <template v-else>{{ job.title }}</template>
          </h1>
          <p class="job-detail__company">{{ job.company }}</p>
        </header>

        <dl class="job-detail__facts">
          <div class="job-detail__fact">
            <dt>급여</dt>
            <dd>{{ formatWage(job.wage) }}</dd>
          </div>
          <div class="job-detail__fact">
            <dt>지역</dt>
            <dd>{{ job.region }}</dd>
          </div>
          <div class="job-detail__fact">
            <dt>근무요일·시간</dt>
            <dd>{{ job.workDays }} · {{ job.workHours }}</dd>
          </div>
          <div class="job-detail__fact">
            <dt>고용형태</dt>
            <dd>{{ job.employmentType }}</dd>
          </div>
          <div class="job-detail__fact">
            <dt>업직종</dt>
            <dd>{{ getCategoryLabel(job.category) }}</dd>
          </div>
          <div class="job-detail__fact">
            <dt>등록일</dt>
            <dd>{{ formatDate(job.postedAt) }}</dd>
          </div>
        </dl>

        <section class="job-detail__description" aria-labelledby="description-title">
          <h2 id="description-title">상세 설명</h2>
          <p>{{ job.description }}</p>
        </section>
      </article>

      <div class="job-detail-view__apply-bar">
        <BaseButton
          ref="applyButtonRef"
          variant="primary"
          block
          @click="openApply"
        >
          지원하기
        </BaseButton>
      </div>
    </template>
  </section>

  <BaseModal
    v-model:open="applyOpen"
    title="지원하기"
    :return-focus-to="applyButtonElement"
  >
    <div v-if="done" class="apply-complete">
      <p ref="successMessageRef" class="apply-complete__message" tabindex="-1">
        지원이 완료되었습니다
      </p>
      <BaseButton block @click="applyOpen = false">닫기</BaseButton>
    </div>

    <form v-else class="apply-form" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        ref="nameInputRef"
        v-model="form.name"
        label="이름"
        autocomplete="name"
        :error="formErrors.name"
      />
      <BaseInput
        ref="phoneInputRef"
        v-model="form.phone"
        label="연락처"
        type="tel"
        inputmode="numeric"
        autocomplete="tel"
        hint="숫자만 입력"
        :error="formErrors.phone"
      />
      <BaseInput
        ref="startDateInputRef"
        v-model="form.startDate"
        label="근무 시작일"
        type="date"
        :min="today"
        :error="formErrors.startDate"
      />

      <p v-if="applyError" class="apply-form__server-error" role="alert">
        {{ applyError }}
      </p>

      <BaseButton type="submit" block :loading="submitting">
        지원서 제출
      </BaseButton>
    </form>
  </BaseModal>
</template>

<style scoped lang="scss">
.job-detail-view {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
}

.job-detail-view__state {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
  padding: var(--space-7) 0;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.job-detail-view__state h1 {
  color: var(--color-text);
  font-size: 1.5rem;
}

.job-detail-view__link {
  @include tap-target;

  display: inline-flex;
  align-items: center;
  color: var(--color-action);
  font-weight: 700;

  &:focus-visible {
    @include focus-ring;
  }
}

.job-detail-view__back {
  justify-self: start;
  margin-left: calc(var(--space-4) * -1);
}

.job-detail {
  display: grid;
  gap: var(--space-7);
}

.job-detail__header {
  display: grid;
  gap: var(--space-3);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-line);
}

.job-detail__title {
  font-size: clamp(1.5rem, 6vw, 2rem);
  line-height: 1.35;
}

.job-detail__title mark {
  padding: 0 0.1em;
  color: inherit;
  background: var(--color-highlight);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.job-detail__company {
  color: var(--color-text-muted);
  font-size: 1.0625rem;
}

.job-detail__facts {
  display: grid;
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--color-line);
}

.job-detail__fact {
  display: grid;
  grid-template-columns: minmax(88px, 30%) 1fr;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-line);
  line-height: 1.5;
}

.job-detail__fact dt {
  color: var(--color-text-muted);
  font-weight: 700;
}

.job-detail__fact dd {
  min-width: 0;
  margin: 0;
}

.job-detail__description {
  display: grid;
  gap: var(--space-4);
}

.job-detail__description h2 {
  font-size: 1.25rem;
}

.job-detail__description p {
  line-height: 1.8;
  white-space: pre-line;
}

.job-detail-view__apply-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: $z-apply-bar;
  padding: var(--space-3) var(--space-4)
    calc(var(--space-3) + env(safe-area-inset-bottom));
  background: var(--color-bg);
  border-top: 1px solid var(--color-line);
}

.apply-form,
.apply-complete {
  display: grid;
  gap: var(--space-5);
}

.apply-form__server-error {
  color: var(--color-error);
  line-height: 1.5;
}

.apply-complete__message {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5;

  &:focus-visible {
    @include focus-ring;
  }
}

@include mq {
  .job-detail-view {
    padding-bottom: 0;
  }

  .job-detail__fact {
    grid-template-columns: 160px 1fr;
  }

  .job-detail-view__apply-bar {
    position: static;
    padding: 0;
    border-top: 0;
  }
}
</style>
