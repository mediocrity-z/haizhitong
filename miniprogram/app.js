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
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      this.globalData.isLogin = false;
      return;
    }
    this.globalData.userInfo = userInfo;
    this.globalData.isLogin = true;
  },

  globalData: {
    userInfo: null,
    isLogin: false,
    isAdmin: false,
  },
});
