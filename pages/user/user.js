const app = getApp();
const pageUrl = require("../../utils/pageUrl")

Page({
  data: {
    $api: app.globalData.$api.default,
    imgSrc: app.globalData.imgUrl, //图片顶地址
    $pay: app.globalData.$pay, //支付
    $login: app.globalData.$login, //登录
    userInfo: {}, //用户信息
    exclusiveList: [], // 专属服务
    myService: [], //我的服务
    historyList: [], //历史数据
    exchangeValue: "", //兑换数据
    is_exchange: false, //是否显示兑换弹窗
    userVip: {}, //是否是vip
    phoneNumber: "", //客服电话
    is_service: false, //是否是客服
    is_bootom_paly: false, //背景音乐是否播放
    pageUrls: '' //本页路径
  },
  onLoad: function (options) {
    let pageUrls = pageUrl.pageUrl()
    this.setData({
      pageUrls: pageUrls
    })
    this.getRecent();
    this.getIcon();
    this.getUserVIP();
    this.getSettings();
  },
  onPullDownRefresh: function () {
    this.getUserVIP();
    this.getRecent();
  },
  onShow: function () {
    this.getUserInfo();
    this.getUserVIP();
    this.getRecent();
    // 监听背景音乐
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
  },
  onHide: function () {
    this.setData({
      is_exchange: false
    })
  },
  // 获取用户信息
  getUserInfo: function () {
    let userinfo = wx.getStorageSync('userInfo');
    userinfo.nickname = this.uncodeUtf16(userinfo.nickname);
    let userVip = wx.getStorageSync('userVip');
    if (userVip) {
      this.setData({
        userVip: userVip
      })
    } else {
      this.setData({
        userVip: {}
      })
    }
    this.setData({
      userInfo: userinfo
    })
    wx.stopPullDownRefresh();
  },
  // 去登录
  goLogin: function () {
    wx.navigateTo({
      url: '/page-two/login/login?pageUrl=' + this.data.pageUrls,
    })
  },
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
  // 取消兑换
  cancel: function () {
    this.setData({
      is_exchange: false,
    })
  },
  // 我的服务点击
  myServiceClick: function (e) {
    let index = e.currentTarget.dataset.index;
    // 会员兑换
    if (index == 0) {
      let salt = wx.getStorageSync('salt');
      if (!salt) {
        wx.showToast({
          title: '登录后才可以兑换会员哟',
          icon: 'none',
          mask: true
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/page-two/login/login?pageUrl=' + this.data.pageUrls,
          })
        }, 500)
        return;
      }
      let userInfo = wx.getStorageSync('userInfo');
      let url = "/pages/userInfo/userInfo?address=bind";
      let msg = "还未绑定地址信息";
      if (!userInfo.mobile || !userInfo.address) {
        if(!userInfo.mobile){
          url = "/pages/bind-tel/bind-tel";
          msg = "还未绑定手机号"
        }
        wx.showModal({
          title: '友情提示',
          content: `${msg},绑定后才可以兑换会员哟~`,
          confirmText: "立即绑定",
          cancelText: "暂不绑定",
          confirmColor: "#F16E22",
          cancelColor: "#999999",
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: url,
              })
            }
          }
        })
        return;
      }
      this.setData({
        is_exchange: true
      })
      return;
    }
    // 客服
    if (this.data.myService[index].url == "service") {
      this.setData({
        is_service: true,
      })
      return;
    }
    if (this.data.myService[index].url) {
      wx.navigateTo({
        url: this.data.myService[index].url,
      })
    }
  },
  // 计算历史学习进度条长度
  setLong() {
    let v = this.data.historyList;
    v.forEach(res => {
      let num = res.progress / res.length;
      if (num > 1) {
        num = 1;
      }
      res.long = (num * 214).toFixed(2) + 'rpx';
      res.circle = (num * 100).toFixed(0);
    })
    this.setData({
      historyList: v
    })
  },
  // 获取我的历史记录
  getRecent: function () {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      this.setData({
        historyList: []
      })
      return;
    }
    this.data.$api.get({
      url: "api/user/getRecent",
      notGoError: true //不去错误等页面处理
    }).then(res => {
      if(!res.data.data){
        return
      }
      let arr = res.data.data;
      if (arr.length > 5) {
        let historyList = [];
        for (let i = 0; i < 5; i++) {
          historyList.push(arr[i]);
        }
        this.setData({
          historyList: historyList
        })
        this.setLong(); //计算进度
        return;
      }
      this.setData({
        historyList: arr
      })
      this.setLong(); //计算进度
    })
  },
  // 去收益页面
  goProfit: function () {
    wx.navigateTo({
      url: '../profit/profit',
    })
  },
  // 专属服务跳转
  exclusive: function (e) {
    let index = e.currentTarget.dataset.index;
    if (this.data.exclusiveList[index].url) {
      wx.navigateTo({
        url: this.data.exclusiveList[index].url,
      })
    }
  },
  // 去个人信息页面
  goUserInfo: function () {
    wx.navigateTo({
      url: '../userInfo/userInfo',
    })
  },
  // 获取我的服务图标
  getIcon: function () {
    this.data.$api.get({
      url: "api/index/getIcon"
    }).then(res => {
      let exclusiveList = [];
      let myService = [];
      let arr = res.data.data;
      arr.forEach(v => {
        if (v.is_exclusive) {
          exclusiveList.push(v)
        }
        if (!v.is_exclusive) {
          myService.push(v)
        }
      })
      this.setData({
        exclusiveList: exclusiveList,
        myService: myService
      })
    })
  },
  // 去签到页面
  goSign: function () {
    wx.navigateTo({
      url: '../integral/integral',
    })
  },

  // 会员兑换
  setUserExchange: function () {
    this.data.$api.post({
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
      this.getUserVIP();
      this.setData({
        is_exchange: false
      })
    })
  },
  // 获取vip状态
  getUserVIP: function () {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      wx.removeStorage({
        key: 'userVip'
      });
      this.setData({
        userInfo: {},
        userVip: {}
      })
      wx.stopPullDownRefresh();
      return;
    }
    this.data.$login.login();
    this.data.$api.get({
      url: "api/user/getUserVIP",
    }).then(res => {
      wx.setStorageSync("userVip", res.data.data);
      this.getUserInfo();
    })
  },

  // 开通vip
  openVip: function () {
    wx.navigateTo({
      url: '../vip-details/vip-details',
    })
  },
  // 拨打电话
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber,
      fail: () => {

      }
    })
  },
  // 取消联系客服
  cancelService: function () {
    this.setData({
      is_service: false
    })
  },
  // 获取服务电话
  getSettings: function () {
    this.data.$api.get({
      url: "api/index/getSettings"
    }).then(res => {
      this.setData({
        phoneNumber: res.data.data.tel
      })
    })
  },
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
  }
  
})