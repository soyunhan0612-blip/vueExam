/*
 * [개념]
 * createApp은 루트 컴포넌트에서 독립된 앱 인스턴스를 만들며, 플러그인과 설정도
 * 전역 Vue 생성자가 아니라 해당 앱 인스턴스 단위로 관리한다.
 *
 * [Vue 2였다면]
 * Vue.use(plugin)
 * new Vue({ render: h => h(App) }).$mount('#app')
 */
import { createApp } from 'vue'

import App from './App.vue'

createApp(App).mount('#app')
