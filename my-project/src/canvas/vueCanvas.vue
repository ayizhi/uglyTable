<template>
    <canvas :id='id' :width="width" :height="height" style="border: 1px solid"></canvas>
</template>
<script>

 //requestAnimationFrame兼容性封装
(() => {  
    let lastTime = 0;  
    let vendors = ['ms', 'moz', 'webkit', 'o'];  
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {  
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];  
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];  
    }  
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {  
        let currTime = new Date().getTime();  
        let timeToCall = Math.max(0, 16 - (currTime - lastTime));  
        let id = window.setTimeout(function() {  
    callback(currTime + timeToCall);  
    }, timeToCall);  
    lastTime = currTime + timeToCall;  
    return id;  
    };  
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {  
    clearTimeout(id);  
    };  
})(); 


    export default{
        props: {
            id: {
                type: String,
                default: () => {
                    return 'canvas'
                }
            },

            width: {
                type: Number,
                default: () => {
                    return 600
                }
            },

            height: {
                type: Number,
                default: () => {
                    return 400
                }
            }
            
        },

        data(){
            const t = this;
            return {
                canvas: null,
                ctx: null,
            }
        },

        mounted(){
            const t = this;

            t.canvas = document.getElementById(t.id);
            t.ctx = t.canvas.getContext('2d');
            
            t.run()
        },

        computed: {},

        methods: {
            run(){
                const t = this;
                const _run = () => {
                    requestAnimationFrame(_run)
                }
                _run();
            },
        },

    }
   

</script>

<style >

</style>

