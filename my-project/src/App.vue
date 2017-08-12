<template>
  <div id="app">
    <vue-canvas id="canva" :width="800" :height="600"></vue-canvas>
  </div>
</template>

<script>
import vueCanvas from './canvas/vueCanvas'

export default {
  name: 'app',
  components: {
    'vue-canvas': vueCanvas
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
