const app = getApp();
Component({

    properties: {
        is_exchange: {
            type: Boolean,
            value: false,
        },
        pageUrls: {
            type: String,
            value: ''
        }
    },

    data: {
        $api: app.globalData.$api.default,
        exchangeValue: "", //输入框的值
    },

    methods: {
        // 获取输入框的值
        bindKeyInput: function (e) {
            this.setData({
                exchangeValue: e.detail.value
            })
        },
        // 确定兑换
        determine: function () {
            if (!this.data.exchangeValue) {
                wx.showToast({
                    title: '请输入有效的兑换码',
                    icon: "none",
                    mask: true
                })
            }
            this.setUserExchange();
        },
        // 会员兑换
        setUserExchange: function () {
            // let pages = getCurrentPages(); //获取加载的页面
            // let pageUrl = ""; //页面地址
            // let option = pages[pages.length - 1].options;
            // let str = "";
            // if(option){
            //     for(let key in option){
            //         str += '&'+ key + "=" +  option[key];
            //     }
            // }
            // str = str.split("");
            // str[0] = "?";
            // str = str.join("");
            // if (pages.length) {
            //     let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            //     pageUrl = currentPage.route; //当前页面url
            // }
            // pageUrl = "/" + pageUrl + str;
            this.data.$api.get({
                url: "api/user/setUserExchange",
                data: {
                    code: this.data.exchangeValue
                },
                show: true
            }).then(res => {
                if (res.data.code == 0) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: "none",
                        mask: true
                    })
                    return;
                }
                wx.showToast({
                    title: '兑换成功',
                    icon: "none"
                })

                this.setData({
                    is_exchange: false
                })

                if(this.data.pageUrls){
                    wx.redirectTo({
                        url: this.data.pageUrls,
                    })
                }
            })
        },
        // 取消兑换
        cancel: function () {
            this.setData({
                is_exchange: false
            })
        },
    }
})