const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 从 env.json 加载配置
var env = {};
try { env = require("./env.json"); } catch (e) { /* env.json 不存在时使用环境变量 */ }
var ADMIN_PASSWORD = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const { adminPassword } = event;

    if (!ADMIN_PASSWORD) {
      return { code: -1, msg: "管理员密码未配置" };
    }
    if (adminPassword) {
      if (adminPassword == ADMIN_PASSWORD) {
        await db
          .collection("users")
          .where({ _openid: openid })
          .update({
            data: { role: "admin", updateTime: db.serverDate() },
          });
      } else {
        return { code: -1, msg: "密码错误" };
      }
    }

    // 查询用户
    const res = await db.collection("users").where({ _openid: openid }).get();

    if (res.data.length == 0) {
      // 新用户，创建记录
      const role = adminPassword == ADMIN_PASSWORD ? "admin" : "user";
      await db.collection("users").add({
        data: {
          _openid: openid,
          role,
          createTime: db.serverDate(),
        },
      });
      // 异步预热签证缓存
      cloud.callFunction({ name: "seedVisaCache" }).catch(() => { });
      return {
        code: 0,
        data: { role, isNew: true },
      };
    }

    const role =
      adminPassword == ADMIN_PASSWORD ? "admin" : res.data[0].role || "user";

    // 异步预热签证缓存（不阻塞登录返回）
    cloud.callFunction({ name: "seedVisaCache" }).catch(() => { });

    return {
      code: 0,
      data: {
        role,
        isNew: false,
        createTime: res.data[0].createTime,
      },
    };
  } catch (err) {
    console.error("login error:", err);
    return { code: -1, msg: "登录失败" };
  }
};
