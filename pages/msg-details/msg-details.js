const app = getApp()
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        id: 0,
        msgData: {},
        is_bootom_paly: false, //底部是否播放
    },

    onLoad: function (options) {
        this.setData({
            id: options.id
        })
        this.getMessageId();
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
    getMessageId: function () {
        this.data.$api.get({
            url: "api/user/getMessageId",
            data: {
                id: this.data.id
            },
            show: true
        }).then(res => {
            this.setData({
                msgData: res.data.data
            })
        })
    }
})