//地图配置
var mapConfig = {
  CRS: "EPSG:4326",                                                                  //坐标系编号
  center: [91.01255, 40.651136],                                                     //中心点坐标
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
    subLayers: "GIS_XJ.GEO_PROV,GIS_XJ.GEO_CITY"                                      //子图层名
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