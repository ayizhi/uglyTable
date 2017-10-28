<template>
  <div id="app">
    <vue-canvas
     id="canvas" :width="1000" :height="400" :fixed="2"
      @upAndDown="handleUpAndDown"
      :reportData="reportData"
	  :reportHeader="reportHeader"
	  :pageNum="pageNum"
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
			pageNum: 1,
			totalPageNum: 1,
			limit: 500,
			reportData: Data.data.reportData,
			reportHeader: Data.data.reportHeader, 
			hasLoad: false
		}
    },
    methods: {
		handleUpAndDown(e){
			const t = this;
			console.log(e.dataLength)
			if(t.hasLoad) return;
			
			
			let i = Math.floor(-e.y/(e.bodyPaneHeight * 2));//当前显示，从第几个开始
			console.log(e.dataLength - i)
			if(e.dataLength - i < 50){
				t.hasLoad = true;
				
				
				t.loadingDataAjax().then((data) => {
					t.hasLoad = false;
					console.log(data.data)
					let tableData = data.data.data
					t.reportData = tableData.reportData.slice(0)
					t.reportHeader = tableData.reportHeader.slice(0)
					t.pageNum += 1



					console.log(t.pageNum,t.reportData,'==============')

				})
			}

		

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
