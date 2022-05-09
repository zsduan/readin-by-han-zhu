const app = getApp();
var bankCardAttribution = require("../../utils/bank_name");
Page({

    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        user_name: "", //开户人姓名
        tel: "", //电话
        bank_name_two: "", //开户支行
        bank_name: "", //银行名称
        bank_num: "", //银行卡号
        is_add: true, //是否是添加
        bank_id: 0, // 银行卡编号
        is_bootom_paly: false, //底部是否播放
    },

    onLoad: function (options) {
        if (options.id) {
            wx.setNavigationBarTitle({
                title: '修改银行卡信息',
            })
            this.setData({
                is_add: false,
                bank_id: options.id
            })
            this.getUserBankId(options.id);
        }
    },
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
    // 用户姓名
    userName: function (e) {
        this.setData({
            user_name: e.detail.value
        })
    },
    // 手机号
    tel: function (e) {
        this.setData({
            tel: e.detail.value
        })
    },
    // 支行名称
    bankNameTwo: function (e) {
        this.setData({
            bank_name_two: e.detail.value
        })
    },
    // 银行号
    bankNum: function (e) {
        let json = bankCardAttribution.method(e.detail.value);
        this.setData({
            bank_name: json.bankName,
            bank_num: e.detail.value
        })
    },

    sbumit: function () {
        let user_name = this.data.user_name;
        if (!user_name) {
            wx.showToast({
                title: '请输入持卡人姓名',
                icon: "none",
                mask: true
            })
            return;
        }
        let tel = this.data.tel;
        if (!tel || (/^1[3456789]d{9}$/.test(tel))) {
            wx.showToast({
                title: '手机号码错误或不能为空',
                icon: "none",
                mask: true
            })
            return;
        }
        let bank_name_two = this.data.bank_name_two;
        if (!bank_name_two) {
            wx.showToast({
                title: '请输入支行名称',
                icon: "none",
                mask: true
            })
            return;
        }
        let bank_name = this.data.bank_name;
        if (!bank_name) {
            wx.showToast({
                title: '暂时不支持该银行',
                icon: "none",
                mask: true
            })
            return;
        }

        this.data.$api.post({
            url: "api/user/setUserBank",
            data: {
                name: this.data.user_name,
                tel: this.data.tel,
                bank: this.data.bank_name,
                deposit: this.data.bank_name_two,
                number: this.data.bank_num
            },
            show: true
        }).then(res => {
            wx.showToast({
                title: '添加成功',
                mask: true
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000)
        })
    },
    // 修改银行卡信息
    modif: function () {
        this.data.$api.post({
            url: "api/user/saveUserBank",
            data: {
                id: this.data.bank_id,
                name: this.data.user_name,
                tel: this.data.tel,
                bank: this.data.bank_name,
                deposit: this.data.bank_name_two,
                number: this.data.bank_num
            },
            show: true
        }).then(res => {
            wx.showToast({
                title: '修改成功',
                mask: true
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000)
        })
    },
    // 获取银行卡信息
    getUserBankId: function (id) {
        this.data.$api.get({
            url: "api/user/getUserBankId",
            data: {
                id: id
            }
        }).then(res => {
            let json = res.data.data;
            this.setData({
                user_name: json.name, //开户人姓名
                tel: json.tel, //电话
                bank_name_two: json.deposit, //开户支行
                bank_name: json.bank, //银行名称
                bank_num: json.number, //银行卡号
            })
            return;
        })
    }

})