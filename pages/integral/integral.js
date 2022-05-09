const app = getApp();
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        my_integral: 0, //当前积分
        days: 0, //连续签到天数
        month: 0, //当前月份
        seven_days: [], //7天
        today: 0, //今天
        integralList: [], //积分情况
        is_all: false, //是否显示所有天数
        monthStartDate: 0, //本月开始是星期几
        all_day: [], //所有天数
        is_bootom_paly: false, //底部是否播放
        $login : app.globalData.$login, // 登录
    },


    onLoad: function (options) {
        this.getUserInfo();
        this.getUserSign();
        this.getSign();
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

    getUserInfo: function () {
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            my_integral: userInfo.integral
        })
    },

    // 获取积分情况
    getUserSign: function () {
        this.data.$api.get({
            url: "api/user/getUserSign",
        }).then(res => {
            this.setData({
                integralList: res.data.data
            })
        })
    },
    // 获取签到情况
    getSign: function () {
        this.data.$api.get({
            url: "api/user/getSign"
        }).then(res => {
            let arr = res.data.data.sign;
            let days = res.data.data.data;
            if (days.day) {
                this.setData({
                    days: days.day
                })
            }
            let date = new Date();
            let nowMonth = date.getMonth(); //当前月 
            let nowYear = date.getFullYear(); //当前年 
            let day = date.getDate(); //我是今天的日期
            this.setData({
                today: day,
                month : nowMonth + 1,
            })

            // 开始计算1号前面空余的天数
            //本月的开始时间
            let monthStartDate = new Date(nowYear, nowMonth, 1);
            let day4 = monthStartDate.getDay(); //推送多余的数据
            let data = {
                day: -1,
                integral: 0,
                type: -1,
                is_show : 0,
            }
            for (let i = 0; i < day4; i++) {
                arr.unshift(data)
            }
            this.setData({
                all_day: arr
            })
        })
    },
    // 是否显示全部
    openAll: function () {
        let is_all = this.data.is_all;
        is_all = !is_all;
        this.setData({
            is_all: is_all
        })
    },
    // 签到
    setSign: function () {
        this.data.$api.get({
            url: "api/user/setSign",
            show: true
        }).then(res => {
            wx.showToast({
                title: '签到成功',
            })
            this.data.$login.login('/pages/integral/integral'); //重新获取用户信息
        })
    },
    // 积分攻略弹窗
    integralPup:function(){
        wx.navigateTo({
            url : "../regulation/regulation?type=integral"
        })
    }
})