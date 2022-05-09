const app = getApp()
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        userInfo: {}, //用户信息
        navList: [{
                id: "",
                name: "我的收益",
                active: 1
            },
            {
                id: "",
                name: "我的支出",
                active: 0
            },
        ], //nav
        list_height: 0, //当前高度
        moneyList: [], //收益列表
        payList:[], //支出列表
        is_bootom_paly: false, //底部是否播放
        changeTable: 0
    },
    onLoad: function (options) {
        this.getUserBalance();
        this.getUserWithdraw();
    },
    //监听背景音乐
    onShow: function () {
        var bgMusic = wx.getBackgroundAudioManager();
        if (bgMusic.src) {
            this.setData({
                is_bootom_paly: true
            })
        }
        this.getUserInfo();

    },
    // 改变顶部
    changeTop: function (e) {
        let index
        if(e.currentTarget){
            index = e.currentTarget.dataset.index;
        }else{
            index = e;
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
        this.setData({
            navList: arr,
            changeTable:index
        })
        // index ? this.getUserWithdraw() : this.getUserBalance();
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
        query.select(".my-profit").boundingClientRect(rect => {
            let height = rect.height;
            if (height < sycHeight - 261) {
                this.setData({
                    list_height: sycHeight - 261
                })
            }
        }).exec();
    },
    // 去提现页面
    goWithdrawal: function () {
        wx.navigateTo({
            url: '../withdrawal/withdrawal',
        })
    },
    // 获取用户信息
    getUserInfo: function () {
        let userinfo = wx.getStorageSync('userInfo');
        this.setData({
            userInfo: userinfo
        })
    },
    // 获取支出数据
    getUserWithdraw: function (type) {
        this.data.$api.get({
            url: "api/user/getUserWithdraw",
            show: true
        }).then(res => {
            this.setData({
                payList: res.data.data
            })
        })
    },
     // 去提现记录列表页面
     goWithdrawalRecord: function () {
        wx.navigateTo({
            url: '../withdrawal-record/withdrawal-record',
        })
    },
    // 去银行卡列表页面
    goBankList: function () {
        wx.navigateTo({
            url: '../bank-list/bank-list?type=withdrawal',
        })
    },
    // 获取收益数据
    getUserBalance: function () {
        this.data.$api.get({
            url: "api/user/getUserBalance",
            show: true
        }).then(res => {
            this.setData({
                moneyList: res.data.data
            })
            this.getHeight();
        })
    },
    //滑动轮播数据
    bindChange: function(e) {
        let index = e.detail.current
        this.changeTop(index)
        this.setData({
            changeTable: e.detail.current
        })
    }
})