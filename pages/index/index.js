// index.js
// 获取应用实例
const app = getApp();
const openPushs = require("../../utils/push");
Page({
  data: {
    $api: app.globalData.$api.default,
    searValue: "", //搜索数据
    navList: [], // nav数据
    bannerList: [], //banner数据
    imgSrc: app.globalData.imgUrl, //图片顶地址
    noticeTips: {}, //通知
    weekData: {}, //本周上新数据
    historyList: [], //历史数据
    hotList: [], //热门推荐数据
    hotBottom: [], //热门推荐底部数据
    count: -1, //判断热门左边数据
    lastCount: -1, // 上一个的值
    typeList: [], // 分类推荐
    scrollHeight: 0, // 页面高度
    bookList: [], //书籍列表
    page: 1, // 当前页面
    is_stop: 0, //是否停止加载
    title: "", //页面标题
    current: 0, //当前页面
    type_id: -1, //分类id
    is_fixed: false, //是否定位
    is_open: false, //是否展开nav
    is_show_pup: false, //是否展示首页弹窗
    opacity: 1, //弹窗透明度
    pupImg: "", //弹窗地址
    pup_timer: null, //弹窗定时器
    is_bootom_paly: false, //底部是否播放
    pupData: {}, //弹窗大小
    curriculumList: [], //课程节数
    is_curriculum: false, //是否为课程
    is_pup_wrop: true, //是否允许滑动
    bookHotSearch: '请输入您想搜索的内容', //搜索框的Placholder
    show_back_img: {
      week_img: true,
      banner_img: true
    }, //是否展示背景图
    show_push: false, //是否启用推送弹窗
    show_push_tips: false, //是否展开提示
    navLeft: 0 //nav左右移动距离
  },
  onShareAppMessage() {
    let path = "/pages/index/index";
    let salt = wx.getStorageSync('salt');
    if (salt) {
      path = path + '?scene=share_user=' + salt
    }
    return {
      title: "让一亿人爱上读书和思考",
      imageUrl: this.data.imgSrc + 'images/5/2021/05/e0a708b917b76cb96660c167df323679.png',
      path: path
    }
  },
  onLoad(options) {
    // 保存分享人
    if (options.scene) {
      let scene = unescape(options.scene);
      let share = {
        share_user: scene.split("=")[1]
      }
      // 自己分享不计入
      let salt_share = wx.getStorageSync('salt');
      if (!(share.share_user == salt_share)) {
        wx.setStorageSync('share', share);
      }
    }
    this.getanner(); //获取banner数据
    this.getArticleClass(); //获取分类
    this.getNewArticle(); //本周上新
    this.getClassArticle(); //获取分类推荐
    this.getRecommendArticle(); // 热门推荐
    this.getNewMessage(); //获取通知
    this.getPopup(); //获取弹窗数据
    this.getHotSearch(); //获取热门搜索
    setTimeout(() => {
      this.getHeight(".list-item"); // 获取高度
    }, 1000)
    let salt = wx.getStorageSync('salt');
    if (salt) {
      this.getRecent(); //获取历史记录
    }
  },
  // 页面隐藏关闭弹窗
  onHide: function () {
    this.closePup();
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.type_id == -1) {
      this.getanner(); //获取banner数据
      this.getArticleClass(); //获取分类
      this.getNewArticle(); //本周上新
      this.getClassArticle(); //获取分类推荐
      this.getRecommendArticle(); // 热门推荐
      this.getanner();
      let salt = wx.getStorageSync('salt');
      if (salt) {
        this.getRecent(); //获取历史记录
      }

    } else {
      this.setData({
        page: 1,
        bookList: []
      });
      this.getClassRecommend();
    }
  },
  // 触底加载
  onReachBottom: function () {
    if (!this.data.is_stop && this.data.type_id != -1) {
      let page = this.data.page;
      page += 1;
      this.setData({
        page: page
      })
      this.getTypeArticleClass();
    }
    if (this.data.type_id == -1) {
      this.getHeight(".list-item");
    }
  },
  // 页面展示获取通知
  onShow: function () {
    this.getNewMessage(); //获取通知
    let salt = wx.getStorageSync('salt');
    if (salt) {
      this.getRecent(); //获取历史记录
    } else {
      this.setData({
        historyList: []
      })
    }
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
  // 获取滚动事件
  onPageScroll(e) {
    if (e.scrollTop >= 45) {
      this.setData({
        is_fixed: true,
      })
    } else {
      this.setData({
        is_fixed: false,
      })
    }
  },

  // 获取元素高度
  getHeight(item) {
    let query = wx.createSelectorQuery();
    query.select(item).boundingClientRect(rect => {
      if (rect) {
        let height = rect.height;
        height ? height = height : height = 560;
        this.setData({
          scrollHeight: height,
        })
      }
    }).exec();
  },
  // 去搜索页面
  goSearch: function () {
    wx.navigateTo({
      url: '../search/search?q=' + this.data.bookHotSearch,
    })
  },
  // 获取输入框的值
  bindKeyInput: function (e) {
    this.setData({
      searValue: e.detail.value
    })
  },

  // 搜索事件
  search: function () {
    wx.navigateTo({
      url: '../search/search?q=' + this.data.bookHotSearch,
    })
    this.setData({
      searValue: ""
    })
  },

  // 切换顶部
  changeNav: function (e) {
    let index = 0;
    if (e.currentTarget) {
      let length = e.currentTarget.dataset.length
      index = e.currentTarget.dataset.index;
    } else if (e.index) {
      let arr = this.data.navList;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == e.index) {
          index = i;
          break;
        }
      }
    } else {
      index = e;
    }
    this.getNavWidth(index) //调用nav元素滑动距离
    let v = this.data.navList;
    this.getNavWidth(index)
    if (v[index].active) {
      return;
    }
    for (let i = 0; i < v.length; i++) {
      if (v[i].active) {
        v[i].active = 0;
        break;
      }
    }
    v[index].active = 1;
    let title = "";
    this.setData({
      navList: v,
      title: v[index].name,
      bookList: [],
      page: 1,
      type_id: v[index].id,
      current: index,
      is_stop: 0,
      is_curriculum: false,
    })
    if (v[index].id != -1) {
      title = v[index].name;
      wx.setNavigationBarTitle({ // 动态设置标题
        title: title,
      })
      this.getClassRecommend();
    } else {
      this.getHeight(".list-item"); // 获取高度
      wx.setNavigationBarTitle({ // 动态设置标题
        title: "韩朱读书",
      })
    }
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  //获取nav元素宽度
  getNavWidth: function (idx) {
    let that = this
    let obj = wx.createSelectorQuery()
    obj.selectAll('.transverse .list .item').boundingClientRect(function (rect) {
      let navWidth = rect[0].width + 22;
      let navLeft = 0;
      if(idx>=4){
        navLeft = (idx-3)*navWidth
      }else{
        navLeft = 0;
      }
      if (idx >= 4) {
        navLeft = (idx - 3) * navWidth
      }
      that.setData({
        navLeft: navLeft
      })
    })
    obj.exec();
  },

  // 主页banner改变
  bannerIndexChange: function (e) {
    let arr = this.data.navList;
    if (arr[e.detail.current].name == '课程') {
      this.setData({
        is_curriculum: true
      })
    }
    this.changeNav(e.detail.current);
  },

  // 获取banner数据
  getanner: function () {
    this.data.$api.get({
      url: "api/index/getCarousel",
      show: "true",
    }).then(res => {
      this.setData({
        bannerList: res.data.data
      })
      wx.stopPullDownRefresh();
      this.getHeight(".list-item"); // 获取高度
    })
  },

  // 获取分类
  getArticleClass() {
    this.data.$api.get({
      url: "api/index/getArticleClass",
      show: "true",
    }).then(res => {
      let v = res.data.data;
      v.unshift({
        id: -1,
        name: "推荐",
        active: 1
      })
      this.setData({
        navList: v
      })
      this.getHeight(".list-item"); // 获取高度
    })
  },

  // 获取本周上新
  getNewArticle: function () {
    this.data.$api.get({
      url: "api/index/getNewArticle",
      show: "true"
    }).then(res => {
      this.setData({
        weekData: res.data.data,
        bookHotSearch: res.data.data.title
      })
      this.getHeight(".list-item"); // 获取高度
    })
  },

  // 获取热门推荐
  getRecommendArticle: function () {
    this.data.$api.get({
      url: "api/index/getRecommendArticle",
      show: "true"
    }).then(res => {
      let v = res.data.data;
      v.forEach(o => {
        o.active = 0;
        o.listening = this.is_ten_thousand(o.listening); 
      })
      let json = this.shuffle(v);
      json[0].active = 1;
      this.setData({
        hotList: json,
        hotBottom: json[0]
      })
      this.getHeight(".list-item"); // 获取高度
    })
  },

  shuffle: function (arr) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
      let index = parseInt(Math.random() * (len - i));
      let temp = arr[index];
      arr[index] = arr[len - i - 1];
      arr[len - i - 1] = temp;
    }
    return arr;
  },

  // 获取分类的热门推荐
  // 获取热门推荐
  getClassRecommend: function () {
    this.data.$api.get({
      url: "api/article/getClassRecommend",
      data: {
        id: this.data.type_id
      },
      show: "false"
    }).then(res => {
      let v = res.data.data;
      v.forEach(o => {
        o.active = 0;
        o.listening = this.is_ten_thousand(o.listening); 
      })
      v[0].active = 1;
      this.setData({
        hotList: v,
        hotBottom: v[0]
      })
      this.getTypeArticleClass();
    })
  },

  // 获取分类所有书籍
  getTypeArticleClass: function () {
    this.data.$api.get({
      url: "api/article/getArticleClass",
      data: {
        id: this.data.type_id,
        page: this.data.page
      },
      show: true
    }).then(res => {
      let v = res.data.data;
      wx.stopPullDownRefresh();
      if (!v.length) {
        wx.showToast({
          title: '没有更多数据了',
          mask: true,
          icon: "none"
        })
        this.setData({
          is_stop: 1
        })
        return;
      }
      v.forEach(o => {
        o.active = 0;
        o.listening = this.is_ten_thousand(o.listening); 
      })
      v[0].active = 1;
      let bookList = this.data.bookList;
      bookList.push(...v);
      this.setData({
        bookList: bookList
      })
      if (v.length < 10) {
        this.setData({
          is_stop: 1
        })
      }
      let navList = this.data.navList;
      navList.forEach(o => {
        if (o.active == 1) {
          if (o.name == '课程') {
            this.getCurriculumId(v[0].id);
          }
        }
      })
      this.getHeight(".list-items"); // 获取高度
      setTimeout(() => {
        this.getHeight(".list-items"); // 获取高度
      }, 500)
    })
  },

  // 获取课程推荐
  getCurriculumId: function (id) {
    this.data.$api.get({
      url: "api/Article/getCurriculumId",
      data: {
        id: id
      }
    }).then(res => {
      this.setData({
        curriculumList: res.data.data,
      })
      setTimeout(() => {
        this.setData({
          scrollHeight: 600 + (res.data.data.length * 78)
        })
      }, 700)
    })
  },

  // 获取课程高度
  currHeight: function (e) {
    this.setData({
      scrollHeight: e.detail.scrollHeight
    })
  },

  // 获取分类推荐
  getClassArticle: function () {
    this.data.$api.get({
      url: "api/index/getClassArticle",
      show: "true"
    }).then(res => {
      let arr = res.data.data;
      arr.forEach(v => {
        v.article.forEach(o =>{
          o.listening = this.is_ten_thousand(o.listening); 
        })
      })
      this.setData({
        typeList: res.data.data
      })
      this.getHeight(); // 获取高度
    })
  },

  // 去banner的详情页
  goDetails: function (e) {
    let index = e.currentTarget.dataset.index;
    let v = this.data.bannerList;
    let url = "";
    if (v[index].url) {
      url += v[index].url;
      if (v[index].jump) {
        url += "?id=" + v[index].jump;
      }
    }
    if (url) {
      wx.navigateTo({
        url: url,
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

  // 本周上新点击
  newWeekClick: function (e) {
    let id = e.currentTarget.dataset.classid;
    wx.navigateTo({
      url: '../details/details?id=' + id,
    })
  },

  // 分类点击更多
  typeMore: function (e) {
    this.changeNav(e.detail.json);
  },
  // 获取我的历史记录
  getRecent: function () {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      return;
    }
    this.data.$api.get({
      url: "api/user/getRecent",
      notGoError:true //是否去错误页面
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
  // 展开nav
  openNav: function () {
    this.setData({
      is_open: true
    })
  },
  // 关闭nav
  closeNav: function () {
    this.setData({
      is_open: false
    })
  },
  // 获取消息
  getNewMessage: function () {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      return;
    }
    this.data.$api.get({
      url: "api/user/getNewMessage",
    }).then(res => {
      this.setData({
        noticeTips: res.data.data
      })
      wx.stopPullDownRefresh();
    })
  },
  // 去消息详情页
  goMsg: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: "../msg-details/msg-details?id=" + id
    })
    this.setData({
      noticeTips: {}
    })
  },

  // 请求弹窗数据
  getPopup: function () {
    let closePup = wx.getStorageSync('closePup');
    let date = new Date;
    let day = date.getDate();
    if (closePup == day) {
      this.closePup();
      return;
    }
    wx.removeStorageSync('closePup');
    let type = 0;
    let salt = wx.getStorageSync('salt');
    if (!salt) {
      this.closePup();
      return;
    }
    this.data.$api.get({
      url: "api/index/getPopup",
      notGoError: true,//是否跳转相关错误页面
      data: {
        type: type,
      }
    }).then(res => {
      if(!res.data.data){
        this.setData({
          is_show_pup: false
        })
        return;
      }
      let json = res.data.data;
      if (json == false) {
        this.closePup();
        return;
      }
      let num = Math.ceil(Math.random() * 2048);
      json.img = json.img + '?id=' + num;
      this.setData({
        is_show_pup: true,
        pupData: json,
      })
      if (json.height) {
        this.setData({
          pupHeight: json.height
        })
      } else {
        this.setData({
          pupHeight: "auto"
        })
      }
    })
    return;
  },

  // 关闭弹窗
  closePup: function (e) {
    this.setData({
      is_pup_wrop: false,
      is_show_pup: false,
    })
    this.getSet();
  },
  // 获取搜索的轮播内容
  getHotSearch: function () {
    this.data.$api.get({
      url: "api/index/getRecommendArticle",
    }).then(res => {
      let bookHotSearch = res.data.data;
      let i = 1;
      setInterval(() => {
        let title = bookHotSearch[i].title
        this.setData({
          bookHotSearch: title
        })
        i++;
        if (i >= bookHotSearch.length) {
          i = 0;
        }
      }, 5000);
    })
  },
  // 背景图图片
  closeBackImg: function (e) {
    let name = e.currentTarget.dataset.name;
    let show_back_img = this.data.show_back_img;
    show_back_img[name] = false;
    this.setData({
      show_back_img: show_back_img
    })
  },

  getSet: function () {
    let openRankPush = wx.getStorageSync('openRankPush');
    if (openRankPush) {
      return;
    }
    let num = wx.getStorageSync('closePushPup');
    if (num) {
      if (num >= 3) {
        return;
      }
    }
    let salt = wx.getStorageSync("salt");
    if (!salt) {
      return;
    }
    let jurisdiction = ["4AS8nA-M5bxbjuMKxIVBqaoSSN4DZD2wA-6NYxn0eeE", "zN3CLmEmylmVKIkMlv_IRsoShPHDFJfsDxp_h-gmbGw"];
    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        if (res.subscriptionsSetting.mainSwitch) {
          if (!res.subscriptionsSetting.itemSettings) {
            wx.removeStorageSync('openRankPush');
            this.setData({
              show_push: true
            })
            return;
          }
          if (res.subscriptionsSetting.itemSettings[jurisdiction[0]] == "accept" && res.subscriptionsSetting.itemSettings[jurisdiction[1]] == "accept") {
            wx.setStorageSync('openRankPush', (new Date).toString());
            return;
          } else {
            wx.removeStorageSync('openRankPush');
            this.setData({
              show_push: true
            })
          }
        }
        if (!res.subscriptionsSetting.mainSwitch) {
          wx.removeStorageSync('openRankPush');
          this.setData({
            show_push: true
          })
        }
      }
    })
  },
  // 关闭推送弹窗
  closePushPup: function (e) {
    let id  = e.currentTarget.dataset.id;
    this.setData({
      show_push: false
    })
    let num = wx.getStorageSync('closePushPup');
    if (!num) {
      num = 0;
    }
    if(id){
      wx.showToast({
        title: '亲，您还可以在我的>设置中打开哟',
        icon: "none",
        mask: true
      })
    }
    wx.setStorageSync('closePushPup', Number(num) + 1);
  },
  // 开启通知
  openPush: function () {
    openPushs.openPush();
    this.setData({
      show_push_tips: true
    })
    setTimeout(() => {
      this.closePushPup();
    }, 15000)
  },
  // 是否超过1w
  is_ten_thousand(num){
    if(num > 10000){
      num = (num / 10000).toFixed(2) + "万"
    }
    return num;
  }

})