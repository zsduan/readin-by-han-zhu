const app = getApp()
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        latelyList: [], //最近学习  
        current: 0, //当前滑块
        bookList: [], //书籍列表
        is_bootom_paly: false, //底部是否播放
        is_stop: false, //是否停止
        page: 1, //页码
        bottom_tips: "下拉加载更多~", //底部提示

    },
    onLoad: function (options) {
        this.getRecent();
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
    // 上拉加载
    onReachBottom: function () {
        if (!this.data.is_stop) {
            let page = this.data.page;
            page += 1;
            this.setData({
                page: page
            })
            this.getRecent();
        }
    },

    // 改变banner
    changeBanner: function (e) {
        let current = e.detail.current;
        let v = this.data.latelyList;
        v.forEach(res => {
            res.active = 0;
        })
        v[current].active = 1;
        this.setData({
            latelyList: v,
            current: current
        })
    },
    // 获取我的历史记录
    getRecent: function () {
        this.data.$api.get({
            url: "api/user/getRecent",
            data: {
                page: this.data.page
            },
            show: true
        }).then(res => {
            let arr = res.data.data;
            let latelyList = this.data.latelyList;
            let bookList = this.data.bookList;
            if (!arr.length) {
                this.setData({
                    is_stop: true,
                    bottom_tips: "没有更多数据了~"
                })
                return;
            }
            arr.forEach(v => {
                v.active = 0;
                let num = v.progress / v.length;
                v.listening = this.is_ten_thousand(v.listening); 
                if (num > 1) {
                    num = 1;
                }
                v.long = (num * 292).toFixed(2) + 'rpx';
                v.circle = (num * 100).toFixed(0);
                if (v.frequency) {
                    v.long = "292rpx"
                }
            })
            arr[0].active = 1;
            if (this.data.page == 1) {
                if (arr.length < 3) {
                    this.setData({
                        bookList: arr
                    })
                    return;
                }
                for (let i = 0; i < 3; i++) {
                    latelyList.push(arr[i])
                }
                for (let i = 2; i < arr.length; i++) {
                    bookList.push(arr[i])
                }
                this.setData({
                    latelyList: latelyList,
                    bookList: bookList
                })
                return;
            }
            bookList.push(...arr);
            this.setData({
                bookList: bookList
            })
        })
    },
    // 点击顶部banner
    swiperCilck: function (e) {
        let id = e.currentTarget.dataset.id;
        let url = '../details/details?id=' + id;
        let arr = this.data.latelyList;
        arr.forEach(v => {
            if (v.id == id && v.is_curriculum) {
                if (v.pid) {
                    url = "/pages/details/details?id=" + id + '&type=curriculum&curriculum_id=' + v.pid
                } else {
                    url = "/pages/curriculum/curriculum?id=" + id
                }
            }
        })
        wx.navigateTo({
            url: url,
        })
    },
    // 是否超过1w
    is_ten_thousand(num) {
        if (num > 10000) {
            num = (num / 10000).toFixed(2) + "万"
        }
        return num;
    }
})