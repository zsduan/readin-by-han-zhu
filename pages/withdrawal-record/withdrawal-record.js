const app = getApp();
Page({
  data: {
    $api: app.globalData.$api.default,
    getWithdrawal: [], //获取的提现记录数据
    is_stop: 0, //是否停止上拉加载
    page: 1, //当前页
  },
  onLoad: function (options) {
    this.getWithdraw();
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      getWithdrawal: [],
      is_stop: 0,
    })
    this.getWithdraw();
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
    this.getWithdraw(); //重新调用请求获取下一页数据
  },

  //获取提现记录的信息
  getWithdraw: function () {
    this.data.$api.get({
      url: "api/user/getWithdraw",
      data: {
        page: this.data.page,
      }
    }).then(res => {
      wx.stopPullDownRefresh();
      let getWithdrawal = this.data.getWithdrawal
      let arr = res.data.data
      if (!arr.length) {
        this.setData({
          is_stop: 1
        })
        return;
      }
      getWithdrawal.push(...arr);
      this.setData({
        getWithdrawal: getWithdrawal,
      })
    })
  }

})