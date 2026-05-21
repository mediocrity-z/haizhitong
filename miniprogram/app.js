var env = {};
try {
  env = require("./config/env.js");
} catch (e) {
  console.warn("env.js 未找到，请复制 config/env.example.js 为 config/env.js 并填入配置");
}

App({
  onLaunch() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      return;
    }
    wx.cloud.init({
      env: env.CLOUDBASE_ENV_ID || "your-cloudbase-env-id",
      traceUser: true,
    });
    this.checkLogin();
  },

  checkLogin() {
    var userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      this.globalData.isLogin = false;
      return;
    }
    this.globalData.userInfo = userInfo;
    this.globalData.isLogin = true;
    this.globalData.isAdmin = userInfo.role === "admin";
    this.globalData.queryCount = userInfo.queryCount || 0;
    this.globalData.lastQueryDate = userInfo.lastQueryDate || "";
  },

  setLogin(userInfo) {
    wx.setStorageSync("userInfo", userInfo);
    this.globalData.userInfo = userInfo;
    this.globalData.isLogin = true;
    this.globalData.isAdmin = userInfo.role === "admin";
    this.globalData.queryCount = userInfo.queryCount || 0;
    this.globalData.lastQueryDate = userInfo.lastQueryDate || "";
  },

  logout() {
    wx.removeStorageSync("userInfo");
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    this.globalData.isAdmin = false;
    this.globalData.queryCount = 0;
    this.globalData.lastQueryDate = "";
  },

  globalData: {
    userInfo: null,
    isLogin: false,
    isAdmin: false,
    queryCount: 0,
    lastQueryDate: "",
    latestResume: null,
  },
});
