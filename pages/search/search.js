const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        historic_records: [], //历史数据
        is_open: false, //是否展开
        open_text: "展开", //展开文字
        bookList: [], //书籍列表
        is_history: true, //是否显示历史记录
        page: 1, //当前页面
        is_stop: false, //是否停止上啦加载
        searValue: "", //搜索关键字
        is_bootom_paly: false, //底部是否播放
        is_focus: false, //是否获得焦点
        is_hotList: true, //是否显示热搜
        hotList: [], //热搜关键词列表
        placeholder: "请输入您想搜索的书籍",
        is_x_show:false,//是否显示X
        xIndex:''
    },

    onLoad: function (options) {
        let historic_records = wx.getStorageSync('historic_records');
        if (historic_records) {
            this.setData({
                historic_records: historic_records
            })
        }
        let str = options.q;
        if (str) {
            this.setData({
                searValue: str
            })
            this.getSearchArticle();
        }
        this.getHotSearch() //获取热门关键词
    },

    //监听背景音乐
    onShow: function () {
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
    // 下拉加载
    onReachBottom: function () {
        if (!this.data.is_stop) {
            let page = this.data.page;
            page += 1;
            this.setData({
                page: page
            })
            this.getSearchArticle();
        }
    },
    // 获取输入框的值
    bindKeyInput: function (e) {
        this.setData({
            searValue: e.detail.value
        })
    },

    // 搜索事件
    search: function () {
        this.setData({
            bookList: []
        })
        if (!this.data.searValue) {
            this.setData({
                searValue: ""
            })
        }
        this.getSearchArticle();
    },
    // 清空历史记录提示
    openTips: function () {
        wx.showModal({
            content: "确认要清空历史记录吗？",
            cancelColor: "#999999",
            confirmColor: "#F16E22",
            success: (res) => {
                if (res.confirm) {
                    wx.removeStorageSync("historic_records");
                    this.setData({
                        historic_records: [],
                    })
                }
            }
        })
    },
    // 展开历史记录
    openMore: function () {
        let is_open = this.data.is_open;
        let str = "";
        is_open = !is_open;
        is_open ? str = "收起" : str = "展开";
        this.setData({
            is_open: is_open,
            open_text: str
        })
    },
    // 获取焦点事件
    getFocus: function (e) {
        this.setData({
            is_history: true,
            is_hotList: true,
            placeholder: e.detail.value,
            searValue: ""
        })
    },

    // 开始搜索
    getSearchArticle: function () {
        let historic_records = this.data.historic_records;
        if (this.data.searValue == "我的排名") {
            wx.navigateTo({
                url: '../share-img/share-img',
            })
            return;
        }
        let falge = true;
        if (this.data.searValue) {
            historic_records.forEach(v => {
                if (v == this.data.searValue) {
                    falge = false;
                }
            })
            if (falge) {
                historic_records.unshift(this.data.searValue);
                wx.setStorageSync('historic_records', historic_records);
                this.setData({
                    historic_records: historic_records
                })
            }
        }
        let data
        if(this.data.searValue){
             data ={
                page: this.data.page,
                key: this.data.searValue
            }
        }else{
             data = {
                page: this.data.page,
            }
        }
        this.data.$api.get({
            url: "api/index/getSearchArticle",
            data: data,
            show: true
        }).then(res => {
            let arr = res.data.data;
            let bookList = this.data.bookList;
            if (!arr.length) {
                this.setData({
                    is_stop: true,
                    is_history: false,
                    is_hotList: false
                })
                wx.showToast({
                    title: '没有更多数据啦',
                    icon: "none",
                    mask: true
                })
                return;
            }
            bookList.push(...arr);
            this.setData({
                bookList: bookList,
                is_history: false,
                is_hotList: false
            })
        })
    },
    // 点击历史记录
    historyClick: function (e) {
        let item = e.currentTarget.dataset.item;
        this.setData({
            searValue: item,
            bookList: [],
        })
        this.getSearchArticle();
    },
    // 点击热门搜索
    hotClick: function (e) {
        let item = e.currentTarget.dataset.keyword; //获取当前值
        this.setData({
            searValue: item,
            bookList: [],
        })
        this.getSearchArticle();
    },
    //获取热门搜索
    getHotSearch: function () {
        this.data.$api.get({
            url: "api/index/getHotSearch"
        }).then(res => {
            let hotList = res.data.data
            this.setData({
                hotList: hotList
            })
        })
    },
    //长按改变样式
    longTach: function (e) {
        let xIndex = e.currentTarget.dataset.index
        this.setData({
            is_x_show: true,
            xIndex: xIndex
        })
    },
    //点击X删除相应的历史记录
    onlyDelete: function(e){
        let index = e.currentTarget.dataset.index;
        let historic_records = this.data.historic_records;
        historic_records.splice(index,1);
        wx.setStorageSync('historic_records', historic_records);
        this.setData({
            historic_records: historic_records,
            is_x_show: false
        })
    }

})