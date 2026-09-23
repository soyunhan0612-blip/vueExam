<!--
  [개념]
  defineOptions({ name })로 컴포넌트 이름을 명시하면 KeepAlive의 include가
  이름으로 JobListView를 찾아 목록 화면만 캐시할 수 있다.

  [Vue 2였다면]
  export default { name: 'JobListView' }
-->
<script setup>
defineOptions({ name: 'JobListView' })
</script>

<template>
  <section>
    <h1>공고 목록</h1>
    <p>생활일자리 공고를 확인할 수 있습니다.</p>
  </section>
</template>
