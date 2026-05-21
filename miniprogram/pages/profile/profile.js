var api = require("../../utils/api");
var db = wx.cloud.database();

Page({
  data: {
    isLogin: false,
    userInfo: null,
    queryRemaining: 0,
    queryTotal: 5,
    quotaPercent: 100,
    resumeHistory: [],
    loading: true,
    loggingIn: false,
  },

  onShow: function () {
    this.checkLoginState();
  },

  onPullDownRefresh: function () {
    var that = this;
    if (that.data.isLogin) {
      Promise.all([that.loadQueryCount(), that.loadResumeHistory()]).then(function () {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  checkLoginState: function () {
    var app = getApp();
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        isLogin: true,
        userInfo: app.globalData.userInfo,
        loading: true,
      });
      this.loadQueryCount();
      this.loadResumeHistory();
    } else {
      this.setData({ isLogin: false, loading: false });
    }
  },

  loadQueryCount: function () {
    var that = this;
    return db
      .collection("users")
      .limit(1)
      .get()
      .then(function (res) {
        if (res.data.length > 0) {
          var user = res.data[0];
          var today = new Date().toDateString();
          var used = user.lastQueryDate === today ? (user.queryCount || 0) : 0;
          var remaining = Math.max(0, that.data.queryTotal - used);
          that.setData({
            queryRemaining: remaining,
            quotaPercent: (remaining / that.data.queryTotal) * 100,
          });
          // 同步回 globalData
          var app = getApp();
          if (app.globalData.userInfo) {
            app.globalData.userInfo.queryCount = user.queryCount || 0;
            app.globalData.userInfo.lastQueryDate = user.lastQueryDate || "";
          }
        }
      })
      .catch(function (err) {
        console.error("加载查询次数失败:", err);
      });
  },

  handleLogin: function () {
    var that = this;
    if (that.data.loggingIn) return;
    that.setData({ loggingIn: true });

    api.login({})
      .then(function (res) {
        that.setData({ loggingIn: false });
        if (res.code === 0) {
          getApp().setLogin(res.data);
          that.checkLoginState();
          wx.showToast({ title: "登录成功", icon: "success" });
        } else {
          wx.showToast({ title: res.msg || "登录失败", icon: "none" });
        }
      })
      .catch(function (err) {
        that.setData({ loggingIn: false });
        console.error("登录失败:", err);
        wx.showToast({ title: "登录失败，请重试", icon: "none" });
      });
  },

  handleLogout: function () {
    var that = this;
    wx.showModal({
      title: "退出登录",
      content: "退出后需重新登录才能查看简历历史",
      success: function (modalRes) {
        if (modalRes.confirm) {
          getApp().logout();
          that.setData({
            isLogin: false,
            userInfo: null,
            queryRemaining: 0,
            resumeHistory: [],
            loading: false,
          });
          wx.showToast({ title: "已退出", icon: "none" });
        }
      },
    });
  },

  loadResumeHistory: function () {
    var that = this;
    return db
      .collection("registrations")
      .orderBy("createTime", "desc")
      .get()
      .then(function (res) {
        that.setData({ resumeHistory: res.data, loading: false });
      })
      .catch(function (err) {
        console.error("加载简历历史失败:", err);
        that.setData({ loading: false });
      });
  },

  onTapResume: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/resume/resume?id=" + id });
  },

  goGenerate: function () {
    wx.switchTab({ url: "/pages/register/register" });
  },
});
