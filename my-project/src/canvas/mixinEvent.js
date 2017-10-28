export default {
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

    }
}