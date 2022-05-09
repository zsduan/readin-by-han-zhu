const app = getApp()
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        userInfo: {}, //用户信息
        navList: [{
                id: "",
                name: "邀请注册-0",
                active: 1
            },
            {
                id: "",
                name: "邀请付费",
                active: 0
            },
        ], //nav
        invitationList: [],
        is_bootom_paly: false, //底部是否播放
        is_pay : false, //是否是邀请付费
        id: '' ,//二级页面id
        is_show: true //是否显示一级页面
    },

    onLoad: function (options) {
        if(options.id){
            this.setData({
                id: options.id,
                is_pay: options.is_pay,
                is_show: false
            })
            wx.setNavigationBarTitle({
                title: '更多邀请'
            })
        }else{
             // 获取我的同学
            this.getUserClassmate();
        } 
        this.getUserInfo();
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
            title = `${userInfo.nickname}邀您一起读书`;
            imageUrl = "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/images/5/2021/04/e3d49496682b7062dd11b997da500b09.png";
            path = '/pages/index/index?scene=share_user=' + userInfo.salt;
        }
        return {
            title: title,
            imageUrl: imageUrl, //这个是分享的图片
            path: path,
        }
    },
    onPullDownRefresh: function () {
        this.getUserInfo();
    },
    getUserInfo: function () {
        if(!this.data.id){
            let userInfo = wx.getStorageSync('userInfo');
            this.setData({
                userInfo: userInfo
            })
        }else{
            let id = this.data.id
            this.data.$api.get({
                url: "api/user/getUserId",
                data: {
                    id: id
                }
            }).then(res => {
                this.setData({
                    userInfo: res.data.data
                })
                if (this.data.is_pay == true) {
                    let nav = this.data.navList;
                    nav[0].active = 0;
                    nav[1].active = 1;
                    this.setData({
                        navList: nav
                    })
                    this.getUserClassmateVip();
                    return;
                }
                this.getUserClassmate();
            })
        }
        wx.stopPullDownRefresh();
    },
    // 改变顶部
    changeTop: function (e) {
        let index = e.currentTarget.dataset.index;
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
            navList: arr
        })
        index ? this.getUserClassmateVip() : this.getUserClassmate();
    },
    
    //  获取我的同学
    getUserClassmate: function () {
        let data;
        let id = this.data.id
        let salt = this.data.userInfo.salt
        if(id){
            data = {
                salt: salt,
                id: id
            }
        }else{
            data = ''
        }
        this.data.$api.get({
            url: "api/user/getUserClassmate",
            data: data,
            show: true
        }).then(res => {
            let navList = this.data.navList;
            navList[0].name = "邀请注册-" + res.data.data.length;
            this.setData({
                invitationList: res.data.data,
                navList: navList,
                is_pay: false
            })
        })
    },

    // 去二级页面
    goNext: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../my-student/my-student?id=' + id + '&is_pay=' + this.data.is_pay,
        })
    },

    getUserClassmateVip: function () {
        let data;
        let id = this.data.id
        let salt = this.data.userInfo.salt
         if(id){
            data = {
                salt: salt,
                id: id
            }
         }else{
             data = ''
         }
        this.data.$api.get({
            url: "api/user/getUserClassmateVip",
            data: data,
            show: true
        }).then(res => {
            let navList = this.data.navList;
            navList[1].name = "邀请付费-" + res.data.data.length;
            this.setData({
                invitationList: res.data.data,
                navList: navList,
                is_pay: true
            })
        })
    },

})