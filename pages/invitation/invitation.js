const app = getApp();
Page({

    data: {
        $api: app.globalData.$api.default,
        is_bootom_paly: false, //底部是否播放
        imgSrc: "", //图片地址
        bannerList: [],
        slected: {}, //选中数据
        is_pup: false, //是不是首页弹窗
        pupImg: "", //首页弹窗图片数据
        day_name: "安", //早安、晚安、午安
    },

    onLoad: function (options) {
        this.setData({
            slected: this.data.bannerList[1]
        })
        if (options.type == 'pup') {
            this.setData({
                is_pup: true,
            })
            let date = new Date;
            let year = date.getFullYear();
            wx.setNavigationBarTitle({
                title: '你好,' + year,
            })
            this.getPopup();
            return;
        }
        this.getCourtesy();
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
    onShareAppMessage: function (res) {
        let title, imageUrl, path;
        let userInfo = wx.getStorageSync('userInfo');
        imageUrl = this.data.slected.share;
        path = '/pages/index/index?scene=share_user=' + userInfo.salt;
        title = !this.data.is_pup ? `${userInfo.nickname}送您7天VIP` : `${userInfo.nickname}给你说${this.data.day_name}`;
        return {
            title: title,
            imageUrl: imageUrl, //这个是分享的图片
            path: path,
        }
    },

    // 获取邀请有礼
    getCourtesy: function () {
        this.data.$api.get({
            url: "api/index/getCourtesy",
            show: true,
        }).then(res => {
            let num = Math.ceil(Math.random() * 1024);
            let json = res.data.data;
            json.forEach(v => {
                v.url = "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/" + v.url + "?id=" + num;
                v.active = 0;
                v.is_complete = 0;
                v.share = "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/" + v.share + "?id=" + num;
                v.share_url = v.share_url + "?id=" + num
            })
            json[1].active = 1;
            this.setData({
                bannerList: json,
                slected: json[1]
            })
        })
    },


    //banner滑动事件
    bannerChange: function (e) {
        let index = e.detail.current;
        let json = this.data.bannerList;
        json.forEach(v => {
            v.active = 0;
        })
        json[index].active = 1;
        this.setData({
            bannerList: json,
            bannerId: index,
            slected: json[index]
        })
    },
    //保存网络图片到相册(主要针对授权的几种不同情况判断)
    addWx() {
        let that = this
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.writePhotosAlbum']) {
                    that.saveImg()
                } else if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            that.setData({
                                tips: "获取权限成功"
                            })
                            that.saveImg()
                        },
                        fail() {
                            wx.showToast({
                                title: '您没有授权，无法保存到相册',
                                icon: 'none'
                            })
                        }
                    })
                } else {
                    wx.openSetting({
                        success(res) {
                            if (res.authSetting['scope.writePhotosAlbum']) {
                                that.saveImg()
                            } else {
                                wx.showToast({
                                    title: '您没有授权，无法保存到相册',
                                    icon: 'none'
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    saveImg() {
        let that = this
        wx.downloadFile({ //下载图片到本地
            url: that.data.slected.share_url,
            success(res) {
                if (res.statusCode === 200) {
                    let img = res.tempFilePath
                    wx.saveImageToPhotosAlbum({ //只支持本地图片所以要先把图片下载下来
                        filePath: img,
                        success(result) {
                            wx.showToast({
                                title: '已保存至相册',
                                icon: "none",
                            })
                        },
                        fail(res) {
                            wx.showToast({
                                title: '保存失败',
                                icon: "none",
                            })
                        }
                    })
                }
            },
            fail: (err) => {
                wx.showToast({
                    title: '保存失败',
                    icon: "none",
                })
            }
        })
    },
    // 请求弹窗数据
    getPopup: function () {
        this.data.$api.get({
            url: "api/index/getPopup",
            data: {
                type: 0,
            }
        }).then(res => {
            let json = res.data.data;
            let select = {};
            select.share_url = json.img
            let num = Math.ceil(Math.random() * 2048);
            json.img = json.img + '?id=' + num;
            this.setData({
                pupImg: json.img,
                slected: select,
                day_name : json.chinese + '安'
            })
        })
        return;
    },
})