const app = getApp();
Component({
    properties: {
        curriculumList: { // 课程列表
            type: Array,
            value: []
        },
        all_price: { //总价格
            type: String,
            value: 0
        },
        is_pay_vip: { //是否是付费会员
            type: String,
            value: 0,
        },
        scroll_left : { //距离左边的距离
            type : String,
            value : 0 , 
        },
        curriculum_id : { //父级课程id
            type : Number,
            value : 0
        },
        pageUrls : {
            type : String,
            value : ''
        }
    },

    data: {
        is_ios: false, //是否是苹果手机
        is_exchange: false, //是否兑换会员
        $api: app.globalData.$api.default,
        tips : "单集分享3人，免费畅听分享单集" , //提示
        is_show_login : false , //是否显示登录按钮 
    },

    lifetimes: {
        attached: function () {
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

            let salt = wx.getStorageSync('salt');
            if(!salt){
                this.setData({
                    is_show_login : true , 
                    tips : "登录后单集分享3人，免费畅听分享单集"
                })
            }
        }
    },

    methods: {
        changeNav: function (e) {
            let id = e.currentTarget.dataset.id;
            this.triggerEvent("goNextCom",{"id": id});
        },
        // 打开弹窗
        openPup: function () {
            this.triggerEvent('openPup', {
                open: true
            })
        },
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
                is_exchange: true
            })
        },
        // 去登录页面
        goLogin:function(){
            wx.navigateTo({
                url: '/page-two/login/login?pageUrl='+this.data.pageUrls,
            })
        }
    }
})