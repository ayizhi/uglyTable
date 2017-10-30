<template>
  <div id="app">
    <vue-canvas
	id="canvas" 
	:width="1000" 
	:height="400" 
	:fixed="2"
	:loadMoreController="loadMoreController"
	:url="url"
	:externalData="externalData"


     ></vue-canvas>
  </div>
</template>

<script>
import Data from '../src/assets/js/data';
import axios from 'axios'
import vueCanvas from './canvas/renderCanvas2'
Mock.mock('/get-data', function(){
	return Data
});


export default {
    name: 'app',
    data(){
		const t =  this;
		return {
			url: '/get-data',
			externalData: {},//post请求需要额外拼装的数据

			pageNum: 1,
			totalPageNum: 1,
			limit: 500,
			reportData: Data.data.reportData,
			reportHeader: Data.data.reportHeader, 
			hasLoad: false
		}
    },
    methods: {
		loadMoreController(info){
			let i = Math.floor(-info.y / (info.bodyPaneHeight * 2));//当前显示，从第几个开始
			if(info.dataLength - i < 900){
				return true
			}
			return false;
		},
		
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
