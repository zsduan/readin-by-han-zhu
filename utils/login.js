// 获取用户信息
var $api = require("./api");

function login(url) {
    let salt = wx.getStorageSync('salt');
    if (!salt) {
        return;
    }
    $api.default.post({
        url: "api/user/getUserSalt",
        data: {
            salt: salt
        }
    }).then(res => {
        let json = res.data.data;
        json.nickname = uncodeUtf16(json.nickname);
        wx.setStorageSync('userInfo', json);
        if (url) { //是否重新刷新页面
            wx.redirectTo({
                url: url,
            })
        }
    })
}

// 转换评论数据
function uncodeUtf16(str) {
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

module.exports = {
    login: login
}