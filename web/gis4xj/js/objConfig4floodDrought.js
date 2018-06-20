/*
新疆应用支撑平台统一地图项目图层对象配置文件，说明如下：
（1）对象的公共配置放在第一层，即若超过3个以上的对象都用到的相同配置放在第一层，如compareArray。
（2）对象单独作为第一层，其key约定为后台路径解析器前缀。
（3）对象中的key按照目前的约定进行定义，即每个对象都保持一致。
*/
var objConfig = {
  compareArray: {0: "大于", 1: "不大于", 2: "等于", 3: "小于", 4: "不小于"},
  gisPump: {
    mapListQuota: ["装机流量", "m<sup>3</sup>/s"],
    queryListName: "泵站工程名称",
    queryListType: {
      nm: "泵站工程类型",
      kv: {1: "排水泵站", 2: "供水泵站", 3: "供排结合泵站"}
    },
    queryListQuota: "装机流量",
    statistics: {0: "工程规模", 1: "泵站类型", 2: "运行状况"}
  },
  gisCws: {
    mapListQuota: ["设计供水日规模", "m<sup>3</sup>"],
    queryListName: "农村供水工程名称",
    queryListType: {
      nm: "农村供水工程类型",
      kv: {1: "集中式Ⅰ型", 2: "集中式Ⅱ型", 3: "集中式Ⅲ型", 4: "集中式Ⅳ型", 5: "集中式Ⅴ型", 6: "分散式"}
    },
    queryListQuota: "设计供水日规模",
    statistics: {0: "工程类型", 1: "收费形式", 2: "运行状况"}
  },
  gisCh: {
    mapListQuota: ["渠道设计流量", "m<sup>3</sup>/s"],
    queryListName: "渠道工程名称",
    queryListType: {
      nm: "渠道工程级别",
      kv: {1: "总干渠", 2: "干渠", 3: "支渠", 4: "斗渠", 9: "其他（或不明确）"}
    },
    queryListQuota: "渠道设计流量",
    statistics: {0: "渠道级别", 1: "运行状况"}
  },
  gisHypo: {
    mapListQuota: ["装机容量", "kW"],
    queryListName: "水电站工程名称",
    queryListType: {
      nm: "水电站工程类型",
      kv: {1: "闸坝式水电站", 2: "引水式水电站", 3: "混合式水电站", 4: "抽水蓄能式水电站", 5: "潮汐电站"}
    },
    queryListQuota: "装机容量",
    statistics: {0: "水电站类型", 1: "多年平均发电量", 2: "运行状况"}
  },
  gisDitr: {
    mapListQuota: ["输水干线总长", "km"],
    queryListName: "引（调）水工程名称",
    queryListType: {
      nm: "引调水方式",
      kv: {1: "提水式", 2: "自流式"}
    },
    queryListQuota: "输水干线总长",
    statistics: {0: "引调水方式", 1: "建设状况", 2: "运行状况"}
  },
  gisGateP: {
    mapListQuota: ["设计过闸流量", "m<sup>3</sup>/s"],
    queryListName: "水闸工程名称",
    queryListType: {
      nm: "水闸工程规模",
      kv: {1: "大（1）型", 2: "大（2）型", 3: "中型", 4: "小（1）型", 5: "小（2）型"}
    },
    queryListQuota: "设计过闸流量",
    statistics: {0: "工程规模", 1: "闸孔数量", 2: "运行状况"}
  },
  gisRiver: {
    mapListQuota: ["河流长度", "km"],
    queryListName: "河流名称",
    queryListType: {
      nm: "河流等级",
      kv: {0: "干流河流", 1: "一级河流", 2: "二级河流", 3: "三级河流", 4: "四级河流", 5: "五级河流", 6: "六级河流", 9: "平原区、区间河流"}
    },
    queryListQuota: "河流长度",
    statistics: {0: "河流等级", 1: "是否为内流河"}
  },
  gisLake: {
    mapListQuota: ["水面面积", "km<sup>2</sup>"],
    queryListName: "湖泊名称",
    queryListType: {
      nm: "咸淡水属性",
      kv: {1: "淡水（含盐度<1g/L）", 2: "咸水（1g/L≤含盐度<35g/L）", 3: "盐水（含盐度≥35g/L）"}
    },
    queryListQuota: "水面面积",
    statistics: {0: "咸淡水属性", 1: "湖泊容积"}
  },
  gisBast1st: {
    mapListQuota: ["流域面积", "km<sup>2</sup>"],
    queryListName: "流域名称",
    queryListType: {
      nm: "流域等级",
      kv: {1: "一级流域", 2: "二级流域", 3: "三级流域", 4: "四级流域", 5: "五级流域", 6: "六级流域", 7: "七级流域"}
    },
    queryListQuota: "流域面积",
    statistics: {0: "流域等级", 1: "基面类型"}
  },
  gisIrr: {
    mapListQuota: ["设计灌溉面积", "万亩"],
    queryListName: "灌区名称",
    queryListType: {
      nm: "灌区类型",
      kv: {1: "水库灌区", 2: "引水灌区", 3: "提水灌区", 4: "井灌区", 5: "混合灌区"}
    },
    queryListQuota: "设计灌溉面积",
    statistics: {0: "灌区类型", 1: "灌区规模", 2: "运行状况"}
  },
  gisDike: {
    mapListQuota: "",
    queryListName: "",
    queryListType: {
      nm: "?堤防==河道断面?",
      kv: []
    },
    queryListQuota: ""
  },
  gisPdo: {
    mapListQuota: ["设计日排污能力", "t"],
    queryListName: "入河排污口名称",
    queryListType: {
      nm: "入河排污口性质",
      kv: {1: "企业", 2: "市政", 9: "其他"}
    },
    queryListQuota: "设计日排污能力",
    statistics: {0: "排污口性质", 1: "排放方式", 2: "入河方式", 3: "运行状况"}
  },
  gisWint: {
    mapListQuota: ["设计流量", "m<sup>3</sup>/s"],
    queryListName: "地表水取水口名称",
    queryListType: {
      nm: "取水方式",
      kv: {1: "蓄水", 2: "引水", 3: "提水", 9: "其他"}
    },
    queryListQuota: "设计流量",
    statistics: {0: "取水方式", 1: "运行状况"}
  }
};