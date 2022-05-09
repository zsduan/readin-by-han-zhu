const app = getApp();
const {
    pageBack
} = require("../../utils/pageUrl");
const pageUrl = require("../../utils/pageUrl")
Page({

    data: {
        $api: app.globalData.$api.default,
        id: 0, // 用户id
        option: {}, //缓存数据
        options: {},
        userInfo: {}, //用户个人信息
        pageUrl: '' //跳转地址和参数
    },

    onLoad: function (options) {
        let pageUrl = options.pageUrl
        pageUrl = pageBack(pageUrl)
        let share = wx.getStorageSync('share');
        this.setData({
            option: share,
            options: options,
            pageUrl: pageUrl
        })
    },
    // 逻辑：先获取用户唯一标识，在通过唯一标志查找用户，如果有直接登录 ， 没有获取用户信息
    login: function () {
        wx.showLoading({
            title: '登录中',
        })
        wx.login({
            timeout: 1000,
            success: (res) => {
                this.data.$api.post({
                    url: "api/user/getCodeOpenid",
                    data: {
                        code: res.code
                    }
                }).then(res => {
                    let id = res.data.data.openid;
                    this.setData({
                        id: id
                    })
                    this.getUserOpenid(id);
                })
            }
        })
    },
    // 获取用户注册id
    getUserOpenid: function (id) {
        wx.request({
            header: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            url: 'https://admin.hzdsh169.com/index.php/api/user/getUserOpenid',
            method: "POST",
            data: {
                openid: id
            },
            success: (res) => {
                if (res.data.code) {
                    wx.setStorageSync('salt', res.data.data.salt);
                    // wx.setStorageSync('salt', 'C5Vlthh2');
                    wx.setStorageSync('userInfo', res.data.data);
                    this.getUserVip();
                    wx.showToast({
                        title: "登录成功"
                    })
                    wx.hideLoading();
                    let options = this.data.options;
                    let share = wx.getStorageSync('share');
                    let url = "";
                    if (options.share_card) {
                        url = '/pages/gift-card/gift-card?share_id=' + share.share_id + '&share_user=' + share.share_user;
                        setTimeout(() => {
                            this.navTo(url);
                        }, 500)
                        return;
                    } else {
                        url = this.data.pageUrl;
                        pageUrl.pageTo(url)
                    }
                    return;
                }
                this.setUserOpenid(this.data.userInfo);
            }
        })
    },
    // 获取用户信息
    getUserInfo: function () {
        let loginTime = wx.getStorageSync('loginTime');
        if (loginTime) {
            wx.showToast({
                title: '您已经点击过了，请勿重复点击',
                icon: "none",
                mask: true
            })
            return;
        }
        wx.setStorageSync('loginTime', new Date);
        setTimeout(() => {
            wx.removeStorageSync('loginTime')
        }, 500)
        wx.getSystemInfo({
            success: (result) => {
                if (result.platform == "windows") { //兼容电脑版
                    wx.getUserInfo({
                        success: (res) => {
                            this.setData({
                                userInfo: res.userInfo
                            })
                            this.login();
                        },
                    })
                    return;
                }
                wx.getUserProfile({ //手机版
                    desc: "为了更好的提供会员服务",
                    success: (res) => {
                        this.setData({
                            userInfo: res.userInfo
                        })
                        this.login();
                    },
                    fail: (err) => {
                        wx.hideLoading();
                        wx.showToast({
                            title: `用户取消授权：错误信息：${err.errMsg}`,
                            icon: "none",
                            mask: true
                        })
                    }
                })
            },
        })
    },
    // 注册
    setUserOpenid: function (userInfo) {
        let data = {
            openid: this.data.id,
            salt: "",
            nickname: this.utf16toEntities(userInfo.nickName),
            avatar: userInfo.avatarUrl
        }
        let share = this.data.option;
        if (share.share_user) {
            data.salt = share.share_user;
        }
        if (share.share_curriculum_id) {
            data.share_id = share.share_curriculum_id;
        }
        this.data.$api.post({
            url: "api/user/setUserOpenid",
            data: data
        }).then(res => {
            wx.setStorageSync('salt', res.data.data.salt);
            let json = res.data.data;
            json.nickname = uncodeUtf16(json.nickname);
            wx.setStorageSync('userInfo', json);
            this.getUserVip();
            let url = "";
            url = "/pages/bind-tel/bind-tel?share=true";
            wx.showToast({
                title: "登录成功"
            })
            wx.hideLoading();
            setTimeout(() => {
                this.navTo(url);
            }, 500)
        })
    },
    // 跳转
    navTo: function (url) {
        wx.redirectTo({
            url: url,
        })
    },
    // 获取vip状态
    getUserVip: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.removeStorage({
                key: 'userVip'
            });
            return;
        }
        this.data.$api.post({
            url: "api/user/getUserVIP",
        }).then(res => {
            wx.setStorageSync("userVip", res.data.data);
        })
    },
    // 去服务协议页面
    goService: function () {
        wx.navigateTo({
            url: "/pages/regulation/regulation?type=service"
        })
    },
    // 随便看看
    goHome: function () {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    // 发表评论转字符串
    utf16toEntities: function (str) {
        var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则 
        str = str.replace(patt, function (char) {
            var H, L, code;
            if (char.length === 2) {
                H = char.charCodeAt(0); // 取出高位 
                L = char.charCodeAt(1); // 取出低位 
                code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法 
                return "&#" + code + ";";
            } else {
                return char;
            }
        });
        return str;
    },
    // 转换评论数据
    uncodeUtf16: function (str) {
        var reg = /\&#.*?;/g;
        var result = str.replace(reg, function (char) {
            var H, L, code;
            if (char.length == 9) {
                code = parseInt(char.match(/[0-9]+/g));
                H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
                L = (code - 0x10000) % 0x400 + 0xDC00;
                return unescape("%u" + H.toString(16) + "%u" + L.toString(16));
            } else {
                return char;
            }
        });
        return result;
    },
})