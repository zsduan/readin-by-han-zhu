//登录跳转到当前页面
function pageUrl() {
    let pages = getCurrentPages(); //获取加载的页面
    let pageUrl = ""; //页面地址
    let option = pages[pages.length - 1].options;
    let str = "";
    let count = 0;
    if (option) {
      for (let key in option) {
        count++;
        if (count == 1) {
          str += '~' + key + "#" + option[key];
        } else {
          str += '!' + key + "#" + option[key];
        }
      }
    }
    if (pages.length) {
      let currentPage = pages[pages.length - 1]; //获取当前页面的对象
      pageUrl = currentPage.route; //当前页面url
    }
    pageUrl = "/" + pageUrl + str;
    return pageUrl;
  }
  
  function pageBack(pageUrl) {
    if(pageUrl){
      pageUrl = pageUrl.replace(/~/,"?");
      pageUrl = pageUrl.replace(/#/g,"=");
      pageUrl = pageUrl.replace(/!/g,"&");
    }
    return pageUrl
  }

  function pageTo(url){
    if(!url){
      url="/pages/index/index"
    }
    if(url == '/pages/index/index' || url == '/pages/ranking/ranking' || url == '/pages/user/user'){
      setTimeout(() => {
          wx.switchTab({
            url: url,
          })
      }, 500)
  }else{
      setTimeout(() => {
          wx.redirectTo({
            url: url,
          })
      }, 500)
  }
  }
  
  module.exports = {
    pageUrl: pageUrl,
    pageBack: pageBack,
    pageTo: pageTo

  }