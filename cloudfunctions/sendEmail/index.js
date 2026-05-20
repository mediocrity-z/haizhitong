const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 从 env.json 加载配置
var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }

exports.main = async (event) => {
  const { type, applicantName, phone, passportType, _openid } = event;

  try {
    // 获取活跃的中介公司
    const agencyRes = await db
      .collection("agencies")
      .where({ isActive: true })
      .get();

    if (!agencyRes.data.length) {
      console.warn("没有活跃的中介公司，跳过邮件发送");
      return { code: 0, msg: "无活跃中介，跳过发送" };
    }

    const agencies = agencyRes.data;

    let subject, content;
    if (type == "new_registration") {
      subject = `【狮城助手】新报名通知 - ${applicantName}`;
      content = `
        <h2>新报名通知</h2>
        <p><strong>姓名：</strong>${applicantName}</p>
        <p><strong>电话：</strong>${phone}</p>
        <p><strong>准证类型：</strong>${passportType}</p>
        <p><strong>报名时间：</strong>${new Date().toLocaleString("zh-CN")}</p>
        <br/>
        <p>请登录狮城助手管理后台查看详情并处理。</p>
        <p>管理后台入口：小程序 → 管理中心</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">此邮件由狮城助手系统自动发送，请勿回复。</p>
      `;
    }

    // 发送邮件给每个活跃中介
    const sendResults = [];
    for (const agency of agencies) {
      try {
        // 方案1：使用云调用发送邮件（需开通腾讯云邮件推送）
        // const result = await cloud.openapi.cloudbase.sendMail({
        //   to: agency.email,
        //   subject,
        //   html: content
        // });

        // 方案2：使用第三方 SMTP（如 sendcloud/阿里云邮件推送等）
        const result = await sendViaSMTP(agency.email, subject, content);

        sendResults.push({ email: agency.email, success: true });
      } catch (err) {
        console.error(`发送给 ${agency.email} 失败:`, err);
        sendResults.push({
          email: agency.email,
          success: false,
          error: err.message,
        });
      }
    }

    // 记录发送日志
    await db.collection("email_logs").add({
      data: {
        type,
        applicantId: _openid,
        recipients: agencies.map((a) => a.email),
        results: sendResults,
        createTime: db.serverDate(),
      },
    });

    return {
      code: 0,
      msg: "邮件发送完成",
      results: sendResults,
    };
  } catch (err) {
    console.error("sendEmail error:", err);
    return { code: -1, msg: "邮件发送失败: " + err.message };
  }
};

// SMTP 发送邮件
async function sendViaSMTP(to, subject, html) {
  // 使用 nodemailer 或直接 HTTP 请求第三方邮件 API
  // 示例：使用 SendCloud API
  const https = require("https");

  const postData = JSON.stringify({
    apiUser: env.SENDCLOUD_API_USER || "",
    apiKey: env.SENDCLOUD_API_KEY || "",
    from: env.SENDCLOUD_FROM || "",
    fromName: env.SENDCLOUD_FROM_NAME || "狮城助手",
    to,
    subject,
    html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.sendcloud.net",
        path: "/apiv2/mail/send",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        timeout: 15000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("SMTP timeout"));
    });
    req.write(postData);
    req.end();
  });
}
