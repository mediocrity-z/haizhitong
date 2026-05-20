const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 从 env.json 加载配置（本地部署），失败时回退到 process.env（云控制台配置）
var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }
var DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || "";
var DEEPSEEK_API_URL = env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

const MAX_DAILY_QUERIES = 5;

// 意图关键词检测
const RESUME_KEYWORDS = [
  "简历", "生成简历", "做简历", "写简历", "简历",
  "我想去", "我要去", "找工作", "帮我找",
  "出国工作", "想去", "怎么办理", "需要什么条件",
  "我能去吗", "可以吗", "有兴趣", "感兴趣", "试试",
];

function detectResumeIntent(userMsg) {
  const text = userMsg.toLowerCase();
  return RESUME_KEYWORDS.some((kw) => text.includes(kw));
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { messages } = event;

  const formattedMessages = messages
    .filter((msg) => msg.content)
    .map((msg) => ({
      role: msg.role == "ai" || msg.role == "assistant" ? "assistant" : msg.role,
      content: msg.content,
    }));
  const lastUserMsg = messages.filter((m) => m.role == "user").pop();

  try {
    // 每日次数限制检查
    const userRes = await db.collection("users").where({ _openid: openid }).get();
    const today = new Date().toDateString();

    if (userRes.data.length > 0) {
      const user = userRes.data[0];
      const lastDate = user.lastQueryDate || "";

      if (lastDate == today && (user.queryCount || 0) >= MAX_DAILY_QUERIES) {
        return {
          code: -1,
          reply: "您今日的免费咨询次数已用完（每日" + MAX_DAILY_QUERIES + "次），请明天再来。如需生成简历，请切换到「AI简历」页面。",
          showGuide: false,
          limitReached: true,
        };
      }
    }

    const response = await httpCall(
      DEEPSEEK_API_KEY,
      DEEPSEEK_API_URL,
      formattedMessages,
    );

    if (!response.choices || !response.choices.length) {
      console.error("DeepSeek invalid response:", response);
      return {
        code: -1,
        reply: "AI服务返回异常",
        showGuide: false,
      };
    }

    const reply = response.choices[0].message.content;
    const showGuide = lastUserMsg && detectResumeIntent(lastUserMsg.content);

    // 更新或创建用户记录 + 增加查询次数
    if (userRes.data.length > 0) {
      const user = userRes.data[0];
      const lastDate = user.lastQueryDate || "";
      const newCount = lastDate == today ? (user.queryCount || 0) + 1 : 1;
      await db.collection("users").where({ _openid: openid }).update({
        data: {
          queryCount: newCount,
          lastQueryDate: today,
          updateTime: db.serverDate(),
        },
      });
    } else {
      await db.collection("users").add({
        data: {
          _openid: openid,
          role: "user",
          queryCount: 1,
          lastQueryDate: today,
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });
    }

    return {
      code: 0,
      reply,
      showGuide,
      usage: response.usage,
    };
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return {
      code: -1,
      reply: "抱歉，服务暂时不可用，请稍后再试。",
      showGuide: false,
    };
  }
};

// 使用 HTTP 模块调用
async function httpCall(apiKey, url, messages) {
  const https = require("https");

  const postData = JSON.stringify({
    model: "deepseek-v4-pro",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    stream: false,
  });

  const urlObj = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 30000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Parse error: ${body}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
    req.write(postData);
    req.end();
  });
}
