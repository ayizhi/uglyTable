export default {
    methods: {
        //============================ dealData start =====================

        //处理左下数据（主要index数据）
        dealLeftBodyData(dataBody,leftHeaderData){
            const t = this;
            //左下分片
            let splitLen = Math.ceil(t.height / t.bodyPaneHeight) * 10;
            let splitNum = Math.ceil(dataBody.length / splitLen);
            let len = Object.keys(t.fixedLeftIndexData).length;

            for(let i = 0 ; i < splitNum ; i++){
                let currentData = dataBody.slice(i * splitLen , (i + 1) * splitLen);
                t.worker.postMessage('dealIndexData',[currentData,leftHeaderData.fixedLeftUpData,t.bodyOptions,i * splitLen])
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
                
                t.worker.postMessage('dealBodyData',[currentData,rightHeaderData.fixedHeaderData,t.bodyOptions,i * splitLen])
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