const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        userInfo: {},
        region: ['重庆市', '重庆市', '渝北区'], //默认地址
        address_text: "暂未选择地址",
        is_bootom_paly: false, //底部是否播放
        $login: app.globalData.$login, // 登录
        show_bind : false , //是否显示点我提示
    },

    onLoad: function (options) {
        this.getUserInfo();
        this.data.$login.login();
        if(options.address){
            this.setData({
                show_bind : true
            })
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
    getUserInfo: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if(userInfo.mobile){
            let mobile = userInfo.mobile
            mobile = mobile.slice(0,3) + '****' + mobile.slice(7)
            userInfo.mobile = mobile
        }
        this.setData({
            userInfo: userInfo
        })
    },
    goBandTel: function () {
        wx.navigateTo({
            url: '../bind-tel/bind-tel',
        })
    },
    // 地址
    bindRegionChange: function (e) {
        wx.showModal({
            title: "提示",
            content: "地址选定无法修改，请仔细检查",
            success: () => {
                let region = e.detail.value;
                this.setData({
                    address_text: region[0] + '-' + region[1] + '-' + region[2]
                })
                this.setUserAddress();
            }
        })
    },
    // 提交绑定地址
    setUserAddress: function () {
        this.data.$api.get({
            url: "api/user/setUserAddress",
            data: {
                address: this.data.address_text
            },
            show: true
        }).then(res => {
            if (res.data.code == 1) {
                wx.showToast({
                    title: '地址绑定成功',
                    mask: true
                })
                this.data.$login.login('/pages/userInfo/userInfo');
                return;
            }
            wx.showToast({
                title: res.data.msg,
                mask: true
            })
        })
    },
    exitLogin: function () {
        wx.showModal({
            title: '退出登录',
            content: '确定要退出登录吗?退出后无法享受历史记录，继续播放等服务哟！',
            confirmText: "退出登录",
            cancelText: "我在想想",
            confirmColor: "#F16E22",
            cancelColor: "#999999",
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorageSync('salt');
                    wx.removeStorageSync('userInfo');
                    wx.removeStorageSync('userVip');
                    wx.switchTab({
                        url: '../index/index',
                    })
                }
            }
        })

    },
    // 放大头像
    viewPicture: function (e) {
        let src = this.data.userInfo.avatar;
        let arr = [];
        arr.push(src);
        wx.previewImage({
          current: src, // 当前显示图片的http链接
          urls: arr ,// 需要预览的图片http链接列表
        })
      },
})