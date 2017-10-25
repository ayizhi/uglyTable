<template>
  <div id="app">
    <vue-canvas
     id="canvas" :width="1000" :height="400" :fixed="2"
      @upAndDown="handleUpAndDown"
      :reportData="reportData"
     ></vue-canvas>
  </div>
</template>

<script>
import Data from './canvas/data';
import axios from 'axios'
import vueCanvas from './canvas/renderCanvas2'
Mock.mock('/get-data', Data);


export default {
    name: 'app',
    data(){
		const t =  this;
		return {
			reportData: Data, 
		}
    },
    methods: {
		handleUpAndDown(e){
			const t = this;
			console.log(e)
			let i = Math.floor(-e.y/(e.bodyPaneHeight * 2) )
			setTimeout(() => {
				if(e.dataLength - i < 930){

					t.loadingDataAjax().then((data) => {
						console.log(data)
					})
				}
			},1)
		
			console.log(i,e.dataLength - i,e.dataLength,'----')
		},

		loadingDataAjax(){
			const t = this;
			return new Promise((resolve) => {
				axios.get('/get-data').then((data) => {
					resolve(data)
				});	
			})
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
