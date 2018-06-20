//地图配置
var mapConfig = {
  CRS: "EPSG:4326",                                                                  //坐标系编号
  center: [117.720206185544, 37.50149439627927],                                     //中心点坐标
  controls: [], //['FullScreen','Rotate','Zoom'],                                    //
  initialZoom: 9,                                                                    //初始缩放级别
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
    zIndex: 1,                                                                       //图层叠加顺序
    url: "http://hzz.bzwater.gov.cn:8090/iserver/services/map-bz/wms111/bzmap",      //wms服务地址,用于地图显示
    subLayers: "city@bzdata,cnty@bzdata,cnty@bzdata#1,cnty@bzdata#2"                 //子图层名
  }]
};

//数据配置
var dataConfig = {
  proxyUrl: "../proxy?targetURL=",                                                   //跨域代理
  serviceList: [{
    name: "bzdata",                                                                  //服务名
    type: "wfs",                                                                     //服务类型
    version: "1.0.0",                                                                //服务版本
    outputFormat: "GML2",                                                            //返回数据类型
    url: "http://hzz.bzwater.gov.cn:8090/iserver/services/data-bz/wfs100?"           //服务地址
  }]
};

//弹窗配置
var popupConfig = [{
  name: "popup0",
  template: "<div id=\"popup-title\" class=\"popup-title\"></div><div id=\"popup-content\" class=\"popup-content\"></div><a href=\"#\" id=\"popup-closer\" class=\"popup-closer\"></a>"
}, {
  name: "popup1",
  template: "<div id=\"popup-content\" class=\"popup-content\"></div>"
}];