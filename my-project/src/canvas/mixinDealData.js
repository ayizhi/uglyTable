export default {
    data(){
        const t = this;

        let defaultPageNumStart = 1;
        

        return {
                 
            //数据容器
            fixedLeftUpData: {}, //固定不动的data
            fixedHeaderData : {},//重点，经过处理后的header数据
            fixedLeftIndexData: {},//下在x方向上固定的index列
            fixedBodyData: {},//经过处理后的body数据

            //loading数据controller
            loadDataController: false,

            
            //默认要提交的数据
            defaultPageNumStart,//page初始化页码
            postData: {
                pageNum: t.defaultPageNumStart
            },
             
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

    async mounted(){
        const t = this;
        await t.initData().then((data) => {})

    },

    methods: {
        //============================ dealData start =====================

        //初始化数据
        initData(){
            const t = this;
            t.fixedLeftUpData = {}; //固定不动的data
            t.fixedHeaderData = {};//重点，经过处理后的header数据
            t.fixedLeftIndexData = {};//下在x方向上固定的index列
            t.fixedBodyData = {};//经过处理后的body数据
            t.bodyDataLen = 0;//body现在数据的长度
            t.postData.pageNum = t.defaultPageNumStart;
            
            return new Promise((resolve) => {
                //ajax
                t.loadingDataAjax().then((data) => {
                    if(!data) return;
                    //setting data
                    let dataHeaders = data.reportHeader;                                    
                    let dataBody = data.reportData;

                    //bodyDataLen
                    t.bodyDataLen = dataBody.length;    
                    
                    if(Object.keys(t.fixedHeaderData).length == 0){ //如果从来没加载过
                        //左上
                        t.dealLeftHeaderData(dataHeaders).then(() => {
                            t.dealLeftBodyData(dataBody,t.fixedLeftUpData)
                        })
                        //右上
                        t.dealRightHeaderData(dataHeaders).then(() => {
                            t.dealRightBodyData(dataBody,t.fixedHeaderData)
                        })
                    }else{
                        t.dealLeftBodyData(dataBody,t.fixedLeftUpData)
                        t.dealRightBodyData(dataBody,t.fixedHeaderData)
                    }

                    resolve(data)
                })
            })
        },


        //加载更多数据
        loadMoreData(info){
            const t = this;
            if(!t.loadMoreController(info)){
                return;
            }

            t.postData.pageNum++;

            return new Promise((resolve) => {
                //ajax     
                t.loadingDataAjax().then((data) => {
                    if(!data) return;

                    let dataHeaders = data.reportHeader;
                    let dataBody = data.reportData;

                    //bodyDataLen                    
                    let bodyDataLen = dataBody.length;
                    t.bodyDataLen += bodyDataLen;
                    

                    t.dealLeftBodyData(dataBody,t.fixedLeftUpData)
                    t.dealRightBodyData(dataBody,t.fixedHeaderData)
                    
                    resolve(data)
                })   
            })            
        },


        //加载数据的ajax
        loadingDataAjax(){
            const t = this;
            let postData = t.postData;

            if(t.loadDataController) return new Promise((resolve) => {resolve(false)});
            t.loadDataController = true;
            return new Promise((resolve) => {
                t.$http({
                    url: t.url,
                    data: postData,
                    method: 'GET'
                }).then((res) => {
                    t.loadDataController = false;
                    let reply = res.data.data
                    resolve(reply)
                })
			})
		},



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
                            t.calculateDownBorder();                            
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

                        if(key  == dataBody.length - 1){
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