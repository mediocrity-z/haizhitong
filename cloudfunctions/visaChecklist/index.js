const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 从 env.json 加载配置（本地部署），失败时回退到 process.env（云控制台配置）
var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }
var DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || "";
var DEEPSEEK_API_URL = env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

exports.main = async (event) => {
  const { country } = event;

  if (!country || !country.trim()) {
    return { code: -1, msg: "请输入国家名称" };
  }

  const keyword = country.trim();

  try {
    // 先查缓存（visa_cache 集合可能不存在，加 try 兜底）
    try {
      const cacheRes = await db
        .collection("visa_cache")
        .where({ country: keyword })
        .get();

      if (cacheRes.data.length > 0) {
        const cached = cacheRes.data[0];
        if (cached.expireAt > Date.now()) {
          return {
            code: 0,
            result: cached.result,
            fromCache: true,
            cacheTime: cached.createTime,
          };
        }
        // 过期则删除
        await db.collection("visa_cache").doc(cached._id).remove();
      }
    } catch (cacheErr) {
      // 集合不存在等异常，忽略缓存直接调 AI
      console.warn("缓存查询失败，跳过:", cacheErr.message);
    }

    // 调 AI
    const prompt = `请列出中国公民前往「${keyword}」办理签证所需的材料清单。

请按以下格式输出（使用 markdown）：
## 必需材料
列出所有必须提交的材料，每项用数字加'.'开头

要求：
- 材料清单尽量简短但尽可能完整
- 结尾提醒以官方最新公告为准`;

    const result = await callDeepSeek(prompt);

    if (!result) {
      return { code: -1, msg: "查询失败，请稍后重试" };
    }

    // 写入缓存
    const now = Date.now();
    try {
      await db.collection("visa_cache").add({
        data: {
          country: keyword,
          result,
          createTime: now,
          expireAt: now + CACHE_TTL,
        },
      });
    } catch (cacheErr) {
      console.warn("缓存写入失败:", cacheErr.message);
    }

    return {
      code: 0,
      result,
      fromCache: false,
      cacheTime: now,
    };
  } catch (err) {
    console.error("visaChecklist error:", err);
    return { code: -1, msg: "查询失败: " + err.message };
  }
};

async function callDeepSeek(prompt) {
  const https = require("https");

  const postData = JSON.stringify({
    model: "deepseek-v4-pro",
    messages: [
      { role: "system", content: "你是一个专业的签证咨询助手" },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    stream: false,
  });

  const { hostname, pathname } = new URL(DEEPSEEK_API_URL);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 30000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (!data.choices || !data.choices.length) {
              reject(new Error("Invalid response: " + body));
              return;
            }
            resolve(data.choices[0].message.content);
          } catch (e) {
            reject(e);
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
