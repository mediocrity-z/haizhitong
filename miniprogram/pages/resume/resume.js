var api = require("../../utils/api");
var db = wx.cloud.database();

Page({
  data: {
    hasRegistration: false,
    registration: null,
    resumeHtml: "",
    resumeStatusText: "",
    enhancing: false,
    registrationId: "",
    fromHistory: false,
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ registrationId: options.id, fromHistory: true });
    }
  },

  onShow: function () {
    this.loadRegistration();
  },

  loadRegistration: function () {
    var that = this;
    var app = getApp();

    // 优先使用 latestResume（刚从生成页跳转过来）
    if (app.globalData.latestResume) {
      var r = app.globalData.latestResume;
      that.setData({
        hasRegistration: true,
        resumeHtml: r.resumeHtml || "",
        resumeStatusText: "已生成",
      });
      delete app.globalData.latestResume;
      // 如果有 latestResume 就不再查 DB
      if (!that.data.registrationId) return;
    }

    var query;
    if (that.data.registrationId) {
      query = db.collection("registrations").doc(that.data.registrationId).get();
    } else {
      query = db.collection("registrations").orderBy("updateTime", "desc").limit(1).get();
    }

    query
      .then(function (res) {
        var reg;
        if (that.data.registrationId) {
          reg = res.data;
        } else {
          reg = res.data.length > 0 ? res.data[0] : null;
        }
        if (reg) {
          var html = that.data.resumeHtml || reg.resumeHtml || "";
          that.setData({
            hasRegistration: true,
            registration: reg,
            resumeHtml: html,
            resumeStatusText: reg.status === "completed" || html ? "已生成" : "待生成",
          });
        } else if (!that.data.hasRegistration) {
          that.setData({ hasRegistration: false });
        }
      })
      .catch(function (err) {
        console.error(err);
        if (!that.data.hasRegistration) {
          that.setData({ hasRegistration: false });
        }
      });
  },

  downloadResume: function () {
    var html = this.data.resumeHtml;
    if (!html) {
      wx.showToast({ title: "暂无简历", icon: "none" });
      return;
    }

    var full = html;
    if (html.indexOf("<!DOCTYPE") === -1 && html.indexOf("<html") === -1) {
      full = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body>" + html + "</body></html>";
    }

    var fs = wx.getFileSystemManager();
    var path = wx.env.USER_DATA_PATH + "/resume.html";
    fs.writeFile({
      filePath: path,
      data: full,
      encoding: "utf8",
      success: function () {
        wx.openDocument({
          filePath: path,
          showMenu: true,
          fileType: "html",
          fail: function () {
            wx.shareFileMessage({
              filePath: path,
              fileName: "我的简历.html",
              fail: function () {
                wx.showToast({ title: "请截图保存", icon: "none" });
              },
            });
          },
        });
      },
      fail: function (err) {
        console.error(err);
        wx.showToast({ title: "保存失败", icon: "none" });
      },
    });
  },

  regenerateResume: function () {
    var that = this;
    var id = that.data.registrationId;
    wx.showModal({
      title: "重新填写",
      content: "将跳转到填写页面重新提交信息",
      success: function (modalRes) {
        if (!modalRes.confirm) return;
        wx.switchTab({ url: "/pages/register/register" });
      },
    });
  },

  enhanceResume: function () {
    var that = this;
    if (this.data.enhancing) return;

    wx.showModal({
      title: "AI 优化工作经历",
      content: "将调用 AI 对您的工作经历进行专业化扩展和美化，使其更贴近目标岗位要求。此过程需要约10-20秒，是否继续？",
      success: function (modalRes) {
        if (!modalRes.confirm) return;

        that.setData({ enhancing: true });
        wx.showLoading({ title: "AI 优化中..." });

        api.enhanceResume(that.data.registrationId)
          .then(function (res) {
            wx.hideLoading();
            if (res.code === 0) {
              that.setData({
                resumeHtml: res.resumeHtml,
                resumeStatusText: "已生成（AI优化）",
                enhancing: false,
              });
              wx.showToast({ title: "优化完成", icon: "success" });
            } else {
              that.setData({ enhancing: false });
              wx.showToast({ title: res.msg || "优化失败", icon: "none" });
            }
          })
          .catch(function (err) {
            wx.hideLoading();
            that.setData({ enhancing: false });
            console.error("AI enhance error:", err);
            wx.showToast({ title: "优化失败，请确保云函数超时已设为60秒", icon: "none" });
          });
      },
    });
  },

  goRegister: function () {
    wx.switchTab({ url: "/pages/register/register" });
  },

  goBack: function () {
    wx.navigateBack();
  },
});
