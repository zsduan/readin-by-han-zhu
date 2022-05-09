Page({

    data: {
        url: "", //地址信息
    },

    onLoad: function (options) {
        this.setData({
            url: options.url
        })
    },
})