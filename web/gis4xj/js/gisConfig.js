//地图配置
var mapConfig = {
  CRS: "EPSG:4326",                                                                  //坐标系编号
  center: [91.01255, 40.651136],                                     //中心点坐标
  controls: [], //['FullScreen','Rotate','Zoom'],                                    //
  initialZoom: 6,                                                                    //初始缩放级别
  minZoom: 1,                                                                        //最小缩放级别
  maxZoom: 20,                                                                       //最大缩放级别
  baseLayers: [{
    name: "baseLayer0",
    type: "tdt", //天地图
    visible: true,
    zIndex: 0,
    url: "http://t0.tianditu.com/DataServer",
    subLayers: "vec_c" //矢量图 ：vec_c、cva_c  地形图： ter_c、 cta_c   影像图： img_c 、cia_c
  }, {
    name: "baseLayer1",
    type: "tdt", //天地图
    visible: true,
    zIndex: 2,
    url: "http://t0.tianditu.com/DataServer",
    subLayers: "cva_c"
  }],
  userLayers: [{
    name: "userLayer0",                                                              //图层名
    type: "wms",                                                                     //图层类型
    visible: true,                                                                   //是否可见
    opacity: 0.7,
    zIndex: 1,                                                                       //图层叠加顺序
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",      //wms服务地址,用于地图显示
    subLayers: "GIS_XJ.GEO_PROV,GIS_XJ.GEO_CITY"                                                              //子图层名
  }, {
    name: "GEO_IRR",                                                              //罐区图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 3,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_IRR"
  }, {
    name: "GEO_LAKE",                                                              //湖泊图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 4,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_LAKE"
  }, {
    name: "GEO_RSWB",                                                              //水库图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 5,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RSWB"
  }, {
    name: "GEO_BAST1ST",                                                           //流域st图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 6,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_BAST1ST"
  }, {
    name: "GEO_BAST2ND",                                                              //流域nd图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 7,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_BAST2ND"
  }, {
    name: "GEO_RIVER1",                                                              //一级河流图层
    type: "wms",
    visible: true,
    zIndex: 8,
    opacity: 0.5,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER1"
  }, {
    name: "GEO_RIVER2",                                                              //二级河流图层
    type: "wms",
    visible: true,
    zIndex: 9,
    opacity: 0.5,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER2"
  }, {
    name: "GEO_RIVER3",                                                              //三级河流图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 10,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER3"
  }, {
    name: "GEO_RIVER4",                                                              //四级河流图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 11,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER4"
  }, {
    name: "GEO_RIVER5",                                                              //五级河流图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 12,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER5"
  }, {
    name: "GEO_RIVER6",                                                              //六级河流图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 13,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_RIVER6"
  }, {
    name: "GEO_CH",                                                              //渠道图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 14,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_CH"
  }, {
    name: "GEO_DAM",                                                              //大坝图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 15,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_DAM"
  }, {
    name: "GEO_DIKE",                                                              //堤防图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 16,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_DIKE"
  }, {
    name: "GEO_DITR",                                                              //引调水图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 17,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_DITR"
  }, {
    name: "GEO_CWS",                                                              //农村供水图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 18,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_CWS"
  }, {
    name: "GEO_GATE_P",                                                              //水闸图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 19,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_GATE_P"
  }, {
    name: "GEO_PDO",                                                              //排污口图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 20,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_PDO"
  }, {
    name: "GEO_WINT",                                                              //地表取水口图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 21,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_WINT"
  }, {
    name: "GEO_PUMP",                                                              //泵站图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 22,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_PUMP"
  }, {
    name: "GEO_HYPO",                                                              //水电站图层
    type: "wms",
    visible: false,
    opacity: 1,
    zIndex: 23,
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WMSServer",
    subLayers: "GIS_XJ.GEO_HYPO"
  }]
};

//数据配置
var dataConfig = {
  proxyUrl: "proxy?targetURL=",                                                   //跨域代理
  serviceList: [{
    name: "xjData",                                                                  //服务名
    type: "wfs",                                                                     //服务类型
    version: "1.0.0",                                                                //服务版本
    outputFormat: "GML2",                                                            //返回数据类型
    url: "http://47.94.161.252:6080/arcgis/services/xjmap/MapServer/WFSServer?"           //服务地址
  }]
};