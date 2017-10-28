export default {
    data(){
        const t = this;
        return {
            //webworker计算body的时候需要的配置
            bodyOptions: {
                ratio: t.ratio,
                bodyPaneHeight: t.bodyPaneHeight
            },

            //webworker计算header的时候需要的配置
            headerOptions: {
                fixedColumnsLeft: t.fixedColumnsLeft,
                ratio: t.ratio,
                headerPaneHeight: t.headerPaneHeight
            }
        }
    },

    methods: {
        //============================ dealData start =====================

        //处理左上数据
        dealLeftHeaderData(dataHeaders){
            const t = this;
            return new Promise((resolve) => {
                t.worker.postMessage('dealFixedData',[dataHeaders,t.headerOptions])
                .then((leftHeaderData) => {
                    console.log(leftHeaderData,'---')
                    t.fixedLeftUpData = leftHeaderData.fixedLeftUpData;
                    t.leftMaxWidth = leftHeaderData.width;
                    resolve(t.fixedLeftUpData)
                })
            })
        },

        //处理右上数据
        dealRightHeaderData(dataHeaders){
            const t = this;            
            return new Promise((resolve) => {
                t.worker.postMessage('dealHeaderData',[dataHeaders,t.headerOptions])
                .then((rightHeaderData) => {
                    console.log(rightHeaderData,'===')                
                    t.fixedHeaderData = rightHeaderData.fixedHeaderData;
                    t.rightMaxWidth = rightHeaderData.width;
                    resolve(t.fixedHeaderData)
                })
            })
        },

        //处理左下数据（主要index数据）
        dealLeftBodyData(dataBody,leftHeaderData){
            const t = this;
            //左下分片
            let splitLen = Math.ceil(t.height / t.bodyPaneHeight) * 10;
            let splitNum = Math.ceil(dataBody.length / splitLen);
            let len = Object.keys(t.fixedLeftIndexData).length;

            for(let i = 0 ; i < splitNum ; i++){
                let currentData = dataBody.slice(i * splitLen , (i + 1) * splitLen);
                t.worker.postMessage('dealIndexData',[currentData,leftHeaderData,t.bodyOptions,i * splitLen])
                .then((leftBodyData) => {
                    for(let key in leftBodyData.fixedLeftIndexData){
                        t.fixedLeftIndexData[+key + +len] = leftBodyData.fixedLeftIndexData[key]
                        if(key  == dataBody.length - 1){
                            //更新右边边界
                            console.log(t.fixedLeftIndexData,'---|---');            
                            t.downBorder = (-(Object.keys(t.fixedLeftIndexData).length) * t.bodyPaneHeight - t.headerPaneHeight) * t.ratio + t.height * t.ratio
                        }
                    }
                })
            }
        },

        //处理右下数据（主体数据）
        dealRightBodyData(dataBody,rightHeaderData){
            const t = this;

            //对t.dataBody分片，整体渲染太慢，切成20(屏幕最大显示数)个一片
            //对fixedBodyData采取类数组对象的方式
            let splitLen = Math.ceil(t.height / t.bodyPaneHeight) * 10;
            let splitNum = Math.ceil(dataBody.length / splitLen);
            let len = Object.keys(t.fixedLeftIndexData).length;

            for(let i = 0 ; i < splitNum ; i++){
                let currentData = dataBody.slice(i * splitLen , (i + 1) * splitLen);
                
                t.worker.postMessage('dealBodyData',[currentData,rightHeaderData,t.bodyOptions,i * splitLen])
                .then((rightBodyData) => {
            
                    for(let key in rightBodyData.fixedBodyData){
                        t.fixedBodyData[+key + +len] = rightBodyData.fixedBodyData[key]

                        if(key  == t.dataBody.length - 1){
                            //更新右边边界
                            console.log(t.fixedBodyData,'===|===');            
                        }
                    }
                })
            }
        },

        //============================ dealData end =======================
        

    }
}