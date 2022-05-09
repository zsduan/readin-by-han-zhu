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
        // 展开关闭详情介绍
        openAll: function () {
            let is_all = this.data.is_all;
            is_all = !is_all;
            let down_text = is_all ? '收起内容' : '查看全部内容';
            this.setData({
                is_all: is_all,
                down_text: down_text
            })
        },
    }
})
