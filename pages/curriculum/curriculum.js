const app = getApp();
const pageUrl = require("../../utils/pageUrl")
Page({

    data: {
        imgSrc: app.globalData.imgUrl, //图片顶地址
        $api: app.globalData.$api.default,
        bookInfo: [], //书籍信息
        curriculumList: [], //课程集数
        title: "", //书籍标题
        curriculum_id: 0, //课程id
        is_vip: false, //是否为vip用户
        top_tips: "开通会员免费畅听全集", //顶部提示
        buy_show: false, //购买弹窗
        is_ios: false, //是否是苹果端
        is_exchange: false, //兑换弹窗
        is_history: false, //是否有历史记录
        paly_text: "立即播放", //提示文字
        history_id: 0, //历史记录id
        episodes : 1 , //当前集数
        all_price : 0 , //当前购买价格
        is_bootom_paly : false , //底部播放
        listing : 0 , //总阅读量
        pageUrls:''
    },


    onLoad: function (options) {
        this.setData({
            curriculum_id: options.id,
            pageUrls:pageUrl.pageUrl()
        })
        this.getCurriculumArticleId(); //获取课程详情
        this.getCurriculumId(); //获取课程集数
        this.isVip(); //判断是否为vip
        this.isIos(); //是否为苹果用户
        this.isHistory(); //是否有历史记录
    },

    // 下拉刷新
    onPullDownRefresh:function(){
        this.isHistory(); //是否有历史记录
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
        this.getNowPlay();
    },

    // 获取课程详情
    getCurriculumArticleId: function () {
        this.data.$api.get({
            url: "api/Article/getCurriculumArticleId",
            data: {
                id: this.data.curriculum_id
            }
        }).then(res => {
            wx.setNavigationBarTitle({
                title: res.data.data.title,
            })
            this.setData({
                bookInfo: res.data.data
            })
        })
    },
    // 是否为vip用户
    isVip: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            return;
        }
        let userVip = wx.getStorageSync('userVip');
        if (!userVip) {
            return;
        }
        if (userVip.is_free != 1 && userVip.day > 0) {
            this.setData({
                is_vip: true,
            })
        }
    },
    // 获取课程集数
    getCurriculumId: function () {
        this.data.$api.get({
            url: "api/Article/getCurriculumId",
            data: {
                id: this.data.curriculum_id
            }
        }).then(res => {
            let arr = res.data.data.data;
            arr.forEach(v => {
                v.active = 0;
            })
            this.setData({
                curriculumList: arr,
                all_price : res.data.data.p_price,
                listing : res.data.data.p_listening
            })
        })
    },
    // 去详情页面
    goDetails: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/details/details?id=' + id + '&type=curriculum&curriculum_id=' + this.data.curriculum_id,
        })
    },
    // 关闭顶部提示
    closeTips: function () {
        this.setData({
            is_vip: true,
        })
    },
    
    // 打开购物弹窗
    openBuy: function () {
        this.setData({
            buy_show: true
        })
    },
    // 是否为苹果
    isIos: function () {
        wx.getSystemInfo({
            success: (result) => {
                let reg = new RegExp('iOS');
                if (result.system.match(reg)) {
                    this.setData({
                        is_ios: true,
                        top_tips: "兑换会员免费畅听全集"
                    })
                }
            },
        })
    },
    // 打开兑换弹窗
    openExchange: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.showToast({
                title: '登录后才可以兑换会员哟',
                icon: 'none',
                mask: true
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '/page-two/login/login?pageUrl='+this.data.pageUrls,
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
                wx.navigateTo({
                    url: '/pages/userInfo/userInfo',
                })
            }, 2000)
            return;
        }
        this.setData({
            is_exchange: true,
        })
    },
    // 继续播放
    continuePlaying: function () {
        if (!this.data.is_history) {
            let arr = this.data.curriculumList;
            wx.navigateTo({
                url: '../details/details?id=' + arr[0].id + '&type=curriculum&curriculum_id=' + this.data.curriculum_id,
            })
            return;
        }
        wx.navigateTo({
            url: '../details/details?id=' + this.data.history_id + '&type=curriculum&curriculum_id=' + this.data.curriculum_id,
        })
    },
    // 立即播放
    payNow:function(){
        let arr = this.data.curriculumList;
        wx.navigateTo({
            url: '../details/details?id=' + arr[0].id + '&type=curriculum&curriculum_id=' + this.data.curriculum_id,
        })
    },
    // 是否有历史记录
    isHistory: function () {
        this.data.$api.get({
            url: "api/Article/getCurriculum",
            data: {
                id: this.data.curriculum_id
            }
        }).then(res => {
            wx.stopPullDownRefresh();
            let id = res.data.data.id;
            let arr = this.data.curriculumList;
            let count = 0; 
            for(let i = 0 ; i < arr.length ; i ++){
                if(arr[i].id == id){
                    count = i + 1;
                    this.setData({
                        episodes : count
                    })
                }
            }
            if(!arr.length){
                return;
            }
            if (arr[0].id != id) {
                this.setData({
                    paly_text: "继续播放",
                    is_history: true,
                    history_id: id
                })
            }
        })
    },
    // 获取当前播放课程
    getNowPlay:function(){
        let curriculumDetails = wx.getStorageSync('bookDetails');
        if(curriculumDetails.id){
            let arr = this.data.curriculumList;
            let count = 0; 
            for(let i = 0 ; i < arr.length ; i ++){
                if(arr[i].id == curriculumDetails.id){
                    count = i + 1;
                    this.setData({
                        episodes : count
                    })
                }
            }
            if(!arr.length){
                return;
            }
            if (arr[0].id != curriculumDetails.id) {
                this.setData({
                    paly_text: "继续播放",
                    is_history: true,
                    history_id: curriculumDetails.id
                })
            }
        }
    }

})