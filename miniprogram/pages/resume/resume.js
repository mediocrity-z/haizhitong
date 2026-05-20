var api = require("../../utils/api");
var db = wx.cloud.database();

Page({
  data: {
    hasRegistration: false,
    registration: null,
    resumeHtml: "",
    resumeStatusText: "",
    enhancing: false,
  },

  onShow: function () {
    this.loadRegistration();
  },

  loadRegistration: function () {
    var that = this;

    var app = getApp();
    if (app.globalData.latestResume) {
      var r = app.globalData.latestResume;
      that.setData({
        hasRegistration: true,
        resumeHtml: r.resumeHtml || "",
        resumeStatusText: "已生成",
      });
      delete app.globalData.latestResume;
    }

    db.collection("registrations")
      .orderBy("updateTime", "desc")
      .limit(1)
      .get()
      .then(function (res) {
        if (res.data.length > 0) {
          var reg = res.data[0];
          var html = that.data.resumeHtml || reg.resumeHtml || "";
          that.setData({
            hasRegistration: true,
            registration: reg,
            resumeHtml: html,
            resumeStatusText: reg.status === "completed" || html ? "已生成" : "待生成",
          });
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  downloadResume: function () {
    var html = this.data.resumeHtml;
    if (!html) {
      wx.showToast({ title: "暂无简历", icon: "none" });
      return;
    }

    // 如果已经是完整 HTML 文档则直接使用，否则包裹
    var full = html;
    if (html.indexOf("<!DOCTYPE") === -1 && html.indexOf("<html") === -1) {
      full = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body>" + html + "</body></html>";
    }

    var fs = wx.getFileSystemManager();
    var path = wx.env.USER_DATA_PATH + "/resume.html";
    var that = this;
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
            // openDocument 可能不支持 html，分享文件
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
    wx.showModal({
      title: "重新生成简历",
      content: "将清除当前简历并跳转到填写页面",
      success: function (modalRes) {
        if (!modalRes.confirm) return;
        wx.showLoading({ title: "清除中..." });
        db.collection("registrations")
          .orderBy("updateTime", "desc")
          .limit(1)
          .get()
          .then(function (dbRes) {
            if (dbRes.data.length > 0) {
              return db.collection("registrations").doc(dbRes.data[0]._id).remove();
            }
          })
          .then(function () {
            wx.hideLoading();
            wx.switchTab({ url: "/pages/register/register" });
          })
          .catch(function (err) {
            wx.hideLoading();
            console.error(err);
          });
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

        api.enhanceResume()
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
});
