const app = getApp();
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        moenyList: [], //消费记录列表
        is_bootom_paly: false, //底部是否播放
        page: 1, //当前页码
        is_stop: false, //是否停止加载
    },

    onLoad: function (options) {
        this.getOrder();
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        this.setData({
            is_stop: false,
            page: 1,
            moenyList: []
        })
        this.getOrder();
    },
    // 触底加载
    onReachBottom: function () {
        if (!this.data.is_stop) {
            let page = this.data.page;
            page += 1;
            this.setData({
                page: page
            })
            this.getOrder();
        }
    },
    //监听背景音乐
    onShow: function () {
        var bgMusic = wx.getBackgroundAudioManager();
        if (bgMusic.paused == false) {
            this.setData({
                is_bootom_paly: true
            })
        } else {
            this.setData({
                is_bootom_paly: false
            })
        }
    },
    // 获取消费记录
    getOrder: function () {
        wx.showLoading({
            title: "数据缓慢请等待",
        })
        this.data.$api.get({
            url: "api/user/getOrder",
            data: {
                page: this.data.page
            }
        }).then(res => {
            let v = res.data.data;
            wx.stopPullDownRefresh();
            if (!v.length) {
                wx.showToast({
                    title: '没有更多数据了',
                    mask: true,
                    icon: "none"
                })
                this.setData({
                    is_stop: 1
                })
                return;
            }
            let moenyList = this.data.moenyList;
            moenyList.push(...v);
            if (res.data.data) {
                this.setData({
                    moenyList: moenyList
                })
            }
        })
    },

})