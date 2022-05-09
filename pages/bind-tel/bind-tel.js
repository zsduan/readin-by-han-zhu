const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        is_send: false, //是否发送验证码
        time: 60, //倒计时
        code_text: "获取验证码", //发送验证码文字
        tel: "", //电话号码
        code: "", //验证码
        userInfo: "", //用户信息
        is_bootom_paly: false, //底部是否播放
        $login : app.globalData.$login, // 登录
    },

    onLoad: function (options) {
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
    getUserInfo: function () {
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            userInfo: userInfo
        })
    },

    // 手机号
    tel: function (e) {
        this.setData({
            tel: e.detail.value
        })
    },

    // 验证码
    code: function (e) {
        this.setData({
            code: e.detail.value
        })
    },
    // 发送验证码
    sendCode: function () {
        if (this.data.is_send) {
            return;
        }
        let tel = this.data.tel;
        if (!tel || (/^1[3456789]d{9}$/.test(tel))) {
            wx.showToast({
                title: '手机号码错误或不能为空',
                icon: "none",
                mask: true
            })
            return;
        }
        let time = this.data.time;
        let timer = null;
        this.setData({
            is_send: true
        })
        timer = setInterval(() => {
            time -= 1;
            this.setData({
                code_text: `${time}s后重试`
            })
            if (time <= 0) {
                clearInterval(timer);
                this.setData({
                    code_text: `获取验证码`,
                    is_send: false
                })
            }
        }, 1000)
        this.data.$api.post({
            url: "api/index/getSMS",
            data: {
                tel: tel
            },
            show: true
        }).then(res => {
            wx.showToast({
                title: '验证码发送成功',
                mask: true
            })
        })

    },
    // 提交
    submit: function () {
        let tel = this.data.tel;
        if (!tel || (/^1[3456789]d{9}$/.test(tel))) {
            wx.showToast({
                title: '手机号码错误或不能为空',
                icon: "none",
                mask: true
            })
            return;
        }
        let code = this.data.code;
        if (!code) {
            wx.showToast({
                title: '请输入验证码',
                icon: "none",
                mask: true
            })
            return;
        }
        this.data.$api.post({
            url: "api/user/setUserMobile",
            data: {
                mobile: tel,
                code: code
            },
            show : true
        }).then(res => {
            if (res.data.code == 1) {
                wx.showToast({
                    title: '手机绑定成功',
                    mask: true
                })
                this.data.$login.login();
                setTimeout(() => {
                    wx.switchTab({
                        url: '../user/user',
                    })
                }, 500)
                return;
            }
            wx.showToast({
                title: res.data.msg,
                mask: true,
                icon : "none"
            })
        })
    },
    // 取消提示框
    cancelTips: function () {
        wx.showModal({
            title: "重要提示",
            content: "绑定手机号可以更好的提供服务，可以免费领取7天vip。",
            success: (res) => {
                if (res.confirm) {
                    wx.switchTab({
                        url: '../index/index',
                    })
                }
            }
        })
    },
})