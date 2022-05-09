const pageUrl = require("../../utils/pageUrl");
const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        bookId: 0, //书籍id
        commentId: 0, //回复评论id
        bookDetails: {}, //书籍详情信息
        keyHeigth: 30, //键盘高度
        is_comment: false, //是否是评论回复
        is_show: false, //是否加载完毕
        is_bootom_paly: false, //底部是否播放
        userInfo: {}, //评论用户信息
        commentValue: "", //评论内容
        maxHeight: 0, // 最高键盘高度
        is_bootom_paly: false, //底部播放
        building_id: 0, //楼主id
        is_edit: false, //是否编辑
        content_text: "", //评论文字
        pageUrls: '' //获取页面路径
    },

    onLoad: function (options) {
        this.setData({
            bookId: options.bookId,
            pageUrls: pageUrl.pageUrl()
        })
        if (options.commentId) { //评论id
            this.setData({
                commentId: options.commentId,
                is_comment: true
            })
            this.getCommentId();
        }
        if (options.building_id) { //是否有楼主id
            this.setData({
                building_id: options.building_id
            })
        }
        if (options.edit) {
            wx.setNavigationBarTitle({
                title: '编辑评论',
            })
            this.setData({
                is_edit: true
            })
        }
        this.getBookDetails();

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
    // 获取书籍信息
    getBookDetails: function () {
        this.data.$api.get({
            url: "api/article/getArticleId",
            data: {
                id: this.data.bookId
            },
            show: "true"
        }).then(res => {
            let json = res.data.data;
            this.setData({
                bookDetails: json,
                is_show: true
            })
        })
    },
    // 获取键盘高度
    bindFocus: function (e) {
        this.setData({
            keyHeigth: e.detail.height * 2 + 60
        })
    },
    // 清空键盘高度
    clearFocus: function () {
        this.setData({
            keyHeigth: 30
        })
    },
    // 获取对应评论
    getCommentId: function () {
        if (!this.data.commentId) {
            return;
        }
        this.data.$api.get({
            url: "api/article/getCommentId",
            data: {
                id: this.data.commentId,
                page: 1
            }
        }).then(res => {
            if(!res.data.data){
                wx.showToast({
                  title: '评论已删除或评论人已屏蔽',
                  icon :"none",
                  mask : true
                })
                setTimeout(()=>{
                    wx.navigateBack({
                        delta: 1,
                    })
                },1000)
                return ;
            }
            this.setData({
                userInfo: res.data.data,
            })
            if (this.data.is_edit) {
                this.setData({
                    content_text: res.data.data.content
                })
            }
        })
    },
    // 检测敏感和发送评论
    send: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.showModal({
                title: "温馨提示",
                content: "登录后才能进行评论哟~",
                confirmColor: "#F16E22",
                cancelColor: "#999999",
                cancelText: "我在想想",
                confirmText: "立即登录",
                success: (res) => {
                    this.setData({
                        commentValue: "",
                    })
                    if (res.confirm) {
                        wx.redirectTo({
                            url: '/page-two/login/login?pageUrl=' + this.data.pageUrls,
                        })
                    }
                }
            })
            return;
        }
        if (this.data.commentValue == "") {
            wx.showToast({
                title: '请输入文字内容',
                mask: true,
                icon: "none"
            })
            return;
        }
        wx.showLoading({
            title: '评论中请稍等~',
            mask: true
        })
        this.testingWrods();
    },

    // 检测是否违规
    testingWrods: function () {
        this.data.$api.post({
            url : "api/article/checkComment",
            data : {
                content: this.data.commentValue
            }
        }).then(res =>{
            if (res.data.code == 0) {
                wx.hideLoading();
                wx.showToast({
                    title: '请检查输入内容是否合法',
                    icon: "none",
                    mask: true
                })
                return;
            }
            this.setComment();
        })
    },

    // 正式发表评论
    setComment: function () {
        let commentValue = this.utf16toEntities(this.data.commentValue);
        let data = { //新书评论
            article: this.data.bookId,
            content: commentValue
        }
        if (this.data.commentId) { //回复评论id
            data.comment = this.data.commentId
        }
        if (this.data.building_id) { //回复评论的评论
            let userInfo = this.data.userInfo;
            data.comment = this.data.building_id;
            data.reply = userInfo.user_id;
        }
        let url = "api/article/setComment"; //新增评论
        if (this.data.is_edit) {
            data = {
                content: commentValue,
                id: this.data.commentId
            }
            url = "api/Article/saveComment" //编辑评论
        }

        wx.onKeyboardHeightChange(res => {
            this.setData({
                keyHeigth: res.height
            })
        })
        this.data.$api.post({
            url: url,
            data: data,
            show: "true"
        }).then(res => {
            wx.hideLoading()
            wx.showToast({
                title: res.data.msg,
                mask: true
            })
            setTimeout(() => {
                wx.navigateBack({
                    delta: 1,
                })
            }, 1000)
        })
    },
    // 获取评论框的值
    bindKeyInput: function (e) {
        this.setData({
            commentValue: e.detail.value
        })
    },
    // 去单独的页面
    goOneDetails: function () {
        let urls = "../comment-details/comment-details?book_id=" + this.data.bookId + "&id=" + this.data.commentId + "&is_one=true"
        wx.navigateTo({
            url: urls,
        })
    },
    // 发表评论转字符串
    utf16toEntities: function (str) {
        var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则 
        str = str.replace(patt, function (char) {
            var H, L, code;
            if (char.length === 2) {
                H = char.charCodeAt(0); // 取出高位 
                L = char.charCodeAt(1); // 取出低位 
                code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法 
                return "&#" + code + ";";
            } else {
                return char;
            }
        });
        return str;
    },

})