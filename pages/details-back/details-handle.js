let api = require("../../utils/api");
api = api.default;
const app = getApp();
const pay = app.globalData.$pay; //支付
const $browsing = require("../../utils/browsing-history"); //上传进度和保存进度
const bgMusic = wx.getBackgroundAudioManager(); //背景音乐
// 获取用户是不是vip
function getArticleVIP() {
    return new Promise((resolve, reject) => {
        let salt = wx.getStorageSync('salt');
        if (!salt) {
            resolve(false)
        }
        api.post({
            url: "api/user/getArticleVIP",
        }).then(res => {
            resolve(res.data.data.type)
        })
    })
};

// 判断当前是否到可以观看的时间
function wacthTimer(topList, wacth_timer, is_vip, seep_time, pageUrls) {
    /*
        type : 当前观看文件类型
        topList : 原始数据
        wacth_timer : 当前观看时间
        is_vip : 是否是vip
    */

    // 不是vip到达时间就不让播放了
    return new Promise((resolve, reject) => {
        let json = topList;
        let wacth = wx.getStorageSync('wacth'); //是否已经提示，防抖
        if (wacth) {
            wx.setStorageSync('wacth', true);
            return;
        }
        // 当前是否为已购买课程
        if (topList.is_pay) {
            if (topList.is_pay == 1) {
                return;
            }
        }
        if (seep_time >= wacth_timer && is_vip != 1) {
            setTimeout(() => {
                wx.removeStorageSync('wacth');
            }, 1000);
            let salt = wx.getStorageSync('salt');
            if (!salt) {
                wx.showModal({
                    title: "提示",
                    content: "登录享更多服务",
                    confirmColor: "#F16E22",
                    cancelColor: "#999999",
                    cancelText: "随便看看",
                    confirmText: "立即登录",
                    success: (res) => {
                        if (res.confirm) {
                            wx.redirectTo({
                                url: '/page-two/login/login?pageUrl=' + pageUrls,
                            })
                        }
                    }
                })
                let data = {
                    code: -1
                }
                resolve(data);
                return;
            }
            let tips = "";
            if (is_vip == 0) {
                tips = "观看完整版需要开通vip，是否立即开通"
            }
            if (json.curriculum && is_vip == 2) {
                tips = "观看完整版课程需要开通正式vip，是否立即开通"
            }
            if (!json.curriculum && is_vip == 2) {
                return;
            }

            let data = {
                code: -2,
                tips: tips
            }
            resolve(data);
            /*
                code -1 未登录
                code -2 不是vip
            */
        }
    })

};

// 分享进入
function shareIn(options) {
    // 保存分享人
    if (options.share_user) {
        let share = {
            share_user: options.share_user,
            share_curriculum_id: options.share_curriculum_id
        }
        // 自己分享不计入
        let salt_share = wx.getStorageSync('salt');
        if (share.share_user == salt_share) {
            return;
        }
        wx.setStorageSync('share', share);
    }
};

// 所有参数处理
async function setDeatalis(platform, json, judge) {
    /* 
        数据说明：
        platform : 是否为window
        json : 原始数据，
        judge : 判断数据
    */
    if (!platform) {
        let F5 = wx.getStorageSync('F5');
        if (!F5) {
            let url = '/pages/details/details?id=' + json.id;
            if (judge.is_play_bottom) {
                url = url + '&play=true';
            }
            if (judge.is_curriculum) {
                url = url + '&type=curriculum&curriculum_id=' + judge.curriculum_id;
            }
            if (judge.is_play_video) {
                url = url + "&is_video=true";
            }
            wx.redirectTo({
                url: url,
            })
            wx.setStorageSync('F5', "123");
            return {
                code: false
            };
        }
    }
    wx.setNavigationBarTitle({
        title: json.title,
    })
    if (json.p_title) {
        wx.setNavigationBarTitle({
            title: json.p_title,
        })
    }
    let sendDate = {
        code: true,
        is_vip: await getArticleVIP()
    }
    return sendDate;
};


// 获取课程的所有分集
function getCurriculumId(book_id) {
    return new Promise((resolve, reject) => {
        api.get({
            url: "api/Article/getCurriculumId",
            data: {
                id: book_id,
                type: 1
            }
        }).then(res => {
            let arr = res.data.data.data;
            let sendDate = {};
            arr.forEach(v => {
                v.active = 0;
                if (v.id == book_id) {
                    v.active = 1;
                    if (v.type != 1) {
                        sendDate.is_buy = true;
                    }
                }
            })
            let count = 0; // 判断当前在哪里
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == book_id) {
                    count = i;
                    sendDate.episodes = count + 1
                }
            }
            if (count == 0) {
                sendDate.is_previous = false;
            }
            if (count == arr.length - 1) {
                sendDate.is_next = false;
            }
            sendDate.curriculumList = arr;
            sendDate.all_price = res.data.data.p_price;
            sendDate.count = count;
            /*
                sendDate参数说明
                count : 当前次数
                all_price : 总价格
                curriculumList : 课程分集数据
                is_previous : 是否有上一集
                is_next : 是否有下一集
                episodes : 当前集数
                is_buy : 是否购买
            */
            resolve(sendDate);
        })
    })
};

// 转换评论数据
function uncodeUtf16(str) {
    var reg = /\&#.*?;/g;
    var result = str.replace(reg, function (char) {
        var H, L, code;
        if (char.length == 9) {
            code = parseInt(char.match(/[0-9]+/g));
            H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
            L = (code - 0x10000) % 0x400 + 0xDC00;
            return unescape("%u" + H.toString(16) + "%u" + L.toString(16));
        } else {
            return char;
        }
    });
    return result;
};

// 上一曲下一曲
 async function goNxet(e, paly, is_video, bookId, curriculum_id , book_ids) {
    /*
        数据说明
        e : 当前是上一曲还是下一曲
        paly : 当前是否播放
        is_video : 是否为视频
        bookId : 当前书籍id，是否为点击
        curriculum_id : 父级课程id
        book_ids : 原始数据id
    */ 
    let json = await getCurriculumId(book_ids);
    let go = "";
    if (e.currentTarget) {
        go = e.currentTarget.dataset.go;
    } else {
        go = e;
    }
    let arr = json.curriculumList;
    let book_id = bookId || book_ids;
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == book_id) {
            if (!bookId) {
                if (go == "next") {
                    count = i + 1;
                } else {
                    count = i - 1;
                }
            } else {
                count = i;
            }
            break;
        }
    }
    if (count == arr.length) {
        wx.showToast({
            title: '哎呀~没有下一集啦~',
            icon: "none",
            mask: true
        })
        return;
    }
    if (count <= 0 && !bookId) {
        wx.showToast({
            title: '这是第一集哟~',
            icon: "none",
            mask: true
        })
        return;
    }
    let url = '/pages/details/details?id=' + arr[count].id + "&type=curriculum&curriculum_id=" + curriculum_id;
    if (paly) {
        url = url + "&play=true";
    }
    if (is_video) {
        url = url + "&is_video=true";
    }
    if (bgMusic.paused == false) {
        bgMusic.pause();
        if (is_video) {
            $browsing.browsing(app.globalData.paly_time, 1, 2);
        } else {
            $browsing.browsing(app.globalData.paly_time, 0, 2);
        }
        wx.removeStorageSync('bookInfo');
        wx.removeStorageSync('Record_id');
        wx.removeStorageSync('duration');
        wx.removeStorageSync('currentTime');
    }
    app.globalData.seep_time = 0;
    wx.showLoading({
        title: '请稍等，正在切换中',
    })
    setTimeout(() => {
        wx.hideLoading();
        wx.redirectTo({
            url: url,
        })
    }, 500)
};


module.exports = {
    getArticleVIP,
    wacthTimer,
    shareIn,
    setDeatalis,
    getCurriculumId,
    uncodeUtf16,
    goNxet ,
}