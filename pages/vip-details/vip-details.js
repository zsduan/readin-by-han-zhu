const app = getApp();
const bgMusic = wx.getBackgroundAudioManager();
const pageUrl = require("../../utils/pageUrl")
Page({
    data: {
        $pay: app.globalData.$pay, //支付
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        bookList: [], //书籍详情
        is_tremble: true, //是否重复点击
        is_ios: false, //是否是苹果手机
        is_exchange: false, //是否是兑换
        num : 0 ,//随机数
        pageUrls:'',//开通vip传入地址
        pageTo:''//登录跳转地址
    },
    onLoad: function (options) {
            if(options.pageUrl){
                let pageUrls = options.pageUrl
                pageUrls = pageUrl.pageBack(pageUrls)
                this.setData({
                    pageUrls: pageUrls,
                })
            }
            let pageTo = pageUrl.pageUrl()
            this.setData({
                pageTo: pageTo
            })
        if (options.type == "gzh") {
            let userVip = wx.getStorageSync('userVip');
            if (userVip.id) {
                wx.switchTab({
                    url: '/pages/index/index',
                })
            }
            return;
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
        let num = Math.ceil(Math.random()*1024);
        this.setData({
            num : num
        })
        this.getLoveArticle();
    },
    onUnload: function () {
        bgMusic.stop();
        this.setData({
            is_exchange : false
        })
    },
    onPullDownRefresh:function(){
        wx.redirectTo({
          url: './vip-details',
        })
    },
    // 免费领取7天
    freeVip: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo.mobile) {
            wx.showToast({
                title: '绑定手机号才可以领取免费vip',
                icon: "none",
                mask: true
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '../bind-tel/bind-tel',
                })
            }, 500)
            return;
        }
        wx.showToast({
            title: '您已领取过免费vip了，不能重复领取哟',
            icon: "none",
            mask: true
        })
    },
    // 开通vip
    openVip: function () {
        let code = this.data.$pay.pay(0, 365, 1);
        if (!code) {
            return;
        }
        code.then(res => {
            if (res) {
                wx.switchTab({
                    url: '/pages/index/index',
                })
            }
        })
    },
    // 获取热门
    getLoveArticle: function () {
        this.data.$api.get({
            url: "api/index/getLoveArticle",
            show: true
        }).then(res => {
            this.setData({
                bookList: res.data.data
            })
        })
    },
    playAudio: function (e) {
        let index = e.currentTarget.dataset.index;
        // 防止重复点击
        let is_tremble = this.data.is_tremble;
        if (!is_tremble) {
            wx.showToast({
                title: '您已点击了，请勿多次连续点击',
                icon: "none",
                mask: true
            })
            return;
        }
        this.setData({
            is_tremble: false,
        })
        let bookList = this.data.bookList;
        bookList.forEach(v => {
            v.active = 0;
        });
        bookList[index].active = 1;
        let json = bookList[index];
        this.setData({
            bookList: bookList
        })
        // 必须初始化标题 微信小程序必填项
        bgMusic.title = json.title; //初始化标题
        bgMusic.src = json.audio;
        bgMusic.coverImgUrl = this.data.imgSrc + json.thumb;
        bgMusic.singer = json.author;
        setTimeout(() => {
            is_tremble = true;
            this.setData({
                is_tremble: is_tremble
            })
        }, 500); //500ms不能重复点
        bgMusic.onPlay(() => {
            if (bgMusic.currentTime >= 600) {
                bgMusic.stop();
                wx.showToast({
                    title: '试听结束了，更多音频请前往详情页听取',
                    icon: "none",
                    mask: true
                })
            }
        })
    },
    pauseAudio: function (e) {
        // 防止重复点击
        let is_tremble = this.data.is_tremble;
        if (!is_tremble) {
            wx.showToast({
                title: '您已点击了，请勿多次连续点击',
                icon: "none",
                mask: true
            })
            return;
        }
        let index = e.currentTarget.dataset.index;
        let bookList = this.data.bookList;
        bookList[index].active = 0;
        this.setData({
            bookList: bookList
        })
        this.setData({
            is_tremble: false,
        })
        bgMusic.pause();
        setTimeout(() => {
            is_tremble = true;
            this.setData({
                is_tremble: is_tremble
            })
        }, 500); //500ms不能重复点
    },
    // 去首页
    goHome: function () {
        wx.switchTab({
            url: '../index/index',
        })
    },
    // 打开兑换vip弹窗
    exchange: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.showToast({
                title: '登录后才可以兑换会员哟',
                icon: 'none',
                mask: true
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '/page-two/login/login?pageUrl='+this.data.pageTo,
                })
            }, 500)
            return;
        }
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo.mobile || !userInfo.address) {
            wx.showToast({
                title: '您没有绑定手机号或者地址信息',
                mask: true,
                icon: "none",
                duration : 2000
            })
            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/userInfo/userInfo',
                })
            }, 2000)
            return;
        }
        this.setData({
            is_exchange: true
        })
    },

    
})