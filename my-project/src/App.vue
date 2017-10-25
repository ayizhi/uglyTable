<template>
  <div id="app">
    <vue-canvas
     id="canvas" :width="1000" :height="400" :fixed="2"
      @upAndDown="handleUpAndDown"
     ></vue-canvas>
  </div>
</template>

<script>
import Data from './canvas/data';
import axios from 'axios'
import vueCanvas from './canvas/renderCanvas2'
Mock.mock('/get-data', Data);

axios.get('/get-data').then((data) => {
  
});
export default {
  name: 'app',

  methods: {
    handleUpAndDown(e){
      const t = this;
    }
  },

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
