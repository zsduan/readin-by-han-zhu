const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        rules: "", //规则、协议
        type: "", //当前类型
    },

    onLoad: function (options) {
        this.setData({
            type: options.type
        })
        this.getSettings();
    },
    // 获取基础设置
    getSettings: function () {
        this.data.$api.get({
            url: "api/index/getSettings"
        }).then(res => {
            let type = this.data.type;
            if (type == "rank") {
                this.setData({
                    rules: res.data.data.ranking_rules
                })
                wx.setNavigationBarTitle({
                    title: '排行规则',
                })
            }
            if (type == "integral") {
                this.setData({
                    rules: res.data.data.integral_strategy
                })
                wx.setNavigationBarTitle({
                    title: '学分攻略',
                })
            }
            if (type == "service") {
                this.setData({
                    rules: res.data.data.user_service_agreement
                })
                wx.setNavigationBarTitle({
                    title: '服务协议',
                })
            }
        })
    }

})