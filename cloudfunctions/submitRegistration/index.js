const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    desiredPosition,
    desiredCountry,
    remark,
  } = event;

  if (!personalInfo || !personalInfo.name || !personalInfo.phone || !personalInfo.email) {
    return { code: -1, msg: "请填写姓名、电话和邮箱" };
  }

  if (!/^1[3-9]\d{9}$/.test(personalInfo.phone)) {
    return { code: -1, msg: "手机号格式不正确" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
    return { code: -1, msg: "邮箱格式不正确" };
  }

  try {
    // 每次提交都新增一条记录，支持历史查看
    const addRes = await db.collection("registrations").add({
      data: {
        _openid: wxContext.OPENID,
        personalInfo,
        workExperience: workExperience || [],
        education: education || [],
        skills: skills || [],
        desiredPosition: desiredPosition || "",
        desiredCountry: desiredCountry || "",
        remark: remark || "",
        resumeHtml: "",
        resumeUrl: "",
        status: "pending",
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
      },
    });

    return { code: 0, msg: "信息保存成功", _id: addRes._id };
  } catch (err) {
    console.error("submitRegistration error:", err);
    return { code: -1, msg: "提交失败" };
  }
};
