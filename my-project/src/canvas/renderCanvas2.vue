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

                // //canvas容器
                // fixedCanvasList: [],//左上角固定不动的
                // headerCanvasList: [],//表头canvas，临时，会在之后把整张表画成一张图                
                // indexCanvasList: [],//左下在x方向上固定的index列
                // bodyCanvasList: [],//表身canvas组

                //location
                startX: 0,
                startY: 0,
                leftMaxWidth: 0,
                rightMaxWidth: 0,
                
                //cell canvas cache
                headerCanvasCache: {},
                bodyCanvasCache: {},
                bodyCanvasBgCache: {},

                //拖拽           
                downBorder: 0,
                rightBorder: 0,



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
                t.leftMaxWidth = leftHeaderData.width;
                
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
                t.rightMaxWidth = rightHeaderData.width;
                
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

                //底边界
                t.downBorder = (-t.dataBody.length * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio

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
            },
            //============================ event end ==========================


            
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

                //body单元格cache
                t.bodyCanvasCache[rowIndex] = t.bodyCanvasCache[rowIndex] == undefined ? {} : t.bodyCanvasCache[rowIndex];
                if(t.bodyCanvasCache[rowIndex][index] == undefined){
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    canvas.width = tWidth;
                    canvas.height = tHeight;

                    //缓存
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
                    
                    let cellCanvas = t.bodyCanvasBgCache[field];    

                    ctx.drawImage(cellCanvas,0,0)

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

                    t.bodyCanvasCache[rowIndex][index] = canvas
                }


        
                return t.bodyCanvasCache[rowIndex][index]  
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

                //画主body,分片
                t.fixedBodyData.map((item,index) => {
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


                // //不分片的body
                // t.fixedBodyData.map((item,index) => {
                //     if(index < startIndex || index > endIndex) return;
                //     for(let key in item){
                //         let cell = item[key];
                //         let c = t.drawBodyPane({
                //             field: cell.field,
                //             type: 'body',
                //             index: cell.index,
                //             headerLen: cell.headerLen,
                //             paneWidth: cell.paneWidth,
                //             paneHeight: t.bodyPaneHeight * t.ratio ,
                //             info: cell.info
                //         })
                //         t.ctx.drawImage(c,
                //             cell.startX + t.startX + t.leftMaxWidth ,
                //             cell.startY + t.startY + t.headerPaneHeight * t.ratio,
                //         ) 
                //     }
                // })
                


                //leftIndex
                t.fixedLeftIndexData.map((item,index) => {
                    if(index < startIndex || index > endIndex) return;
                
                    for(let key in item){
                        let cell = item[key];
                        let c = t.drawBodyPane({
                            field: cell.field,
                            type: 'body',
                            index: cell.index,
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

