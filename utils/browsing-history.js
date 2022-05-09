const bgMusic = wx.getBackgroundAudioManager();
const $api = require("./api");
const utils = require("./util");
const app = getApp();
function browsing(paly_time,type,log,all,video_time) { //初始化参数
    /*
        数据说明：
        paly_time : 播放时间
        type ： 0 音频 1视频
        log ： 日志 0 底部播放上传 1 主页第一次上传  2 详情页上传 3 新的播放 4 隐藏上传 5 重新进入上传
        all : 是否全部播放完毕
        video_time : 视频播放时间
    */
    let salt = wx.getStorageSync('salt');
    if (!salt) {
        return;
    }
    let Record_id = wx.getStorageSync('Record_id');
    // 收听日志
    let arr = [];
    let arr_1 = wx.getStorageSync('browsing');
    if(arr_1){
        arr = arr_1;
    }
    let date = utils.formatTime(new Date);
    let json = {
        "上传时间" : date,
        "播放时间" : paly_time || "未获取到播放时间",
        "记录id" : Record_id ,
        "重要提示" : "用户上传进度记录",
        "上传方式" : log,
        "播放进度" : video_time || parseInt(bgMusic.currentTime)
    }
    arr.push(json);
    wx.setStorageSync('browsing', arr);
    if(!Record_id){
        return;
    }
    setViewing(Record_id,paly_time,type,all,video_time)
}

// 修改浏览记录
function setViewing(Record_id,paly_time,type,all,video_time) {
    let currentTime =  parseInt(bgMusic.currentTime);
    let duration = wx.getStorageSync('duration');
    if(paly_time > currentTime && !video_time){
        paly_time = currentTime;
    }
    if(paly_time > duration && !video_time){
        paly_time = duration;
    }
    $api.default.post({
        url: "api/article/setViewing",
        data: {
            id: Record_id,
            type: type || 0,
            time: paly_time || undefined
        },
        show: false
    }).then(res => {
        wx.removeStorageSync('paly_time');
        setRecord(all,video_time);
    })
}

// 保存浏览记录
function setRecord(all,video_time) {
    let bookDetails = wx.getStorageSync('bookDetails');
    let bookInfo = wx.getStorageSync('bookInfo');
    let duration = wx.getStorageSync('duration');
    $api.default.post({
        url: "api/article/setRecord",
        data: {
            article: bookDetails.id || bookInfo.book_id,
            progress: !all ? video_time ? video_time : parseInt(bgMusic.currentTime) : 0,
            frequency: all ? 1 : 0,
            length:  parseInt(duration) || 60 * 60
        },
        show: false
    }).then(res => {
        if(all){ //如果是全部
            wx.removeStorageSync('bookDetails');
        }
        wx.removeStorageSync('currentTime');
    })
}

module.exports = {
    browsing: browsing
}