<template>
    <canvas :id='id' :width="width" :height="height" :style="{
        border: '1px solid #000',
        width: width + 'px',
        height: height + 'px',

    }"></canvas>
</template>
<script>
import Data from './data';

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

        mounted(){
            const t = this;

            t.canvas = document.getElementById(t.id);
            t.ctx = t.canvas.getContext('2d');
            t.canvas.width = t.ratio * t.width;
            t.canvas.height = t.ratio * t.height;

            //画左上(左上，固定不动)
            t.leftMaxWidth = t.dealFixedData();         
            t.fixedCanvasList = t.drawRow(t.fixedLeftUpData,'header',t.leftMaxWidth);

            //画右上（header）
            t.rightMaxWidth = t.dealHeaderData()//表头       
            t.headerCanvasList = t.drawRow(t.fixedHeaderData,'header',t.rightMaxWidth);

            //画左下
            t.dealIndexData();
            t.fixedLeftIndexData.map((data) => {
                t.indexCanvasList.push(t.drawRow(data,'body',t.leftMaxWidth))
            })

            //画右下（body，表身）
            t.dealBodyData(); 
            t.fixedBodyData.map((data) => {
                t.bodyCanvasList.push(t.drawRow(data,'body',t.rightMaxWidth));
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
                

                console.log(t.leftMaxWidth,t.rightMaxWidth,rightBorder)

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


            //============================ 数据处理 start ========================
            //处理左上固定块数据
            dealFixedData(){
                const t = this;
                let fixedList = [{
                    field: 'table_index',
                    fieldName: '',
                }];

                if(t.fixedColumnsLeft != 0){
                    t.dataHeaders.slice(0, t.fixedColumnsLeft).map((d) => {
                        fixedList.push(d)
                    })
                };

                //总长度，主要是画canvas时计算
                let headerLen = fixedList.length;
                let selfStartX = 0;
                let selfStartY = 0;
            
                fixedList.map((fixedItem,index) => {
                    let field = fixedItem.field;
                    let fieldName = fixedItem.fieldName;
                    let paneWidth = fieldName.length * 30;
                    let dataType = fixedItem.dataType;
                    let isFixed = fixedItem.isFixed;

                    //开头的空格
                    if(field == 'table_index' && fieldName == ''){
                        let paneWidth =  30 * 2;
                        t.fixedLeftUpData[field] = {
                            field: field,
                            index: index,
                            type: 'header',  
                            headerLen: headerLen,                                                                              
                            paneWidth: paneWidth * t.ratio,
                            paneHeight: t.headerPaneHeight * t.ratio,
                            paneCanvas: t.drawPane({
                                index: index,
                                headerLen: headerLen,
                                paneWidth: paneWidth * t.ratio,
                                paneHeight: t.headerPaneHeight * t.ratio ,
                                info: fieldName
                            })
                        };
                       
                        selfStartX += paneWidth * t.ratio;                            
                        return;        
                    }


                    t.fixedLeftUpData[field] = {
                        field: field,                        
                        index: index,
                        type: 'header',    
                        headerLen: headerLen,                                            
                        paneWidth: paneWidth * t.ratio ,
                        paneHeight: t.headerPaneHeight * t.ratio,
                        paneCanvas: t.drawPane({
                            index: index,
                            headerLen: headerLen,
                            paneWidth: paneWidth * t.ratio ,
                            paneHeight: t.headerPaneHeight * t.ratio,
                            info: fieldName
                        })
                    };
                    selfStartX += paneWidth * t.ratio;                            
                }) 
                
                return selfStartX;
            },

            //处理表头，也就是右上的数据
            dealHeaderData(){
                const t = this;

                let currentHeaders = t.dataHeaders.slice(t.fixedColumnsLeft);

                //处理后的数据
                let headerLen = currentHeaders.length;
                let selfStartX = 0;
                let selfStartY = 0;
            
                //表头
                currentHeaders.map((header,index) => {
                    let field = header.field;
                    let fieldName = header.fieldName;
                    let paneWidth = fieldName.length * 30;
                    let dataType = header.dataType;
                    let isFixed = header.isFixed
                    t.fixedHeaderData[field] = {
                        index: index,
                        field: field,                                                
                        type: 'header',  
                        headerLen: headerLen,                                              
                        paneWidth: paneWidth * t.ratio ,
                        paneHeight: t.headerPaneHeight * t.ratio,
                        paneCanvas: t.drawPane({
                            index: index,
                            headerLen: headerLen,
                            paneWidth: paneWidth * t.ratio ,
                            paneHeight: t.headerPaneHeight * t.ratio,
                            info: fieldName
                        })
                    };
                    selfStartX += paneWidth * t.ratio;  
                })

                return selfStartX
            },

            //画左下
            dealIndexData(){
                const t = this;
                t.dataBody.map((data,index) => {
                    let tmpData = {};
                    Object.keys(t.fixedLeftUpData).map((key) => {
                        let colPreSet = t.fixedLeftUpData[key];
                        let colData = data[key] || '';
                        let i = colPreSet.index;
                        tmpData[i] = {
                            field: key,
                            rowIndex: index,
                            type: 'body',                                                                                    
                            paneWidth: colPreSet.paneWidth ,
                            paneHeight: t.bodyPaneHeight * t.ratio,
                            paneCanvas: t.drawPane({
                                index: i,
                                headerLen: colPreSet.headerLen,
                                paneWidth: colPreSet.paneWidth,
                                paneHeight: t.bodyPaneHeight * t.ratio,
                                info: key == 'table_index' ? index + 1 : colData
                            })                       
                        }
                    })
                    t.fixedLeftIndexData.push(tmpData)
                })
            },

            //画右下
            dealBodyData(){
                const t = this;
                t.dataBody.map((data,index) => {
                    let tmpData = {};
                    let allWidth = 0;

                    Object.keys(t.fixedHeaderData).map((key) => {
                        let colPreSet = t.fixedHeaderData[key]; 
                        let colData = data[key] || '';
                        let i = colPreSet.index;

                        tmpData[i] = {
                            field: key,
                            rowIndex: index,
                            type: 'body',                                                        
                            paneWidth: colPreSet.paneWidth ,
                            paneHeight: t.bodyPaneHeight * t.ratio,
                            paneCanvas: t.drawPane({
                                index: i,
                                headerLen: colPreSet.headerLen,
                                paneWidth: colPreSet.paneWidth,
                                paneHeight: t.bodyPaneHeight * t.ratio,
                                info: colData
                            })                       
                        }
                        allWidth += colPreSet.paneWidth  
                    })
                    t.fixedBodyData.push(tmpData)
                })
            },

            //============================ 数据处理 end ========================
            
            
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

            //画每行
            drawRow(tableRowData,type,maxWidth){
                const t = this;

                let rowCanvasList = [];
                //google 浏览器canvas的最大宽度为32766px
                let splitLen = 10000                
                //所以我们需要的最小canvas数为
                let minCanNum = parseInt(maxWidth / splitLen) + 1;
                let i;
                //区分group
                for(i = 0 ; i < minCanNum ; i ++){
                    let canvas = document.createElement('canvas');
                    canvas.width = splitLen;
                    canvas.height = type == 'body' ? t.bodyPaneHeight * t.ratio : t.headerPaneHeight * t.ratio;
                    
                    rowCanvasList[i] = {
                        canvas: canvas,
                        start: i * splitLen,
                        end: (i+1) * splitLen,
                        realStart:  (i+1) * splitLen,
                        realEnd: i * splitLen,
                        index: i,
                        splitLen: splitLen
                    }
                }


                let ctxList = {};
                //为了防止新开的一个group的初始x小于0
                let fillX = 0;
                let startX = 0;
                let startY = 0;
                Object.keys(tableRowData).map((key,index) => {
                    let pane = tableRowData[key];
                    let hc = pane.paneCanvas;
                    let x = startX;
                    let y = startY;
                    let w = pane.paneWidth;
                    let h = pane.paneHeight;

                    //属于哪个group
                    let i = parseInt((startX + pane.paneWidth) / splitLen);

                    startX += pane.paneWidth

                    let rowCanvas = rowCanvasList[i];
                    let canvas = rowCanvas.canvas;

                    if(ctxList[i] == undefined){//说明刚建立
                        ctxList[i] = canvas.getContext('2d');
                        //判断初始是小于零
                        let rx = x - rowCanvas.start;
                        rx < 0 && (fillX = Math.abs(rx))
                    }

                    let ctx = ctxList[i]

                    //x需要减去前一个档
                    let rX = x - rowCanvas.start;
                    ctx.drawImage(hc,rX + fillX,y,w,h);

                    //标记realStart & realEnd
                    x < rowCanvas.realStart && (rowCanvas.realStart = x); 
                    (x + pane.paneWidth) > rowCanvas.realEnd && (rowCanvas.realEnd = x + pane.paneWidth);
                })

                return rowCanvasList;
            },

            //============================ 绘制 end ==========================

            render(){
                const t = this;
                let realStartX = 0;

                //main body
                t.bodyCanvasList.map((cList,index) => {
                    cList.map((cObj,i) => {
                        if(i == 0){
                            realStartX = 0
                        } 
                        //the 9 params
                        let c = cObj.canvas;
                        let startX = cObj.realStart - cObj.start;
                        let width = cObj.realEnd - cObj.realStart;
                        let startY = t.startY + (index * t.bodyPaneHeight + t.headerPaneHeight) * t.ratio

                        if(startX > t.canvas.width || startX + width < 0 || width < t.startX + t.canvas.width) return;
                        if (startY > t.canvas.height || startY + t.bodyPaneHeight * t.ratio < 0) return;


                        t.ctx.drawImage(c,
                            0,0,width,c.height,
                            cObj.realStart + t.startX + t.leftMaxWidth, startY ,width,c.height
                        )          
                    })
                })

                //header
                t.headerCanvasList.map((cObj,index) => {
                    if(index == 0){
                        realStartX = 0
                    } 
                    //the 9 params
                    let c = cObj.canvas;
                    let startX = cObj.realStart - cObj.start;
                    let width = cObj.realEnd - cObj.realStart;

                    if(startX > t.canvas.width || startX + width < 0) return;

                    t.ctx.drawImage(c,
                        0,0,width,c.height,
                        cObj.realStart + t.startX + t.leftMaxWidth,0,width,c.height
                    )    
                });

                //渲染index
                t.indexCanvasList.map((cList,index) => {
                     cList.map((cObj,i) => {
                        //the 9 params
                        let c = cObj.canvas;
                        let startX = cObj.realStart - cObj.start;
                        let width = cObj.realEnd - cObj.realStart;
                        let startY = t.startY + (index * t.bodyPaneHeight + t.headerPaneHeight) * t.ratio

                        if (startY > t.canvas.height || startY + t.bodyPaneHeight * t.ratio < 0) return;

                        t.ctx.drawImage(c,
                            0,0,width,c.height,
                            0, startY ,width,c.height
                        )          
                    }) 
                })

                //渲染固定头
                t.fixedCanvasList.map((cObj,index) => {
                    if(index == 0){
                        realStartX = 0
                    } 
                    let c = cObj.canvas;  
                    let width = cObj.realEnd - cObj.realStart;
                                      
                    t.ctx.drawImage(c,
                        0,0,width,c.height,
                        0,0,width,c.height
                    )  
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

