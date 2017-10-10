//处理左上固定块数据
/**
 * options
 * @params
 * fixedColumnsLeft
 * ratio
 * headerPaneHeight
 * **/
export const dealFixedData = (dataHeaders,options) => {
    //options
    let fixedColumnsLeft = options.fixedColumnsLeft;
    let ratio = options.ratio;
    let headerPaneHeight = options.headerPaneHeight;

    //tmplist
    let fixedList = [{
        field: 'table_index',
        fieldName: '',
    }];

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

    fixedList.map((fixedItem,index) => {
        let field = fixedItem.field;
        let fieldName = fixedItem.fieldName;
        let paneWidth = fieldName.length * 30;
        let dataType = fixedItem.dataType;
        let isFixed = fixedItem.isFixed;

        //开头的空格
        if(field == 'table_index' && fieldName == ''){
            let paneWidth =  30 * 2;
            fixedLeftUpData[field] = {
                field: field,
                index: index,
                type: 'header',  
                headerLen: headerLen,                                                                              
                paneWidth: paneWidth * ratio,
                paneHeight: headerPaneHeight * ratio,
                info: fieldName
            };
            
            selfStartX += paneWidth * ratio;                            
            return;        
        }


        fixedLeftUpData[field] = {
            field: field,                        
            index: index,
            type: 'header',    
            headerLen: headerLen,                                            
            paneWidth: paneWidth * ratio ,
            paneHeight: headerPaneHeight * ratio,
            info: fieldName
        };
        selfStartX += paneWidth * ratio;                            
    }) 
    
    return {
        fixedLeftUpData,
        selfStartX
    }
};

//处理表头，也就是右上的数据
export const dealHeaderData = (dataHeaders,options) => {
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

    //表头
    currentHeaders.map((header,index) => {
        let field = header.field;
        let fieldName = header.fieldName;
        let paneWidth = fieldName.length * 30;
        let dataType = header.dataType;
        let isFixed = header.isFixed
        fixedHeaderData[field] = {
            index: index,
            field: field,                                                
            type: 'header',  
            headerLen: headerLen,                                              
            paneWidth: paneWidth * ratio ,
            paneHeight: headerPaneHeight * ratio,
            info: fieldName
        };
        selfStartX += paneWidth * ratio;  
    })

    return {
        selfStartX,
        fixedHeaderData
    }

};

//画左下
/**
 * options
 * @params
 * ratio
 * bodyPaneHeight
 * **/
export const dealIndexData = (dataBody,fixedLeftUpData,options) => {
    //options
    let ratio = options.ratio;
    let bodyPaneHeight = options.bodyPaneHeight;
    
    //main
    let fixedLeftIndexData = [];

    dataBody.map((data,index) => {
        let tmpData = {};
        Object.keys(fixedLeftUpData).map((key) => {
            let colPreSet = fixedLeftUpData[key];
            let colData = data[key] || '';
            let i = colPreSet.index;
            tmpData[i] = {
                field: key,
                rowIndex: index,
                type: 'body',  
                index: i,                                                                                  
                paneWidth: colPreSet.paneWidth ,
                paneHeight: bodyPaneHeight * ratio,
                info: key == 'table_index' ? index + 1 : colData                     
            }
        })
        fixedLeftIndexData.push(tmpData)
    })

    return {
        fixedLeftIndexData
    }
};

//画右下
export const dealBodyData = (dataBody,fixedHeaderData,options) =>{
    //options
    let ratio = options.ratio;
    let bodyPaneHeight = options.bodyPaneHeight;

    //main
    let fixedBodyData = []
    
    dataBody.map((data,index) => {
        let tmpData = {};
        let allWidth = 0;

        Object.keys(fixedHeaderData).map((key) => {
            let colPreSet = fixedHeaderData[key]; 
            let colData = data[key] || '';
            let i = colPreSet.index;

            tmpData[i] = {
                field: key,
                rowIndex: index,
                type: 'body',   
                index: i,                                                                                 
                paneWidth: colPreSet.paneWidth ,
                paneHeight: bodyPaneHeight * ratio,
                info: colData                    
            }
            allWidth += colPreSet.paneWidth  
        })
        fixedBodyData.push(tmpData)
    })

    return {
        fixedBodyData
    }
};