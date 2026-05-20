const api = require("../../utils/api");
const { AI_SYSTEM_PROMPT } = require("../../utils/constants");

// 修改欢迎消息文案，避免敏感词
const WELCOME_MSG = {
  role: "assistant",
  content:
    "您好！我是狮城助手的新加坡职位咨询 AI 助手 🌏\n\n无论您是想了解不同签证类型、各行业薪资水平，还是想寻找合适的岗位，我都可以帮您解答。\n\n请问有什么可以帮到您的？",
};

Page({
  data: {
    messages: [WELCOME_MSG],
    inputText: "",
    isTyping: false,
    scrollToView: "",
    chatSessionId: null,
  },

  onLoad() {
    this.loadChatHistory();
  },

  // 加载历史聊天记录
  loadChatHistory() {
    const history = wx.getStorageSync("chatHistory");
    if (history && history.length) {
      this.setData({ messages: [WELCOME_MSG, ...history] });
    }
  },

  // 保存聊天记录
  saveChatHistory() {
    const msgs = this.data.messages.filter((m) => m.role != "system");
    wx.setStorageSync("chatHistory", msgs.slice(-50));
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  // 发送消息
  async sendMessage() {
    const text = this.data.inputText.trim();
    if (!text || this.data.isTyping) return;

    const userMsg = { role: "user", content: text, time: Date.now() };
    const messages = [...this.data.messages, userMsg];

    this.setData({
      messages,
      inputText: "",
      isTyping: true,
    });

    this.scrollToBottom(messages.length);

    try {
      // 构建请求消息（最近20条 + 系统提示）
      const recentMsgs = messages.slice(-20);
      const apiMessages = [
        { role: "system", content: AI_SYSTEM_PROMPT },
        ...recentMsgs.map((m) => ({ role: m.role, content: m.content })),
      ];

      const result = await api.aiChat(apiMessages);

      if (result && result.limitReached) {
        const aiMsg = {
          role: "assistant",
          content: result.reply,
          time: Date.now(),
        };
        this.setData({
          messages: [...this.data.messages, aiMsg],
          isTyping: false,
        });
        this.scrollToBottom(this.data.messages.length);
      } else if (result && result.reply) {
        const aiMsg = {
          role: "assistant", // 改成 assistant 避免 DeepSeek 接口报错
          content: result.reply,
          time: Date.now(),
        };
        const newMessages = [...this.data.messages, aiMsg];
        this.setData({ messages: newMessages, isTyping: false });
        this.scrollToBottom(newMessages.length);

        // 检测意图：如果用户有提交信息意向，弹出引导卡片
        if (result.showGuide) {
          setTimeout(() => {
            const guideMsg = {
              role: "system",
              type: "register-guide",
              time: Date.now(),
            };
            const msgs = this.data.messages;
            this.setData({
              messages: [...msgs, guideMsg],
            });
            this.scrollToBottom(this.data.messages.length);
          }, 1500);
        }
      } else {
        this.handleAIError();
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      this.handleAIError();
    }

    this.saveChatHistory();
  },

  handleAIError() {
    const errMsg = {
      role: "assistant",
      content:
        "抱歉，我暂时无法回复您的消息。请稍后再试或使用其他方式进行咨询。",
      time: Date.now(),
    };
    this.setData({
      messages: [...this.data.messages, errMsg],
      isTyping: false,
    });
  },

  scrollToBottom(len) {
    this.setData({ scrollToView: `msg-${len - 1}` });
  },

  // 跳转提交信息页
  goRegister() {
    wx.switchTab({ url: "/pages/register/register" });
  },

  // 继续咨询
  continueChat() {
    const aiMsg = {
      role: "assistant",
      content: '好的，您随时可以问我关于新加坡职位的任何问题。如果想提交信息以获取岗位推荐，请点击下方“提交信息”即可。',
      time: Date.now(),
    };
    this.setData({ messages: [...this.data.messages, aiMsg] });
    this.scrollToBottom(this.data.messages.length);
  },
});
