const app = getApp();
const openPushs = require("../../utils/push");
const pageUrl = require("../../utils/pageUrl")
Page({

    data: {
        $api: app.globalData.$api.default,
        show_userInfo: true, //是否显示去个人信息页面
        edition_text: "切换体验版",
        edition_now_text: "稳定版",
        pup_text: "已开启",
        definition_text: "原画" ,
        show_pup: false, //是否展示弹窗
        definitionList: [{
                id: 1,
                name: "原画",
                active: 1
            },
            {
                id: 2,
                name: "高清",
                active: 0
            },
            {
                id: 3,
                name: "标清",
                active: 0
            }

        ],
        is_checked: false, //是否选中推送
        user_close: false, //是否用户关闭了推送
        edition_now: false, //是否是内部人眼
        jurisdiction: ["4AS8nA-M5bxbjuMKxIVBqaoSSN4DZD2wA-6NYxn0eeE", "zN3CLmEmylmVKIkMlv_IRsoShPHDFJfsDxp_h-gmbGw"],
        pageUrls: ''
    },

    onLoad: function (options) {
        if(options.pageUrl){
            let pageUrls = options.pageUrl
            let pageSrc = pageUrls.split("@")
            pageUrls = pageUrl.pageBack(pageSrc[0])
            this.setData({
                pageUrls: pageUrls
            })
            if(pageSrc[1] == 'show_pup'){
                this.setData({
                    show_pup: true
                })
            }
            
        }
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            this.setData({
                show_userInfo: false
            })
        }
        let edition_now = wx.getStorageSync('edition_now');
        if (edition_now) {
            this.setData({
                edition_text: "切换稳定版",
                edition_now_text: "体验版",
                edition_now: true
            })
        }
        let closePup = wx.getStorageSync('closePup');
        if (closePup) {
            this.setData({
                pup_text: `已关闭`
            })
        }
        let definitionList = this.data.definitionList;
        let definition = wx.getStorageSync('definition');
        if (definition) {
            definitionList.forEach(v => {
                v.active = 0;
            })
            definitionList[definition - 1].active = 1;
            this.setData({
                definitionList: definitionList,
                definition_text: definitionList[definition - 1].name
            })
        }
    },
    onShow: function () {
        this.getSet();
    },
    // 切换体验版
    changeEdition: function () {
        let content = "切换体验版会出现不稳定状态，请谨慎切换";
        let edition_now = wx.getStorageSync('edition_now');
        if (edition_now) {
            content = "是否切换到稳定版";
        }
        wx.showModal({
            title: "提示",
            content: content,
            confirmText: "立即切换",
            cancelText: "我在想想",
            confirmColor: "#F16E22",
            cancelColor: "#999999",
            success: (res) => {
                if (res.confirm) {
                    if (edition_now) {
                        this.setData({
                            edition_text: "切换体验版",
                            edition_now_text: "稳定版"
                        })
                        wx.removeStorageSync('edition_now');
                        return;
                    }
                    this.setData({
                        edition_text: "切换稳定版",
                        edition_now_text: "体验版"
                    })
                    wx.setStorageSync('edition_now', "kai");
                }
            }
        })
    },
    // 清除缓存
    clearStorage: function () {
        wx.showModal({
            title: "提示",
            content: "清除缓存会清除全部数据，请谨慎清理",
            confirmText: "立即清理",
            cancelText: "我在想想",
            confirmColor: "#F16E22",
            cancelColor: "#999999",
            success: function (res) {
                if (res.confirm) {
                    wx.clearStorageSync();
                    wx.showToast({
                        title: '清除成功',
                    })
                    wx.switchTab({
                        url: '../user/user',
                    })
                }
            }
        })
    },
    // 更新版本
    updata: function () {
        const updateManager = wx.getUpdateManager();
        updateManager.applyUpdate();
    },
    // 去服务协议页面
    goService: function () {
        wx.navigateTo({
            url: "/pages/regulation/regulation?type=service"
        })
    },
    // 获取设置
    getSet: function () {
        let jurisdiction = this.data.jurisdiction;
        let openRankPush = wx.getStorageSync("openRankPush");
        wx.getSetting({
            withSubscriptions: true,
            success: (res) => {
                if (res.subscriptionsSetting.mainSwitch) {
                    if (!res.subscriptionsSetting.itemSettings) {
                        return;
                    }
                    if(openRankPush){
                        wx.removeStorageSync('openRankPush')
                    }
                    if (res.subscriptionsSetting.itemSettings[jurisdiction[0]] && res.subscriptionsSetting.itemSettings[jurisdiction[1]]) {
                        this.setData({
                            is_checked: true
                        })
                        wx.setStorageSync('openRankPush', (new Date).toString());
                        return;
                    }
                }
                if (!res.subscriptionsSetting.mainSwitch) {
                    wx.removeStorageSync('openRankPush')
                    this.setData({
                        user_close: true
                    })
                }
            }
        })
    },

    // 打开弹窗
    openClose: function () {
        let closePup = wx.getStorageSync('closePup');
        let date = new Date;
        let year = date.getFullYear();
        let mouth = date.getMonth() + 1;
        let day = date.getDate() + 1;
        if (closePup) {
            wx.removeStorageSync('closePup');
            this.setData({
                pup_text: `已开启`
            })
            wx.showToast({
                title: `弹窗已开启`,
                icon: "none",
                mark: true
            })
        } else {
            wx.setStorageSync('closePup', `${day - 1}`);
            wx.showToast({
                title: `仅关闭一天，${year}-${mouth}-${day}到期`,
                icon: "none",
                mark: true
            })
            this.setData({
                pup_text: `已关闭`
            })
        }
    },
    // 关闭弹窗
    closePup: function () {
        this.setData({
            show_pup: false
        })
    },
    // 改变视频清晰度
    openEfinition: function () {
        this.setData({
            show_pup: true
        })
    },
    changedEfinition: function (e) {
        let index = e.currentTarget.dataset.index;
        let definitionList = this.data.definitionList;
        if (definitionList[index].active) {
            return;
        }
        definitionList.forEach(v => {
            v.active = 0;
        })
        definitionList[index].active = 1;
        this.setData({
            show_pup: false,
            definition_text: definitionList[index].name,
            definitionList: definitionList
        })
        wx.setStorageSync('definition', definitionList[index].id);
        //跳转页面到相关页
        if (this.data.pageUrls) {
            wx.redirectTo({
                url: this.data.pageUrls,
            })
        }
    },
    openPush: function (e) {
        let detail = e.detail;
        if (detail) {
            openPushs.openPush();
            return;
        }
        wx.showToast({
            title: '请在小程序设置中关闭',
            icon: "none",
            mask: true
        })
    },
})