var app = getApp();
Component({

    properties: {
        historyList: { //历史数据
            type: Array,
            value: []
        },
        fontSize : {
            type : Boolean,
            value : false
        }
    },

    data: {
        imgSrc: app.globalData.imgUrl, //图片顶地址
    },

    methods: {
        // 历史学习点击
        historyCilck: function (e) {
            let id = e.currentTarget.dataset.id;
            let url = '/pages/details/details?id=' + id;
            let arr = this.data.historyList;
            arr.forEach(v=>{
                if(v.id == id && v.is_curriculum){
                    if( v.pid){
                        url = "/pages/details/details?id=" + id + '&type=curriculum&curriculum_id=' + v.pid
                    }else{
                        url = "/pages/curriculum/curriculum?id=" + id
                    }
                }
            })
            wx.navigateTo({
              url: url,
            })
        },
        // 历史学习更多点击
        historyMore: function () {
            wx.navigateTo({
                url: '../history-learning/history-learning',
            })
        },
    }
})