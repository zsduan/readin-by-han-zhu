const pageUrl = require("../../utils/pageUrl");

Component({

    properties: {
        tips: { //提示文字
            type: String,
            value: ""
        },
        show_vip: { //是否显示vip图标
            type: Boolean,
            value: false,
        },
        show_notice : { //是否显示公告图标
            type : Boolean,
            value : false ,
        },
        show_btn: { //是否显示按钮
            type: Boolean,
            value: false,
        },
        duration: { //延迟关闭时间，默认关闭
            type: Number,
            value: 0
        },
        pageUrls: {
            type: String,
            value: ''
        }
    },

    data: {
        is_ios: false, //是否为苹果端
        is_show: true, //是否展示
    },
    lifetimes:{
        attached:function(){
            this.isIos();
            if (this.data.duration) {
                this.autoClose();
            }
        }
    },
    methods: {
        // 是否为苹果
        isIos: function () {
            wx.getSystemInfo({
                success: (result) => {
                    let reg = new RegExp('iOS');
                    if (result.system.match(reg)) {
                        this.setData({
                            is_ios: true,
                        })
                    }
                },
            })
        },
        // 自动关闭
        autoClose: function () {
            setTimeout(() => {
                this.setData({
                    is_show: false
                })
            }, this.data.duration)
        },
        // 关闭顶部提示
        closeTips: function () {
            this.setData({
                is_show: false
            })
        },
        // 去开通vip页面
        goOpenVip: function () {
            let salt = wx.getStorageSync('salt');
            if(!salt){
                wx.showToast({
                  title: '请先登录后在开通会员',
                  icon : "none",
                  mask : true
                })
                setTimeout(()=>{
                    wx.navigateTo({
                        url: "../../page-two/login/login?pageUrl="+this.data.pageUrls,
                    })
                },1000)
                return ;
            }
            wx.navigateTo({
                url: '../vip-details/vip-details?pageUrl='+this.data.pageUrls,
            })
        },
        // 打开兑换弹窗
        openExchange:function(){
            let salt = wx.getStorageSync('salt');
            if(!salt){
                wx.showToast({
                  title: '请先登录后在进行兑换',
                  icon : "none",
                  mask : true
                })
                setTimeout(()=>{
                    wx.navigateTo({
                        url: "../../page-two/login/login?pageUrl="+this.data.pageUrls,
                    })
                },1000)
                return ;
            }
            this.triggerEvent("openExchange",{"open":true})
        }
    }
})