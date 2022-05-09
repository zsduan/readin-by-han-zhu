// app.js
const $api = require("./utils/api.js"); //请求
const $login = require("./utils/login"); //判断登录状态
const $pay = require("./utils/pay"); //支付
const updateManager = wx.getUpdateManager();
const $browsing = require("./utils/browsing-history");
const bgMusic = wx.getBackgroundAudioManager();
const pageUrl = require("./utils/pageUrl");
const log = require("./utils/log");

App({
  //当加载小程序时，页面路径不存在时
  onPageNotFound(res) {
    wx.redirectTo({
      url: '/page-three/404/404',
    })
  },
  onLaunch() {
    log.info("启动了小程序");
    // 初次加载的时候清空相应数据
    wx.removeStorageSync('is_close');
    wx.removeStorageSync('duration');
    wx.removeStorageSync('play_distance');
    wx.removeStorageSync('edition_now');
    wx.removeStorageSync('palyVideo');
    wx.removeStorageSync('paly_music');
    wx.removeStorageSync('clearFocus');
    this.updata(); //版本更新
    let currentTime = wx.getStorageSync('currentTime');
    let paly_time = wx.getStorageSync('paly_time');
    if (paly_time || currentTime) {
      paly_time = paly_time ? paly_time % 300 : 0;
      //执行上传任务
      $browsing.browsing(paly_time, 0, 1, false, currentTime) //保存记录
      setTimeout(() => {
        wx.removeStorageSync('paly_time');
        wx.removeStorageSync('currentTime');
        wx.removeStorageSync('Record_id');
        wx.removeStorageSync('bookDetails');
        wx.removeStorageSync('bookInfo');
      }, 1000)
    } else {
      wx.removeStorageSync('Record_id');
      wx.removeStorageSync('bookDetails');
      wx.removeStorageSync('bookInfo');
    }
    setTimeout(() => {
      let salt = wx.getStorageSync('salt');
      if (salt) {
        return;
      }
      wx.showModal({
        title: '登录提醒',
        content: '检测到您还没有登录，登录享更多服务~',
        confirmText: "立即登录",
        cancelText: "暂不登录",
        confirmColor: "#F16E22",
        cancelColor: "#999999",
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: "/page-two/login/login?pageUrl=" + pageUrl.pageUrl()
            })
          }
        }
      })
    }, 3000);
    this.upLog('browsing');
  },
  onShow() {
    this.getuserVip(); // 获取vip状态
  },
  onHide: function () {
    if (bgMusic.paused == false) { //是否播放
      let salt = wx.getStorageSync('salt');
      if (salt) {
        $browsing.browsing(this.globalData.paly_time, 0, 4, false, bgMusic.currentTime) //保存记录
        this.globalData.paly_time = 0;
        setTimeout(() => {
          wx.removeStorageSync('bookDetails');
          wx.removeStorageSync('bookInfo');
        }, 2000)
      }
    }
  },
  // 获取vip状态
  getuserVip: function () {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      wx.removeStorage({
        key: 'userVip'
      });
      return;
    }
    wx.removeStorageSync('share');
    $login.login(); //获取用户信息
    $api.default.post({
      url: "api/user/getUserVIP",
    }).then(res => {
      wx.setStorageSync("userVip", res.data.data);
    })
  },
  // 更新版本
  updata: function () {
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
  },
  // 上传日志
  upLog: function (logName) {
    let Log = wx.getStorageSync(logName);
    if (Log) {
      Log = logName + "日志:" + JSON.stringify(Log);
      let arr = [];
      let num = 0;
      if (Log.length > 2000) {
        num = Log.length / 2000;
        num = Number(num.toFixed(0));
      }
      for (let i = 0; i < num + 1; i++) {
        if (i + 1 < num + 1) {
          arr.push(Log.substr(i * 2000, (i + 1) * 2000))
        } else {
          arr.push(Log.substr((i + 1) * 2000, arr.length))
        }
      }
      if (num == 0) {
        arr.push(Log);
      }

      let userInfo = wx.getStorageSync('userInfo');
      if (!userInfo.id) {
        return;
      }

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].length != 0) {
          $api.default.post({
            url: "api/index/setFeedback",
            data: {
              id: userInfo.id,
              text: arr[i]
            },
            show: true
          }).then(res => {
            wx.removeStorageSync(logName);
          })
        }
      }
    }
  },


  globalData: {
    imgUrl: "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/",
    $api: require("./utils/api.js"),
    $login: $login, //登录
    $pay: $pay, // 支付
    paly_time: 0, // 音频播放时长
    seep_time: 0, //进度时长
    video_time: 0, // 视频播放时长
  },

})