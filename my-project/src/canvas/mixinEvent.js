export default {
    data(){
        return {
            //拖拽           
            downBorder: 0,
            rightBorder: 0,

            currentX: undefined,
            currentY: undefined,

            //鼠标当前的cell，body
            currentBodyCell: undefined, 

            mouseDown: false,//检测鼠标是否拖动

        }
    },
    methods: {
        //============================ event start ========================
        bindEvent(){
            const t = this;
            let draging = false;
            let dragStartY = 0;
            let dragStartX = 0;
            let canvas = document.querySelector('#' + t.id);
            let distYs = [];

            //底边界
            t.calculateDownBorder();

            document.onmousedown = (e) => {                
                draging = true;
                dragStartY = e.clientY;
                dragStartX = e.clientX;
                t.mouseDown = true;
                distYs = [];
            }

            document.onmousemove = (e) => {
                
                if(!draging) return

                //针对y
                if(t.startY > 0) {
                    t.startY = 0;
                }else{
                    let distY = e.clientY - dragStartY;
                    let tmpY = t.startY + distY;
                    if(tmpY <= 0){
                        t.startY = tmpY
                        dragStartY = e.clientY

                        //上下滚动
                        let info = {
                            y: t.startY,
                            downBorder: t.downBorder,
                            ratio: t.ratio,
                            bodyPaneHeight: t.bodyPaneHeight,
                            dataLength: t.bodyDataLen
                        }


                        t.loadMoreData(info)
                    };

                    distYs.push(distY)                    


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
                t.mouseDown = false;      
                
                // //对y轴进行鼠标抬起后的延迟
                // // console.log(distYs,t.startY)
                // let yLen = distYs.length;
                // if(yLen < 10){
                //     let distY = distYs[yLen - 1];
                //     let step = 50;
                //     let timer = setInterval(() => {
                //         if(distY < 0){
                //             t.startY -= step;
                //         }else if(distY > 0){
                //             t.startY += step;
                //         }else{
                //             clearInterval(timer);
                //             distYs = [];                            
                //         }
                //         step -= 7;
                //         if(step <= 0){
                //             clearInterval(timer);
                //             distYs = [];                                                        
                //         }                        
                //     },1)
                // }
            }



            //鼠标当前坐标
            let canvasLeft = t.canvas.offsetLeft;
            let canvasTop = t.canvas.offsetTop;
            t.canvas.onmousemove = function(e){
 
                t.currentX = e.offsetX;
                t.currentY = e.offsetY;

                t.getCurrentCell(t.currentX,t.currentY)

            }
            t.canvas.onmouseleave = function(e){
                t.currentX = undefined;
                t.currentY = undefined;
                t.currentBodyCell = undefined;
            }
        },
        
        //获取当前鼠标附在那个cell上
        getCurrentCell(x,y){
            const t = this;            
            //如果正在拖动／滚动 ，则不计算
            if(t.mouseDown) return;
            let col,row;
            x = x * t.ratio + -t.startX - t.leftMaxWidth;
            let timer = setTimeout(() => {
                //第几行
                row = Math.floor(((-t.startY / t.ratio) + y - t.headerPaneHeight) / t.bodyPaneHeight);

                //第几列
                if(row < 0) return;
                t.fixedBodyData[row] && Object.keys(t.fixedBodyData[row]).map((key) => {
                    let cellPa = t.fixedBodyData[row][key];
                    let startX = cellPa.startX;
                    let endX = cellPa.endX;
                    
                    if(x >= startX && x < endX){
                        Object.keys(cellPa.children).map((k) => {
                            let cell = cellPa.children[k];
                            let cellStartX = cell.startX;
                            let cellEndX = cell.endX;

                            if(x >= cellStartX && x < cellEndX){
                                col = cell.field;
                            }
                        })
                    }
                })

                t.currentBodyCell = {
                    row,
                    col,
                    event: 'hover'
                } 
                clearTimeout(timer)
            },1)

            // let info = {
            //     x,
            //     y,
            //     ratio: t.ratio,
            //     startX: t.startX,
            //     startY: t.startY,
            //     headerPaneHeight: t.headerPaneHeight,
            //     bodyPaneHeight: t.bodyPaneHeight,
            //     leftMaxWidth: t.leftMaxWidth,
            //     fixedBodyData: t.fixedBodyData
            // }

            // setTimeout(() => {
            //     t.worker.postMessage('getCurrentCell',[info]).then((data) => {
            //         console.log(data,'==')
            //     })
            // },1)
        }

        //============================ event end ==========================
    }
}