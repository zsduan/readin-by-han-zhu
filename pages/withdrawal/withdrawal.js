const app = getApp()
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        $login: app.globalData.$login, //登录
        mode: "到账银行卡", // 到账方式
        bank_card: {},
        arrival: "审核通过后，24小时到账",
        moeny: 0, //钱
        list_height: 0, //高度
        withdrawal_moeny: "", //提现金额
        is_empty: false, //是有没有银行卡
        is_bootom_paly: false, //底部是否播放
        bankList: [], //银行卡列表
        is_pup: false, //是否打开弹窗
        show_tips : false, //是否展示提示框
        wx_withdraw : false , //是否打开微信提现
    },
    onLoad: function (options) {
        this.getHeight();
        this.getUserInfo();
        this.getSettings();
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
        this.getUserBank();
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
        query.select(".withdrawal").boundingClientRect(rect => {
            let height = rect.height;
            if (height < sycHeight - 214) {
                this.setData({
                    list_height: sycHeight - 214
                })
            }
        }).exec();
    },
    getUserInfo: function () {
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            moeny: userInfo.balance
        })
    },
    // 获取输入框的值
    bindKeyInput: function (e) {
        this.setData({
            withdrawal_moeny: e.detail.value
        })
    },
    // 全部提现
    all: function () {
        let money = this.data.moeny;
        this.setData({
            withdrawal_moeny: money
        })
    },
    // 提现
    withdrawal: function () {
        let money = this.data.moeny;
        let withdrawal_moeny = this.data.withdrawal_moeny;
        let bankList = this.data.bankList;
        if (!bankList.length) {
            wx.showToast({
                title: '您还没有绑定银行卡，快去绑定银行卡吧',
                icon: "none",
                mask: true
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '../add-bank/add-bank',
                })
            }, 1000);
            return;
        }
        if (Number(withdrawal_moeny) > Number(money)) {
            wx.showToast({
                title: '提现金额不能超过所有金额',
                icon: "none",
                mask: true
            })
            return;
        }
        if (!withdrawal_moeny || withdrawal_moeny < 1 || withdrawal_moeny > 5000) {
            wx.showToast({
                title: '提现金额不小于1元,且不大于5000元',
                icon: "none",
                mask: true
            })
            return;
        }

        this.data.$api.get({
            url: "api/user/setUserWithdraw",
            data: {
                card_id: this.data.bank_card.id,
                price: this.data.withdrawal_moeny
            },
            show: true
        }).then(res => {
            if (res.data.code) {
                wx.showToast({
                    title: '提现成功',
                    mask: true
                })
                this.data.$login.login();
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                    })
                }, 1000)
                return;
            }
            wx.showToast({
                title: res.data.msg,
                mask: true,
                icon: "none"
            })
        })
    },
    // 去添加银行卡
    goAddBank: function () {
        wx.navigateTo({
            url: '../add-bank/add-bank',
        })
        this.setData({
            is_pup: false
        })
    },
    // 打开弹窗
    openPup: function () {
        this.setData({
            is_pup: true
        })
    },
    // 关闭弹窗
    closePup: function () {
        this.setData({
            is_pup: false
        })
    },
    // 获取银行卡
    getUserBank: function () {
        this.data.$api.get({
            url: "api/user/getUserBank",
            show: true,
        }).then(res => {
            this.setData({
                bankList : []
            })
            let arr = res.data.data;
            let wx_withdraw = this.data.wx_withdraw;
            if (!arr.length && !wx_withdraw) {
                return;
            }
            arr.forEach(v => {
                v.num = "**" + v.number.substring(v.number.length - 4);
                v.arrival = "审核通过后，24小时到账";
                v.active = 0;
                v.default_icon = !v.icon ? true : false;
                v.icon = !v.icon ? "../../static/img/bank-card-icon.png" : this.data.imgSrc + v.icon;
            })
            if(wx_withdraw){
                let data = {
                    id: 0,
                    bank: "微信余额",
                    num: "速度更快",
                    arrival: "审核后，2小时到账",
                    icon: "../../static/img/weixin-code.png",
                    active: 1,
                    default_icon : true
                }
                arr.unshift(data);
                this.setData({
                    mode: "到账微信余额", // 到账方式
                })
            }else{
                arr[0].active = 1;
            }
            
            this.setData({
                bankList: arr,
                bank_card: arr[0]
            })
        })
    },
    // 单选
    reportRadio: function (e) {
        let index = e.currentTarget.dataset.index;
        bankList = this.data.bankList;
        if(bankList[index].active){
            wx.showToast({
              title: '你现在就在此选项',
              icon : "none",
              mask : true,
            })
            return ;
        }
        if (bankList[index].id != 0) {
            this.setData({
                mode: "到账银行卡", // 到账方式
            })
        } else {
            this.setData({
                mode: "到账微信余额", // 到账方式
            })
        }
        let bankList = this.data.bankList;
        if (bankList[index].active) {
            bankList[index].active = false;
        } else {
            for (let i = 0; i < bankList.length; i++) {
                if (bankList[i].active) {
                    bankList[i].active = false;
                    break;
                }
            }
            bankList[index].active = true;
        }

        this.setData({
            bankList: bankList,
            is_pup: false,
            bank_card: bankList[index]
        })
    },
    // 打开提现须知
    openTips:function(){
        this.setData({
            show_tips : true
        })
    },
    closeTips:function(){
        this.setData({
            show_tips : false
        })
    },
    // 获取设置是否打开微信提现
    getSettings:function(){
        this.data.$api.get({
            url : "api/index/getSettings"
        }).then(res =>{
            this.setData({
                wx_withdraw : res.data.data.wx_withdraw
            })
            if(res.data.data.wx_withdraw){
                let data = {
                    id: 0,
                    bank: "微信余额",
                    num: "速度更快",
                    arrival: "审核后，2小时到账",
                    icon: "../../static/img/weixin-code.png",
                    active: 1
                }
                let arr = this.data.bankList;
                if(arr.length){
                    arr[0].active = 0;
                }
                arr.unshift(data);
                this.setData({
                    mode: "到账微信余额", // 到账方式
                    bankList : arr,
                    bank_card: arr[0]
                })
            }
        })
    }
     
})