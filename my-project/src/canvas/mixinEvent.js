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
            //鼠标当前坐标
            let canvasLeft = t.canvas.offsetLeft;
            let canvasTop = t.canvas.offsetTop;

            //底边界
            t.calculateDownBorder();

            t.canvas.onmousedown = (e) => {                
                draging = true;
                dragStartY = e.clientY;
                dragStartX = e.clientX;
                t.mouseDown = true;
            }

            t.canvas.onmousemove = (e) => {
                t.currentX = e.offsetX;
                t.currentY = e.offsetY;

                //得到当前鼠标落在body得哪个格子里
                t.getCurrentCell(t.currentX,t.currentY)
                
                if(!draging) return

                //真对Y
                dragStartY = t.dealMouseMoveY(e,dragStartY);
            
                //针对x
                dragStartX = t.dealMouseMoveX(e,dragStartX);
            }

            t.canvas.onmouseup = (e) => {
                draging = false;     
                t.mouseDown = false;      
            }

            t.canvas.onmouseleave = function(e){
                draging = false;                     
                t.currentX = undefined;
                t.currentY = undefined;
                t.currentBodyCell = undefined;
            }
        },

        dealMouseMoveX(e,dragStartX){
            const t = this;            
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

            return dragStartX
        },

        dealMouseMoveY(e,dragStartY){
            const t = this;
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

                //滚到最下面
                if(t.startY < t.downBorder){
                    t.startY = t.downBorder;
                }   
            }

            return dragStartY
        },
 

        //============================ event end ==========================
    }
}














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