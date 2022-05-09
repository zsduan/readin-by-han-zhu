
const app = getApp()
Page({
  data: {
    
  },

  onLoad: function (options) {
   
  },

  goHome:function(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})