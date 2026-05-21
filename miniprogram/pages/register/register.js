const api = require("../../utils/api");
const {
  GENDERS,
  EDUCATION_LEVELS,
  TARGET_COUNTRIES,
} = require("../../utils/constants");

const EMPTY_WORK_EXP = { company: "", position: "", period: "", duties: "" };
const EMPTY_EDUCATION = { school: "", major: "", degree: "", period: "" };

Page({
  data: {
    currentStep: 1,
    genders: GENDERS,
    educationLevels: EDUCATION_LEVELS,
    targetCountries: TARGET_COUNTRIES,
    skillInput: "",
    submitting: false,

    form: {
      personalInfo: {
        name: "",
        gender: "male",
        age: "",
        phone: "",
        email: "",
      },
      workExperience: [{ ...EMPTY_WORK_EXP }],
      education: [{ ...EMPTY_EDUCATION }],
      skills: [],
      desiredCountry: "",
      desiredPosition: "",
      remark: "",
    },
  },

  // 通用字段修改
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    const val = e.detail.value;

    if (field.includes(".")) {
      const [section, key] = field.split(".");
      this.setData({ [`form.${section}.${key}`]: val });
    } else {
      this.setData({ [`form.${field}`]: val });
    }
  },

  // 数组内字段修改
  onArrayFieldChange(e) {
    const { array, index, field } = e.currentTarget.dataset;
    const val = e.detail.value;
    this.setData({ [`form.${array}[${index}].${field}`]: val });
  },

  // Radio 修改
  onRadioChange(e) {
    const field = e.currentTarget.dataset.field;
    const val = e.detail.value;
    const [section, key] = field.split(".");
    this.setData({ [`form.${section}.${key}`]: val });
  },

  // Picker 修改（学历）
  onPickerChange(e) {
    const { array, index, field } = e.currentTarget.dataset;
    const val = EDUCATION_LEVELS[e.detail.value].label;
    this.setData({ [`form.${array}[${index}].${field}`]: val });
  },

  // 目标国家选择
  onTargetCountryChange(e) {
    this.setData({ "form.desiredCountry": TARGET_COUNTRIES[e.detail.value] });
  },

  // 技能输入
  onSkillInputChange(e) {
    this.setData({ skillInput: e.detail.value });
  },

  addSkill() {
    const skill = this.data.skillInput.trim();
    if (!skill) return;
    if (this.data.form.skills.includes(skill)) {
      wx.showToast({ title: "技能已添加", icon: "none" });
      return;
    }
    if (this.data.form.skills.length >= 10) {
      wx.showToast({ title: "最多添加10项技能", icon: "none" });
      return;
    }
    this.setData({
      "form.skills": [...this.data.form.skills, skill],
      skillInput: "",
    });
  },

  removeSkill(e) {
    const idx = e.currentTarget.dataset.index;
    const skills = this.data.form.skills.filter((_, i) => i != idx);
    this.setData({ "form.skills": skills });
  },

  // 工作经历操作
  addWorkExp() {
    if (this.data.form.workExperience.length >= 5) {
      wx.showToast({ title: "最多添加5条工作经历", icon: "none" });
      return;
    }
    this.setData({
      "form.workExperience": [
        ...this.data.form.workExperience,
        { ...EMPTY_WORK_EXP },
      ],
    });
  },

  removeWorkExp(e) {
    const idx = e.currentTarget.dataset.index;
    if (this.data.form.workExperience.length <= 1) {
      wx.showToast({ title: "至少保留一条工作经历", icon: "none" });
      return;
    }
    const list = this.data.form.workExperience.filter((_, i) => i != idx);
    this.setData({ "form.workExperience": list });
  },

  // 教育经历操作
  addEducation() {
    if (this.data.form.education.length >= 5) {
      wx.showToast({ title: "最多添加5条教育经历", icon: "none" });
      return;
    }
    this.setData({
      "form.education": [...this.data.form.education, { ...EMPTY_EDUCATION }],
    });
  },

  removeEducation(e) {
    const idx = e.currentTarget.dataset.index;
    if (this.data.form.education.length <= 1) {
      wx.showToast({ title: "至少保留一条教育经历", icon: "none" });
      return;
    }
    const list = this.data.form.education.filter((_, i) => i != idx);
    this.setData({ "form.education": list });
  },

  // 步骤导航
  nextStep() {
    if (!this.validateStep(this.data.currentStep)) return;
    this.setData({ currentStep: this.data.currentStep + 1 });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  prevStep() {
    this.setData({ currentStep: this.data.currentStep - 1 });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },

  // 单步校验
  validateStep(step) {
    const { personalInfo } = this.data.form;
    switch (step) {
      case 1:
        if (!personalInfo.name.trim()) {
          wx.showToast({ title: "请输入姓名", icon: "none" });
          return false;
        }
        if (
          !personalInfo.phone ||
          !/^1[3-9]\d{9}$/.test(personalInfo.phone)
        ) {
          wx.showToast({ title: "请输入正确的手机号", icon: "none" });
          return false;
        }
        if (
          !personalInfo.email ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)
        ) {
          wx.showToast({ title: "请输入正确的邮箱", icon: "none" });
          return false;
        }
        if (
          !personalInfo.age ||
          personalInfo.age < 18 ||
          personalInfo.age > 65
        ) {
          wx.showToast({ title: "请输入有效年龄(18-65)", icon: "none" });
          return false;
        }
        return true;
      case 4:
        if (!this.data.form.desiredCountry) {
          wx.showToast({ title: "请选择目标国家", icon: "none" });
          return false;
        }
        if (!this.data.form.desiredPosition.trim()) {
          wx.showToast({ title: "请输入期望职位", icon: "none" });
          return false;
        }
        return true;
      default:
        return true;
    }
  },

  // 提交
  async submitForm() {
    if (!this.validateStep(4)) return;
    if (this.data.submitting) return;

    this.setData({ submitting: true });
    wx.showLoading({ title: "保存信息..." });

    try {
      const saveRes = await api.submitResumeInfo(this.data.form);
      if (saveRes.code !== 0) {
        wx.hideLoading();
        wx.showToast({ title: saveRes.msg || "保存失败", icon: "none" });
        this.setData({ submitting: false });
        return;
      }

      var registrationId = saveRes._id;

      wx.showLoading({ title: "生成简历中..." });
      const genRes = await api.generateResume(registrationId);

      wx.hideLoading();
      if (genRes.code == 0) {
        getApp().globalData.latestResume = {
          resumeHtml: genRes.resumeHtml,
          status: "completed",
        };
        wx.showToast({ title: "简历生成成功", icon: "success" });
        setTimeout(function () {
          wx.navigateTo({ url: "/pages/resume/resume?id=" + registrationId });
        }, 800);
      } else {
        wx.showToast({ title: genRes.msg || "生成失败，请在简历页重试", icon: "none" });
      }
    } catch (err) {
      wx.hideLoading();
      console.error("Submit error:", err);
      wx.showToast({ title: "网络错误，请稍后再试", icon: "none" });
    }

    this.setData({ submitting: false });
  },
});
