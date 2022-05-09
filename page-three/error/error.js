const app = getApp();
const pageUrl = require("../../utils/pageUrl")

Page({
  data: {
    pageUrls:'' ,//跳转上一页面路径
    errMsg:'' //错误提示
  },

  onLoad: function (options) {
    let pageUrls
    if(this.data.pageUrls){
      pageUrls = this.data.pageUrls
    }else{
      let pages = pageUrl.pageBack(options.pageUrl)
      pages = pages.split("pageUrl=")
      let num = pages.length-1
      pageUrls = pages[num]
    }
    this.setData({
      pageUrls:pageUrls,
      errMsg: options.errMsg
    })
  },

  goHome:function(){
    let url = this.data.pageUrls
    pageUrl.pageTo(url)
  }
})