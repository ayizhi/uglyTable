import base from './base';

let VerticalLine = base.VerticalLine;
let AcrossLine = base.AcrossLine;


export default {
    data(){
        return {
            //cell canvas cache
            headerCanvasCache: {},
            bodyCanvasCache: {},
            bodyCanvasBgCache: {},
            bodyCanvasTextCache: {},

            //============= event related cache start ===================
            bodyHoverCanvasBgCache: {},
            bodyHoverCanvasTextCache: {},
            //============= event related cache end ===================

            acrossLine: new AcrossLine({width: 100}).canvas,
            verticalLine: new VerticalLine({height: 100}).canvas,

        }
    },
    methods: {
        
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
            let headerLen = obj.headerLen;
            let startX = obj.startX;
            let endX = obj.endX;
            let startY = obj.startY;
            let endY = obj.endY;
            

            //body单元格cache
            t.bodyCanvasCache[rowIndex] = t.bodyCanvasCache[rowIndex] || {};
            t.bodyCanvasTextCache[rowIndex] = t.bodyCanvasTextCache[rowIndex] || {};
            
            // let currentRowIndex,currentCol,currentCellEvent;
            // if(t.currentBodyCell){
            //     currentRowIndex = t.currentBodyCell.row;
            //     currentCol = t.currentBodyCell.col;
            //     currentCellEvent = t.currentBodyCell.event;
            // }
            
            // if(currentRowIndex == rowIndex && field == currentCol){
            //     if(currentCellEvent == 'hover'){

            //     }
            // };

            if(t.bodyCanvasCache[rowIndex][field] == undefined){
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                canvas.width = tWidth;
                canvas.height = tHeight;

                (async() => {
                    //背景缓存
                    await t.drawBodyBgCacheCanvas(field,tWidth,tHeight,index,headerLen).then((cellBgCanvas) => {
                        ctx.drawImage(cellBgCanvas,0,0)
                    })

                    //字体缓存
                    await t.drawBodyTextCacheCanvas(field,tWidth,tHeight,rowIndex,info,type).then((cellTextCanvas) => {
                        if(!cellTextCanvas) return;
                        ctx.drawImage(cellTextCanvas,0,0)                    
                    })
                })()
               
            


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

        drawBodyBgCacheCanvas(field,tWidth,tHeight,index,headerLen){
            return new Promise((resolve) => {

                const t = this;
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
                    if(index == headerLen - 1){                 
                        bgCtx.drawImage(t.verticalLine,
                        tWidth - 1,
                        0,
                        1,
                        tHeight)
                    }

                    t.bodyCanvasBgCache[field] = bgCanvas
                }
                
                let cellBgCanvas = t.bodyCanvasBgCache[field];  
                resolve(cellBgCanvas)
            })
        },

        drawBodyTextCacheCanvas(field,tWidth,tHeight,rowIndex,info,type){
            const t = this;
          
          
            return new Promise((resolve) => {
                if(t.bodyCanvasTextCache[rowIndex][field] == undefined && info != ''){
                    
                    let textCanvas = document.createElement('canvas');
                    let textCtx = textCanvas.getContext('2d');
                    textCanvas.width = tWidth;
                    textCanvas.height = tHeight;

                    //text default color
                    textCtx.font = t.fontSize * t.ratio + 'px Arif';
                    if(type == 'header'){
                        textCtx.fillStyle = '#9e9ea6';
                    }else{
                        textCtx.fillStyle = '#555459';
                    }

                    textCtx.textAlign = t.textAglin;    //start, end, left, right or center
                    textCtx.textBaseline = 'middle';
                    if(t.textAglin == 'center'){
                        textCtx.fillText(info,tWidth/2,tHeight/2)
                    }else if(t.textAglin == 'left'){
                        textCtx.fillText(info,t.padding,tHeight/2)                   
                    }

                    t.bodyCanvasTextCache[rowIndex][field] = textCanvas
                }

                if(info != ''){
                    let cellTextCanvas = t.bodyCanvasTextCache[rowIndex][field];
                    resolve((cellTextCanvas))
                    return;
                }
                resolve()
            })
        }



        //============================ 绘制 end ==========================

    }
}