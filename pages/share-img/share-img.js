const app = getApp()
const pageUrl = require("../../utils/pageUrl")

Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        showColorPicker: false,
        colorData: {
            //基础色相(色盘右上顶点的颜色)
            hueData: {
                colorStopRed: 255,
                colorStopGreen: 0,
                colorStopBlue: 0,
            },
            //选择点的信息
            pickerData: {
                x: 0,
                y: 480,
                red: 0,
                green: 0,
                blue: 0,
                hex: '#000000'
            },
            //色相控制条位置
            barY: 0
        },
        rpxRatio: 1, //单位rpx实际像素
        iconList: { //头像数据
            avatarurl_width: 50, //图片宽度
            avatarurl_heigth: 50, //图片高度
            avatarurl_x: 20, //X坐标
            avatarurl_y: 15, //y坐标
        },
        fontColor: "#ffffff", //字体颜色
        loadImagePath: "", //生成的canvas地址
        canvansWidth: 0, //canvas宽度
        canvansheight: 0, //canvas高度
        canvansStyle: '', // canvas的style代码
        fontSize: 1, //字体大小比例
        ranking: 1, //当前排名
        readingTime: "", //阅读时长
        readingTime_wxml: "", //阅读时长显示
        exceed: "0%", //超过与用户数
        tips: "让一亿人爱上读书和思考",
        userInfo: {}, //用户信息
        date: {}, //日期等信息
        is_show_edit: true, //是否暂时编辑
        is_show_pup: false, //是否在展示弹窗
        fontNum: 0, //字数
        tipsValue: "", //评论框字
        is_show_canvas: false, //是否展示canvas弹出框
        backList: [], //背景图片
        imgList: { //所有图片
            code: "", //小程序码
            back: "", //背景
            icon: "", //头像
            logo: "https://hanzhudushu.oss-cn-chengdu.aliyuncs.com/images/5/2021/06/1671e4033c89db11ef174a3ea9c3ee5a.png"
        },
        is_frequency: 0, //当前次数
        backHeight: 0, //画图背景图片高度
        is_show_all: false, //是否展示全部
        changeBack:[],//背景切换
        bool:false,//选中判断
        changeIdx: 0,//选中时候的下标
    },
    onLoad() {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.showToast({
                title: '您还没有登录哟',
                icon: "none",
                mask: true
            })
            setTimeout(() => {
                wx.redirectTo({
                    url: "../../page-two/login/login?pageUrl=" + pageUrl.pageUrl()
                })
            }, 1000)
            return;
        }
        wx.getSystemInfo({
            success: (result) => {
                if (result.platform == "windows") {
                    setTimeout(() => {
                        wx.showToast({
                            title: '请在手机端查看',
                            icon: "none",
                            mask: true,
                            duration: 3000
                        })
                    }, 1000)
                    setTimeout(() => {
                        wx.switchTab({
                            url: '../index/index',
                        })
                    }, 4000)
                    return;
                } else {
                    this.setData({ 
                        is_show_all: true
                    })
                }
            }
        })
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            userInfo: userInfo
        })
        this.getPhoneInfo();
        this.getTime(); //获取当前时间
        this.initImg(); //初始化图片
        this.getExceedUsers(); //获取排名信息
        this.getWxCode(); //获取小程序码
        this.getRankingBackground(); //获取背景
    },
    onShareAppMessage: function () {
        let title, imageUrl;
        let userInfo = wx.getStorageSync('userInfo');
        imageUrl = `${this.data.imgSrc}images/5/2021/07/fda79e21e2c3e5bbc614c5f600b874e3.jpg`;
        title = `${userInfo.nickname}邀请你看你本周数据`;
        return {
            title: title,
            imageUrl: imageUrl, //这个是分享的图片
        }
    },
    // 初始化图片
    initImg: function () {
        let imgList = this.data.imgList;
        let userInfo = wx.getStorageSync('userInfo');
        imgList.icon = userInfo.avatar;
        this.setData({
            imgList: imgList
        })
    },
    imgOnload: function (e) {
        let key = e.currentTarget.dataset.index;
        if (key == 'back') {
            let num = e.detail.width / 331;
            let height = e.detail.height / num;
            this.setData({
                backHeight: Number(height.toFixed(0))
            })
        }
        let imgList = this.data.imgList;
        let changeBack = this.data.changeBack;
        let idx = this.data.changeIdx
        if(this.data.bool && changeBack.length !=0 ){
            for(let i in changeBack){
                if(changeBack[i].idx == idx){
                    imgList.back = changeBack[i].url
                    this.setData({
                         imgList: imgList
                     })
                }
            }
            return;kk
        }
        this.dwonImg(imgList[key]).then(res => {
            let is_frequency = this.data.is_frequency;
            imgList[key] = res;
            if(key == 'back' && changeBack.length != 0){
                for(let i in changeBack){
                    if(changeBack[i].idx == idx){
                        changeBack[i].url = res
                        this.setData({
                             changeBack: changeBack
                         })
                    }
                }
            }
            is_frequency += 1;
            this.setData({
                imgList: imgList,
                is_frequency: is_frequency
            })
        });
    },
    // 获取手机信息
    getPhoneInfo: function () {
        wx.getSystemInfo({
            success: (res) => {
                let num = (res.windowWidth / 375).toFixed(2);
                this.setData({
                    fontSize: Number(num),
                    rpxRatio: res.screenWidth / 750
                })
            }
        })
    },
    // 开始画图
    drowStrat: function () {
        let is_frequency = this.data.is_frequency;
        if (is_frequency < 4) {
            wx.showToast({
                title: '请等待图片下载完毕',
                icon: "none"
            })
            return;
        }
        this.setData({
            is_show_canvas: true
        })
        wx.showLoading({
            title: '图片生成中...',
        })
        setTimeout(() => {
            let query = wx.createSelectorQuery();
            query.select(".canvas-top").boundingClientRect(rect => {
                if (rect) {
                    this.setData({
                        canvansWidth: rect.width,
                        canvansheight: rect.height,
                        canvansStyle: `width:${rect.width}px;height:${rect.height}px;`,
                    })
                    this.initDrow();
                }
            }).exec();
        }, 1000)
    },
    // 开始画图
    initDrow: function () {
        let ctx = wx.createCanvasContext('myCanvas', this);
        let width = this.data.canvansWidth;
        let imgList = this.data.imgList;
        let userInfo = this.data.userInfo;

        // 画背景
        let backHeight = this.data.backHeight;
        backHeight = backHeight < 441 ? 441 : backHeight;
        this.drawImg(ctx, imgList.back, 0, 0, Number(width), backHeight);
        // 画二维码
        this.drawRect(ctx, 242, 366, 68, 68);
        this.drawImg(ctx, imgList.code, 242, 366, 68, 68);
        // 画logo
        this.drawImg(ctx, imgList.logo, 190, 4, 175, 70);
        // 画用户头像
        this.circleImg(ctx, imgList.icon);
        // 画用户名
        this.drawText(ctx, userInfo.nickname, 20, 89, 15);

        // 画当前日期
        let date = this.data.date;
        this.drawText(ctx, date.date, 20, 107, 13);

        // 绘制排名
        let rank = this.data.ranking.split("");
        for (let i = 0; i < rank.length; i++) {
            if (i == 0) {
                this.drawText(ctx, rank[i], 20, 195, 50, true);
            } else {
                this.drawText(ctx, rank[i], (26 * (i + 1)), 195, 50, true);
            }
        }
        let line = 31 * rank.length;
        this.drawRect(ctx, 20, 204, line, 1);
        this.drawText(ctx, "本周排名", 20, 224, 15);

        // 绘制阅读时长
        let readingTime = this.data.readingTime;
        readingTime = readingTime.split("");
        for (let i = 0; i < readingTime.length; i++) {
            if (i == 0) {
                this.drawText(ctx, readingTime[i], 20, 265, 25, true);
            } else if (i == 1) {
                this.drawText(ctx, readingTime[i], 35, 265, 25, true);
            } else {
                this.drawText(ctx, readingTime[i], (16 * (i + 1)), 265, 25, true);
            }
        }
        let lines = 15.5 * readingTime.length;
        this.drawRect(ctx, 20, 272, lines, 1);
        this.drawText(ctx, "阅读时长", 20, 291, 15);

        // 超过了多少的用户
        this.drawText(ctx, `时长超过${this.data.exceed}的用户`, 20, 313, 13);

        // 画提示语
        let tips = this.data.tips;
        let tipsArr = [];
        if (tips.length > 12) {
            let str = tips.slice(0, 12);
            let str1 = tips.slice(12, tips.length);
            tipsArr.push(str);
            tipsArr.push(str1);
        } else {
            tipsArr.push(tips);
        }
        for (let i = 0; i < tipsArr.length; i++) {
            if (i == 0) {
                this.drawText(ctx, tipsArr[i], 20, 404, 15, false, this.data.fontColor);
            } else {
                this.drawText(ctx, tipsArr[i], 20, 425, 15, false, this.data.fontColor);
            }
        }

        setTimeout(() => {
            ctx.draw();
            wx.hideLoading()
        }, 1000)
    },
    // 改变change
    onChangeColor(e) {
        this.setData({
            colorData: e.detail.colorData,
            fontColor: e.detail.colorData.pickerData.hex,
        })
    },
    // 选择
    toggleColorPicker(e) {
        this.setData({
            showColorPicker: !this.data.showColorPicker
        })
    },
    // 关闭颜色选择
    closeColorPicker() {
        this.setData({
            showColorPicker: false,
        })
    },
    // 获取当前时间
    getTime: function () {
        let date = new Date;
        let year = date.getFullYear();
        let mouth = this.addZroe(date.getMonth() + 1);
        let day = this.addZroe(date.getDate());
        let hours = this.addZroe(date.getHours());
        let minutes = this.addZroe(date.getMinutes());
        let data = {
            date: `${year}.${mouth}.${day}`,
            time: `${hours}:${minutes}`
        }
        wx.setNavigationBarTitle({
            title: '你好,' + year,
        })
        this.setData({
            date: data
        })
        return data;
    },
    // 补零
    addZroe: function (num) {
        if (num < 10) {
            num = '0' + num;
        }
        return num;
    },
    // 保存图片
    saveImg: function () {
        wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: (res) => {
                this.setData({
                    loadImagePath: res.tempFilePath
                })
                wx.saveImageToPhotosAlbum({ //只支持本地图片所以要先把图片下载下来
                    filePath: res.tempFilePath,
                    success(result) {
                        wx.showToast({
                            title: '已保存至相册',
                            icon: "none",
                        })
                    },
                    fail(res) {
                        wx.showToast({
                            title: '保存失败',
                            icon: "none",
                        })
                    }
                })
            }
        }, this)
    },
    // 下载图片
    dwonImg: function (url) {
        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url: url,
                success: (res) => {
                    resolve(res.tempFilePath);
                },
                fail: (err) => {
                    reject(new Error('downloadFail fail'))
                }
            })
        })
    },

    // 画没有圆形的图片
    drawImg: function (ctx, imgUrl, x = 0, y = 0, width = 100, height = 100) {
        ctx.save();
        ctx.drawImage(imgUrl, x, y, width, height);
        ctx.restore(); //恢复上下文
    },

    // 画文字
    drawText: function (ctx, text, x = 0, y = 0, fontSize = 16, bold = false, color = "#ffffff", maxWidth) {
        ctx.save();
        let font = !bold ? fontSize + "px " + 'Microsoft YaHei' : "bold " + fontSize + 'px' + ' Microsoft YaHei';
        // let font = "900 50px 'Microsoft YaHei'";
        ctx.font = font;
        ctx.setFontSize(fontSize);
        ctx.setFillStyle(color);
        if (maxWidth) {
            // const metrics = ctx.measureText(text);
            ctx.setTextAlign("center");
            ctx.fillText(text, x, y, maxWidth);
        } else {
            ctx.fillText(text, x, y);
        }
        ctx.restore(); //恢复上下文
    },

    // 画方框
    /**
     * 
     * @param {CanvasContext} ctx canvas上下文
     * @param {number} x  x坐标
     * @param {number} y  y坐标
     * @param {number} width 宽度
     * @param {number} height 高度
     * @param {string} color 颜色
     */
    drawRect: function (ctx, x = 0, y = 0, width = 100, height = 100, color = "#ffffff") {
        ctx.save();
        ctx.setFillStyle(color);
        ctx.fillRect(x, y, width, height);
        ctx.restore(); //恢复上下文
    },

    // 画头像
    circleImg: function (ctx, imgUrl) {
        ctx.save();
        let iconList = this.data.iconList;
        ctx.beginPath();
        ctx.arc(iconList.avatarurl_width / 2 + iconList.avatarurl_x, iconList.avatarurl_heigth / 2 + iconList.avatarurl_y, iconList.avatarurl_width / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.clip();
        ctx.drawImage(imgUrl, iconList.avatarurl_x, iconList.avatarurl_y, iconList.avatarurl_width, iconList.avatarurl_heigth);
        ctx.restore(); //恢复上下文
    },

    // 画圆角
    /**
     * 
     * @param {CanvasContext} ctx canvas上下文
     * @param {number} x 圆角矩形选区的左上角 x坐标
     * @param {number} y 圆角矩形选区的左上角 y坐标
     * @param {number} w 圆角矩形选区的宽度
     * @param {number} h 圆角矩形选区的高度
     * @param {number} r 圆角的半径
     */
    roundRect: function (ctx, x, y, w, h, r) {
        // 开始绘制
        ctx.beginPath()
        // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
        // 这里是使用 fill 还是 stroke都可以，二选一即可
        ctx.setFillStyle('transparent')
        // ctx.setStrokeStyle('transparent')
        // 左上角
        ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

        // border-top
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.lineTo(x + w, y + r)
        // 右上角
        ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

        // border-right
        ctx.lineTo(x + w, y + h - r)
        ctx.lineTo(x + w - r, y + h)
        // 右下角
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

        // border-bottom
        ctx.lineTo(x + r, y + h)
        ctx.lineTo(x, y + h - r)
        // 左下角
        ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

        // border-left
        ctx.lineTo(x, y + r)
        ctx.lineTo(x + r, y)

        // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
        ctx.fill()
        // ctx.stroke()
        ctx.closePath()
        // 剪切
        ctx.clip();
    },
    // 取消
    closePup: function () {
        this.setData({
            is_show_pup: false,
            tipsValue: ""
        })
    },
    // 完成
    complete: function () {
        this.setData({
            is_show_pup: false,
            tipsValue: ""
        })
    },

    // 当前输入
    textInput: function (e) {
        this.setData({
            fontNum: e.detail.cursor,
            tips: e.detail.value
        })
        if (!e.detail.cursor) {
            this.setData({
                tips: "让一亿人爱上读书和思考"
            })
        }
    },
    // 编辑
    edit: function () {
        this.setData({
            is_show_pup: true
        })
        wx.pageScrollTo({
            scrollTop: 10
        })
    },
    // 回到首页
    goHome: function () {
        wx.switchTab({
            url: '../index/index',
        })
    },
    // 关闭canvas弹窗
    closeCanvas: function () {
        this.setData({
            is_show_canvas: false
        })
    },
    // 上传图片
    updataImg: function () {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                let img = {
                    url: res.tempFilePaths[0],
                    active: 1
                }
                let backList = this.data.backList;
                backList.forEach(v => {
                    v.active = 0;
                })
                backList.push(img);
                let imgList = this.data.imgList;
                imgList.back = res.tempFilePaths[0];
                this.setData({
                    backList: backList,
                    imgList: imgList
                })
            }
        })
    },
    changeBack: function (e) {
        let index = e.currentTarget.dataset.index;
        let backList = this.data.backList;
        backList.forEach(v => {
            v.active = 0;
        })
        backList[index].active = 1;
        let imgList = this.data.imgList;
        imgList.back = backList[index].url;
        let changeBack = this.data.changeBack;
        let imgs = {idx:0,url:''}
        let bool = false
        if(changeBack.length > 0){
            for(let i in changeBack){
                if(changeBack[i].idx == index){
                    bool = true;
                }
            }
            if(!bool){
                imgs.url = imgList.back
                imgs.idx = index
                changeBack.push(imgs)
            }
        }else{
            imgs.url = imgList.back
            imgs.idx = index
            changeBack.push(imgs)
        }
        this.setData({
            backList: backList,
            imgList: imgList,
            bool:bool,
            changeBack:changeBack,
            changeIdx: index
        })
    },

    // 获取排名信息
    getExceedUsers: function () {
        this.data.$api.get({
            url: "api/user/getExceedUsers"
        }).then(res => {
            let json = res.data.data;
            let hour = this.addZroe(json.hour);
            let minute = this.addZroe(json.minute);
            let second = this.addZroe(json.second);
            this.setData({
                readingTime: `${hour}：${minute}：${second}`,
                readingTime_wxml: `${hour}:${minute}:${second}`,
                ranking: (json.ranking).toString(),
                exceed: (json.percentage).toFixed(2) + "%"
            })
        })
    },
    // 获取小程序二维码
    getWxCode: function () {
        this.data.$api.get({
            url: "api/index/getWxCode"
        }).then(res => {
            let imgList = this.data.imgList;
            imgList.code = res.data.data.url;
            this.setData({
                imgList: imgList
            })
        })
    },
    // 获取排行榜背景
    getRankingBackground: function () {
        this.data.$api.get({
            url: "api/index/getRankingBackground"
        }).then(res => {
            let arr = res.data.data;
            arr.forEach(v => {
                v.active = 0;
                v.url = this.data.imgSrc + v.url
            })
            arr[0].active = 1;
            let imgList = this.data.imgList;
            let backimg = arr[0];
            imgList.back = backimg.url;
            this.setData({
                imgList: imgList,
                backList: arr
            })
        })
    }
})