<template>
    <canvas :id='id' :width="width" :height="height" :style="{
        border: '1px solid #000',
        width: width + 'px',
        height: height + 'px',

    }"></canvas>
</template>
<script>
import Data from './data';



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

 //竖
class VerticalLine{
    constructor(obj){
        const t = this;
        t.canvas = document.createElement('canvas');
        t.ctx = t.canvas.getContext('2d');
        t.ratio = obj.ratio || 2;
        t.height = obj.height * t.ratio;
        t.width = (obj.width || 1) * t.ratio; //stoke width
        t.canvas.height = t.height;
        t.canvas.width = t.width;
        t.draw();
        return t;
    };

    draw(){
        const t = this;
        t.ctx.beginPath();
        t.ctx.moveTo(0,0);
        t.ctx.lineTo(0,t.height);
        t.ctx.lineWidth = t.width;
        t.ctx.strokeStyle = '#000';
        t.ctx.stroke();     
    };
}

//横
class AcrossLine{
    constructor(obj){
        const t = this;
        t.canvas = document.createElement('canvas');
        t.ctx = t.canvas.getContext('2d');
        t.ratio = obj.ratio || 2;
        t.height = (obj.height || 1) * t.ratio;
        t.width = obj.width * t.ratio; //stoke width
        t.canvas.height = t.height;
        t.canvas.width = t.width;
        t.draw();
        return t;
    };

    draw(){
        const t = this;
        t.ctx.beginPath();
        t.ctx.moveTo(0,0);
        t.ctx.lineTo(t.width,0);
        t.ctx.lineWidth = t.height;
        t.ctx.strokeStyle = '#000';
        t.ctx.stroke();     
    };
}


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
            },

            ratio: {
                type: Number,
                default: () => {
                    return 2
                }
            },

            headerPaneHeight: {
                type: Number,
                default: () => {
                    return 40
                }
            },

            bodyPaneHeight: {
                type: Number,
                default: () => {
                    return 43
                }
            },

            fontSize: {
                type: Number,
                default: () => {
                    return 14
                }
            },

            textAglin: {
                type: String,
                default: () => {
                    return 'left'//start, end, left, right or center
                }
            },
            
            padding: {
                type: Number,
                default: () => {
                    return 10
                }
            },
        },

        data(){
            const t = this;
            const tableData = Data.data;
            let dataHeaders = tableData.reportHeader;
            let dataBody = tableData.reportHeaderData;
           
           


            return {
                canvas: null,
                ctx: null,
                tableData,
                dataHeaders,
                dataBody, 
                fixedData : {},//重点，经过处理后的数据

                acrossLine: new AcrossLine({width: 100}).canvas,
                verticalLine: new VerticalLine({height: 100}).canvas,

                
                startX: 0,
                startY: 0,
            }
        },

        mounted(){
            const t = this;

            t.canvas = document.getElementById(t.id);
            t.ctx = t.canvas.getContext('2d');
            t.canvas.width = t.ratio * t.width;
            t.canvas.height = t.ratio * t.height;

            //表头index
            t.dataHeaders.unshift({
                field: 'table_index',
                fieldName: '',
            })

             //处理后的数据
            let headerLen = t.dataHeaders.length;
           
            //表头
            t.dataHeaders.map((header,index) => {
                let field = header.field;
                let fieldName = header.fieldName;
                if(field == 'table_index' && fieldName == ''){
                    let paneWidth =  50 * 2;
                    t.fixedData[field] = {
                        fieldName: '',
                        startY: t.startY,
                        startX: t.startX,
                        index: index,
                        headerLen: headerLen,
                        paneWidth: paneWidth * t.ratio,
                        paneHeight: t.headerPaneHeight * t.ratio,
                        headerCanvas: t.drawPane({
                            type: 'header',
                            index: index,
                            headerLen: headerLen,
                            paneWidth: paneWidth ,
                            paneHeight: t.headerPaneHeight ,
                            info: fieldName
                        })
                    };
                    t.startX += paneWidth;                
                    return;        
                }

                let paneWidth = fieldName.length * 50;
                let dataType = header.dataType;
                let isFixed = header.isFixed
                t.fixedData[field] = {
                    fieldName: fieldName,
                    startY: t.startY,
                    startX: t.startX,
                    index: index,
                    headerLen: headerLen,
                    paneWidth: paneWidth * t.ratio,
                    paneHeight: t.headerPaneHeight * t.ratio,
                    headerCanvas: t.drawPane({
                        type: 'header',
                        index: index,
                        headerLen: headerLen,
                        paneWidth: paneWidth ,
                        paneHeight: t.headerPaneHeight ,
                        info: fieldName
                    })
                };
                t.startX += paneWidth;  
            })
            
            t.run()
        },

        computed: {},

        methods: {
            //绘制每个单元格
            drawPane(obj){
                const t = this;
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let info = obj.info;
                let tWidth = obj.paneWidth * t.ratio;
                let tHeight = obj.paneHeight * t.ratio;
                canvas.width = tWidth;
                canvas.height = tHeight;



                if(obj.info == ''){

                }
                ctx.drawImage(t.acrossLine,
                    0,
                    tHeight - 1,
                    tWidth,
                    1)
                if(obj.index != 0){

                    ctx.drawImage(t.verticalLine,
                        0,
                        0,
                        1,
                        tHeight)
                }
                if(obj.index == obj.headerLen - 1){                    
                    ctx.drawImage(t.verticalLine,
                        tWidth,
                        0,
                        1,
                        tHeight)
                }

                //text default color
                ctx.font = t.fontSize * t.ratio + 'px Arif';
                if(obj.type == 'header'){
                    ctx.fillStyle = '#9e9ea6';
                }else{
                    ctx.fillStyle = '#555459';
                }
                
                ctx.textAlign = t.textAglin;    //start, end, left, right or center
                ctx.textBaseline = 'middle';
                if(t.textAglin == 'center'){
                    ctx.fillText(obj.info,tWidth/2,tHeight/2)
                }else if(t.textAglin == 'left'){
                    ctx.fillText(obj.info,t.padding,tHeight/2)
                }

                return canvas  
            },


            render(){
                const t = this;

                Object.keys(t.fixedData).map((key,index) => {
                    let pane = t.fixedData[key];
                    let hc = pane.headerCanvas;
                    let x = pane.startX;
                    let y = pane.startY;
                    let w = pane.paneWidth;
                    let h = pane.paneHeight;
                    t.ctx.drawImage(hc,0,0,hc.width,hc.height,x,y,w,h)
                })

            },

            run(){
                const t = this;
                const _run = () => {
                    t.ctx.clearRect(0,0,t.canvas.width,t.canvas.height)
                    t.render()
                    requestAnimationFrame(_run)
                }
                _run();
            },

         

        },

    }
   

</script>

<style >

</style>

