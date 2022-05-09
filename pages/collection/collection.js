const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        bookList: [], //书籍列表
        is_bootom_paly: false, //底部是否播放
        
    },

    onLoad: function (options) {
        this.getCollect();
    },
    //监听背景音乐
    onShow: function () {
        var bgMusic = wx.getBackgroundAudioManager();
        if (bgMusic.paused == false) {
            this.setData({ 
                is_bootom_paly: true
            })
        }else{
            this.setData({
                is_bootom_paly: false
            })
        }
    },
    // 请求收藏数据
    getCollect: function () {
        this.data.$api.get({
            url: "api/user/getCollect",
            show: true
        }).then(res => {
            this.setData({
                bookList: res.data.data
            })
        })
    }
})