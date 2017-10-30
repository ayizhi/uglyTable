export default {
    data(){
        return {
            //拖拽           
            downBorder: 0,
            rightBorder: 0,

            currentX: undefined,
            currentY: undefined,

            currentCell: undefined, 

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
            t.calculateDownBorder();

            document.onmousedown = (e) => {                
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
            }
        },
        
        //获取当前鼠标附在那个cell上
        getCurrentCell(x,y){
            const t = this;
            x = x * t.ratio - t.leftMaxWidth;
            let timer = setTimeout(() => {
                //第几行
                let row = Math.floor(((-t.startY / t.ratio) + y - t.headerPaneHeight) / t.bodyPaneHeight);
                console.log(row)

                //第几列
                if(row < 0) return;
                console.log(t.fixedBodyData[row])
                Object.keys(t.fixedBodyData[row]) && Object.keys(t.fixedBodyData[row]).map((key) => {
                    let cellPa = t.fixedBodyData[row][key];
                    let startX = cellPa.startX;
                    let endX = cellPa.endX;
                    
                    if(x > startX && x < endX){
                        Object.keys(cellPa.children).map((k) => {
                            let cell = cellPa.children[k];
                            let startX = cell.startX;
                            let endX = cell.endX;
                            if(x > startX && x < endX){
                                console.log(key,k)
                            }
                        })
                    }
                })

                clearTimeout(timer)
                
            },1)
    
        }

        //============================ event end ==========================
    }
}