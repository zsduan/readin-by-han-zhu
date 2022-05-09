const app = getApp();
Component({

    properties: {
        is_show_pup: { //是否弹窗
            type: Boolean,
            value: true
        },
        pupData: { //弹窗数据
            type: Object,
            value: {}
        }

    },
    data: {
        is_show: true,
        is_click: false,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        today: false, //今日是否展示
    },

    methods: {
        close: function () {
            if (this.data.is_click) {
                return;
            }
            this.setData({
                is_click: true,
                is_show: false
            });
            this.triggerEvent("closePup", {
                "closePuP": true
            });
        },
        // 点击跳转
        goNav: function () {
            let pupUrl = this.data.pupData.url;
            if (!pupUrl) {
                return;
            }
            this.close();
            wx.navigateTo({
                url: pupUrl,
            })
        },
        // 关闭弹窗
        imgLoade: function () {
            setTimeout(() => {
                this.close();
            }, 20000)
        },
        todayshow: function (e) {
            let checked = e.currentTarget.dataset.checked;
            checked = !checked;
            if (checked) {
                let date = new Date;
                let year = date.getFullYear();
                let mouth = date.getMonth() + 1;
                let day = date.getDate() + 1;
                wx.setStorageSync('closePup', `${day - 1}`);
                wx.showToast({
                    title: `仅关闭一天，${year}-${mouth}-${day}到期`,
                    icon: "none",
                    mark: true
                })
            }
            this.setData({
                today: checked
            })
        }
    }
})