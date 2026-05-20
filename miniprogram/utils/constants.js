// 常量定义

// 性别
const GENDERS = [
  { label: "男", value: "male" },
  { label: "女", value: "female" },
];

// 学历
const EDUCATION_LEVELS = [
  { label: "小学", value: "primary" },
  { label: "初中", value: "junior" },
  { label: "高中", value: "senior" },
  { label: "中专/技校", value: "technical" },
  { label: "大专", value: "diploma" },
  { label: "本科", value: "bachelor" },
  { label: "硕士及以上", value: "master" },
];

// 常见海外求职目标国家
const TARGET_COUNTRIES = [
  "新加坡",
  "日本",
  "韩国",
  "澳大利亚",
  "新西兰",
  "加拿大",
  "美国",
  "英国",
  "德国",
  "法国",
  "阿联酋",
  "沙特阿拉伯",
  "马来西亚",
  "泰国",
  "其他",
];

// DeepSeek 系统提示词 - AI 咨询
const AI_SYSTEM_PROMPT = `你是狮城助手的海外求职 AI 顾问，为想去海外工作的中国求职者提供咨询服务。

你的职责：
1. 解答关于各国工作签证的疑问
2. 介绍不同国家的热门行业和薪资水平
3. 了解求职者的背景和意向
4. 引导用户使用 AI简历功能生成简历

规则：
- 保持热情专业，用中文交流
- 每次提问不要太多，逐步引导
- 当用户想生成简历时，引导他们切换到"AI简历"页面填写信息
- 提醒用户注意辨别正规中介，谨防诈骗`;

// 海外生活知识库分类
const KNOWLEDGE_CATEGORIES = [
  { id: "housing", name: "租房住房", icon: "🏠" },
  { id: "medical", name: "医疗健康", icon: "🏥" },
  { id: "banking", name: "银行金融", icon: "🏦" },
  { id: "transport", name: "交通出行", icon: "🚇" },
  { id: "education", name: "教育留学", icon: "🎓" },
  { id: "tax", name: "税务法律", icon: "⚖️" },
  { id: "culture", name: "文化习俗", icon: "🌍" },
];

module.exports = {
  GENDERS,
  EDUCATION_LEVELS,
  TARGET_COUNTRIES,
  AI_SYSTEM_PROMPT,
  KNOWLEDGE_CATEGORIES,
};
