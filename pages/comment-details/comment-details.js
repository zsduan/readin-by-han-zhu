const app = getApp();
Page({
    data: {
        $api: app.globalData.$api.default,
        commentId: 0, //评论id
        is_bootom_paly: false, //底部播放
        report_id: 0, //举报id
        is_pup: false, //是否显示举报弹窗
        commentList: [], //评论数据
        book_id: 0, //书籍id
        is_show_top: false, //是否隐藏
        is_one: false, //是否只显示一行
        placeholder_text : "" , //提示文字
        comment_user_id : 0 , //操作评论人员id
        page : 1 , //页码
        is_stop : false , //是否停止加载
    },
    onLoad: function (options) {
        this.setData({
            book_id: options.book_id,
            commentId: options.id
        })
        if (options.is_one) {
            this.setData({
                is_one: options.is_one
            })
        }
        this.getExamine();
    },
    //监听背景音乐
    onShow: function () {
        this.setData({
            commentList : []
        })
        this.getCommentId();

        var bgMusic = wx.getBackgroundAudioManager();
        if (bgMusic.paused == false) {
            this.setData({
                is_bootom_paly: true
            })
        }else{
            this.setData({
                is_bootom_paly: false
            })
        }
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },
    // 触底刷新
    onReachBottom: function () {
        return;
        if (!this.data.is_stop) {
            let page = this.data.page;
            page += 1;
            this.setData({
                page: page
            })
            this.getCommentId();
        }
    },
    // 获取相应信息
    getExamine: function () {
        this.data.$api.get({
            url: "api/index/getExamine",
            data: {
                examine: 1
            }
        }).then(res => {
            if (res.data.data.type == 1) {
                this.setData({
                    is_show_top: true
                })
            }
        })
    },
    // 获取组件举报id
    getReportId: function (e) {
        this.setData({
            is_pup: true,
            report_id: e.detail.report_id,
            comment_user_id: e.detail.user_id, //评论人的id
        })
    },
    // 获取对应评论
    getCommentId: function () {
        if(!this.data.commentId){
            return;
        }
        this.data.$api.get({
            url: "api/article/getCommentId",
            data: {
                id: this.data.commentId,
                page: this.data.page
            }
        }).then(res => {
            let commentList = this.data.commentList;
            let json = res.data.data;
            json.content = this.uncodeUtf16(json.content); 
            if(!json.id){
                wx.showToast({
                  title: '哎呀~还没有评论了',
                  icon : "none",
                  mask : true
                })
                setTimeout(()=>{
                    wx.navigateBack({
                      delta: 1,
                    })
                },1000)
                return;
            }
            let placeholder_text = "回复@" + json.nickname;
            this.setData({
                placeholder_text : placeholder_text
            })
            let is_one = this.data.is_one;
            if (!is_one) {
                let comment = json.comment;
                delete json.comment;
                json.is_details = true;
                commentList.push(res.data.data);
                comment.forEach(v => {
                    v.is_list = true;
                    v.content = this.uncodeUtf16(v.content); 
                    commentList.push(v);
                });
            } else {
                delete json.comment;
                json.is_one = true;
                commentList.push(json);
            }
            this.setData({
                commentList: commentList
            })
        })
    },
    // 删除评论成功
    delOk:function(e){
        this.setData({
            commentList : [],
            page : 1
        })
        this.getCommentId();
    },
    // 去评论页面
    goComment: function () {
        if (!this.data.is_show_top) {
            return;
        }
        let book_id = this.data.book_id;
        let urls = '../comment/comment?bookId=' + book_id + "&commentId=" + this.data.commentId;
        wx.navigateTo({
            url: urls,
        })
    },
    // 转换评论数据
    uncodeUtf16:function (str){
        var reg = /\&#.*?;/g;
        var result = str.replace(reg,function(char){
            var H,L,code;
            if(char.length == 9 ){
                code = parseInt(char.match(/[0-9]+/g));
                H = Math.floor((code-0x10000) / 0x400)+0xD800;
                L = (code - 0x10000) % 0x400 + 0xDC00;
                return unescape("%u"+H.toString(16)+"%u"+L.toString(16));
            }else{
                return char;
            }
        });
        return result;
    },
})