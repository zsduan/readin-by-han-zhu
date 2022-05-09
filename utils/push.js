let jurisdiction = ["4AS8nA-M5bxbjuMKxIVBqaoSSN4DZD2wA-6NYxn0eeE", "zN3CLmEmylmVKIkMlv_IRsoShPHDFJfsDxp_h-gmbGw"];
var $api = require("./api");

function openPush(pageUrls) {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
        wx.showToast({
            title: '请登录后在进行推送',
            icon: "none",
            mask: true
        })
        return;
    }
    wx.requestSubscribeMessage({
        tmplIds: jurisdiction,
        success: (res) => {
            if (res[jurisdiction[0]] == "accept" && res[jurisdiction[1]] == "accept") {
                wx.showToast({
                    title: '推送已开启',
                    icon: "none",
                    mask: true
                })
                $api.default.get({
                    url: "api/user/setPush"
                }).then(res => {
                    
                })
            }else if(res[jurisdiction[0]] == "accept" || res[jurisdiction[1]] == "accept"){
                wx.showToast({
                    title: '亲，您只打开了一个',
                    icon: "none",
                    mask: true
                })
                $api.default.get({
                    url: "api/user/setPush"
                }).then(res => {
                    
                })
            }else {
                wx.showToast({
                    title: '亲，您还可以在我的>设置中打开哟',
                    icon: "none",
                    mask: true
                })
            }
            return 1;
        },
        fail: (err) => {
            wx.showToast({
                title: '打开失败',
                icon: "none",
                mask: true
            })
            return 1;
        }
    })
}

module.exports = {
    openPush
}