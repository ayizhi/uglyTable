export default {

    methods: {

        //计算底部边界
        calculateDownBorder(){
            const t = this;
            t.downBorder = (-(Object.keys(t.fixedLeftIndexData).length) * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio          
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
        }
    }
}