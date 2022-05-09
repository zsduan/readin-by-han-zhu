const app = getApp()
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        list_height: 0, //list的高度
        msgList: [], //数据
        is_bootom_paly: false, //底部是否播放
    },
    onLoad: function (options) {
        this.getSystemMessage();
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

    // 计算高度，当高度没有达到相应高度的时候进行高度补充
    getHeight: function () {
        let sycHeight = "";
        wx.getSystemInfo({
            success: (result) => {
                sycHeight = result.screenHeight;
            },
        });
        let query = wx.createSelectorQuery();
        query.select(".list").boundingClientRect(rect => {
            let height = rect.height;
            if (height < sycHeight - 115) {
                this.setData({
                    list_height: sycHeight - 115
                })
            }
        }).exec();
    },

    getSystemMessage: function () {
        this.data.$api.get({
            url: "api/user/getSystemMessage",
            show: true
        }).then(res => {
            this.setData({
                msgList: res.data.data
            })
            this.getHeight(); //获取高度
        })
    },
    itemClick: function (e) {
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let arr = this.data.msgList;
        if (!arr[index].read) {
            arr[index].read = 1
        }
        this.setData({
            msgList: arr
        })
        wx.navigateTo({
            url: "../msg-details/msg-details?id=" + id
        })
    }

})