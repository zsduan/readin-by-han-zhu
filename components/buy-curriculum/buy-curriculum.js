const pageUrl = require("../../utils/pageUrl");

const app = getApp();
Component({

    properties: {
        show: {
            type: Boolean,
            value: false
        },
        all_price: { //总价
            type: String,
            value: '0.00'
        },
        curriculum: { //课程列表
            type: Array,
            value: []
        },
        title: {
            type: String,
            value: '未获取到书籍信息'
        },
        total_price: {
            type: String,
            value: "0.00"
        },
        curriculum_id: { //书籍id
            type: String,
            value: '0'
        },
        pageUrls : {
            type : String,
            value: '0'
        }
    },


    data: {
        $api: app.globalData.$api.default, //请求数据
        $pay: app.globalData.$pay, //支付
        $login: app.globalData.$login, //登录 
        navList: [{
                id: 1,
                title: "购买全集 ",
                active: 1
            },
            {
                id: 2,
                title: "购买单集",
                active: 0
            }
        ],
        is_all: true, //是否买整本
        sumNum: 0, //总数量
        Unit_Price: 0.00, //单集价格
    },

    methods: {
        // 切换nav
        changeNav: function (e) {
            let index = 0
            if (e.currentTarget) {
                index = e.currentTarget.dataset.index;
            }else{
                index = e;
            }
            let v = this.data.navList;
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
            let is_all = index ? false : true;
            let arr = this.data.curriculum;
            if (!index) {
                arr.forEach(res => {
                    res.active = 0;
                })
                this.setData({
                    Unit_Price: '0.00',
                    all_price: '0.00',
                    curriculum: arr
                })
            }
            this.setData({
                navList: v,
                is_all: is_all
            })
        },
        // 关闭弹窗
        closePup: function () {
            this.setData({
                show: false
            })
        },
        // 选集计算
        Anthology: function (e) {
            let index = e.currentTarget.dataset.index;
            let arr = this.data.curriculum;
            if (arr[index].type != 1) {
                wx.showToast({
                    title: '免费和已购的书籍不用购买',
                    icon: "none",
                    mask: true,
                    duration: 2500
                })
                return;
            }
            let sum = 0; //总价格
            arr[index].active = arr[index].active ? 0 : 1;
            let count = 0;

            arr.forEach(v => {
                if (v.active) {
                    let Unit_Price = parseFloat(v.price);
                    sum += Unit_Price;
                    count += 1;
                }
            })

            this.setData({
                curriculum: arr,
                all_price: sum.toFixed(2),
                sumNum: count,
                Unit_Price: arr[index].price
            })
        },
        // 没有价格
        EmptyPay: function () {
            wx.showToast({
                title: '还没有选择集数',
                icon: "none",
                mask: true,
                duration: 500
            })
        },
        // 去vip详情页
        goVipDetails: function () {
            wx.navigateTo({
                url: '/pages/vip-details/vip-details?pageUrl='+this.data.pageUrls,
            })
        },
        // 支付
        pay: function () {
            let salt = wx.getStorageSync('salt');
            if (!salt) {
                wx.showToast({
                    title: '登录才能购买',
                    icon: "none",
                    mask: true
                })
                setTimeout(() => {
                    wx.navigateTo({
                        url: '/page-two/login/login?pageUrl='+this.data.pageUrls,
                    })
                }, 1000)
                return;
            }
            if (this.data.all_price == '0.00' && this.data.total_price == '0.00') {
                wx.showToast({
                    title: '支付价格不能为0',
                    icon: "none",
                    mask: true
                })
                return;
            }

            let pay_money = 0;
            let type = 3;
            let arr = this.data.navList;
            pay_money = arr[0].active ? this.data.total_price : this.data.all_price;
            type = arr[0].active ? type : 4;
            pay_money = (pay_money * 100).toFixed(0)
            pay_money = parseInt(pay_money).toString(8);
            let article = [];
            let arr_1 = this.data.curriculum;
            article = arr[0].active ? [this.data.curriculum_id] : article;
            let code = this.data.$pay.pay(0, pay_money, type, JSON.stringify(article));
            // let code = this.data.$pay.pay(0,0.01,type,JSON.stringify(article));
            let pages = getCurrentPages(); //获取加载的页面
            let pageUrl = ""; //页面地址
            let option = pages[pages.length - 1].options;
            let str = "";
            let count = 0;
            if (option) {
                for (let key in option) {
                    count++;
                    if (count == 1) {
                        str += '?' + key + "=" + option[key];
                    } else {
                        str += '&' + key + "=" + option[key];
                    }
                }
            }
            if (pages.length) {
                let currentPage = pages[pages.length - 1]; //获取当前页面的对象
                pageUrl = currentPage.route; //当前页面url
            }
            pageUrl = "/" + pageUrl + str;
            code.then(res => {
                if (res) {
                    this.data.$login.login(pageUrl);
                }
            })
        }
    }
})