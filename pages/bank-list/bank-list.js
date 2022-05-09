const app = getApp();
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        bankList: [], //银行卡列表
        is_see: false, //是否只是查看
        is_bootom_paly: false, //底部是否播放
        is_pup : false , //提示框
        bank_id : 0, //银行卡id
    },

    onLoad: function (options) {
        if (options.type) {
            this.setData({
                is_see: true
            })
        }
        this.getUserBank();
    },
    onPullDownRefresh:function(){
        this.getUserBank();
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
    // 获取银行卡
    getUserBank: function () {
        this.data.$api.get({
            url: "api/user/getUserBank",
            show: true,
        }).then(res => {
            let arr = res.data.data;
            arr.forEach(v => {
                v.num =  v.number.substring(v.number.length - 4);
            })
            // let data = {
            //     id: -1,
            //     bank: "微信余额",
            //     num: "速度更快"
            // }
            // arr.unshift(data);
            this.setData({
                bankList: arr
            })
            wx.stopPullDownRefresh(); //停止下拉刷新
        })
    },
    // 去修改银行卡
    modifyBank: function () {
        if (this.data.bank_id == -1) {
            return;
        }
        wx.navigateTo({
            url: '../add-bank/add-bank?id=' +  this.data.bank_id,
        })
    },
    // 去添加银行卡页面
    goAddBank: function () {
        wx.navigateTo({
            url: '../add-bank/add-bank',
        })
    },
    // 删除银行卡
    delBank: function () {
        wx.showModal({
            title: "您真的要解绑吗？",
            confirmColor : "#F16E22",
            cancelColor : "#999999",
            success: (res) => {
                if (res.confirm) {
                    this.data.$api.post({
                        url: "api/user/delUserBank",
                        data: {
                            id: this.data.bank_id
                        }
                    }).then(res => {
                        wx.showToast({
                            title: '解绑成功',
                            mask: true
                        })
                        setTimeout(() => {
                            wx.redirectTo({
                                url: '/pages/bank-list/bank-list',
                            })
                        }, 500)
                    })
                }
                if(res.cancel){
                    this.cancel();
                }

            }
        })
    },
    // 打开弹窗
    openPup:function(e){
        let id = e.currentTarget.dataset.id;
        this.setData({
            is_pup: true,
            bank_id : id
        })
    },
    // 取消
    cancel: function () {
        this.setData({
            is_pup: false
        })
    },
})