const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        Vaule: "", //反馈内容
    },

    onLoad: function (options) {
        this.showModal();
    },
    // 展示提示框
    showModal: function () {
        wx.showModal({
            showCancel: false,
            title: "提示",
            content: "请优先选择联系客服，本功能不保证时效性"
        })
    },
    // 输入文字
    inputValue: function (e) {
        this.setData({
            Vaule: e.detail.value
        })
    },
    // 提交反馈
    setFeedback: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.showToast({
                title: '请先登录在进行反馈',
                icon: "none",
                mask: true
            })
            return;
        }
        if(!Vaule){
            wx.showToast({
                title: '反馈内容不能为空',
                icon: "none",
                mask: true
            })
            return;
        }
        let userInfo = wx.getStorageSync('userInfo');
        this.data.$api.get({
            url: "api/index/setFeedback",
            data: {
                id  : userInfo.id,
                text : this.data.Vaule
            },
            show: true
        }).then(res => {
            wx.removeStorageSync('browsing');
            wx.showToast({
                title: '感谢您反馈',
            })
            setTimeout(() => {
                wx.switchTab({
                    url: '../user/user',
                })
            }, 500)
        })
    }
})