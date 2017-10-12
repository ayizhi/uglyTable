<template>
    <canvas :id='id' :width="width" :height="height" :style="{
        border: '1px solid #000',
        width: width + 'px',
        height: height + 'px',

    }"></canvas>
</template>
<script>
import Data from './data';
import workerConfig from '../assets/js/workerConfig';
console.log(Data);

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
                    return 20
                }
            },

            fixedColumnsLeft: {
                type: Number,
                default: () => {
                    return 2
                }
            }
        },

        data(){
            const t = this;
            const tableData = Data.data;
            let dataHeaders = tableData.reportHeader;
            let dataBody = tableData.reportData;

    
            return {
                canvas: null,
                ctx: null,
                tableData,
                dataHeaders,
                dataBody, 
              

                acrossLine: new AcrossLine({width: 100}).canvas,
                verticalLine: new VerticalLine({height: 100}).canvas,

                //数据容器
                fixedLeftUpData: {}, //固定不动的data
                fixedHeaderData : {},//重点，经过处理后的header数据
                fixedLeftIndexData: [],//下在x方向上固定的index列
                fixedBodyData: [],//经过处理后的body数据

                //canvas容器
                fixedCanvasList: [],//左上角固定不动的
                headerCanvasList: [],//表头canvas，临时，会在之后把整张表画成一张图                
                indexCanvasList: [],//左下在x方向上固定的index列
                bodyCanvasList: [],//表身canvas组

                //location
                startX: 0,
                startY: 0,
                leftMaxWidth: 0,
                rightMaxWidth: 0,
            }
        },

        created(){
            const t = this;

            t.worker = t.$worker.create(workerConfig)
        },

        mounted(){
            const t = this;

            t.canvas = document.getElementById(t.id);
            t.ctx = t.canvas.getContext('2d');
            t.canvas.width = t.ratio * t.width;
            t.canvas.height = t.ratio * t.height;

            //headerOptions
            let headerOptions = {
                fixedColumnsLeft: t.fixedColumnsLeft,
                ratio: t.ratio,
                headerPaneHeight: t.headerPaneHeight
            }

            //bodyOptions
            let bodyOptions = {
                ratio: t.ratio,
                bodyPaneHeight: t.bodyPaneHeight
            }

            //左上
            t.worker.postMessage('dealFixedData',[t.dataHeaders,headerOptions])
            .then((leftHeaderData) => {
                console.log(leftHeaderData,'---')
                t.fixedLeftUpData = leftHeaderData.fixedLeftUpData;
                
                //左下
                t.worker.postMessage('dealIndexData',[t.dataBody,leftHeaderData.fixedLeftUpData,bodyOptions])
                .then((leftBodyData) => {
                    console.log(leftBodyData,'---|---')
                    t.fixedLeftIndexData = leftBodyData.fixedLeftIndexData;
                })
            })

            //右上
            t.worker.postMessage('dealHeaderData',[t.dataHeaders,headerOptions])
            .then((rightHeaderData) => {
                console.log(rightHeaderData,'===')
                t.fixedHeaderData = rightHeaderData.fixedHeaderData;
                //右下
                t.worker.postMessage('dealBodyData',[t.dataBody,rightHeaderData.fixedHeaderData,bodyOptions])
                .then((rightBodyData) => {
                    console.log(rightBodyData,'===|===');
                    t.fixedBodyData = rightBodyData.fixedBodyData;
                })
            })


 
            t.run();

            t.bindEvent();
        },



        methods: {

            //============================ event start ==========================
            bindEvent(){
                const t = this;
                let draging = false;
                let dragStartY = 0;
                let dragStartX = 0;
                let canvas = document.querySelector('#' + t.id)
                var downBorder = (-t.dataBody.length * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio
                var rightBorder = -t.rightMaxWidth - t.leftMaxWidth + t.width * t.ratio
                

                document.onmousedown = (e) => {
                    console.log('down')                
                    
                    draging = true;
                    dragStartY = e.clientY;
                    dragStartX = e.clientX;
                }

                document.onmousemove = (e) => {
                    if(!draging) return

                    //针对y
                    if(t.startY > 0) {
                        t.startY = 0;
                    }else{
                        let tmpY = t.startY + (e.clientY - dragStartY)
                        if(tmpY <= 0){
                            t.startY = tmpY
                            dragStartY = e.clientY
                        }

                        //滚到最下面
                        if(t.startY < downBorder){
                            t.startY = downBorder;
                        }   
                    }

                    //针对x
                    if(t.startX > 0){
                        t.startX = 0;
                    }else {
                        let tmpX = t.startX + (e.clientX - dragStartX)
                        if(tmpX <= 0){
                            t.startX = tmpX                    
                            dragStartX = e.clientX
                        }

                        //滚到头
                        if(t.startX < rightBorder){
                            t.startX = rightBorder;
                        }
                    }
                }

                document.onmouseup = (e) => {
                    draging = false;    
                    console.log('up')                
                }
            },
            //============================ event end ==========================


            
            //============================ 绘制 start =========================

            //绘制每个单元格
            drawPane(obj){
                const t = this;
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let info = obj.info;
                let tWidth = obj.paneWidth;
                let tHeight = obj.paneHeight;
                canvas.width = tWidth;
                canvas.height = tHeight;

                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(t.acrossLine,
                    0,
                    tHeight - 1,
                    tWidth,
                    1);
                
                if(obj.index != 0){
                    ctx.drawImage(t.verticalLine,
                        0,
                        0,
                        1,
                        tHeight)
                };
                if(obj.index == obj.headerLen - 1){                 
                    ctx.drawImage(t.verticalLine,
                        tWidth - 1,
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

            //============================ 绘制 end ==========================

            render(){
                const t = this;
                let realStartX = 0;

                

                
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

