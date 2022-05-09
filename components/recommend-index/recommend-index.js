const app = getApp()
Component({

    properties: {
        typeList: {
            type: Array,
            value: []
        },
        is_curriculum: {
            type: Number,
            value: 0
        }
    },

    data: {
        imgSrc: app.globalData.imgUrl, //图片顶地址
    },

    methods: {
        // 分类顶部点击
        typetopList: function (e) {
            let id = e.currentTarget.dataset.classid;
            wx.navigateTo({
                url: '../details/details?id=' + id,
            })
        },

        // 分类点击更多
        typeMore: function (e) {
            let index = e.currentTarget.dataset.classid;
            let json = {
                index: index
            }
            this.triggerEvent("typeMore", {
                json: json
            })
        },

        // 分类下面点击
        typeList: function (e) {
            let id = e.currentTarget.dataset.classid;
            wx.navigateTo({
                url: '../details/details?id=' + id,
            })
        },
        // 去课程二级页面
        goCurriculum: function (e) {
            let id = e.currentTarget.dataset.classid;
            let url = '';
            url = '../curriculum/curriculum?id=' + id;
            wx.navigateTo({
                url: url,
            })
        }
    }
})