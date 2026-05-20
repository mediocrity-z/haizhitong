var CATEGORIES = [
  {
    id: "housing",
    name: "租房住房",
    icon: "🏠",
    articles: [
      {
        id: "h1",
        title: "海外租房全攻略",
        summary: "从找房到签约的完整指南",
        content: [
          { t: "h", v: "找房渠道" },
          { t: "p", v: "常用平台：Zillow（美国）、Rightmove（英国）、PropertyGuru（新加坡）、SUUMO（日本）。也可关注当地华人社区和Facebook群组。" },
          { t: "tip", v: "建议先住酒店3-7天，实地看房后再签约" },
          { t: "h", v: "签约检查清单" },
          { t: "li", v: "确认房东身份和房产证明" },
          { t: "li", v: "仔细阅读租约条款（租期、押金、维修）" },
          { t: "li", v: "拍照记录房屋现状，避免退租纠纷" },
          { t: "li", v: "了解周边治安和交通" },
          { t: "h", v: "押金与租金" },
          { t: "p", v: "大部分国家押金为1-2个月租金。部分国家（如英国）要求押金存入第三方托管。" },
        ],
      },
      {
        id: "h2",
        title: "各国租房成本对比",
        summary: "主要城市一居室月租金参考",
        content: [
          { t: "p", v: "以下为各城市一居室月租金参考（人民币）：" },
          { t: "li", v: "新加坡：市中心约1.2-1.8万，郊区约0.7-1万" },
          { t: "li", v: "日本东京：0.6-1万；大阪：0.4-0.6万" },
          { t: "li", v: "澳大利亚悉尼：0.8-1.4万" },
          { t: "li", v: "加拿大多伦多：0.7-1.2万" },
          { t: "li", v: "德国柏林：0.5-0.9万" },
          { t: "tip", v: "建议月租金不超过月收入30%" },
        ],
      },
    ],
  },
  {
    id: "medical",
    name: "医疗健康",
    icon: "🏥",
    articles: [
      {
        id: "m1",
        title: "海外就医指南",
        summary: "各国医疗体系和就医流程",
        content: [
          { t: "h", v: "各国医疗体系" },
          { t: "li", v: "英国NHS：基本医疗免费，等待时间较长" },
          { t: "li", v: "德国/日本：强制医保，自付10%-30%" },
          { t: "li", v: "美国：必须商业医保，费用高昂" },
          { t: "li", v: "新加坡：MediSave/MediShield模式" },
          { t: "h", v: "看病流程" },
          { t: "p", v: "预约GP/家庭医生→诊断→如需专科转诊。非紧急不去急诊。" },
          { t: "tip", v: "出国前备好常用药（感冒药、肠胃药），保留英文说明书" },
        ],
      },
      {
        id: "m2",
        title: "医疗保险怎么选",
        summary: "海外医疗保险购买指南",
        content: [
          { t: "h", v: "选择要点" },
          { t: "li", v: "确认是否满足签证最低保额要求" },
          { t: "li", v: "门诊和住院是否都覆盖" },
          { t: "li", v: "既往病史是否承保" },
          { t: "li", v: "免赔额和报销比例" },
          { t: "tip", v: "推荐保险公司：Cigna Global、Allianz、Bupa Global" },
        ],
      },
    ],
  },
  {
    id: "banking",
    name: "银行金融",
    icon: "🏦",
    articles: [
      {
        id: "b1",
        title: "海外银行开户指南",
        summary: "开户所需材料及推荐银行",
        content: [
          { t: "h", v: "开户所需材料" },
          { t: "li", v: "护照原件 + 有效签证/居留许可" },
          { t: "li", v: "住址证明（租房合同/水电账单）" },
          { t: "li", v: "工作合同或雇主证明信" },
          { t: "li", v: "税号（美国SSN、英国NI Number等）" },
          { t: "h", v: "推荐银行" },
          { t: "p", v: "新加坡：DBS/OCBC/UOB | 日本：MUFG/SMBC | 澳洲：Commonwealth/ANZ | 美国：Chase/BOA" },
          { t: "tip", v: "实体银行+数字银行（Revolut/Wise）搭配使用" },
        ],
      },
      {
        id: "b2",
        title: "国际汇款省钱攻略",
        summary: "最低手续费汇钱回国",
        content: [
          { t: "p", v: "选对工具可以省下可观的手续费：" },
          { t: "li", v: "Wise：汇率中间价，手续费透明，大额推荐" },
          { t: "li", v: "熊猫速汇：专注华人，支持微信/支付宝收款" },
          { t: "li", v: "银行电汇：安全但费用高" },
          { t: "tip", v: "避免银行柜台换汇汇款，汇率差+手续费可达3%-5%" },
        ],
      },
    ],
  },
  {
    id: "transport",
    name: "交通出行",
    icon: "🚇",
    articles: [
      {
        id: "t1",
        title: "海外驾照与买车",
        summary: "中国驾照换领及购车流程",
        content: [
          { t: "h", v: "驾照换领" },
          { t: "p", v: "大部分国家允许中国驾照+翻译公证件短期驾驶（3-12个月）。长期需换当地驾照。" },
          { t: "li", v: "新加坡：通过BTT理论考试可转换" },
          { t: "li", v: "日本：需笔试+路考" },
          { t: "li", v: "澳大利亚：各州规定不同" },
          { t: "h", v: "购车注意" },
          { t: "li", v: "新加坡：拥车证(COE)费用极高" },
          { t: "li", v: "日本：需停车位证明书" },
          { t: "li", v: "美国/加拿大：二手车市场成熟" },
        ],
      },
      {
        id: "t2",
        title: "公共交通使用指南",
        summary: "各国公交系统速通",
        content: [
          { t: "li", v: "新加坡：EZ-Link卡或SimplyGo" },
          { t: "li", v: "日本：Suica/Pasmo卡全国通用" },
          { t: "li", v: "英国：Oyster Card（伦敦）" },
          { t: "li", v: "澳大利亚：Opal Card（悉尼）/ Myki（墨尔本）" },
          { t: "tip", v: "下载Google Maps或Citymapper实时查询路线" },
        ],
      },
    ],
  },
  {
    id: "education",
    name: "教育留学",
    icon: "🎓",
    articles: [
      {
        id: "e1",
        title: "子女海外入学指南",
        summary: "带孩子出国后如何办理入学",
        content: [
          { t: "h", v: "公立vs国际学校" },
          { t: "p", v: "公立免费但以当地语言授课。国际学校英语授课但学费高昂（每年10-30万）。" },
          { t: "h", v: "入学流程" },
          { t: "li", v: "准备：护照、出生证明、疫苗记录、成绩单（需翻译公证）" },
          { t: "li", v: "联系教育局了解学区划分" },
          { t: "li", v: "提交申请并等待学位" },
          { t: "li", v: "参加入学评估（语言/学业测试）" },
          { t: "tip", v: "提前3-6个月准备，优质学校学位紧张" },
        ],
      },
    ],
  },
  {
    id: "tax",
    name: "税务法律",
    icon: "⚖️",
    articles: [
      {
        id: "tx1",
        title: "海外工作税务基础",
        summary: "各国个人所得税概览",
        content: [
          { t: "h", v: "各国个税" },
          { t: "li", v: "新加坡：0%-22%，无资本利得税" },
          { t: "li", v: "日本：5%-45% + 10%住民税" },
          { t: "li", v: "澳大利亚：19%-45%，7-10月报税" },
          { t: "li", v: "美国：联邦10%-37% + 州税，4月15日前申报" },
          { t: "h", v: "避免双重征税" },
          { t: "p", v: "中国与大部分国家有避免双重征税协定(DTA)，已缴税款可抵扣。" },
          { t: "tip", v: "建议请当地会计师处理税务，避免高额罚款" },
        ],
      },
    ],
  },
  {
    id: "culture",
    name: "文化习俗",
    icon: "🌍",
    articles: [
      {
        id: "c1",
        title: "各国文化禁忌与礼仪",
        summary: "了解当地习惯，避免无意冒犯",
        content: [
          { t: "h", v: "新加坡" },
          { t: "li", v: "禁止携带口香糖入境" },
          { t: "li", v: "公共交通上禁止饮食" },
          { t: "h", v: "日本" },
          { t: "li", v: "进屋必须脱鞋" },
          { t: "li", v: "公共场合不要大声说话" },
          { t: "li", v: "给小费被视为不礼貌" },
          { t: "h", v: "中东国家" },
          { t: "li", v: "斋月期间白天不要在公共场合饮食" },
          { t: "li", v: "穿着保守，女性遮盖肩膀膝盖" },
        ],
      },
      {
        id: "c2",
        title: "海外工作沟通技巧",
        summary: "跨文化职场沟通要点",
        content: [
          { t: "h", v: "西方职场" },
          { t: "li", v: "直接表达观点，不拐弯抹角" },
          { t: "li", v: "定期1-on-1是常态" },
          { t: "li", v: "重视工作生活平衡" },
          { t: "h", v: "亚洲职场" },
          { t: "li", v: "日本：等级分明，决策流程长" },
          { t: "li", v: "韩国：敬语体系复杂" },
          { t: "li", v: "新加坡：中英混合，效率优先" },
          { t: "tip", v: "观察当地同事的沟通方式是最佳策略" },
        ],
      },
    ],
  },
];

Page({
  data: {
    categories: CATEGORIES,
    currentCategory: null,
    currentArticle: null,
  },

  onLoad: function () { },

  onSelectCategory: function (e) {
    var id = e.currentTarget.dataset.id;
    var cat = null;
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id == id) {
        cat = CATEGORIES[i];
        break;
      }
    }
    if (cat) {
      this.setData({ currentCategory: cat, currentArticle: null });
    }
  },

  onSelectArticle: function (e) {
    var idx = e.currentTarget.dataset.index;
    var article = this.data.currentCategory.articles[idx];
    if (article) {
      this.setData({ currentArticle: article });
    }
  },

  onBack: function () {
    this.setData({ currentCategory: null, currentArticle: null });
  },

  onBackToArticles: function () {
    this.setData({ currentArticle: null });
  },
});
