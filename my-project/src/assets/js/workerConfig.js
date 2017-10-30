

let workerConfig = [

    //移动鼠标的时候，获取当前cell
    //todo: 这个效率反而慢，为啥
    {
        message: 'getCurrentCell',
        func(info){
            let row,col;
            let x = info.x,
                y = info.y,
                ratio = info.ratio,
                startX = info.startX,
                startY = info.startY,
                headerPaneHeight = info.headerPaneHeight,
                bodyPaneHeight = info.bodyPaneHeight,
                leftMaxWidth = info.leftMaxWidth,
                fixedBodyData = info.fixedBodyData;
            
            x = x * ratio + -startX - leftMaxWidth;

            

            //第几行
            row = Math.floor(((-startY / ratio) + y - headerPaneHeight) / bodyPaneHeight);
            //第几列
            let key;
            if(fixedBodyData[row]){
                for(key in fixedBodyData[row]){
                    let cellPa = fixedBodyData[row][key];
                    let startX = cellPa.startX;
                    let endX = cellPa.endX;
                    
                    if(x > startX && x < endX){
                        let k;
                        for(k in cellPa.children){
                            let cell = cellPa.children[k];
                            let startX = cell.startX;
                            let endX = cell.endX;
                            if(x > startX && x < endX){
                                col = k;
                            }
                        }
                    }
                }
            }
            return {row,col}   
        }
    },

    //处理左上数据
    {
        message: 'dealFixedData',
        func(dataHeaders,options){
            //options
            let fixedColumnsLeft = options.fixedColumnsLeft;
            let ratio = options.ratio;
            let headerPaneHeight = options.headerPaneHeight;

            //tmplist
            let fixedList = [{
                field: 'table_index',
                fieldName: '',
            }];

            //predeal
            if(fixedColumnsLeft != 0){
                dataHeaders.slice(0, fixedColumnsLeft).map((d) => {
                    fixedList.push(d)
                })
            };

            //总长度，主要是画canvas时计算
            let headerLen = fixedList.length;
            let selfStartX = 0;
            let selfStartY = 0;

            //main
            let fixedLeftUpData = {};

            //header长度的配置
            let headerLengthConfig = {
                table_index: 2,
                gender: 2,
                name: 4,
                idcode: 6,
                mobile: 4,
            }

            fixedList.map((fixedItem,index) => {
                let field = fixedItem.field;
                let fieldName = fixedItem.fieldName;
                let paneWidth = headerLengthConfig[field] * 30 || fieldName.length * 30;
                let dataType = fixedItem.dataType;
                let isFixed = fixedItem.isFixed;

                //position
                let startX = selfStartX;
                let endX = selfStartX + paneWidth * ratio;
                let startY = selfStartY;
                let endY = startY + headerPaneHeight * ratio;

                fixedLeftUpData[field] = {
                    field: field,                        
                    index: index,
                    type: 'header', 
                    startX,
                    endX,
                    startY,
                    endY,
                    headerLen: headerLen,                                            
                    paneWidth: paneWidth * ratio ,
                    paneHeight: headerPaneHeight * ratio,
                    info: fieldName
                };

                //reset startX
                selfStartX = endX;                            
            }) 

            return {
                fixedLeftUpData,
                width: selfStartX
            }
        },
    },

    //画右上（header）
    {
        message: 'dealHeaderData',
        func(dataHeaders,options){
            //options
            let fixedColumnsLeft = options.fixedColumnsLeft;
            let ratio = options.ratio;
            let headerPaneHeight = options.headerPaneHeight;

            //tmp
            let currentHeaders = dataHeaders.slice(fixedColumnsLeft);

            //处理后的数据
            let headerLen = currentHeaders.length;
            let selfStartX = 0;
            let selfStartY = 0;

            //main
            let fixedHeaderData = {};
    
            //header长度的配置
            let headerLengthConfig = {
                table_index: 2,
                gender: 2,
                name: 4,
                idcode: 6,                
                mobile: 4,
            }

            //表头
            currentHeaders.map((header,index) => {
                let field = header.field;
                let fieldName = header.fieldName;
                let paneWidth = headerLengthConfig[field] * 30 || fieldName.length * 30;                
                let dataType = header.dataType;
                let isFixed = header.isFixed; //todo ??                

                //position
                let startX = selfStartX;
                let endX = selfStartX + paneWidth * ratio;
                let startY = selfStartY;
                let endY = startY + headerPaneHeight * ratio;

                fixedHeaderData[field] = {
                    index: index,
                    field: field,                                                
                    type: 'header', 
                    startX,
                    endX,
                    startY,
                    endY,
                    headerLen: headerLen,                                              
                    paneWidth: paneWidth * ratio ,
                    paneHeight: headerPaneHeight * ratio,
                    info: fieldName
                };

                //reset startX                
                selfStartX = endX;  
            })

            return {
                fixedHeaderData,
                width: selfStartX                
            }      
        }
    },

    //左下
    {
        message: 'dealIndexData',
        func(dataBody,fixedLeftUpData,options,startIndex){
            //options
            let ratio = options.ratio;
            let bodyPaneHeight = options.bodyPaneHeight;

            //position
            let selfStartX = 0;
            let selfStartY = 0;
            
            //main
            let fixedLeftIndexData = {};

            dataBody.map((data,index) => {           
                let tmpData = {};
                let key;

                selfStartX = 0;
                selfStartY = startIndex * bodyPaneHeight * ratio;                
    
                for(key in fixedLeftUpData){
                    let colPreSet = fixedLeftUpData[key];
                    let colData = data[key] || '';
                    let i = colPreSet.index;
                    let paneWidth = colPreSet.paneWidth;
                    let headerLen = colPreSet.headerLen;
                    
                    //position
                    let startX = selfStartX;
                    let endX = selfStartX + paneWidth;
                    let startY = selfStartY;
                    let endY = startY + bodyPaneHeight * ratio;
                    
                    tmpData[i] = {
                        rowIndex: startIndex,                        
                        field: key,
                        type: 'body',  
                        startX,
                        endX,
                        startY,
                        endY,
                        index: i,   
                        headerLen: headerLen,                                                                  
                        paneWidth: paneWidth,
                        paneHeight: bodyPaneHeight * ratio,
                        info: key == 'table_index' ? startIndex + 1 : colData                     
                    }
            
                    //reset selfStartX
                    selfStartX = endX;
                }
                fixedLeftIndexData[startIndex] = tmpData;
                startIndex++
            })

            return {
                fixedLeftIndexData
            }
        }
    },
   //右下（main）
   {
        message: 'dealBodyData',
        func(dataBody,fixedHeaderData,options,startIndex){
            //options
            let ratio = options.ratio;
            let bodyPaneHeight = options.bodyPaneHeight;

            //position
            let selfStartX = 0;
            let selfStartY = 0;

            //main
            let fixedBodyData = {}

            //分片
            dataBody.map((data,index) => {
                let tmpData = {};
                let key;

                selfStartX = 0;
                selfStartY = startIndex * bodyPaneHeight * ratio;


                for(key in fixedHeaderData){
                    let colPreSet = fixedHeaderData[key]; 
                    let colData = data[key] || '';
                    let i = colPreSet.index;
                    let paneWidth = colPreSet.paneWidth;
                    let headerLen = colPreSet.headerLen; 
                    
                    
                    //position
                    let startX = selfStartX;
                    let endX = selfStartX + paneWidth;
                    let startY = selfStartY;
                    let endY = startY + bodyPaneHeight * ratio;

                    //分片,10项为一片
                    let partLen = 7;
                    let partIndex = parseInt(i / partLen);
                    
                    tmpData[partIndex] = tmpData[partIndex] == undefined ? {} : tmpData[partIndex];
                    if(i % partLen === 0){
                        tmpData[partIndex].startX = startX;                   
                    }else{
                        tmpData[partIndex].endX = (endX > (tmpData[partIndex].endX || 0) ) 
                        ? endX
                        : tmpData[partIndex].endX
                    };
                      
                    tmpData[partIndex].children = tmpData[partIndex].children == undefined ? {} : tmpData[partIndex].children;                                     
                    tmpData[partIndex].children[i] = {
                        rowIndex: startIndex,                        
                        field: key,
                        type: 'body',  
                        startX,
                        endX,
                        startY,
                        endY, 
                        index: i,    
                        headerLen: headerLen,                                                              
                        paneWidth: paneWidth ,
                        paneHeight: bodyPaneHeight * ratio,
                        info: colData                    
                    }
                    //reset selfStartX
                    selfStartX = endX;
                }
                fixedBodyData[startIndex] = tmpData;
                startIndex++
            })

            return {
                fixedBodyData: fixedBodyData
            }
        }
    },
]
export default workerConfig