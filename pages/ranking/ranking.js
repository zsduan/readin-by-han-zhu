const app = getApp();
const pageUrl = require('../../utils/pageUrl');
Page({
  data: {
    imgSrc: app.globalData.imgUrl, //图片顶地址
    $api: app.globalData.$api.default,
    recordList: [], //列表
    user: {}, //我的数据
    is_bootom_paly: false, //底部是否播放
    is_show_me: true, //是否显示我的
    is_show_none: true, //暂无排名
    pageUrls: ''
  },

  onLoad: function (options) {
    let salt = wx.getStorageSync('salt');
    this.setData({
      pageUrls: pageUrl.pageUrl()
    })
    if (!salt) {
      this.setData({
        is_show_me: false,
      })
    }
    this.getRanking();
  },
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
  },
  onPullDownRefresh: function () {
    this.setData({
      recordList: []
    })
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      this.setData({
        is_show_me: false,
      })
    }
    this.getRanking();
  },
  // 获取排行榜数据
  getRanking: function () {
    this.data.$api.get({
      url: "api/article/getRanking",
      show: true
    }).then(res => {
      let v = res.data.data;
      let recordList = this.data.recordList;
      v.record.forEach(res => {
        res.hour = this.zero(res.hour);
        res.minute = this.zero(res.minute);
        res.second = this.zero(res.second);
        res.nickname = this.uncodeUtf16(res.nickname);
      })
      recordList.push(...v.record);
      let user = this.data.user;
      user = v.user;
      user.hour = this.zero(user.hour);
      user.minute = this.zero(user.minute);
      user.second = this.zero(user.second);
      if (user.id) {
        this.setData({
          is_show_none: false
        })
      }
      this.setData({
        recordList: recordList,
        user: user,
      })
      wx.stopPullDownRefresh();
    })
  },
  // 补零
  zero: function (num) {
    if (num < 10) {
      return "0" + num
    }
    return num
  },
  // 点赞
  fabulousRecord: function (e) {
    let id = e.currentTarget.dataset.id;
    let recordList = this.data.recordList;
    recordList.forEach(v => {
      if (v.id == id) {
        v.is_fabulous = !v.is_fabulous;
        v.is_fabulous ? v.fabulous += 1 : v.fabulous -= 1;
        v.is_fabulous < 0 ? 0 : v.is_fabulous;
      }
    })
    this.data.$api.get({
      url: "api/article/fabulousRecord",
      data: {
        record: id
      }
    }).then(res => {
      let user = this.data.user;
      if (id == user.id) {
        user.is_fabulous = !user.is_fabulous;
        user.is_fabulous ? user.fabulous += 1 : user.fabulous -= 1;
        user.is_fabulous = user.is_fabulous < 0 ? 0 : user.is_fabulous;
        this.setData({
          user: user
        })
      }
      this.setData({
        recordList: recordList
      })
    })
  },
  // 展示规则
  showTips: function () {
    wx.navigateTo({
      url: '../regulation/regulation?type=rank',
    })
  },
  // 去登录页面
  goLogin: function () {
    wx.redirectTo({
      url: '/page-two/login/login?pageUrl=' + this.data.pageUrls,
    })
  },
  //点击跳转到个人信息详情页
  goDetails: function (e) {
    let userId = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '../ranking-detail/ranking-detail?userId=' + userId,
    })
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
  }

})