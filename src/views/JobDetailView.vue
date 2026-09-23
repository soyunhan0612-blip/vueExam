<!--
  [개념]
  라우터의 route props가 경로 파라미터를 숫자로 변환해 컴포넌트 props로 전달하므로,
  화면이 라우터 인스턴스에 직접 의존하지 않는다.

  [Vue 2였다면]
  this.$route.params.id로 문자열 값을 읽고 Number()로 직접 변환해야 했다.
-->
<script setup>
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <section>
    <h1>공고 상세</h1>
    <p>공고 번호: {{ props.id }}</p>
  </section>
</template>
