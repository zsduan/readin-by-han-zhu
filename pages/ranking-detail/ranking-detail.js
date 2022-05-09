const app = getApp();
Page({
  data: {
    $api: app.globalData.$api.default,
    bookList: [], //书籍列表
    is_bookList:false,//书籍是否为空
    userId: [], //用户id
    userInfo:[], //用户其他信息
    ranking_time:[],//排名和时间
    is_time: true, //时间是否为零
    salt: '', //唯一标识符
    is_stop: 0, //是否停止上拉加载
    page: 1,//当前页面
    is_bootom_paly: false, //底部是否播放
    pageHeight: 560 //page的高度设置
  },

  onLoad: function (options) {
    let userId = options.userId
    this.setData({
      userId: userId
    })
    this.getUserId();
    setTimeout(()=>{
      this.getPageHeight();
    },2000)
    
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

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      bookList: [],
      is_stop: 0,
      is_time: true, 
    })
    this.getUserId();
   
  },

  //上拉加载页面
  onReachBottom: function () { //触底开始下一页
    if (this.data.is_stop) {
      return
    }
    let page = this.data.page + 1; //获取当前页数并+1
    this.setData({
      page: page, //更新当前页数
    })
    this.getHistory(); //重新调用请求获取下一页数据
  },

  //获取用户信息
  getUserId: function () {
    wx.stopPullDownRefresh();
    this.data.$api.get({
      url: "api/user/getUserId",
      data: {
        id: this.data.userId,
      }
    }).then(res => {
      let salt = res.data.data.salt;
      let userTitle = this.uncodeUtf16(res.data.data.nickname);
      if(userTitle.length > 4){
        userTitle = userTitle.slice(0, 4)  + ".."
      }
      userTitle = userTitle.concat('学习动态')
      this.setData({
        salt: salt
      })
      //添加动态标题
      wx.setNavigationBarTitle({
        title: userTitle
      })
      this.getHistory()
      this.getInformation()
      this.getExceedUsers()
    })
  },

  //获取历史学习书籍
  getHistory: function () {
    let salt = this.data.salt;
    this.data.$api.get({
      url: "api/user/getRecent",
      notGoError:true, //不做请求失败的处理
      data: {
        salt: salt,
        page: this.data.page
      }
    }).then(res => {
      if(!res.data.data){
        return
      }
      let bookList = this.data.bookList
      let arr = res.data.data;
      let is_bookList = false
      if(arr.length == 0){
        is_bookList =true
      }
      if(!arr.length){
        this.setData({
          is_stop: 1
        })
      }else{
        arr.forEach(arr => {
          arr.active = 0;
          let num = arr.progress / arr.length;
          if (num > 1) {
            num = 1;
          }
          arr.circle = (num * 100).toFixed(0);
          arr.long = (num * 292).toFixed(2) + 'rpx';
          arr.circle = (num * 100).toFixed(0);
          if (arr.frequency) {
            arr.long = "292rpx"
          }
        })
        arr[0].active = 1;
      }
      bookList.push(...arr);
      this.setData({
        bookList: bookList,
        is_bookList: is_bookList
      })
    })
    setTimeout(()=>{
      this.getPageHeight();
    },1000)
  },

  // 获取用户阅读信息
  getInformation: function () {
    let salt = this.data.salt;
    this.data.$api.get({
      url: "api/user/getInformation",
      data: {
        salt: salt
      }
    }).then(res => {
      let userInfo = res.data.data
      // let addr = JSON.stringify(userInfo.address)
      let addr = userInfo.address
      if (!addr || addr == 'null') {
        addr = "暂无数据";
        userInfo.address = addr;
      }
      userInfo.nickname = this.uncodeUtf16(userInfo.nickname)
      this.setData({
        userInfo: userInfo
      })
    })
  },

  // 获取排名
  getExceedUsers: function () {
    let salt = this.data.salt;
    this.data.$api.get({
      url: "api/user/getExceedUsers",
      data: {
        salt: salt
      }
    }).then(res => {
      let ranking_time = res.data.data
      ranking_time.hour = this.zero(res.data.data.hour);
      ranking_time.minute = this.zero(res.data.data.minute);
      ranking_time.second = this.zero(res.data.data.second);
      let is_time = this.data.is_time;
      if (ranking_time.hour == 0 && ranking_time.minute == 0 && ranking_time.second == 0) {
        is_time = false
      }
      this.setData({
        ranking_time: ranking_time,
        is_time: is_time
      })
    })
  
  },
  // 数字小于10时补0
  zero: function (num) {
    if (num < 10) {
      return "0" + num
    }
    return num
  },

  // 点击图片放大
  viewPicture: function (e) {
    let src = this.data.userInfo.avatar;
    let arr = [];
    arr.push(src);
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },
  //到我的排名页面
  goShareImg: function () {
    let salts = wx.getStorageSync('salt');
    if (salts == this.data.salt) {
      wx.navigateTo({
        url: '../share-img/share-img',
      })
    }
  },
    //获取整个页面高度
    getPageHeight:function(){
      let _this = this
      let winHeight = 0
      wx.getSystemInfo({
        success (res) {
          winHeight = res.windowHeight
        }
      })
      let query = wx.createSelectorQuery();
      query.select('.content').boundingClientRect(rect => {
        if (rect) {
          let height = rect.height+79;
          // let height = 200;
          (height>winHeight) ? height =height : height= winHeight
         _this.setData({
           pageHeight: height
         })
        }
      }).exec();
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