const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 从 env.json 加载配置（本地部署），失败时回退到 process.env（云控制台配置）
var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }
var DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || "";
var DEEPSEEK_API_URL = env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

// ========== 内置简历模板 ==========
function buildResumeHTML(data) {
  var p = data.personalInfo || {};
  var name = p.name || "";
  var gender = p.gender === "male" ? "男" : "女";
  var age = p.age || "";
  var phone = p.phone || "";
  var email = p.email || "";
  var country = data.desiredCountry || "";
  var position = data.desiredPosition || "";
  var skills = (data.skills && data.skills.length) ? data.skills.join(" / ") : "";
  var remark = data.remark || "";

  var workHtml = "";
  if (data.workExps && data.workExps.length) {
    for (var i = 0; i < data.workExps.length; i++) {
      var w = data.workExps[i];
      if (!w.company && !w.position) continue;
      var dutiesHtml = formatDutiesText(w.enhancedDuties || w.duties || "");
      workHtml +=
        '<div class="work-item">' +
        '<div class="work-header">' +
        '<span class="work-company">' + escapeHtml(w.company || "") + '</span>' +
        '<span class="work-position">' + escapeHtml(w.position || "") + '</span>' +
        '<span class="work-period">' + escapeHtml(w.period || "") + '</span>' +
        '</div>' +
        '<div class="work-duties">' + dutiesHtml + '</div>' +
        '</div>';
    }
  } else {
    workHtml = '<div class="empty-item">暂无工作经历</div>';
  }

  var eduHtml = "";
  if (data.educations && data.educations.length) {
    for (var j = 0; j < data.educations.length; j++) {
      var e = data.educations[j];
      if (!e.school) continue;
      eduHtml +=
        '<div class="edu-item">' +
        '<span class="edu-school">' + escapeHtml(e.school || "") + '</span>' +
        '<span class="edu-major">' + escapeHtml(e.major || "") + " / " + escapeHtml(e.degree || "") + '</span>' +
        '<span class="edu-period">' + escapeHtml(e.period || "") + '</span>' +
        '</div>';
    }
  } else {
    eduHtml = '<div class="empty-item">暂无教育经历</div>';
  }

  return '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<title>个人简历 - ' + escapeHtml(name) + '</title>\n' +
'<style>\n' +
'  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'  body { font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }\n' +
'  .resume { max-width: 800px; margin: 0 auto; background: #fff; }\n' +
'  .header { background: linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%); color: #fff; padding: 36px 40px 28px; text-align: center; }\n' +
'  .header .name { font-size: 32px; font-weight: 700; letter-spacing: 4px; margin-bottom: 12px; }\n' +
'  .header .contact { font-size: 14px; opacity: 0.9; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 24px; }\n' +
'  .header .contact span { white-space: nowrap; }\n' +
'  .content { padding: 28px 40px 36px; }\n' +
'  .section { margin-bottom: 24px; }\n' +
'  .section-title { font-size: 18px; font-weight: 700; color: #1a3a5c; border-left: 4px solid #2d6a9f; padding-left: 12px; margin-bottom: 14px; line-height: 1.3; }\n' +
'  .objective-box { background: #f0f4f8; border-radius: 8px; padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 12px 32px; }\n' +
'  .objective-item { display: flex; align-items: center; gap: 6px; font-size: 15px; }\n' +
'  .objective-item .label { color: #888; }\n' +
'  .objective-item .value { color: #1a3a5c; font-weight: 600; }\n' +
'  .skills-wrap { display: flex; flex-wrap: wrap; gap: 10px; }\n' +
'  .skill-tag { background: #e8f0fe; color: #1a3a5c; padding: 5px 14px; border-radius: 20px; font-size: 14px; }\n' +
'  .work-item { border-bottom: 1px dashed #e0e0e0; padding: 14px 0; }\n' +
'  .work-item:last-child { border-bottom: none; }\n' +
'  .work-header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 16px; margin-bottom: 8px; }\n' +
'  .work-company { font-size: 16px; font-weight: 700; color: #1a3a5c; }\n' +
'  .work-position { font-size: 14px; color: #555; }\n' +
'  .work-period { font-size: 13px; color: #999; margin-left: auto; }\n' +
'  .work-duties { font-size: 14px; color: #555; line-height: 1.8; padding-left: 4px; }\n' +
'  .edu-item { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 16px; padding: 10px 0; border-bottom: 1px dashed #e0e0e0; }\n' +
'  .edu-item:last-child { border-bottom: none; }\n' +
'  .edu-school { font-size: 16px; font-weight: 700; color: #1a3a5c; }\n' +
'  .edu-major { font-size: 14px; color: #555; }\n' +
'  .edu-period { font-size: 13px; color: #999; margin-left: auto; }\n' +
'  .remark-box { background: #fafafa; border-left: 3px solid #ddd; padding: 14px 18px; border-radius: 4px; font-size: 14px; color: #555; line-height: 1.8; white-space: pre-wrap; }\n' +
'  .empty-item { color: #bbb; font-size: 14px; padding: 10px 0; }\n' +
'  @media print { body { background: #fff; } .resume { max-width: 100%; box-shadow: none; } }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="resume">\n' +
'  <div class="header">\n' +
'    <div class="name">' + escapeHtml(name) + '</div>\n' +
'    <div class="contact">\n' +
'      <span>' + escapeHtml(gender) + ' / ' + escapeHtml(String(age)) + '岁</span>\n' +
'      <span>' + escapeHtml(phone) + '</span>\n' +
'      <span>' + escapeHtml(email) + '</span>\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="content">\n' +
'    <div class="section">\n' +
'      <div class="section-title">求职意向</div>\n' +
'      <div class="objective-box">\n' +
'        <div class="objective-item"><span class="label">目标国家</span><span class="value">' + escapeHtml(country) + '</span></div>\n' +
'        <div class="objective-item"><span class="label">期望职位</span><span class="value">' + escapeHtml(position) + '</span></div>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="section">\n' +
'      <div class="section-title">技能特长</div>\n' +
'      <div class="skills-wrap">\n' +
'        ' + (skills ? skills.split(" / ").map(function(s) { return '<span class="skill-tag">' + escapeHtml(s) + '</span>'; }).join("\n        ") : '<span class="empty-item">暂无技能信息</span>') + '\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="section">\n' +
'      <div class="section-title">工作经历</div>\n' +
'      ' + workHtml + '\n' +
'    </div>\n' +
'    <div class="section">\n' +
'      <div class="section-title">教育背景</div>\n' +
'      ' + eduHtml + '\n' +
'    </div>\n' +
'    ' + (remark ? '<div class="section"><div class="section-title">补充信息</div><div class="remark-box">' + escapeHtml(remark) + '</div></div>' : "") + '\n' +
'  </div>\n' +
'</div>\n' +
'</body>\n' +
'</html>';
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDutiesText(text) {
  if (!text) return "";
  return text
    .split("\n")
    .filter(function (line) { return line.trim(); })
    .map(function (line) { return "<p>" + escapeHtml(line.trim()) + "</p>"; })
    .join("");
}

// ========== AI 工作经历优化 ==========
async function enhanceWorkExperience(workExps, desiredPosition, desiredCountry) {
  if (!workExps || !workExps.length) return null;

  var validExps = workExps.filter(function (e) { return e.company || e.position; });
  if (!validExps.length) return null;

  var expList = validExps.map(function (e, i) {
    return (i + 1) + ". 公司：" + (e.company || "未知") +
      "，职位：" + (e.position || "未知") +
      "，时间：" + (e.period || "未知") +
      "，职责：" + (e.duties || "无");
  }).join("\n");

  var prompt =
    "你是专业的简历优化师。请对以下工作经历的职责描述进行专业化扩展和美化，" +
    "使其更贴近目标岗位的要求。保留公司名、职位、时间不变，只优化职责描述。\n\n" +
    "目标职位：" + (desiredPosition || "未指定") + "\n" +
    "目标国家：" + (desiredCountry || "未指定") + "\n\n" +
    "原始工作经历：\n" + expList + "\n\n" +
    "要求：\n" +
    "1. 将每条经历的职责扩展为3-5个要点，用bullet符号（•）开头\n" +
    "2. 使用专业的简历语言，突出与目标职位相关的技能和成果\n" +
    "3. 使用量化数据增强说服力\n" +
    "4. 不要编造公司名或职位名\n\n" +
    "返回纯JSON（不要markdown标记）：\n" +
    '{"experiences":[{"index":0,"duties":"• ...\\n• ..."},{"index":1,"duties":"..."}]}';

  var raw = await callDeepSeek([
    { role: "system", content: "你是专业的简历优化师。只返回JSON，不要任何解释或markdown标记。" },
    { role: "user", content: prompt },
  ], 2000, 0.5);

  if (!raw) return null;

  var json = extractJSON(raw);
  if (!json || !json.experiences || !json.experiences.length) return null;

  return json.experiences;
}

function extractJSON(text) {
  try { return JSON.parse(text); } catch (e) { /* continue */ }
  var m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch (e) { /* continue */ }
  }
  return null;
}

// ========== 主函数 ==========
exports.main = async (event) => {
  var wxContext = cloud.getWXContext();
  var _openid = event._openid || wxContext.OPENID;
  if (!_openid) return { code: -1, msg: "缺少用户标识" };

  try {
    var reg;
    // 支持按 ID 精确查找（用于历史记录），否则查最新一条
    if (event.registrationId) {
      var docRes = await db.collection("registrations").doc(event.registrationId).get();
      if (!docRes.data) return { code: -1, msg: "未找到该简历记录" };
      reg = docRes.data;
    } else {
      var listRes = await db.collection("registrations").where({ _openid }).orderBy("updateTime", "desc").limit(1).get();
      if (!listRes.data.length) return { code: -1, msg: "未找到个人信息" };
      reg = listRes.data[0];
    }
    var workExps = reg.workExperience || [];

    // 只有显式传入 enhance: true 才调用 AI 优化
    if (event.enhance === true) {
      var enhanced = await enhanceWorkExperience(
        workExps,
        reg.desiredPosition || "",
        reg.desiredCountry || ""
      );
      if (enhanced) {
        // 将 AI 优化后的职责合并到原数据
        for (var i = 0; i < enhanced.length; i++) {
          var item = enhanced[i];
          if (item.index < workExps.length) {
            workExps[item.index] = Object.assign({}, workExps[item.index], {
              enhancedDuties: item.duties || "",
            });
          }
        }
      }
    }

    var resumeHtml = buildResumeHTML({
      personalInfo: reg.personalInfo || {},
      workExps: workExps,
      educations: reg.education || [],
      skills: reg.skills || [],
      desiredCountry: reg.desiredCountry || "",
      desiredPosition: reg.desiredPosition || "",
      remark: reg.remark || "",
    });

    await db.collection("registrations").doc(reg._id).update({
      data: {
        resumeHtml: resumeHtml,
        status: "completed",
        updateTime: db.serverDate(),
      },
    });

    return { code: 0, resumeHtml: resumeHtml };
  } catch (err) {
    console.error("generateResume error:", err);
    return { code: -1, msg: "简历生成失败" };
  }
};

// ========== HTTP 调用 ==========
function callDeepSeek(messages, maxTokens, temperature) {
  var https = require("https");
  var postData = JSON.stringify({
    model: "deepseek-v4-pro",
    messages: messages,
    temperature: temperature || 0.3,
    max_tokens: maxTokens || 800,
    stream: false,
  });

  var u = new URL(DEEPSEEK_API_URL);

  return new Promise(function (resolve, reject) {
    var req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + DEEPSEEK_API_KEY,
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 45000,
    }, function (res) {
      var body = "";
      res.on("data", function (c) { body += c; });
      res.on("end", function () {
        if (res.statusCode !== 200) {
          reject(new Error("HTTP " + res.statusCode));
          return;
        }
        try {
          var d = JSON.parse(body);
          if (d.choices && d.choices.length) {
            resolve(d.choices[0].message.content);
          } else if (d.error) {
            reject(new Error(d.error.message || "API error"));
          } else {
            resolve("");
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", function () { req.destroy(); reject(new Error("Timeout")); });
    req.write(postData);
    req.end();
  });
}
