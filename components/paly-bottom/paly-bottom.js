const bgMusic = wx.getBackgroundAudioManager();
let timer_app = null;
const app = getApp();
const $browsing = require("../../utils/browsing-history"); //上传进度和保存进度
Component({
    properties: {
        is_bootom_paly: {
            type: Boolean,
            value: false,
        }, //书籍详情信息
        is_show_prop: {
            type: Boolean,
            value: true,
        },
        is_paly_details: { //详情页是否重新播放
            type: Boolean,
            value: false,
        }
    },
    data: {
        $api: app.globalData.$api.default,
        left: 310, //左边距离
        is_right: true, //是否显示右边
        is_close: false, //是否关闭
        bgMusic: {}, //背景音乐
        bookDetails: {}, //书籍详情
        speed: 0, //左边进度
        is_rotation: true, //是否旋转
        top: 0, //距离顶部距离
        windowHeight: 0, //屏幕可用高度
        windowWidth: 0, //屏幕可用宽度
        is_show: true, //是都展示
        last_id: 0, //上一次的id
    },
    lifetimes: {
        attached: function () {
            this.getSystemInfo(); //获取系统信息
            this.Muisc(); //获取音乐状态
            this.monitorBgMusic();
            // 在渲染的时候进行判断是否有距离
            let play_distance = wx.getStorageSync('play_distance');
            if (play_distance) {
                this.setData({
                    top: play_distance.top,
                    left: play_distance.left
                })
            }
            if (bgMusic.paused == false) {
                this.palying();
            }
        }
    },
    pageLifetimes: {
        show: function () {
            setTimeout(()=>{
            this.Muisc()
            },500)
            let play_distance = wx.getStorageSync('play_distance');
            if (play_distance) {
                this.setData({
                    top: play_distance.top,
                    left: play_distance.left
                })
            }
            if (bgMusic.paused == false) {
                this.palying();
            }
        },
    },
    methods: {
        Muisc: function () {
            let bookDetails = wx.getStorageSync('bookDetails');
            if (bookDetails.id) {
                this.setData({
                    bookDetails: bookDetails
                })
            }
            bgMusic.onStop(() => {
                let currentTime = parseInt(wx.getStorageSync('currentTime'));
                $browsing.browsing(app.globalData.paly_time, 0, 0, false, currentTime) //保存记录
                clearInterval(timer_app);
                timer_app = null;
                app.globalData.paly_time = 0;
                this.setData({
                    is_show: false
                })
                this.triggerEvent("onStopMusic", {
                    "is_stop": true
                });
                setTimeout(() => {
                    wx.removeStorageSync('bookDetails');
                }, 2000)
            });
            bgMusic.onPause(() => {
                this.setData({
                    is_show: false,
                    is_rotation: false,
                })
                $browsing.browsing(app.globalData.paly_time, 0, 0) //保存记录
                clearInterval(timer_app);
                timer_app = null;
                app.globalData.paly_time = 0;
                this.triggerEvent("onPauseMuisic", {
                    "is_paused": true
                })
            })
            bgMusic.onPlay(() => {
                let playNow = wx.getStorageSync('playNow');
                if (!playNow) {
                    if (app.globalData.paly_time) {
                        $browsing.browsing(app.globalData.paly_time, 0, 3);
                        app.globalData.paly_time = 0;
                    }
                    clearInterval(timer_app);
                    timer_app = null;
                    this.palying();
                    this.getBack();
                    this.monitorBgMusic();
                    this.setData({
                        is_show: true,
                        is_rotation: true
                    })
                    wx.setStorageSync('playNow', new Date);
                    this.triggerEvent("onPalyMusic", {
                        "is_paly": true
                    });
                }
                setTimeout(() => { //两秒不能重复执行
                    wx.removeStorageSync('playNow');
                }, 2000)
            })
            // 背景音乐解析错误
            bgMusic.onError(() => {
                wx.showToast({
                    title: '音频解析错误，请重新播放',
                    icon: "none",
                    duration: 3000
                })
                this.triggerEvent("onErrMusic", "err", true);
            })
            bgMusic.onEnded(() => { //音频自然结束
                $browsing.browsing(app.globalData.paly_time, 0, 2, "all"); //创建记录
                clearInterval(timer_app);
                timer_app = null;
                app.globalData.paly_time = 0;
                this.setData({
                    is_show: false
                })
                this.triggerEvent("onEndedMusic", "end", true);
            })
            if (!bgMusic.url) {
                this.setData({
                    is_show: false
                })
            }
            if (!bgMusic.paused) {
                this.setData({
                    is_show: true
                })
            }
        },
        // 获取系统信息
        getSystemInfo: function () {
            wx.getSystemInfo({
                success: (result) => {
                    this.setData({
                        windowHeight: result.windowHeight,
                        windowWidth: result.windowWidth,
                        top: result.windowHeight - 140,
                    })
                },
            })
        },
        // 收起
        close: function () {
            this.setData({
                is_close: true,
            })
            wx.setStorageSync('is_close', "true");
            setTimeout(() => {
                this.setData({
                    is_right: false
                })
            }, 1000)
        },
        // 获取背景音乐
        getBack: function () {
            let is_close = wx.getStorageSync('is_close');
            if (is_close) {
                this.close();
            }
            let bookDetails = wx.getStorageSync('bookDetails');
            this.setData({
                bookDetails: bookDetails
            })
            if (bgMusic.paused == false) {
                this.setData({
                    is_rotation: true,
                    is_show: true
                })
                let timer = setInterval(() => {
                    let currentTime = bgMusic.currentTime;
                    let duration = bgMusic.duration;
                    let percentage = parseInt(currentTime) / parseInt(duration);
                    percentage = percentage.toFixed(5) * 360;
                    let speed = Number(percentage.toFixed(0))
                    this.setData({
                        speed: speed
                    })
                    if (bgMusic.currentTime >= bgMusic.duration - 3) {
                        this.setData({
                            is_rotation: false,
                        })
                        clearInterval(timer)
                    }
                    if (bgMusic.paused) {
                        this.setData({
                            is_rotation: false,
                        })
                        clearInterval(timer)
                    }
                }, 500)
            }

        },
        // 去详情页面
        goDetails: function () {
            let bookDetails = this.data.bookDetails;
            if (!bookDetails.id) {
                wx.showToast({
                    title: '书籍信息可能丢失，点击其他地方进去吧',
                    icon: "none",
                    mask: true,
                })
                return;
            }
            let url = '/pages/details/details?id=' + bookDetails.id;
            if (this.data.is_rotation) {
                url = url + "&play=true"
            }
            let is_curriculum = wx.getStorageSync('is_curriculum');
            if (is_curriculum) {
                url = url + '&type=curriculum&curriculum_id=' + bookDetails.pid;
            }
            clearInterval(timer_app);
            timer_app = null;
            wx.navigateTo({
                url: url,
            }) 
        },
        // 拖动
        moveCircle: function (e) {
            let windowHeight = this.data.windowHeight;
            let windowWidth = this.data.windowWidth;
            let top = e.changedTouches[0].clientY - 32;
            let left = e.changedTouches[0].clientX - 32;
            if (top <= 0) {
                top = 0;
            }
            if (top >= windowHeight - 80) {
                top = windowHeight - 80;
            }
            if (left <= 0) {
                left = 0;
            }
            if (left >= windowWidth - 70) {
                left = windowWidth - 70;
            }
            this.setData({
                top: top,
                left: left
            })
            // 保存播放距离
            let play_distance = {
                left: left,
                top: top,
            }
            wx.setStorageSync('play_distance', play_distance);
            
        },
        endMoveCircle: function () {
            let left = this.data.left;
            let windowWidth = this.data.windowWidth;
            if (left <= (windowWidth - 70) / 2) {
                this.setData({
                    left: 0
                })
            }
            if (left >= (windowWidth - 70) / 2) {
                this.setData({
                    left: windowWidth - 70
                })
            }
        },
        // 正在播放中
        palying: function () {
            if (bgMusic.paused == false) {
                app.globalData.paly_time = 0;
                if (timer_app) {
                    clearInterval(timer_app);
                    timer_app = null;
                }
                timer_app = setInterval(() => {
                    let currentTime = bgMusic.currentTime;
                    let duration = bgMusic.duration;
                    let percentage = parseInt(currentTime) / parseInt(duration);
                    percentage = percentage.toFixed(5) * 360;
                    let speed = Number(percentage.toFixed(0))
                    this.setData({
                        speed: speed
                    })
                    app.globalData.paly_time += 1;
                    if (app.globalData.paly_time % 10 == 0) {
                        // 每10s存一次播放时间
                        wx.setStorageSync('paly_time', app.globalData.paly_time);
                    }
                    if (app.globalData.paly_time >= 100) {
                        $browsing.browsing(app.globalData.paly_time, 0, 0);
                        app.globalData.paly_time = 0;
                        wx.removeStorageSync('currentTime');
                        wx.removeStorageSync('paly_time');
                    }
                    // 设置当前进度
                    if (bgMusic.currentTime) {
                        wx.setStorageSync('currentTime', bgMusic.currentTime)
                    }
                }, 1000)
            }
        },
        // 监听背景音乐是狗暂停 10s一次
        monitorBgMusic: function () {
            let timer = null;
            timer = setInterval(() => {
                if (bgMusic.paused == true) {
                    clearInterval(timer_app);
                    timer_app = null;
                    clearInterval(timer);
                    timer = null;
                }
            }, 10000)
        }
    },
})