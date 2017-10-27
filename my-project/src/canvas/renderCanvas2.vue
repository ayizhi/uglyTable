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
            },


            reportData: {
                type: Array,
                default: () => {
                    return []
                }
            },

            reportHeader: {
                type: Array,
                default: () => {
                    return []
                }
            },

            pageNum: {
                type: Number
            }

        },

        data(){
            const t = this;
            let dataHeaders = t.reportHeader;
            let dataBody = t.reportData;
            let bodyDataLen = dataBody.length;

    
            return {
                canvas: null,
                ctx: null,
                dataHeaders,
                dataBody, //每次新加进来的data
              
                acrossLine: new AcrossLine({width: 100}).canvas,
                verticalLine: new VerticalLine({height: 100}).canvas,

                //数据容器
                fixedLeftUpData: {}, //固定不动的data
                fixedHeaderData : {},//重点，经过处理后的header数据
                fixedLeftIndexData: {},//下在x方向上固定的index列
                fixedBodyData: {},//经过处理后的body数据
                bodyDataLen,//body现在数据的长度
                leftHeaderData: null,//处理过后的左头的容器，因为只要处理一次，所以保存下来，
                rightHeaderData: null,//处理过后的右头的容器，因为只要处理一次，所以保存下来，


                //location
                startX: 0,
                startY: 0,
                leftMaxWidth: 0,
                rightMaxWidth: 0,
                currentX: undefined,
                currentY: undefined,
                
                //cell canvas cache
                headerCanvasCache: {},
                bodyCanvasCache: {},
                bodyCanvasBgCache: {},
                bodyCanvasTextCache: {},

                //拖拽           
                downBorder: 0,
                rightBorder: 0,

                //webworker计算body的时候需要的配置
                bodyOptions: {
                    ratio: t.ratio,
                    bodyPaneHeight: t.bodyPaneHeight
                },

                //webworker计算header的时候需要的配置
                headerOptions: {
                    fixedColumnsLeft: t.fixedColumnsLeft,
                    ratio: t.ratio,
                    headerPaneHeight: t.headerPaneHeight
                }

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


           

            //左上
            t.worker.postMessage('dealFixedData',[t.dataHeaders,t.headerOptions])
            .then((leftHeaderData) => {
                console.log(leftHeaderData,'---')
                t.fixedLeftUpData = leftHeaderData.fixedLeftUpData;
                t.leftMaxWidth = leftHeaderData.width;
                t.leftHeaderData = leftHeaderData;
                
                t.dealLeftBodyData(t.dataBody,t.leftHeaderData)
            })

            //右上
            t.worker.postMessage('dealHeaderData',[t.dataHeaders,t.headerOptions])
            .then((rightHeaderData) => {
                console.log(rightHeaderData,'===')                
                t.fixedHeaderData = rightHeaderData.fixedHeaderData;
                t.rightMaxWidth = rightHeaderData.width;
                t.rightHeaderData = rightHeaderData;

                t.dealRightBodyData(t.dataBody,t.rightHeaderData)
            
            })


 
            t.run();

            t.bindEvent();
        },

        watch: {
            pageNum(newVal,oldVal){
                    const t = this;
                    let dataHeaders = t.reportHeader;
                    let dataBody = t.reportData;
                    let bodyDataLen = dataBody.length;
                    t.bodyDataLen += bodyDataLen;

                    t.dealLeftBodyData(dataBody,t.leftHeaderData)
                    t.dealRightBodyData(dataBody,t.rightHeaderData)
                    
                
            }
        },


        methods: {
            //============================ event start ========================
            bindEvent(){
                const t = this;
                let draging = false;
                let dragStartY = 0;
                let dragStartX = 0;
                let canvas = document.querySelector('#' + t.id)

                //底边界
                t.downBorder = (-t.fixedBodyData.length * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio

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

                            //上下滚动

                            t.$emit('upAndDown',{
                                y: t.startY,
                                downBorder: t.downBorder,
                                ratio: t.ratio,
                                bodyPaneHeight: t.bodyPaneHeight,
                                dataLength: t.bodyDataLen
                            })
                        };


                        //滚到最下面
                        if(t.startY < t.downBorder){
                            t.startY = t.downBorder;
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

                        //滚到头,因为这个右边最大宽度是异步获取的
                        if(t.rightMaxWidth){
                            //缓存
                            t.rightBorder = t.rightBorder == 0 ? (-t.rightMaxWidth - t.leftMaxWidth + t.width * t.ratio) : t.rightBorder
                            if(t.startX < t.rightBorder){
                                t.startX = t.rightBorder;
                            }   
                       }
                    }
                }

                document.onmouseup = (e) => {
                    draging = false;    
                    console.log('up')                
                }

                //鼠标当前坐标
                let canvasLeft = t.canvas.offsetLeft;
                let canvasTop = t.canvas.offsetTop;
                t.canvas.onmousemove = function(e){
                    t.currentX = e.offsetX;
                    t.currentY = e.offsetY;
                }
                t.canvas.onmouseleave = function(e){
                    t.currentX = undefined;
                    t.currentY = undefined;
                }



            },
            //============================ event end ==========================

            //============================ dealData start =====================

            //处理左下数据（主要index数据）
            dealLeftBodyData(dataBody,leftHeaderData){
                const t = this;
                //左下分片
                let splitLen = Math.ceil(t.height / t.bodyPaneHeight) * 10;
                let splitNum = Math.ceil(dataBody.length / splitLen);
                let len = Object.keys(t.fixedLeftIndexData).length;
                console.log(len,'~~~~~~~~~~~~~~~~')

                for(let i = 0 ; i < splitNum ; i++){
                    let currentData = dataBody.slice(i * splitLen , (i + 1) * splitLen);
                    t.worker.postMessage('dealIndexData',[currentData,leftHeaderData.fixedLeftUpData,t.bodyOptions,i * splitLen])
                    .then((leftBodyData) => {
                        for(let key in leftBodyData.fixedLeftIndexData){
                            t.fixedLeftIndexData[+key + +len] = leftBodyData.fixedLeftIndexData[key]
                            if(key  == dataBody.length - 1){
                                //更新右边边界
                                console.log(t.fixedLeftIndexData,'---|---');            
                                t.downBorder = (-(Object.keys(t.fixedLeftIndexData).length) * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio
                                console.log(t.downBorder,'~~~~~~~~')
                            }
                        }
                    })
                }
            },

            //处理右下数据（主体数据）
            dealRightBodyData(dataBody,rightHeaderData){
                const t = this;

                //对t.dataBody分片，整体渲染太慢，切成20(屏幕最大显示数)个一片
                //对fixedBodyData采取类数组对象的方式
            
                let splitLen = Math.ceil(t.height / t.bodyPaneHeight) * 10;
                let splitNum = Math.ceil(dataBody.length / splitLen);
                let len = Object.keys(t.fixedLeftIndexData).length;
                
                console.log(len,'~~~~~~~~~~~~~~~~')
                

                for(let i = 0 ; i < splitNum ; i++){
                    let currentData = dataBody.slice(i * splitLen , (i + 1) * splitLen);
                    
                    t.worker.postMessage('dealBodyData',[currentData,rightHeaderData.fixedHeaderData,t.bodyOptions,i * splitLen])
                    .then((rightBodyData) => {
              
                        for(let key in rightBodyData.fixedBodyData){
                            t.fixedBodyData[+key + +len] = rightBodyData.fixedBodyData[key]

                            if(key  == t.dataBody.length - 1){
                                //更新右边边界
                                console.log(t.fixedBodyData,'===|===');            
                            }
                        }
                    })
                }
            },

            //============================ dealData end =======================
            

            
            //============================ 绘制 start =========================

            //绘制每个header单元格
            drawHeaderPane(obj){
                const t = this;
                let field = obj.field;
                let type = obj.type;
                let info = obj.info;
                let tWidth = obj.paneWidth;
                let tHeight = obj.paneHeight;

                //缓存
                if(t.headerCanvasCache[field] == undefined){
                    let bgCanvas = document.createElement('canvas');
                    let bgCtx = bgCanvas.getContext('2d');
                    bgCanvas.width = tWidth;
                    bgCanvas.height = tHeight;

                    bgCtx.fillStyle = "#fff";
                    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

                    bgCtx.drawImage(t.acrossLine,
                    0,
                    tHeight - 1,
                    tWidth,
                    1);

                    if(obj.index != 0){
                        bgCtx.drawImage(t.verticalLine,
                        0,
                        0,
                        1,
                        tHeight)
                    };
                    if(obj.index == obj.headerLen - 1){                 
                        bgCtx.drawImage(t.verticalLine,
                        tWidth - 1,
                        0,
                        1,
                        tHeight)
                        
                    }                    

                    //text default color
                    bgCtx.font = t.fontSize * t.ratio + 'px Arif';
                    if(obj.type == 'header'){
                        bgCtx.fillStyle = '#9e9ea6';
                    }else{
                        bgCtx.fillStyle = '#555459';
                    }

                    bgCtx.textAlign = t.textAglin;    //start, end, left, right or center
                    bgCtx.textBaseline = 'middle';
                    if(t.textAglin == 'center'){
                        bgCtx.fillText(obj.info,tWidth/2,tHeight/2)
                    }else if(t.textAglin == 'left'){
                        bgCtx.fillText(obj.info,t.padding,tHeight/2)                   
                    }

                    t.headerCanvasCache[field] = bgCanvas
                }

                let cellCanvas = t.headerCanvasCache[field];    

                return cellCanvas  
            },

            //绘制每个body
            drawBodyPane(obj){
                const t = this;
                let field = obj.field;
                let type = obj.type;
                let info = obj.info;
                let index = obj.index;//列index
                let rowIndex = obj.rowIndex;//行index
                let tWidth = obj.paneWidth;
                let tHeight = obj.paneHeight;
                let startX = obj.startX;
                let endX = obj.endX;
                let startY = obj.startY;
                let endY = obj.endY;

                //body单元格cache
                // t.bodyCanvasCache[rowIndex] = t.bodyCanvasCache[rowIndex] == undefined ? {} : t.bodyCanvasCache[rowIndex];
                t.bodyCanvasCache[rowIndex] = t.bodyCanvasCache[rowIndex] || {};
                t.bodyCanvasTextCache[rowIndex] = t.bodyCanvasTextCache[rowIndex] || {};
                if(t.bodyCanvasCache[rowIndex][field] == undefined){
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    canvas.width = tWidth;
                    canvas.height = tHeight;

                    //背景缓存
                    if(t.bodyCanvasBgCache[field] == undefined){
                        let bgCanvas = document.createElement('canvas');
                        let bgCtx = bgCanvas.getContext('2d');
                        bgCanvas.width = tWidth;
                        bgCanvas.height = tHeight;

                        bgCtx.fillStyle = "#fff";
                        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

                        bgCtx.drawImage(t.acrossLine,
                        0,
                        tHeight - 1,
                        tWidth,
                        1);

                        if(index != 0){
                            bgCtx.drawImage(t.verticalLine,
                            0,
                            0,
                            1,
                            tHeight)
                        };
                        if(index == obj.headerLen - 1){                 
                            bgCtx.drawImage(t.verticalLine,
                            tWidth - 1,
                            0,
                            1,
                            tHeight)
                        }

                        t.bodyCanvasBgCache[field] = bgCanvas
                    }
                    
                    let cellBgCanvas = t.bodyCanvasBgCache[field];  
                    ctx.drawImage(cellBgCanvas,0,0)
                    
                    //字体缓存
                    if(t.bodyCanvasTextCache[rowIndex][field] == undefined && obj.info != ''){
                        
                        let textCanvas = document.createElement('canvas');
                        let textCtx = textCanvas.getContext('2d');
                        textCanvas.width = tWidth;
                        textCanvas.height = tHeight;

                        //text default color
                        textCtx.font = t.fontSize * t.ratio + 'px Arif';
                        if(obj.type == 'header'){
                            textCtx.fillStyle = '#9e9ea6';
                        }else{
                            textCtx.fillStyle = '#555459';
                        }

                        textCtx.textAlign = t.textAglin;    //start, end, left, right or center
                        textCtx.textBaseline = 'middle';
                        if(t.textAglin == 'center'){
                            textCtx.fillText(obj.info,tWidth/2,tHeight/2)
                        }else if(t.textAglin == 'left'){
                            textCtx.fillText(obj.info,t.padding,tHeight/2)                   
                        }

                        t.bodyCanvasTextCache[rowIndex][field] = textCanvas
                    }

                    if(obj.info != ''){
                        let cellTextCanvas = t.bodyCanvasTextCache[rowIndex][field];
                        ctx.drawImage(cellTextCanvas,0,0)
                    }
              
  

                    t.bodyCanvasCache[rowIndex][field] = {
                        canvas,
                        startX,
                        endX,
                        startY,
                        endY,
                    }
                }


        
                return t.bodyCanvasCache[rowIndex][field].canvas  
            },



            //============================ 绘制 end ==========================

            render(){
                const t = this;
                let leftX = -t.startX ;
                let rightX = -t.startX + t.width * t.ratio;
                let upY = -t.startY;
                let downY = -t.startY + t.height * t.ratio - t.headerPaneHeight * t.ratio;


                //确定所有y轴上要显示的index
                let startIndex = Math.floor(upY / (t.bodyPaneHeight * t.ratio))
                let endIndex = Math.ceil(downY / (t.bodyPaneHeight * t.ratio))

                let config = {
                    startIndex,
                    endIndex,
                    rightX,
                    leftX
                }

                 //画主body,分片
                Object.keys(t.fixedBodyData).map((index) => {
                    let item = t.fixedBodyData[index]
                    if(index < startIndex || index > endIndex) return;
                    Object.keys(item).map((key) => {
                        let cellPa = item[key];
                        let startX = cellPa.startX;
                        let endX = cellPa.endX;
                        if(startX > rightX || endX < leftX) return;

                        let children = cellPa.children;
                        Object.keys(children).map((cellIndex) => {
                            let cell = children[cellIndex];
                            if(cell.startX > rightX || cell.endX < leftX) return;

                            let c = t.drawBodyPane({
                                field: cell.field,
                                type: 'body',
                                startX,
                                endX,
                                startY: cell.startY,
                                endY: cell.endY,
                                index: cell.index,//列index
                                rowIndex: index,//行index
                                headerLen: cell.headerLen,
                                paneWidth: cell.paneWidth,
                                paneHeight: t.bodyPaneHeight * t.ratio ,
                                info: cell.info
                            })
                            t.ctx.drawImage(c,
                                cell.startX + t.startX + t.leftMaxWidth ,
                                cell.startY + t.startY + t.headerPaneHeight * t.ratio,
                            ) 
                        })
                    })
                })


                //leftIndex
                Object.keys(t.fixedLeftIndexData).map((index) => {
                    let item  = t.fixedLeftIndexData[index]
                    if(index < startIndex || index > endIndex) return;
                
                    for(let key in item){
                        let cell = item[key];
                        let c = t.drawBodyPane({
                            field: cell.field,
                            type: 'body',
                            index: cell.index,//列index
                            rowIndex: index,//行index
                            headerLen: cell.headerLen,
                            paneWidth: cell.paneWidth,
                            paneHeight: t.bodyPaneHeight * t.ratio ,
                            info: cell.info
                        })
                        t.ctx.drawImage(c,
                            cell.startX, cell.startY + t.startY + t.headerPaneHeight * t.ratio
                        ) 
                    }
                })


                //画右边头部
                for(let key in t.fixedHeaderData){
                    let cell = t.fixedHeaderData[key];
                    if(cell.startX > rightX || cell.endX < leftX){
                        continue;
                    }
                    let c = t.drawHeaderPane({
                        field: cell.field,
                        type: 'header',
                        index: cell.index,
                        headerLen: cell.headerLen,
                        paneWidth: cell.paneWidth,
                        paneHeight: t.headerPaneHeight * t.ratio ,
                        info: cell.info
                    })
                    t.ctx.drawImage(c,
                         cell.startX + t.startX + t.leftMaxWidth , cell.startY, cell.paneWidth,t.headerPaneHeight * t.ratio
                    ) 
                }


                //画固定头部left up
                for(let key in t.fixedLeftUpData){
                    let cell = t.fixedLeftUpData[key];
                    let c = t.drawHeaderPane({
                        field: cell.field,
                        type: 'header',
                        index: cell.index,
                        headerLen: cell.headerLen,
                        paneWidth: cell.paneWidth,
                        paneHeight: t.headerPaneHeight * t.ratio ,
                        info: cell.info
                    })

                    t.ctx.drawImage(c,
                        cell.startX, cell.startY, cell.paneWidth,t.headerPaneHeight * t.ratio
                    ) 
                }
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

