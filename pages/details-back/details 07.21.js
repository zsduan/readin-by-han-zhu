const app = getApp();
const bgMusic = wx.getBackgroundAudioManager(); //背景音乐
const $browsing = require("../../utils/browsing-history"); //上传进度和保存进度
const handle = require("./details-handle");
const pageUrl = require("../../utils/pageUrl");
const log = require("../../utils/log");
Page({
    data: {
        $api: app.globalData.$api.default,
        imgSrc: app.globalData.imgUrl, //图片顶地址
        $pay: app.globalData.$pay, //支付
        $login: app.globalData.$login, //登录
        book_id: 0, //书籍id
        navList: [{
                id: 1,
                name: "音频",
                active: 1
            },
            {
                id: 2,
                name: "视频",
                active: 0
            },
        ],
        is_video: 0, // 是否是视频
        topList: {}, //顶部数据
        current_time: "00:00", //当前时间
        all_time: "00:00", //音频总时间
        pro_width: 0, //顶层进度条长度
        bottomList: [{
                id: 1,
                name: "简介",
                active: 1
            },
            {
                id: 2,
                name: "评论",
                active: 0
            },
        ],
        is_comment: 0, //是否是评论
        bookList: [], //更多推荐
        commentList: [], //评论数据
        comment_id: 0, //评论id 
        is_play: false, //是否播放音频
        timer_paly: null, //播放定时器
        seep_time: 0, // 当前进度
        Record_id: 0, //记录id
        is_pup: false, //是否显示弹窗
        report_id: 0, //举报id
        is_play_bottom: false, //是否开始播放
        is_disabled: true, // 是否禁用
        wacth_timer: 0, //可以观看时间
        is_vip: 0, //是否是vip
        is_play_now: false, //现在是否正在播放
        current: 0, //当前滑块
        is_show_top: false, //是否显示头部
        page: 1, //当前页面
        is_stop: false, //是否停止加载
        pause_video_time: 0, //视频播放时间
        is_fixed: false, //是否定位在顶部
        comment_user_id: 0, //评论人的id
        is_loding: true, //是否在加载中
        top_pro_width: 0, //顶部滚动条
        is_slider: false, //是否顶部滑动
        slider_time: "00:00", //顶部显示
        is_music_end: false, //自然结束音频
        is_curriculum: false, //是否为课程
        curriculumList: [], //课程列表数据
        curriculumList_2: [], //课程列表数据2,主要用于弹窗
        all_price: "0.00", //总价
        is_previous: true, //是否显示上一曲
        is_next: true, //是否显示下一曲
        show_buy: false, //展示购买弹窗
        is_buy: false, // 是否购买
        top_tips: "请先购买或者分享3人免费观看", //顶部提示语
        is_ios: false, //是否是苹果
        is_exchange: false, //会员兑换弹窗
        curriculum_id: 0, //父级课程id
        episodes: 0, //当前集数
        share_curriculum_id: 0, //课程分享id
        scroll_left: 0, //距离左边的距离
        is_play_video: false, //是否自动播放视频
        is_play_video_now: false, // 是否正在播放视频
        show_video_set: false, //是否展示视频设置
        pageUrls: '', //获取路径
        is_video_load: 0, //是否是初始化加载视频
        top_tips_2: "开通会员免费畅听全集",
        salt: wx.getStorageSync('salt'),
    },
    onLoad: function (options) {
        if (!options.id) {
            wx.showToast({
                title: '哎呀~书籍信息丢失啦~请稍后再试',
                icon: "none",
                mask: true
            })
            setTimeout(() => {
                wx.switchTab({
                    url: '../index/index',
                })
            }, 1000)
            return;
        }
        handle.shareIn(options);
        if (options.type == 'curriculum') { //是否为课程
            this.setData({
                is_curriculum: true,
                curriculum_id: options.curriculum_id
            })
        }
        this.setData({
            book_id: options.id,
            pageUrls: pageUrl.pageUrl()
        })
        if (options.play == "true") {
            this.setData({
                is_play_bottom: true
            })
        }
        if (options.is_video == 'true') {
            this.setData({
                is_play_video: true
            })
        }
        wx.getSystemInfo({
            success: (result) => {
                if (result.platform == "windows") {
                    if (options.type == 'curriculum') {
                        this.getCurriculumArticleId("windows")
                    } else {
                        this.getBookDetails("windows");
                    }
                    return;
                } else {
                    if (options.type == 'curriculum') {
                        this.getCurriculumArticleId()
                    } else {
                        this.getBookDetails();
                    }
                }
            }
        })
        this.getExamine();
        this.isIos(); //判断是否是ios
    },

    onShareAppMessage: function (res) {
        let title, imageUrl, path;
        let userInfo = wx.getStorageSync('userInfo');
        let bookInfo = this.data.topList;
        title = userInfo.nickname == undefined ? `您的好友邀请你听《${bookInfo.title}》啦` : `${userInfo.nickname}邀您听《${bookInfo.title}》`,
            imageUrl = this.data.imgSrc + this.data.topList.share_thumb;
        path = '/pages/details/details?id=' + this.data.book_id
        if (userInfo.salt) {
            path = path + "&share_user=" + userInfo.salt;
            if (this.data.is_curriculum) {
                path = path + '&type=curriculum&curriculum_id=' + this.data.curriculum_id + '&share_curriculum_id=' + this.data.share_curriculum_id + "&share_user=" + userInfo.salt;
            }
        }
        return {
            title: title,
            imageUrl: imageUrl,
            path: path,
        }
    },
    // 页面卸载清除本页面的定时器
    onUnload: function () {
        let timer_paly = this.data.timer_paly;
        clearInterval(timer_paly);
        timer_paly = null;
        this.setData({
            timer_paly: timer_paly
        })
        wx.removeStorageSync('palyVideo');
        wx.removeStorageSync('paly_music');
        let Record_id = this.data.Record_id; //保存历史记录id
        if (Record_id) {
            wx.setStorageSync('Record_id', Record_id);
            if (this.data.is_video) {
                $browsing.browsing(app.globalData.paly_time, 1, 2, false, this.data.seep_time);
                app.globalData.paly_time = 0;
            }
        }
        this.setData({
            is_exchange: false
        })
    },
    onShow: function () {
        this.setData({
            commentList: [],
            page: 1,
            show_buy: false
        })
        this.getComment();
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },
    // 触底刷新
    onReachBottom: function () {
        if (!this.data.is_stop && this.data.is_comment) {
            let page = this.data.page;
            page += 1;
            this.setData({
                page: page
            })
            this.getComment();
        }
    },
    // 获取滚动事件
    onPageScroll(e) {
        if (e.scrollTop >= 274) {
            this.setData({
                is_fixed: true,
            })
        } else {
            this.setData({
                is_fixed: false,
            })
        }
    },

    // 获取书籍信息
    getBookDetails: function (platform) {
        // 清晰度
        let definition = wx.getStorageSync('definition');
        if (!definition) {
            definition = 1
        }
        this.data.$api.get({
            url: "api/article/getArticleId",
            data: {
                id: this.data.book_id,
                type: definition
            },
            show: "true"
        }).then(res => {
            let json = res.data.data;
            json.audio = encodeURI(json.audio);
            json.video = encodeURI(json.video);
            this.setDeatalis(platform, json);
            if (!this.data.ios) {
                let Android = wx.getStorageSync('Android');
                if (!Android) {
                    Android = []
                }
                Android.push({
                    "书籍进度": json.progress,
                    "id": json.id
                })
                wx.setStorageSync('Android', Android);
                log.info(JSON.stringify({
                    "书籍进度": json.progress,
                    "id": json.id
                }));
            }
        })
    },

    // 处理获取过来的数据
    setDeatalis: function (platform, json) {
        let judge = { //当前判断
            is_play_bottom: this.data.is_play_bottom,
            is_curriculum: this.data.is_curriculum,
            is_play_video: this.data.is_play_video
        }
        handle.setDeatalis(platform, json, judge).then(res => {
            if (res.code) {
                setTimeout(() => {
                    wx.removeStorageSync('F5');
                    this.setData({
                        seep_time: json.progress
                    })
                    let bookDetails = wx.getStorageSync('bookDetails');
                    if (bookDetails && !bgMusic.paused && !judge.is_play_video) { //从其他页面点进来
                        if (bookDetails.name == json.title && !bgMusic.paused && bgMusic.paused != undefined) {
                            json.progress = Number((bgMusic.currentTime).toFixed(0));
                            this.setData({
                                seep_time: json.progress
                            })
                            this.playAudio();
                        }
                    }
                    if (judge.is_curriculum && judge.is_play_bottom && !judge.is_play_video) { //这是切换下一曲自动播放
                        this.playAudio();
                    }
                }, 3000)
                this.setUserShare(); //获取分享id
                if (judge.is_play_video) {
                    this.changeTop(1);
                }
                this.setData({
                    topList: json,
                    wacth_timer: json.duration,
                    is_vip: res.is_vip
                })
                this.getArticleClas();
            }
        })
        return;
    },

    // 获取书籍推荐
    getArticleClas: function () {
        this.data.$api.get({
            url: "api/article/getArticleClassId",
            data: {
                id: this.data.book_id
            }
        }).then(res => {
            this.setData({
                bookList: res.data.data
            })
        })
    },
    // 获取相应信息
    getExamine: function () {
        this.data.$api.get({
            url: "api/index/getExamine",
            data: {
                examine: 1
            }
        }).then(res => {
            if (res.data.data.type == 1) {
                this.setData({
                    is_show_top: true
                })
            }
        })
    },
    // 改变头部
    changeTop: function (e) {
        let is_play_now = this.data.is_play_now;
        let index = e;
        let v = this.data.navList;
        if (v[index].active) {
            return;
        }
        for (let i = 0; i < v.length; i++) {
            if (v[i].active) {
                v[i].active = 0;
                break;
            }
        }
        v[index].active = 1;
        let is_video = 0;
        if (v[index].id == 2) {
            this.videoContext = wx.createVideoContext('myVideo');
            is_video = 1;
            if (is_play_now) {
                this.palyVideo();
                this.palyVideoTwo();
            }
        }
        if (v[index].id == 1) {
            is_video = 0;
            if (this.data.is_play_video_now) {
                // 在切换过来的时候没有暂停所以要直接切换
                this.setAudioTime(this.data.seep_time, "切换播放音频");
                if(this.data.is_ios){
                    let json = this.data.topList;
                    json.progress = this.data.seep_time;
                    this.setData({
                        topList : json
                    })
                }
                this.playAudio();
            }
        }
        this.setData({
            navList: v,
            is_video: is_video,
            current: index,
        })
    },
    // 改变底部nav
    changeBottom: function (e) {
        let index = e.currentTarget.dataset.index;
        let v = this.data.bottomList;
        if (v[index].active) {
            return;
        }
        for (let i = 0; i < v.length; i++) {
            if (v[i].active) {
                v[i].active = 0;
                break;
            }
        }
        v[index].active = 1;
        let is_comment = 0;
        if (v[index].id == 2) {
            is_comment = 1;
        }
        this.setData({
            bottomList: v,
            is_comment: is_comment
        })
        let is_fixed = this.data.is_fixed;
        if (is_fixed) {
            wx.pageScrollTo({
                scrollTop: 274
            })
        }
    },

    // 进度条
    sliderChange: function (e) {
        if (!bgMusic.src) {
            return;
        }
        this.setData({
            is_show_now: false
        })
        if (bgMusic.duration) {
            let timer_paly = this.data.timer_paly;
            clearInterval(timer_paly);
            timer_paly = null;
            this.setData({
                timer_paly: timer_paly
            })
            let duration = bgMusic.duration;
            let sum = (e.detail.value / 100) * duration;
            sum = parseInt(sum);
            bgMusic.seek(sum); //设置跳转时间
            this.setData({
                current_time: this.secondsFormat(sum),
                seep_time: sum,
                pro_width: e.detail.value
            })
            setTimeout(() => {
                this.playAudio();
            }, 500)
        }
    },
    // 正在改变中
    sliderChangeing: function (e) {
        if (!bgMusic.src) {
            wx.showToast({
                title: '哎呀~您还没有播放呢',
                mask: true,
                icon: "none",
            })
            return;
        }
        this.setData({
            is_slider: true
        })
        let duration = bgMusic.duration;
        let sum = (e.detail.value / 100) * duration;
        sum = parseInt(sum);
        let slider_time = this.data.current_time;
        slider_time = this.secondsFormat(sum);
        this.setData({
            slider_time: slider_time
        })
        let timer_paly = this.data.timer_paly;
        if (timer_paly) {
            clearInterval(timer_paly);
            timer_paly = null;
            this.setData({
                timer_paly: timer_paly
            })
        }
    },
    sliderChangeEnd: function (e) {
        this.setData({
            is_slider: false,
        })
        this.sliderChange(e)
    },

    // 获取评论数据
    getComment: function () {
        this.data.$api.get({
            url: "api/article/getComment",
            data: {
                id: this.data.book_id,
                page: this.data.page,
            },
            show: "false"
        }).then(res => {
            let arr = res.data.data.data;
            if (this.data.page > 1) {
                if (!arr.length) {
                    wx.showToast({
                        title: '没有更多数据了',
                        icon: "none",
                        mask: true
                    })
                    this.setData({
                        is_stop: true
                    })
                    return;
                }
            }

            let arr_1 = this.data.bottomList;
            let arr_2 = this.data.commentList; //评论数据
            arr_1[1].name = "评论";
            arr_1[1].name = `${arr_1[1].name}(${res.data.data.count})`;
            arr.forEach(v => {
                v.wrods_num = v.content.length;
                v.comment_text = "展开";
                v.is_up = true;
                v.content = handle.uncodeUtf16(v.content);
                if (v.comment.length) {
                    v.comment.forEach(o => {
                        o.content = handle.uncodeUtf16(o.content);
                    })
                }
                if (v.fabulous < 0) {
                    v.fabulous = 0;
                }
            })
            arr_2.push(...arr);
            this.setData({
                commentList: arr_2,
                bottomList: arr_1,
            })
        })
    },

    // 首次播放等待1s
    palyAudioFrist: function () {
        if (this.data.Record_id) {
            setTimeout(() => {
                this.playAudio();
            }, 1000)
        } else {
            this.playAudio();
        }
    },
    // 播放音乐
    playAudio: function () {
        let json = this.data.topList;
        if (this.data.is_play_video_now) {
            this.videoContext.pause();
            this.setData({
                is_play_video_now: false,
            });
        }
        if (!this.data.seep_time) {
            this.setData({
                seep_time: json.progress
            })
        } else {
            json.progress = this.data.seep_time;
            if (this.data.is_ios) {
                let ios = wx.getStorageSync('ios');
                if (!ios) {
                    ios = []
                }
                ios.push({
                    "视频切换后": json.progress,
                    'id': json.id
                })
                wx.setStorageSync('ios', ios);
                log.info(JSON.stringify({
                    "视频切换后": json.progress,
                    'id': json.id
                }));
            } else {
                let Android = wx.getStorageSync('Android');
                if (!Android) {
                    Android = []
                }
                Android.push({
                    "视频切换后": json.progress,
                    'id': json.id
                })
                wx.setStorageSync('Android', Android);
                log.info(JSON.stringify({
                    "视频切换后": json.progress,
                    'id': json.id
                }));
            }
        }
        // 防止重复点击
        let paly_music = wx.getStorageInfoSync("paly_music");
        if (!paly_music) {
            wx.showToast({
                title: '您已点击了，请勿多次连续点击',
                icon: "none",
                mask: true
            })
            wx.setStorageSync('paly_music', (new Data).toString());
            return;
        }
        let seep_time = this.data.seep_time;
        setTimeout(() => {
            wx.removeStorageSync('paly_music')
        }, 1000);
        // 判断是否是课程
        if (this.data.is_curriculum) {
            wx.setStorageSync('is_curriculum', (new Date).toString())
        } else {
            wx.removeStorageSync('is_curriculum');
        }
        this.setData({
            is_play: true,
            is_play_now: true, //现在正在播放
        })
        if (!this.data.Record_id) { //初始化进度
            this.viewingRecord();
        }

        let timer_paly = this.data.timer_paly; // 播放定时器
        let all_time = 1000;

        // 是否为当前音乐,不是当前音乐，暂停原来的音乐，然后在进行播放
        let bookDetails = wx.getStorageSync('bookDetails');
        let changeBook = false; //是否改变书籍
        if (bookDetails.name) {
            if (bookDetails.name != json.title) {
                changeBook = true;
            }
        }
        let bookDetails_now = { //保存书籍信息
            id: json.id,
            name: json.title,
            imgSrc: this.data.imgSrc + json.thumb,
            author: json.author,
            pid: json.pid
        }
        wx.setStorageSync("bookDetails", bookDetails_now);
        if (bgMusic.src != json.audio) {
            changeBook = true;
        }
        // 初始化数据
        if (!bgMusic.src || changeBook) {
            this.setData({
                is_disabled: false
            })
            // 必须初始化标题 微信小程序必填项
            bgMusic.title = json.title; //初始化标题
            bgMusic.src = json.audio;
            bgMusic.coverImgUrl = this.data.imgSrc + json.thumb;
            bgMusic.singer = json.author;
        }

        // 设置播放进度 在继续播放的情况下
        if (bgMusic.src) {
            if (this.data.is_play_bottom) {
                seep_time = bgMusic.currentTime;
                this.setAudioTime(seep_time, "底部继续播放");
            }
            let setTime = wx.getStorageSync('setTime');
            if (setTime) {
                return;
            }
            this.setData({
                is_disabled: false
            })
        }
        let duration = 0;
        // 计算总时间
        if (this.data.all_time == '00:00') { //只有初始化的时候进行计算时间
            let timer = setInterval(() => {
                duration = bgMusic.duration;
                if (duration) {
                    all_time = this.secondsFormat(parseInt(duration));
                    this.setAudioTime(json.progress, "初始化设置1");
                    this.setData({
                        all_time: all_time
                    })
                    clearInterval(timer);
                    timer = null;
                    wx.setStorageSync('duration', duration);
                    if (!this.data.is_play_bottom) {
                        seep_time = json.progress;
                        this.setAudioTime(seep_time, "初始化设置2");
                    }
                }
            }, 200);
        }
        clearInterval(timer_paly);
        timer_paly = null;
        this.setData({
            timer_paly: timer_paly
        })
        if (!duration) { //如果没有时间
            duration = bgMusic.duration
        }
        if (!timer_paly) {
            if (this.data.is_music_end) { //当自然结束后重新播放
                seep_time = 0;
                this.setData({
                    seep_time: 0
                })
                this.setAudioTime(0, "自然播放结束");
                this.setData({
                    is_music_end: false
                })
            }
            if (!duration && this.data.all_time != "00:00") {
                duration = bgMusic.duration;
            }
            timer_paly = setInterval(() => {
                if (this.data.is_loding) {
                    wx.showLoading({
                        title: '音频正在缓冲中~，请稍等',
                    })
                    // bgMusic.play();
                    let count = 0;
                    let timers = setInterval(() => {
                        count++;
                        if (count > 21) {
                            wx.showToast({
                                title: '哎呀，您网速不给力呀，请检查您的网络状况是否良好',
                                icon: "none",
                                mask: true
                            })
                            wx.hideLoading();
                            clearInterval(timers);
                            timers = null;
                            this.pauseAudio();
                            this.setData({
                                is_loding: false
                            })
                            return;
                        }
                        if (!this.data.is_loding) {
                            clearInterval(timers);
                            timers = null;
                        }
                    }, 1000)
                }
                if (bgMusic.paused == false) {
                    wx.hideLoading();
                    this.setData({
                        is_loding: false,
                    })
                    seep_time += 1;
                    let current_time = this.secondsFormat(seep_time);
                    let percentage = seep_time / (duration ? parseInt(duration) : parseInt(bgMusic.duration));
                    percentage = percentage.toFixed(5) * 100;
                    percentage = percentage.toFixed(2);
                    let subtraction = (seep_time - parseInt(bgMusic.currentTime)) > 3; //大于当前时间的3秒
                    let subtraction_two = (seep_time - parseInt(bgMusic.currentTime)) < -3; //小于当前时间的3秒
                    if (percentage > 100 || subtraction || subtraction_two) {
                        seep_time = parseInt(bgMusic.currentTime);
                    }
                    this.setData({
                        current_time: current_time,
                        pro_width: parseFloat(percentage),
                        seep_time: seep_time
                    })
                    this.wacthTimer("music");
                }
            }, 1000)
        }
        bgMusic.play();
        this.setData({
            timer_paly: timer_paly,
            is_tremble: false
        })
    },
    // 设置音乐跳转时间
    setAudioTime: function (seep_time, num) {
        bgMusic.seek(seep_time);
        let json = this.data.topList;
        if (this.data.is_ios) {
            let ios = wx.getStorageSync('ios');
            if (!ios) {
                ios = [];
            }
            let data = {
                id: json.id
            }
            data[num] = json.progress,
                ios.push(data);
            wx.setStorageSync('ios', ios);
            log.info(JSON.stringify(data));
        } else {
            let Android = wx.getStorageSync('Android');
            if (!Android) {
                Android = [];
            }
            let data = {
                id: json.id
            }
            data[num] = json.progress,
                Android.push(data)
            wx.setStorageSync('Android', Android);
            log.info(JSON.stringify(data));
        }
    },
    // 监听音乐暂停
    onPauseMuisic: function (e) {
        this.pauseAudio();
    },
    // 监听音乐停止
    onStopMusic: function (e) {
        this.pauseAudio();
    },
    // 监听音频错误事件
    onErrMusic: function () {
        this.pauseAudio();
    },
    // 监听音频自然停止
    onEndedMusic: function () {
        let timer_paly = this.data.timer_paly;
        clearInterval(timer_paly);
        timer_paly = null;
        this.setData({
            is_play: false,
            timer_paly: timer_paly,
            is_disabled: true,
            is_music_end: true,
            seep_time: 0
        });
        if (this.data.is_curriculum) {
            this.goNxet("next", true);
        }
    },
    // 监听音乐正常播放
    onPalyMusic: function () {
        let bookDetails = wx.getStorageSync('bookDetails');
        let json = this.data.topList;
        if (bookDetails.name == json.title) {
            this.playAudio();
        }
    },
    // 暂停音乐
    pauseAudio: function () {
        let paly_music = wx.getStorageInfoSync("paly_music");
        if (!paly_music) {
            wx.showToast({
                title: '您已点击了，请勿多次连续点击',
                icon: "none",
                mask: true
            })
            wx.setStorageSync('paly_music', new Data);
            return;
        }
        let json = this.data.topList;
        setTimeout(() => {
            wx.removeStorageSync('paly_music')
        }, 2000)
        let timers = setInterval(() => {
            bgMusic.pause();
            if (bgMusic.paused) {
                clearInterval(timers);
                timers = null;
            }
        }, 200)
        let timer_paly = this.data.timer_paly;
        clearInterval(timer_paly);
        timer_paly = null;
        this.setData({
            is_play: false,
            timer_paly: timer_paly,
            is_play_now: false, //设置现在是否正在播放
        })
    },
    // 播放视频
    palyVideo: function (e) {
        let palyVideo = wx.getStorageSync('palyVideo');
        let json = this.data.topList;
        if (this.data.is_paly_now) {
            this.pauseAudio();
            this.setData({
                is_play_now: false, //设置现在是否正在播放
            })
        }
        this.setData({
            is_play_video_now: true, //设置现在是否正在播放
        })
        if (palyVideo) {
            setTimeout(() => {
                wx.removeStorageSync('palyVideo')
            }, 2000)
            return;
        }
        wx.setStorageSync('palyVideo', (new Date).toString());
        let bookDetails = wx.getStorageSync('bookDetails');
        if (!bookDetails) {
            let bookDetails_now = { //保存书籍信息
                id: json.id,
                name: json.title,
                imgSrc: this.data.imgSrc + json.thumb,
                author: json.author,
                pid: json.pid
            }
            wx.setStorageSync("bookDetails", bookDetails_now);
        }
        let Record_id = this.data.Record_id;
        let salt = wx.getStorageSync('salt');
        if (!Record_id && salt) { //用户直接播放
            this.viewingRecord();
            this.videoContext.seek(json.progress);
        }
        let timer_paly = this.data.timer_paly;
        clearInterval(timer_paly);
        timer_paly = null;
        this.setData({
            timer_paly: timer_paly
        })
        if (!timer_paly) {
            timer_paly = setInterval(() => {
                app.globalData.paly_time += 1;
                this.setData({
                    timer_paly: timer_paly
                })
            }, 1000)
        }
    },
    // 播放视频2  主要为了防止切换不准确
    palyVideoTwo: function () {
        this.setData({
            is_play_video_now: true, //设置现在是否正在播放
        })
        this.videoContext.seek(this.data.seep_time);
        this.videoContext.play();
    },
    // 暂停视频
    pauseVideo: function (e) {
        if (this.data.is_play_video_now) {
            this.pauseAudio();
            this.setData({
                is_play_video_now: false,
            })
        }
        let type = "";
        if (e) {
            type = e.type;
        }
        if (type != "pause") {
            this.videoContext.pause();
        }
        if (app.globalData.paly_time) { //当前是否播放
            $browsing.browsing(app.globalData.paly_time, 1, 2, false, this.data.seep_time); //创建记录
            app.globalData.paly_time = 0;
        }
        let is_video = this.data.is_video;
        if (!is_video) {
            return;
        }
    },
    // 视频出现缓冲
    waitingVideo: function () {
        if (this.data.is_video_load > 1) {
            this.setData({
                show_video_set: true
            })
        } else {
            this.setData({
                is_video_load: 2
            })
        }
        setTimeout(() => {
            this.setData({
                show_video_set: false
            })
        }, 3000)
    },
    // 关闭视频提示
    closeWaitingVideo: function () {
        this.setData({
            show_video_set: false
        })
    },
    // 创建时间
    secondsFormat: function (s) {
        let minute = parseInt(Math.floor(s / 60));
        if (minute < 10) {
            minute = "0" + minute;
        }
        let second = parseInt(s - minute * 60);
        if (second < 10) {
            second = "0" + second;
        }
        return minute + ":" + second;
    },
    // 视频播放时间 
    timeupdate: function (e) {
        // console.log("执行计算时间");
        // 不是vip到达时间就不让播放了
        this.wacthTimer("video");
        this.setData({
            seep_time: parseInt(e.detail.currentTime)
        })
        if (app.globalData.paly_time % 10 == 0) {
            // 每10s存一次播放时间
            wx.setStorageSync('paly_time', app.globalData.paly_time);
        }
        if (app.globalData.paly_time >= 100) {
            $browsing.browsing(app.globalData.paly_time, 1, 2, false, parseInt(bgMusic.currentTime));
            app.globalData.paly_time = 0;
            wx.removeStorageSync('currentTime');
            wx.removeStorageSync('paly_time');
        }
    },

    // 创建浏览记录
    viewingRecord: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            return;
        }
        this.data.$api.get({
            url: "api/article/viewingRecord",
            data: {
                article: this.data.book_id
            },
            show: false
        }).then(res => {
            this.setData({
                Record_id: res.data.data.id
            })
            let data = {
                book_id: this.data.book_id,
                id: res.data.data.id
            }
            wx.setStorageSync('bookInfo', data); //设置书籍信息
            wx.setStorageSync('Record_id', this.data.Record_id); //设置记录id
        })
    },
    // 获取组件举报id
    getReportId: function (e) {
        this.setData({
            is_pup: true,
            report_id: e.detail.report_id,
            comment_user_id: e.detail.user_id, //评论人的id
        })
    },

    // 删除评论成功
    delOk: function (e) {
        this.setData({
            commentList: [],
            page: 1
        })
        this.getComment();
    },

    // 开通vip
    openVip: function () {
        let code = this.data.$pay.pay(0, 365, 1);
        code.then(res => {
            if (res) {
                handle.getArticleVIP().then((res) => { //重新获取vip
                    if (res) {
                        this.setData({
                            is_vip: res
                        })
                    }
                })
                this.getuserVip(); //重置vip状态
            }
        })
    },
    //重置vip状态
    getuserVip: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            wx.removeStorage({
                key: 'userVip'
            });
            return;
        }
        this.data.$login.login(); //获取用户信息
        this.data.$api.post({
            url: "api/user/getUserVIP",
        }).then(res => {
            wx.setStorageSync("userVip", res.data.data);
        })
    },
    // 改变banner
    chnageBanner: function (e) {
        let id = e.type == 'tap' ? e.currentTarget.dataset.index : e.detail.current;
        this.changeTop(id);
    },
    // 判断当前是否到可以观看的时间
    wacthTimer: function (type) {
        handle.wacthTimer(this.data.topList, this.data.wacth_timer, this.data.is_vip, this.data.seep_time, this.data.pageUrls).then((res) => {
            let timer_paly = this.data.timer_paly;
            clearInterval(timer_paly);
            timer_paly = null;
            this.setData({
                timer_paly: timer_paly
            })
            if (type == 'music') {
                this.pauseAudio();
            }
            if (type == 'video') {
                this.videoContext.pause();
            }
            if (res.code == -2) {
                wx.showModal({
                    title: "提示",
                    content: res.tips,
                    confirmColor: "#F16E22",
                    cancelColor: "#999999",
                    cancelText: "我在想想",
                    confirmText: "立即开通",
                    success: (res) => {
                        if (res.confirm) {
                            this.openVip();
                        }
                    }
                })
            }
        })
    },
    // 去评论页面
    goComment: function () {
        let book_id = this.data.book_id;
        let urls = '../comment/comment?bookId=' + book_id;
        wx.navigateTo({
            url: urls,
        })
    },

    // 获取课程推荐
    getCurriculumId: function () {
        handle.getCurriculumId(this.data.book_id).then(res => {
            this.setData({
                is_buy: res.is_buy ? res.is_buy : false,
                episodes: res.episodes,
                is_previous: res.is_previous === false ? res.is_previous : true,
                is_next: res.is_next === false ? res.is_next : true,
                curriculumList: res.curriculumList,
                all_price: res.all_price
            })
            res.curriculumList.forEach(v => {
                v.active = 0;
            })
            this.setData({
                curriculumList_2: res.curriculumList
            })
            setTimeout(() => {
                if (res.count > 1) {
                    this.setData({
                        scroll_left: (res.count + 1) * (60 + (10 * res.count))
                    })
                }
            }, 1000)
        })
    },

    // 获取课程详情
    getCurriculumArticleId: function (platform) {
        this.data.$api.get({
            url: "api/Article/getCurriculumArticleId",
            data: {
                id: this.data.book_id
            }
        }).then(res => {
            let json = res.data.data;
            if (json) {
                json.audio = encodeURI(json.audio);
                json.video = encodeURI(json.video);
                this.setDeatalis(platform, json);
                this.getCurriculumId();
                if (this.data.salt == "Tc5y2z1l") {
                    let test_huang = wx.getStorageSync('test_huang');
                    if (!test_huang) {
                        test_huang = []
                    }
                    test_huang.push({
                        "课程进度": json.progress,
                        "id": json.id
                    })
                    wx.setStorageSync('test_huang', test_huang);
                }
            }
        })
    },
    // 组件去下一页
    goNextCom: function (e) {
        this.goNxet("", false, false, e.detail.id);
    },
    // 上一曲下一曲
    goNxet: function (e, paly, is_video, bookId) {
        handle.goNxet(e, paly, is_video, bookId, this.data.curriculum_id, this.data.book_id);
    },
    // 打开购买弹窗
    openPup: function (e) {
        this.setData({
            show_buy: e.detail.open
        })
    },
    // 打开购买弹窗2
    openbuy: function () {
        this.setData({
            show_buy: true
        })
    },
    // 是否为ios
    isIos: function () {
        wx.getSystemInfo({
            success: (result) => {
                let reg = new RegExp('iOS');
                if (result.system.match(reg)) {
                    this.setData({
                        is_ios: true,
                        top_tips: "请先兑换会员或者分享3人免费观看",
                        top_tips_2: "兑换会员免费畅听全集"
                    })
                }
            },
        })
    },
    // 打开会员兑换
    openExchange: function () {
        this.setData({
            is_exchange: true
        })
    },
    // 获取分享课程id
    setUserShare: function () {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            return;
        }
        setTimeout(() => {
            this.data.$api.get(({
                url: "api/Article/setUserShare",
                data: {
                    article: this.data.topList.id
                }
            })).then(res => {
                this.setData({
                    share_curriculum_id: res.data.data.id
                })
            })
        }, 2000)
    },
    // 视频自然播放到结束
    endVideo: function () {
        this.goNxet('next', true, 'video');
    },
    // 去设置
    goSet: function () {
        if (this.data.is_play_video_now) {
            this.pauseVideo();
        }
        setTimeout(() => {
            wx.redirectTo({
                url: '../setting/setting?pageUrl=' + this.data.pageUrls + '@show_pup',
            })
        }, 1000)
    },
})