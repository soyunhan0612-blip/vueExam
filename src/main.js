/*
 * [개념]
 * createApp은 루트 컴포넌트에서 독립된 앱 인스턴스를 만들며, 플러그인과 설정도
 * 전역 Vue 생성자가 아니라 해당 앱 인스턴스 단위로 관리한다. createPinia로 만든
 * 상태 관리 플러그인도 app.use(pinia)로 이 앱에만 등록한다.
 *
 * [Vue 2였다면]
 * Vue.use(plugin)
 * new Vue({ render: h => h(App) }).$mount('#app')
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import '@/styles/base.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
