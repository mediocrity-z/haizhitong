const api = require("../../utils/api");

Page({
  data: {
    country: "",
    loading: false,
    result: "",
    resultTime: "",
    history: [],
    quickCountries: [
      "日本", "韩国", "美国", "澳大利亚",
      "加拿大", "英国", "新加坡", "德国",
      "法国", "新西兰", "泰国", "马来西亚",
    ],
  },

  onLoad() {
    const history = wx.getStorageSync("visaHistory") || [];
    this.setData({ history });
  },

  onCountryInput(e) {
    this.setData({ country: e.detail.value });
  },

  onQuickSearch(e) {
    const country = e.currentTarget.dataset.country;
    this.setData({ country });
    this.doSearch(country);
  },

  onHistoryTap(e) {
    const country = e.currentTarget.dataset.country;
    this.setData({ country });
    this.doSearch(country);
  },

  onSearch() {
    const country = this.data.country.trim();
    if (!country) return;
    this.doSearch(country);
  },

  async doSearch(country) {
    if (this.data.loading) return;

    this.setData({ loading: true, result: "" });

    try {
      const res = await api.visaChecklist(country);

      if (res.code == 0 && res.result) {
        const cacheLabel = res.fromCache ? "缓存数据" : "实时查询";

        // 解析 markdown 为简易 HTML
        const html = this.markdownToHtml(res.result);

        this.setData({
          result: html,
          resultTime: cacheLabel,
          loading: false,
        });

        this.saveHistory(country);
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: res.msg || "查询失败", icon: "none" });
      }
    } catch (err) {
      console.error("Visa search error:", err);
      this.setData({ loading: false });
      wx.showToast({ title: "网络错误，请重试", icon: "none" });
    }
  },

  // 简易 markdown 转 HTML
  markdownToHtml(text) {
    let html = text
      // 标题
      .replace(/### (.+)/g, '<h3 style="font-size:28rpx;color:#1a3a5c;margin:16rpx 0 8rpx;font-weight:600;">$1</h3>')
      .replace(/## (.+)/g, '<h2 style="font-size:30rpx;color:#1a3a5c;margin:20rpx 0 10rpx;font-weight:700;">$1</h2>')
      .replace(/# (.+)/g, '<h1 style="font-size:32rpx;color:#1a3a5c;margin:24rpx 0 12rpx;font-weight:700;">$1</h1>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 列表
      .replace(/^- (.+)/gm, '<li style="margin-left:16rpx;line-height:1.8;">$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li style="margin-left:16rpx;line-height:1.8;">$1. $2</li>')
      // 换行
      .replace(/\n\n/g, '<br/>')
      .replace(/\n/g, '<br/>');

    // 包裹列表
    html = html.replace(/(<li[^>]*>.*?<\/li>(?:<br\/>)?)+/g, (match) => {
      return '<ul style="list-style:none;padding:0;margin:8rpx 0;">' + match + '</ul>';
    });

    return html;
  },

  saveHistory(country) {
    let history = this.data.history.filter((h) => h != country);
    history.unshift(country);
    history = history.slice(0, 10);
    this.setData({ history });
    wx.setStorageSync("visaHistory", history);
  },
});
