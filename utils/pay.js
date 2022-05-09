const $api = require("./api");
const $login = require("./login");
const pageUrl = require("./pageUrl");

function pay(id, moeny, type, article) {
    /*
        数据说明：
        id : card_id,
        moeny : 钱
        type ： 1 会员 2 礼品卡 3 全集 4 分集
        article : 转json的数据，用于支付课程
    */ 
    let salt = wx.getStorageSync('salt');
    if (!salt) {
        wx.showToast({
            title: '登录后才可以开通会员哟',
            icon: 'none',
            mask: true
        })
        setTimeout(() => {
            wx.navigateTo({
                url: '/page-two/login/login?pageUrl='+pageUrl.pageUrl(),
            })
        }, 500)
        return;
    }
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo.mobile || !userInfo.address){
        wx.showToast({
          title: '您没有绑定手机号或者地址信息',
          mask:true,
          icon : "none",
          duration : 2000
        })
        setTimeout(()=>{
            wx.navigateTo({
              url: '/pages/userInfo/userInfo',
            })
        },2000)
        return;
    }
    wx.showLoading({
      title: '正在调起支付请稍等',
      mask:true
    })
    let data = {
        card_id: id, //会员id为0
        price: moeny,
        type: type
    }
    if(article){
        data.article = article
    }
    return new Promise((resolve, reject) => {
        let sign = false;
        $api.default.post({
            url: "api/order/setOrder",
            data: data
        }).then(res => {
            let json = res.data.data;
            wx.requestPayment({
                nonceStr: json.nonce_str,
                package: json.package,
                paySign: json.paySign,
                timeStamp: json.timeStamp.toString(),
                signType: json.signType,
                success: (res) => {
                    selectPay(json.id).then(value => {
                        wx.hideLoading();
                        if (value) {
                            wx.showToast({
                                title: '支付成功',
                            })
                            sign = true;
                            setTimeout(() =>{
                                resolve(sign);
                            },500)
                        }else {
                            resolve(sign);
                        }
                    });
                },
                fail: (err) => {
                    selectPay(json.id).then(value => {
                        if (value) {
                            wx.showToast({
                                title: '支付成功',
                            })
                            sign = true;
                            resolve(sign);
                        } else {
                            resolve(sign);
                        }
                    });
                    if (!sign) {
                        wx.showToast({
                            title: '用户已取消支付',
                            icon: "none",
                            mask: true
                        })
                    }
                }
            })
        })
    })
}

function selectPay(id) {
    return new Promise((resolve, reject) => {
        let sign = false;
        $api.default.post({
            url: "api/order/orderQuery",
            data: {
                id: id
            }
        }).then(res => {
            if (res.data.code) {
                sign = true;
            };
            resolve(sign);
        })

    })

}

module.exports = {
    pay: pay
}