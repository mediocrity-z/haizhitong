// 云函数调用封装
const api = {
  call(name, data = {}, opts = {}) {
    var timeout = opts.timeout || 60000;
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (!done) {
          done = true;
          reject(new Error("请求超时，请检查网络后重试"));
        }
      }, timeout);

      wx.cloud
        .callFunction({ name, data })
        .then(function (res) {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(res.result);
          }
        })
        .catch(function (err) {
          if (!done) {
            done = true;
            clearTimeout(timer);
            reject(err);
          }
        });
    });
  },

  // AI 对话
  aiChat(messages) {
    return this.call("aiChat", { messages });
  },

  // 提交简历信息
  submitResumeInfo(formData) {
    return this.call("submitRegistration", formData);
  },

  // 生成简历（默认不调AI，秒出）
  generateResume() {
    return this.call("generateResume", {});
  },

  // AI 优化工作经历（会调AI，较慢，需云函数超时60s）
  enhanceResume() {
    return this.call("generateResume", { enhance: true }, { timeout: 65000 });
  },

  // 签证清单查询
  visaChecklist(country) {
    return this.call("visaChecklist", { country });
  },

  // 登录
  login() {
    return this.call("login", {});
  },
};

module.exports = api;
