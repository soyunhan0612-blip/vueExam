# Vue 2 ↔ Vue 3 개념 비교

이 문서는 생활일자리 MVP의 실제 코드를 기준으로 Vue 3 구현과 Vue 2 대응 방식을 개념별로 비교한다. 코드 조각은 핵심 문법만 남겨 축약했다.

## 앱 생성과 플러그인

Vue 3:

```js
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
```

Vue 2:

```js
Vue.use(VueRouter)
Vue.use(Vuex)
new Vue({ router, store, render: (h) => h(App) }).$mount('#app')
```

Vue 3의 플러그인과 설정은 `createApp()`이 만든 앱 인스턴스에 귀속된다. Vue 2는 전역 `Vue` 생성자에 `Vue.use()`를 적용했다.

프로젝트 위치: `src/main.js`

## 반응성: Proxy와 `Vue.set`

Vue 3:

```js
const map = reactive({})
map[id] = true
delete map[id]
```

Vue 2:

```js
this.$set(this.map, id, true)
this.$delete(this.map, id)
// 또는 Vue.set(this.map, id, true)
```

Vue 3의 Proxy 반응성은 객체 키 추가와 삭제를 감지한다. Vue 2의 `Object.defineProperty` 방식은 처음 관찰할 때 없던 키를 감지하지 못해 `Vue.set`과 `Vue.delete`가 필요했다.

프로젝트 위치: `src/stores/scrap.js`

## props와 emit

Vue 3:

```js
const props = defineProps({ job: { type: Object, required: true } })
const emit = defineEmits(['toggle-scrap'])
emit('toggle-scrap', props.job.id)
```

Vue 2:

```js
export default {
  props: { job: { type: Object, required: true } },
  methods: {
    toggleScrap() { this.$emit('toggle-scrap', this.job.id) },
  },
}
```

데이터는 prop으로 내려가고 변경 의도는 이벤트로 올라가는 흐름은 같다. Vue 3의 `<script setup>`에서는 컴파일 매크로로 계약을 선언하며 `this`를 사용하지 않는다.

프로젝트 위치: `src/components/job/JobCard.vue`

## v-model, `.sync`, `model` 옵션

Vue 3:

```js
const model = defineModel({ type: String, default: '' })
const keyword = defineModel('keyword')
const region = defineModel('region')
const open = defineModel('open', { type: Boolean })
```

```vue
<JobFilter v-model:keyword="keyword" v-model:region="region" />
<BaseModal v-model:open="applyOpen" />
```

Vue 2:

```js
export default {
  model: { prop: 'value', event: 'change' },
  props: ['value', 'keyword', 'region', 'open'],
  methods: {
    select(value) { this.$emit('change', value) },
    close() { this.$emit('update:open', false) },
  },
}
```

```vue
<JobFilter :keyword.sync="keyword" :region.sync="region" />
<BaseModal :open.sync="applyOpen" />
```

Vue 3은 인자 있는 `v-model`을 여러 개 선언할 수 있고 `defineModel()`이 prop과 `update:*` 이벤트를 함께 만든다. Vue 2의 기본 모델은 `value`/`input`이며, 다른 조합에는 `model` 옵션이나 `.sync`를 사용했다.

프로젝트 위치: `src/components/base/BaseInput.vue`, `src/components/base/BaseSelect.vue`, `src/components/job/JobFilter.vue`, `src/components/base/BaseModal.vue`

## scoped slot

Vue 3:

```vue
<slot name="tab" :tab="tab" :selected="selected === tab.key" />

<BaseTabs>
  <template #tab="{ tab, selected }">...</template>
</BaseTabs>
```

Vue 2:

```vue
<slot name="tab" :tab="tab" />

<BaseTabs>
  <template slot="tab" slot-scope="{ tab }">...</template>
</BaseTabs>
```

자식이 slot prop을 제공하고 부모가 표현을 결정하는 원리는 같다. Vue 3은 일반 slot과 scoped slot 문법을 `v-slot`/`#`로 통합했다.

프로젝트 위치: `src/components/base/BaseTabs.vue`

## `$attrs`, `$listeners`, `.native`

Vue 3:

```vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<input v-bind="$attrs" />
```

Vue 2:

```vue
<input v-bind="$attrs" v-on="$listeners" />
<BaseButton @click.native="handleClick" />
```

Vue 3에서는 이벤트 리스너가 `$attrs`에 합쳐졌고 `$listeners`와 `.native`가 삭제됐다. `class`와 `style`도 `$attrs`에 포함되므로 속성을 어느 DOM에 전달할지 명시적으로 설계한다.

프로젝트 위치: `src/components/base/BaseButton.vue`, `src/components/base/BaseInput.vue`

## 라이프사이클과 composable, mixin

Vue 3:

```js
export function useMediaQuery(query) {
  const matches = ref(false)
  onMounted(() => mediaQuery.addEventListener('change', update))
  onUnmounted(() => mediaQuery.removeEventListener('change', update))
  return matches
}
```

Vue 2:

```js
const mediaQueryMixin = {
  data: () => ({ matches: false }),
  mounted() { this.mediaQuery.addListener(this.update) },
  beforeDestroy() { this.mediaQuery.removeListener(this.update) },
}
```

composable은 관련 상태와 훅을 함수의 명시적인 반환값으로 묶는다. mixin은 데이터 출처가 흐려지고 이름이 충돌하며, 사용처별 설정을 전달하기 어렵다.

프로젝트 위치: `src/composables/useMediaQuery.js`, `src/composables/useJobs.js`

## template ref와 `nextTick`

Vue 3:

```js
const dialogRef = ref(null)
await nextTick()
dialogRef.value?.querySelector('button')?.focus()
```

Vue 2:

```js
this.$nextTick(() => {
  this.$refs.dialog.querySelector('button')?.focus()
})
```

둘 다 DOM 갱신이 끝난 뒤 ref에 접근한다. Vue 3 Composition API의 template ref는 `.value`로 읽고, Vue 2는 컴포넌트 인스턴스의 `$refs`를 사용한다.

프로젝트 위치: `src/composables/useFocusTrap.js`, `src/components/base/BaseModal.vue`

## 상태 관리: Pinia와 Vuex

Vue 3 + Pinia:

```js
export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null }),
  getters: { isLoggedIn: (state) => Boolean(state.user) },
  actions: { logout() { this.user = null } },
})
```

Vue 2 + Vuex:

```js
const store = new Vuex.Store({
  state: { user: null },
  getters: { isLoggedIn: (state) => Boolean(state.user) },
  mutations: { logout(state) { state.user = null } },
  actions: { logout({ commit }) { commit('logout') } },
})
```

Pinia는 Options와 Setup 스타일을 지원하고 action에서 state를 직접 바꿀 수 있다. Vuex 3은 동기 변경을 mutation에 두고 컴포넌트에서 `mapGetters`, `dispatch`, `commit`으로 연결하는 패턴이 일반적이었다.

프로젝트 위치: `src/stores/auth.js`, `src/stores/scrap.js`

## 라우터: history, 가드, catch-all

Vue Router 4:

```js
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:pathMatch(.*)*', redirect: '/jobs' }],
})

router.beforeEach((to) => {
  if (needsLogin(to)) return { name: 'login' }
})
```

Vue Router 3:

```js
const router = new VueRouter({
  mode: 'history',
  routes: [{ path: '*', redirect: '/jobs' }],
})

router.beforeEach((to, from, next) => {
  if (needsLogin(to)) next({ name: 'login' })
  else next()
})
```

Router 4는 history 구현을 함수로 전달하고 가드에서 이동 대상이나 `false`를 반환한다. Router 3은 `mode: 'history'`, `path: '*'`, 반드시 호출해야 하는 `next()`를 사용했다.

프로젝트 위치: `src/router/index.js`

## Teleport

Vue 3:

```vue
<Teleport to="body">
  <section role="dialog" aria-modal="true">...</section>
</Teleport>
```

Vue 2:

```vue
<portal to="modal-target">
  <section role="dialog" aria-modal="true">...</section>
</portal>
```

Vue 3은 내장 `Teleport`로 컴포넌트의 논리적 소속을 유지한 채 다른 DOM 위치에 렌더링한다. Vue 2에서는 같은 목적에 `portal-vue` 같은 외부 라이브러리가 필요했다.

프로젝트 위치: `src/components/base/BaseModal.vue`

## KeepAlive와 RouterView slot

Vue 3:

```vue
<RouterView v-slot="{ Component }">
  <KeepAlive include="JobListView">
    <component :is="Component" />
  </KeepAlive>
</RouterView>
```

Vue 2:

```vue
<keep-alive include="JobListView">
  <router-view />
</keep-alive>
```

Vue Router 4에서는 `RouterView`의 slot으로 현재 컴포넌트를 받아 캐시 범위를 정한다. 이 프로젝트는 목록 화면만 캐시해 상세에서 돌아왔을 때 화면 상태를 유지한다.

프로젝트 위치: `src/App.vue`, `src/views/JobListView.vue`

## filters 삭제

Vue 3:

```js
export function formatWage(wage) {
  return `${wage.type} ${numberFormatter.format(wage.amount)}원`
}
```

```vue
{{ formatWage(job.wage) }}
```

Vue 2:

```js
export default {
  filters: {
    currency(value) { return `${value.toLocaleString()}원` },
  },
}
```

```vue
{{ price | currency }}
```

Vue 3에서는 filters가 삭제됐다. 일반 함수나 computed를 사용하면 템플릿 밖에서도 재사용할 수 있고 입력과 출력이 더 명확하다.

프로젝트 위치: `src/utils/format.js`, `src/components/job/JobCard.vue`, `src/views/JobDetailView.vue`

## 면접에서 설명할 포인트

- 앱 인스턴스 단위 설정 덕분에 테스트나 다중 앱에서 전역 오염을 줄일 수 있다.
- Proxy 반응성은 객체 키 추가·삭제에서도 `Vue.set` 없이 동작한다.
- `defineModel()`은 여러 양방향 바인딩의 prop/emit 계약을 짧고 명확하게 만든다.
- composable은 mixin보다 로직 출처, 반환값, 의존성이 드러나 재사용과 추적이 쉽다.
- Pinia의 Options/Setup 스토어를 모두 사용해 Vuex와 Composition API 양쪽 관점에서 설명할 수 있다.
- URL 쿼리, `KeepAlive`, `scrollBehavior`를 조합해 상세 왕복 뒤 필터와 스크롤을 복원했다.
- `Teleport`만으로 접근성이 완성되지는 않아 포커스 트랩, ESC 닫기, 포커스 복귀를 별도로 구현했다.
