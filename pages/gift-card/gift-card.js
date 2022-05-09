const app = getApp();
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        $pay: app.globalData.$pay, //支付
        list_height: 0,
        bannerList: [], //banner数据
        navList: [{
                id: "",
                name: "我购买的",
                active: 1
            },
            {
                id: "",
                name: "我收到的",
                active: 0
            },
        ], //nav
        shopList: [], //购买列表
        bannerId: 1, //当前banner的id
        is_pay: true, // 是否是购买的
        share_id: 0, //分享
        share_user: "",
        is_bootom_paly: false, //底部是否播放
        is_ios: false, //是否为苹果手机
    },
    onLoad: function (options) {
        let userInfo = wx.getStorageSync('userInfo');
        let salt = wx.getStorageSync('salt');
        if (salt) {
            this.setData({
                share_user: salt
            })
        }
        if (options.share_id) {
            wx.setStorageSync('share_user', options.share_user);
            if (!userInfo.id) {
                wx.setStorageSync('share', options);
                wx.reLaunch({
                    url: '/page-two/login/login?share_card=true',
                })
                return;
            }
            this.data.$api.get({
                url: "api/user/setBuyCard",
                data: {
                    user_id: userInfo.id,
                    id: options.share_id
                }
            }).then(res => {
                this.changeTop(1);
            })

        }

        wx.getSystemInfo({
            success: (result) => {
                let reg = new RegExp('iOS');
                if (result.system.match(reg)) {
                    this.setData({
                        is_ios: true
                    })
                }
            },
        })
        this.getCard();
    },
    onPullDownRefresh: function () {
        if (this.data.navList[0].active) {
            this.getBuyCard();
        } else {
            this.getUserCard();
        }
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
    onShareAppMessage: function (res) {
        let title, imageUrl, path;
        let userInfo = wx.getStorageSync('userInfo')
        if (res.from === 'button') {
            title = `${userInfo.nickname}送你一张畅听卡`,
                imageUrl = "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/images/5/2021/04/693a07fff21fafe01b60926a9d9bfda6.png";
            path = '/pages/gift-card/gift-card?share_id=' + res.target.dataset.id + '&share_user=' + this.data.share_user;
        }
        return {
            title: title,
            imageUrl: imageUrl, //这个是分享的图片
            path: path,
        }
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
            bannerId: index
        })
    },
    // 计算高度，当高度没有达到相应高度的时候进行高度补充
    getHeight: function () {
        let sycHeight = "";
        wx.getSystemInfo({
            success: (result) => {
                sycHeight = result.screenHeight;
            },
        });
        let query = wx.createSelectorQuery();
        query.select(".content").boundingClientRect(rect => {
            let height = rect.height;
            if (height < sycHeight - 395) {
                this.setData({
                    list_height: sycHeight - 395
                })
            }
        }).exec();
    },
    // 改变顶部
    changeTop: function (e) {
        let index = "";
        if (e.currentTarget) {
            index = e.currentTarget.dataset.index;
        } else {

        }
        let arr = this.data.navList;
        if (arr[index].active) {
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].active) {
                arr[i].active = 0;
                break;
            }
        }
        arr[index].active = 1;
        let is_pay = true;
        if (index) {
            is_pay = false
        }
        this.setData({
            navList: arr,
            is_pay: is_pay,
            shopList: []
        })
        index ? this.getUserCard() : this.getBuyCard();
        this.getHeight();
    },
    // 获取礼品卡
    getCard: function () {
        this.data.$api.get({
            url: "api/user/getCard",
        }).then(res => {
            let arr = res.data.data;
            arr[1].active = 1;
            this.setData({
                bannerList: arr
            })
            this.getBuyCard();
        })
    },
    // 获取我的购买 
    getBuyCard: function () {
        this.data.$api.get({
            url: "api/user/getBuyCard",
            show: true
        }).then(res => {
            this.setData({
                shopList: res.data.data
            })
            this.getHeight();
            wx.stopPullDownRefresh(); //停止下拉刷新
        })
    },
    // 获取我的收到
    getUserCard: function () {
        this.data.$api.get({
            url: "api/user/getUserCard",
            show: true
        }).then(res => {
            this.setData({
                shopList: res.data.data
            })
            this.getHeight();
            wx.stopPullDownRefresh(); //停止下拉刷新
        })
    },
    // 领取卡
    setUserCard: function (e) {
        let id = e.currentTarget.dataset.id;
        let userInfo = wx.getStorageSync('userInfo');
        this.data.$api.get({
            url: "api/user/setUserCard",
            data: {
                user_id: userInfo.id,
                id: id
            }
        }).then(res => {
            wx.showToast({
                title: '领取成功',
                mask: true
            })
            this.getUserCard();
        })
    },
    // 购买礼品卡
    openVip: function () {
        let code = this.data.$pay.pay(this.data.bannerList[this.data.bannerId].id, this.data.bannerList[this.data.bannerId].price, 2);
        // let code = this.data.$pay.pay(this.data.bannerList[this.data.bannerId].id,0.01, 2);
        code.then(res => {
            if (res) {
                this.getBuyCard();
            }
        })
    }
})