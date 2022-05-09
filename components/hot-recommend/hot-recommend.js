const app = getApp()
Component({
    properties: {
        title: { //标题
            type: String,
            value: ""
        },
        hotList: { //热门数据
            type: Array,
            value: [],
        },
        hotBottom: { //底部数据
            type: Object,
            value: {}
        },
        is_curriculum: {
            type: Boolean,
            value: false
        }
    },

    data: {
        imgSrc: app.globalData.imgUrl, //图片顶地址
    },

    methods: {
        // 热门推荐滑动事件
        hotChange: function (e) {
            let index = e.detail.current;
            let json = this.data.hotList;
            json.forEach(v => {
                v.active = 0;
            })
            json[index].active = 1;
            this.setData({
                hotList: json,
                hotBottom: json[index]
            })
        },
        // 热门推荐点击
        hotClick: function (e) {
            let id = e.currentTarget.dataset.id;
            let url = '../details/details?id=' + id;
            let arr = this.data.hotList;
            arr.forEach(v => {
                if (v.id == id && v.is_curriculum) {
                    url = "/pages/curriculum/curriculum?id=" + id
                }
            })
            wx.navigateTo({
                url: url,
            })
        },
    }
})