const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }
var ADMIN_PASSWORD = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";

exports.main = async (event) => {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;
  var { adminPassword, nickName, avatarUrl } = event || {};

  try {
    var userRes = await db.collection("users").where({ _openid: openid }).get();
    var isNew = userRes.data.length === 0;
    var role = "user";

    // 管理员密码验证
    if (adminPassword && ADMIN_PASSWORD && adminPassword === ADMIN_PASSWORD) {
      role = "admin";
    }

    if (isNew) {
      // 新用户创建
      await db.collection("users").add({
        data: {
          _openid: openid,
          role: role,
          nickName: nickName || "",
          avatarUrl: avatarUrl || "",
          queryCount: 0,
          lastQueryDate: "",
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
        },
      });
      cloud.callFunction({ name: "seedVisaCache" }).catch(function () {});
      return {
        code: 0,
        data: { openid: openid, nickName: nickName || "", avatarUrl: avatarUrl || "", role: role, queryCount: 0, lastQueryDate: "", isNew: true },
      };
    }

    // 老用户：更新 profile + 必要时提权
    var user = userRes.data[0];
    var updateData = { updateTime: db.serverDate() };
    if (nickName) updateData.nickName = nickName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (role === "admin" && user.role !== "admin") updateData.role = "admin";

    await db.collection("users").where({ _openid: openid }).update({ data: updateData });

    cloud.callFunction({ name: "seedVisaCache" }).catch(function () {});

    return {
      code: 0,
      data: {
        openid: openid,
        nickName: nickName || user.nickName || "",
        avatarUrl: avatarUrl || user.avatarUrl || "",
        role: updateData.role || user.role || "user",
        queryCount: user.queryCount || 0,
        lastQueryDate: user.lastQueryDate || "",
        isNew: false,
      },
    };
  } catch (err) {
    console.error("login error:", err);
    return { code: -1, msg: "登录失败" };
  }
};
