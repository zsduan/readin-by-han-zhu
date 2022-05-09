const app = getApp();
Component({
    properties: {
        commentList: { //评论数据
            type: Array,
            value: [],
        },
        book_id: { // 书籍id
            type: Number,
            value: 0
        },
        is_show_top: { //是否显示顶部
            type: Boolean,
            value: false
        },
        is_details: { //是否是三级评论页面
            type: Boolean,
            value: false
        },
        building_id: { //楼主id
            type: String,
            value: 0,
        }
    },

    data: {
        $api: app.globalData.$api.default, //请求数据
        report_id: 0, //举报评论id
        likeList: [], //当前页面所有点赞数据
    },
    lifetimes: {
        attached: function () {
            this.isLike();
        }
    },
    pageLifetimes:{
        show : function() {
            this.isLike();
        }
    },
    methods: {
        // 展开或收起
        upAndDwon: function (e) {
            let index = e.currentTarget.dataset.index;
            let arr = this.data.commentList;
            arr[index].is_up = !arr[index].is_up;
            arr[index].is_up ? arr[index].comment_text = "展开" : arr[index].comment_text = "收起";
            this.setData({
                commentList: arr
            })
        },
        // 把点赞单独拿出来
        isLike: function () {
            let arr = this.data.commentList;
            let likeList = [];
            arr.forEach(v => {
                likeList.push(v.is_like);
            })
            this.setData({
                likeList: likeList
            })
        },
        // 点赞
        likeComment: function (e) {
            let id = e.currentTarget.dataset.commentid;
            let index = e.currentTarget.dataset.index;
            let arr = this.data.commentList;
            let likeList = this.data.likeList;
            likeList[index] = !likeList[index];
            arr[index].fabulous = likeList[index] ? arr[index].fabulous + 1 : arr[index].fabulous - 1
            arr[index].fabulous = arr[index].fabulous < 0 ? 0 : arr[index].fabulous;
            this.setData({
                commentList: arr,
                likeList: likeList
            })
            this.data.$api.get({
                url: "api/article/likeComment",
                data: {
                    comment: id
                }
            }).then(res => {
                if (!res.data.code) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: "none"
                    })
                }
            })
        },
        // 去评论页面
        goComment: function (e) {
            let id = e.currentTarget.dataset.commentid;
            let building_id = e.currentTarget.dataset.building_id;
            let book_id = this.data.book_id;
            let urls = '../comment/comment?bookId=' + book_id + "&commentId=" + id;
            if (building_id) {
                urls = urls + "&building_id=" + building_id;
            }
            wx.navigateTo({
                url: urls,
            })
        },
        // 打开弹窗
        openPup: function (e) {
            let id = e.currentTarget.dataset.id;
            let user_id = e.currentTarget.dataset.user_id;
            // 发送数据
            this.triggerEvent('reportId', {
                report_id: id,
                user_id: user_id
            });
        },
        // 去三级评论页面
        goCommentDetails: function (e) {
            let id = e.currentTarget.dataset.id;
            let urls = '/pages/comment-details/comment-details?id=' + id + "&book_id=" + this.data.book_id;
            wx.navigateTo({
                url: urls
            })
        },
        //进入个人信息页
        goRankingDetail: function (e) {
            let userId = e.currentTarget.dataset.user_id
            let urls = '/pages/ranking-detail/ranking-detail?userId=' + userId;
            wx.navigateTo({
                url: urls
            })
        }
    }
})