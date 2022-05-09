const app = getApp();
Component({

    properties: {
        bookDetails: { //书籍详情
            type: Object,
            value: {}
        },
        episodes : { //当前集数
            type : Number,
            value : 0
        },
    },

    data: {
        $api: app.globalData.$api.default, //请求数据
    },

    methods: {
        // 收藏 
        setCollect: function () {
            let json = this.data.bookDetails;
            json.collect ? json.collect = 0 : json.collect = 1;
            this.data.$api.get({
                url: "api/article/setCollect",
                data: {
                    article: this.data.bookDetails.id
                },
                show: false
            }).then(res => {
                this.setData({
                    bookDetails: json
                })
            })
        },
    }
})
