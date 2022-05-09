const utils = require("./util");
const pageUrl = require("./pageUrl");

export default {
    // get请求
    get(data, stauts) {
        // let urls = "http://test.hzdsh169.com/index.php/";
        let urls = "https://admin.hzdsh169.com/index.php/";
        urls = `${urls}${data.url}`;
        let staut = stauts || 0;
        if (data.show) {
            wx.showLoading({
                title: "加载中...",
                mask: true
            })
        }
        let notGoError = data.notGoError //推送错误判断
        let e = {};
        let salt = wx.getStorageSync('salt');
        let userId = wx.getStorageSync('userInfo').id;
        if (salt) {
            e.salt = salt;
        }
        if (userId) {
            e.userId = userId;
        }
        for (let key in data.data) {
            e[key] = data.data[key]
        }
        return new Promise((resolve, reject) => {
            wx.request({
                url: urls,
                method: "GET",
                data: e,
                success: (res) => {
                    if(notGoError){
                        resolve(res);
                        return;
                    }
                    if (res.statusCode != 200) {
                        staut += 1;
                        if (staut < 3) {
                            this.get(data, staut);
                        } else {
                            wx.hideLoading();
                            this.feedback(data.url, e, res.statusCode);
                            let goUrl = '/page-three/error/error?pageUrl='+pageUrl.pageUrl();
                            let words = "网络有点小问题，请收稍后再试";
                            this.handUrl(goUrl,words,res.errMsg,res.statusCode);
                        }
                    } else {
                        wx.hideLoading();
                        if (res.data.msg == "用户不存在") {
                            let words = "您还没有登录哟";
                            let goUrl = '/page-two/login/login?pageUrl=' + pageUrl.pageUrl();
                            this.handUrl(goUrl,words);
                        } else {
                            resolve(res);
                        }
                    }
                },
                fail: (err) => {
                    if(notGoError){
                        return;
                    }
                    staut += 1
                    if (staut < 3) {
                        this.get(data, staut);
                    } else {
                        wx.hideLoading();
                        this.feedback(data.url, e, JSON.stringify(err));
                        let words = "网络有点延迟，请收稍后再试";
                        let goUrl = '/page-three/error/error?pageUrl='+pageUrl.pageUrl()
                        this.handUrl(goUrl,words,err.errMsg);
                        reject(err)
                    }
                }
            })
        })
    },
    // post请求
    post(data, stauts) {
        // let urls = "http://test.hzdsh169.com/index.php/";
        let urls = "https://admin.hzdsh169.com/index.php/";
        urls = `${urls}${data.url}`;
        let staut = stauts || 0;
        if (data.show) {
            wx.showLoading({
                title: "加载中...",
                mask: true
            })
        }
        let notGoError = data.notGoError //推送错误判断
        let e = {};
        let salt = wx.getStorageSync('salt');
        let userId = wx.getStorageSync('userInfo').id;
        if (salt) {
            e.salt = salt;
        }
        if (userId) {
            e.userId = userId;
        }
        for (let key in data.data) {
            e[key] = data.data[key]
        }
        return new Promise((resolve, reject) => {
            wx.request({
                header: {
                    'content-type': 'application/x-www-form-urlencoded',
                },
                url: urls,
                method: "POST",
                data: e,
                success: (res) => {
                    if(notGoError){
                        resolve(res);
                        return;
                    }
                    if (res.statusCode != 200) {
                        staut += 1;
                        if (staut < 3) {
                            this.get(data, staut);
                        } else {
                            wx.hideLoading();
                            this.feedback(data.url, e, res.statusCode);
                            let goUrl = '/page-three/error/error?pageUrl='+pageUrl.pageUrl();
                            let words = "网络有点小问题，请收稍后再试";
                            this.handUrl(goUrl,words,res.errMsg,res.statusCode);
                        }
                    } else {
                        wx.hideLoading();
                        if (res.data.msg == "用户不存在") {
                            let words = "您还没有登录哟";
                            let goUrl = '/page-two/login/login?pageUrl=' + pageUrl.pageUrl()
                            this.handUrl(goUrl,words)
                        } else {
                            resolve(res);
                        }
                    }
                },
                fail: (err) => {
                    if(notGoError){
                        return;
                    }
                    staut += 1
                    if (staut < 3) {
                        this.get(data, staut);
                    } else {
                        wx.hideLoading();
                        this.feedback(data.url, e, JSON.stringify(err));
                        let words = "网络有点延迟，请收稍后再试";
                        let goUrl = '/page-three/error/error?pageUrl='+pageUrl.pageUrl()
                        this.handUrl(goUrl,words,err.errMsg);
                        reject(err)
                    }
                }
            })
        })
    },
    
    feedback(url, data, code) {
        let model = "";
        wx.getSystemInfo({
            success: (result) => {
                model = result.brand + " " + result.model;
            },
        })
        let date = new Date; 
        let userInfo = wx.getStorageSync('userInfo');
        let id = userInfo.id;
        id = id ? id : "用户未登录";
        let time = utils.formatTime(date);
        let q = ""; //获取请求参数
        for (let key in data) {
            q = q + '"' + key + '":"' + data[key] + '",'
        }
        let pages = getCurrentPages(); //获取加载的页面
        let pageUrl = ""; //页面地址
        if (pages.length) {
            let currentPage = pages[pages.length - 1]; //获取当前页面的对象
            pageUrl = currentPage.route; //当前页面url
        }
        pageUrl = pageUrl ? pageUrl : "未获取到页面地址"
        let str = `url:${url},参数：{${q}},用户id:${id},用户名称：${userInfo.nickname},时间：${time},错误代码：${code},手机型号：${model},页面地址:${pageUrl}`;
        let urls = "https://admin.hzdsh169.com/index.php/";
        // let urls = "http://test.hzdsh169.com/index.php/";
        wx.request({
            url: urls + 'api/index/setFeedback',
            data: {
                id: userInfo.id || 3899,
                salt: userInfo.salt || "C5Vlthh2",
                text: str
            },
            success: (res) => { }
        })
    },

    //请求问题跳转页面
    handUrl(goUrl,words,errMsg,statusCode){
        let errMsgs = errMsg
        if(statusCode){
             errMsgs = errMsg+'statusCode:'+statusCode
        }
        wx.showToast({
            title: words,
            mask: true,
            icon: "none"
        })
        if (statusCode == 404) {
            goUrl = '/page-three/404/404'
        }else if(statusCode == 500){
            goUrl = '/page-three/500/500'
        }else{
            goUrl = goUrl
        }
        if(goUrl == "/page-three/404/404" || goUrl == "/page-three/500/500"){
            setTimeout(() => {
                wx.reLaunch({
                    url: goUrl,
                })
            }, 500);
          return;
        }
       setTimeout(() => {
            wx.redirectTo({
                url: goUrl+'&errMsg='+errMsgs,
            })
        }, 500)
    }

}