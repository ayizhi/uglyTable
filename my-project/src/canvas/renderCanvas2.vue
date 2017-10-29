<template>
    <canvas :id='id' :width="width" :height="height" :style="{
        border: '1px solid #000',
        width: width + 'px',
        height: height + 'px',
    }"></canvas>
</template>
<script>
import workerConfig from '../assets/js/workerConfig';
import mixinDealData from './mixinDealData';
import mixinEvent from './mixinEvent';
import mixinDrawPane from './mixinDrawPane';
    export default{
        mixins: [mixinDealData,mixinEvent,mixinDrawPane],
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
              
         
               //数据容器
                fixedLeftUpData: {}, //固定不动的data
                fixedHeaderData : {},//重点，经过处理后的header数据
                fixedLeftIndexData: {},//下在x方向上固定的index列
                fixedBodyData: {},//经过处理后的body数据
                bodyDataLen,//body现在数据的长度
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
            //左上
            t.dealLeftHeaderData(t.dataHeaders).then((leftHeaderData) => {
                t.dealLeftBodyData(t.dataBody,leftHeaderData)
            })
            //右上
            t.dealRightHeaderData(t.dataHeaders).then((rightHeaderData) => {
                t.dealRightBodyData(t.dataBody,rightHeaderData)
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
                    t.dealLeftBodyData(dataBody,t.fixedLeftUpData)
                    t.dealRightBodyData(dataBody,t.fixedHeaderData)
                    
                
            }
        },
        methods: {
      
    
        
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