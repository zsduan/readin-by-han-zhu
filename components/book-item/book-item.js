var app = getApp();

Component({
    properties: {
        bookList: { // 书籍数据
            type: Array,
            value: []
        },
        speed: { // 显示进度条
            type: Boolean,
            value: false
        },
        time: { // 显示时间
            type: Boolean,
            value: false
        },
        collect: { //显示收藏
            type: Boolean,
            value: false
        },
        is_book_details: {
            type: Boolean,
            value: false,
        },
        is_curriculum: { //是否是课程
            type: Boolean,
            value: false,
        },
    },

    data: {
        imgSrc: app.globalData.imgUrl, //图片顶地址
        $api: app.globalData.$api.default,
    },

    methods: {
        goDetails: function (e) {
            let id = e.currentTarget.dataset.classid;
            let url = '/pages/details/details?id=' + id;
            let arr = this.data.bookList;
            if (this.data.is_curriculum) {
                url = "/pages/curriculum/curriculum?id=" + id;
            }
            arr.forEach(v => { 
                if (v.id == id && v.is_curriculum) {
                    if (v.pid) {
                        url = "/pages/details/details?id=" + id + '&type=curriculum&curriculum_id=' + v.pid;
                    } else {
                        url = "/pages/curriculum/curriculum?id=" + id;
                    }
                }
            })
            wx.navigateTo({
                url: url,
            })
        },
        // 收藏 
        setCollect: function (e) {
            let id = e.currentTarget.dataset.classid;
            this.data.$api.get({
                url: "api/article/setCollect",
                data: {
                    article: id
                },
                show: false
            }).then(() => {
                wx.redirectTo({
                    url: '/pages/collection/collection',
                })
            })
        },
    }
})