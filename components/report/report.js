const app = getApp();
Component({
    properties: {
        report_id: { //评论id
            type: Number,
            value: 0
        },
        is_pup: { //是否显示
            type: Boolean,
            value: false
        },
        report_user_id: { //评论用户id
            type: Number,
            value: 0
        },
        book_id: { // 书籍id
            type: Number,
            value: 0
        }
    },

    data: {
        $api: app.globalData.$api.default, //请求数据
        reportList: [{
                id: "1",
                title: "盗版、侵权",
                active: false
            },
            {
                id: "2",
                title: "欺诈、不实信息、谣言",
                active: false
            },
            {
                id: "3",
                title: "暴力、色情、人身攻击",
                active: false
            },
            {
                id: "4",
                title: "广告内容、诱导关注分享加好友",
                active: false
            },
            {
                id: "5",
                title: "其他",
                active: false
            }
        ], //举报内容
        is_report: false, //是否是选择举报弹窗
        is_text: false, //是否是写举报内容
        user_id: 0, //用户id
        is_show_bottom : true , //是否显示底部弹窗
        is_edition : false , //是否是开发版
        show:false
    },
    

    lifetimes: {
        attached: function () {
            let userInfo = wx.getStorageSync('userInfo');
            this.setData({
                user_id: userInfo.id
            })
        }
    },

    methods: {
        // 获取输入值
        inputText: function (e) {
            this.setData({
                reportValue: e.detail.value,
            })
        },
        // 开始举报
        startReporting: function () {
            if(this.data.reportValue){
                 this.data.$api.post({
                url: "api/article/reportComment",
                data: {
                    flag: this.data.reportValue,
                    comment: this.data.report_id,
                    content: this.data.reportValue
                },
                show: true
            }).then(res => {
                wx.showToast({
                    title: '举报成功',
                })
                this.setData({
                    is_pup: false,
                    is_report: false,
                    is_show_bottom : true
                })
            })
            }else{
                wx.showToast({
                    title: '请勾选您的举报理由哟',
                    mask: true,
                    icon: "none"
                })
            }
           
        },
        // 单选
        reportRadio: function (e) {
            let index = e.currentTarget.dataset.index;
            let reportList = this.data.reportList;
            if (reportList[index].active) {
                reportList[index].active = false;
            } else {
                for (let i = 0; i < reportList.length; i++) {
                    if (reportList[i].active) {
                        reportList[i].active = false;
                        break;
                    }
                }
                reportList[index].active = true;
            }

            this.setData({
                reportList: reportList,
                is_text: false,
                reportValue: reportList[index].title
            })

            if (reportList[4].active) {
                this.setData({
                    is_text: true,
                    reportValue: ""
                })
            }
        },
        // 取消
        cancel: function () {
            this.setData({
                is_pup: false,
                is_report: false,
                is_text: false,
                is_show_bottom : true
            })
        },
        // 举报
        report: function () {
            this.setData({
                is_report: true,
                is_show_bottom : false
            })
        },
        // 编辑评论
        edit: function () {
            wx.navigateTo({
                url: '/pages/comment/comment?bookId=' + this.data.book_id + "&commentId=" + this.data.report_id + "&edit=true",
            })
            this.cancel();
        },
        del: function () {
            this.setData({
                is_show_bottom : false
            })
            wx.showModal({
                title: "删除",
                content: "您真的要删除这条评论吗?",
                confirmText: "立即删除",
                cancelText: "暂不删除",
                confirmColor: "#F16E22",
                cancelColor: "#999999",
                success: (res) => {
                    if (res.confirm) {
                        this.data.$api.post({
                            url: "api/Article/delComment",
                            show: true,
                            data: {
                                id: this.data.report_id
                            }
                        }).then((res) => {
                            if (res.data.code) {
                                wx.showToast({
                                    title: res.data.msg,
                                })
                                // 发送数据
                                setTimeout(()=>{
                                    this.triggerEvent('delOk', {
                                        delOk: true,
                                    });
                                },1000)
                            }
                        })
                    }
                    this.cancel();
                }
            })
        },
    }
})