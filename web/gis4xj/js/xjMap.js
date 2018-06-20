//定义全局Map
var map;

//地图初始化方法
function init(mapDiv){
  //初始化地图获取map对象
  map = lvwMapLib.initMap(mapDiv);
  //添加地图事件
  lvwMapLib.addMapEventListener(map, "click", function(){
    lvwMapLib.hidePopup();
  });
  //lvwMapLib.addMapEventListener(map,'pointerMove',moveEventHandle);
  //lvwMapLib.addMapEventListener(map,'zoomChange',zoomEventHandle);
  //控件添加事件
}

function initialLayers(){
  //清除Overlays
  map.getOverlays().clear();
  // 构建面对象图层
  var polygonLayer = lvwMapLib.getLayersByName(map, "polygonLayer")[0];
  if(!polygonLayer){
    polygonLayer = lvwMapLib.createVectorLayer("polygonLayer");
    polygonLayer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(polygonLayer);
  }else{
    polygonLayer.getSource().clear();
  }
  // 构建线对象图层
  var lineLayer = lvwMapLib.getLayersByName(map, "lineLayer")[0];
  if(!lineLayer){
    lineLayer = lvwMapLib.createVectorLayer("lineLayer");
    lineLayer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(lineLayer);
  }else{
    lineLayer.getSource().clear();
  }
  // 构建点对象图层
  var pointLayer = lvwMapLib.getLayersByName(map, "pointLayer")[0];
  if(!pointLayer){
    pointLayer = lvwMapLib.createVectorLayer("pointLayer");
    pointLayer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(pointLayer);
  }else{
    pointLayer.getSource().clear();
  }
}

// 添加点（要素过滤查询方式）
function addPointByGEOFeature(ctlPrefix, featureName, filter){
  /*获取要素 设置图层数据源*/
  lvwMapLib.queryWFS("xjData", featureName, filter, function(result){
    //处理查询返回数据 解析得到要素集合
    var fs = lvwMapLib.processServiceData("xjData", result);
    var layer = lvwMapLib.getLayersByName(map, "searchLayer")[0];
    if(!layer){
      layer = lvwMapLib.createVectorLayer("searchLayer");
    }else{
      layer.getSource().clear();
    }
    //创建样式
    var style = lvwMapLib.createIconStyle('gis/image/gisPump.png', 1);
    //给图层设置样式
    layer.setStyle(style);
    //设置图层叠加顺序
    layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(layer);
    //给矢量图层添加要素
    lvwMapLib.addFeatures(layer, fs);
    //给图层添加事件
    lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", ptSelectedHandle, ptDeselectedHandle);
    //lvwMapLib.addSelectEventListener(map, [layer], "click", ptClickHandle(features, ctlPrefix), null);
  });
}

// 添加点（要素创建方式）
function addPointByDB(ctlPrefix, data){
  //创建矢量图层
  var layer = lvwMapLib.getLayersByName(map, "pointLayer")[0];
  if(!layer){
    layer = lvwMapLib.createVectorLayer("pointLayer");
    layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(layer);
  }else{
    layer.getSource().clear();
  }
  //创建样式
  var style = lvwMapLib.createIconStyle("gis/image/" + ctlPrefix + ".png", 0.7);
  //添加样式
  layer.setStyle(style);
  //创建要素 设置图层数据源
  for(var i in data){
    if(data.hasOwnProperty(i)){
      var f = new ol.Feature(lvwMapLib.createPoint(data[i].SMX, data[i].SMY));
      f.setProperties({
        NAME: data[i].OBJ_NAME,
        CD: data[i].OBJ_CD
      });
      layer.getSource().addFeature(f);
    }
  }
  lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", ptSelectedHandle, ptDeselectedHandle);
  //给图层添加事件
  //lvwMapLib.addSelectEventListener(map, [layer], "click",pointClickHandle(f, ctlPrefix), null);
  //把图层加入地图
  // map.addLayer(layer);
}

// 鼠标移动到上方事件
function ptSelectedHandle(features){
  if(!features){
    return;
  }
  var feature = features[0];
  if(!feature){
    return;
  }
  var name = feature.get("NAME");
  if(!name){
    return;
  }
  var c = feature.getGeometry().getCoordinates();
  lvwMapLib.showPopup(map, name, "", 30, c);
}

// 鼠标移动离开事件
function ptDeselectedHandle(){
  lvwMapLib.hidePopup();
}

// 点对象被鼠标点击对象事件
function pointClickHandle(features){
  if(!features){
    return;
  }
  var feature = features[0];
  if(!feature){
    return;
  }
  var name = feature.get("NAME");
  var cd = feature.get("CD");
  //显示详细对话框
  showDialogForMap(ctlPrefix, cd);
}

// 添加静态OverLayer（带数字顺序）
function addOverlayWithOrder(ctlPrefix, data){
  //清除全部Overlay,lvwMapLib封装的有bug后期再看原因//TODO
  $(".ol-overlaycontainer-stopevent").empty();//根据源码清除
  var _index;
  for(var i in data){
    if(data.hasOwnProperty(i)){
      _index = parseInt(i) + 1;
      var oli = data[i];
      var eleId = "overlay_" + i;
      var overLayerHtml = "<div id=" + eleId + ">";
      overLayerHtml += "<img src=\"gis/image/point50.png\" />";
      overLayerHtml += "<span class=\"dialMsg\" onclick=\"showDialogForMap('" + ctlPrefix + "','" + oli.OBJ_CD + "')\" >" + _index + "</span>";
      overLayerHtml += "</div>";
      // $("#overlay").append("<div id=" + eleId + ">"+data[i].PUMP_NM+"</div>");
      $("#overlaySpecial").html(overLayerHtml);
      var c = [oli.SMX, oli.SMY];
      var ele = document.getElementById(eleId);
      // ele.onmouseover = function(e){
      //   alert(e.target.id);
      // };
      lvwMapLib.addSpecialOverlay(map, ele, c);
    }
  }
}

// 添加线
function addLine(name, ctlPrefix, cdtList){
  //构造查询过滤器ID=?
  var cdArray = new Array(10);
  for(var i in cdtList){
    if(cdtList.hasOwnProperty(i)){
      cdArray[i] = cdtList[i].OBJ_CD
    }
  }
  var filter = encodeURIComponent(lvwMapLib.createInFilter("ID", cdArray));
  //查询wfs服务
  lvwMapLib.queryWFS("xjData", name, filter, function queryLineWFSHandleResult(result){
    var features = lvwMapLib.processServiceData('xjData', result);
    //创建矢量图层
    var layer = lvwMapLib.getLayersByName(map, "lineLayer")[0];
    if(!layer){
      layer = lvwMapLib.createVectorLayer("lineLayer");
      layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
      map.addLayer(layer);
    }else{
      layer.getSource().clear();
    }
    //创建样式
    var style = lvwMapLib.createLineStyle('#41f411', 2);//007CFF
    //添加样式
    layer.setStyle(style);
    //给矢量图层添加要素
    lvwMapLib.addFeatures(layer, features);
    //添加图层要素选择事件
    lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", lineSelectedHandle, lineDeselectedHandle);
    lvwMapLib.addSelectEventListener(map, [layer], "click",
      function lineClickHandle(features){
        if(!features){
          return;
        }
        var feature = features[0];
        if(!feature){
          return;
        }
        var cd = feature.get("ID");
        //显示详细对话框
        showDialogForMap(ctlPrefix, cd);
      }, null);
  });
}

//鼠标移动到线上方事件
function lineSelectedHandle(features){
  if(!features){
    return;
  }
  features.forEach(function(feature){
    if(!feature){
      return;
    }
    var name = feature.getProperties().NAME;
    if(!name){
      return;
    }
    var geo = feature.getGeometry();
    var c = lvwMapLib.getGeoCenter(geo).getCoordinates()[1];
    lvwMapLib.showPopup(map, name, "", 30, c);
    feature.setStyle(lvwMapLib.createLineStyle('#FF0000', 4));
    //flashFeature(feature,3);
  });
}

//鼠标移动离开事件
function lineDeselectedHandle(features){
  features.forEach(function(each){
    lvwMapLib.hidePopup();
    //未选中要素样式
    each.setStyle(lvwMapLib.createLineStyle('#41f411', 2));
  });
}

//添加面
function addPolygon(name, ctlPrefix, cdtList){
  //构造查询过滤器ID=?
  var cdArray = new Array(10);
  for(var i in cdtList){
    if(cdtList.hasOwnProperty(i)){
      cdArray[i] = cdtList[i].OBJ_CD
    }
  }
  var filter = encodeURIComponent(lvwMapLib.createInFilter("ID", cdArray));
  //查询wfs服务
  lvwMapLib.queryWFS("xjData", name, filter, function(result){
    //处理查询返回数据 解析得到要素集合
    var features = lvwMapLib.processServiceData('xjData', result);
    //创建矢量图层
    var layer = lvwMapLib.getLayersByName(map, "polygonLayer")[0];
    if(!layer){
      layer = lvwMapLib.createVectorLayer("polygonLayer");
      layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
      map.addLayer(layer);
    }else{
      layer.getSource().clear();
    }
    //设置样式
    var style = lvwMapLib.createPolygonStyle('#007CFF', 2, '#EEEEEE');
    //设置图层透明度
    layer.setOpacity(0.5);
    //设置图层样式
    layer.setStyle(style);
    //给矢量图层添加要素
    lvwMapLib.addFeatures(layer, features);
    map.render();
    //添加图层要素选择事件
    lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", polygonSelectedHandle, polygonDeselectedHandle);
    lvwMapLib.addSelectEventListener(map, [layer], "click", function(features){
      if(!features){
        return;
      }
      features.forEach(function(feature){
        if(!feature){
          return;
        }
        var cd = feature.get("ID");
        //显示详细对话框
        showDialogForMap(ctlPrefix, cd);
      });
    }, null);
  });
}

//鼠标移动到面上方事件
function polygonSelectedHandle(features){
  if(!features){
    return;
  }
  features.forEach(function(feature){
    if(!feature){
      return;
    }
    var name = feature.getProperties().NAME;
    if(!name){
      return;
    }
    var geo = feature.getGeometry();
    var c = lvwMapLib.getGeoCenter(geo).getCoordinates();
    lvwMapLib.showPopup(map, name, "", 30, c);
    feature.setStyle(lvwMapLib.createPolygonStyle('#0000000', 1, '#ff00ff'));
    //alert(feature.get('value'));
    //flashFeature(feature,3);
  });
}

// 鼠标移动离开面上方事件
function polygonDeselectedHandle(features){
  features.forEach(function(each){
    lvwMapLib.hidePopup();
    each.setStyle(lvwMapLib.createPolygonStyle('#007CFF', 2, '#EEEEEE'));
  });
}

// 添加CHART
function addOverlayWithChart(ctlPrefix, cdtJson, staList, layerName){
  //查询wfs服务
  lvwMapLib.queryWFS("xjData", layerName, null, function(result){
    var features = lvwMapLib.processServiceData('xjData', result);
    var idCoor = {};
    features.forEach(function(feature){
      if(!feature){
        return;
      }
      var id = feature.getProperties().ID;
      if(!id){
        return;
      }
      var geo = feature.getGeometry();
      idCoor[id] = lvwMapLib.getGeoCenter(geo).getCoordinates();
    });

    var dataSetWithID = {};
    for(var i in idCoor){
      if(idCoor.hasOwnProperty(i)){
        var dataObj = {};
        dataObj.x = idCoor[i][0];
        dataObj.y = idCoor[i][1];
        dataSetWithID[i] = dataObj;
      }
    }
    switch(ctlPrefix){
      case "gisPump":
        switch(cdtJson.indexType){
          case "0":
            for(var j in staList){
              if(staList.hasOwnProperty(j)){
                dataSetWithID[staList[j].CD].name = staList[j].NM;
                var dtj = [{
                  name: "大（1）型",
                  y: staList[j].SO,
                  color: "#FF6666"
                }, {
                  name: "大（2）型",
                  y: staList[j].ST,
                  color: "#FF9900"
                }, {
                  name: "中型",
                  y: staList[j].SH,
                  color: "#99CC33"
                }, {
                  name: "小（1）型",
                  y: staList[j].SF,
                  color: "#33CC99"
                }, {
                  name: "小（2）型",
                  y: staList[j].SI,
                  color: "#FFFF00"
                }];
                dataSetWithID[staList[j].CD].data = dtj;
              }
            }
            break;
          case "1" :
            for(var k in staList){
              if(staList.hasOwnProperty(k)){
                dataSetWithID[staList[k].CD].name = staList[k].NM;
                var dtk = [{
                  name: "排水泵站",
                  y: staList[k].SO,
                  color: "#FF6666"
                }, {
                  name: "供水泵站",
                  y: staList[k].ST,
                  color: "#FF9900"
                }, {
                  name: "供排结合泵站",
                  y: staList[k].SH,
                  color: "#99CC33"
                }];
                dataSetWithID[staList[k].CD].data = dtk;
              }
            }
            break;
          case "2":
            for(var m in staList){
              if(staList.hasOwnProperty(m)){
                dataSetWithID[staList[m].CD].name = staList[m].NM;
                var dtm = [{
                  name: "在用良好",
                  y: staList[m].SO,
                  color: "#FF6666"
                }, {
                  name: "在用故障",
                  y: staList[m].ST,
                  color: "#FF9900"
                }, {
                  name: "停用",
                  y: staList[m].SH,
                  color: "#99CC33"
                }];
                dataSetWithID[staList[m].CD].data = dtm;
              }
            }
            break;
        }
        break;
      case "gisGateP":
        switch(cdtJson.indexType){
          case "0":
            break;
          case "1" :
            break;
          case "2":
            break;
        }
        break;
    }
    var data = [];
    var dataName = [];
    for(var cd in dataSetWithID){
      if(dataSetWithID.hasOwnProperty(cd)){
        data.push(dataSetWithID[cd]);
        dataName.push(cd);
      }
    }
    for(var p = 0; p < data.length; p++){
      var d = data[p];
      var pt = [d.x, d.y];
      var pieId = "chart" + p;
      $("#overlay").append("<div id=\'" + pieId + "\'></div>");
      var element = document.getElementById(pieId);
      lvwMapLib.addOverlay(map, element, pt);
      addHighCharts(pieId, d, 130, d.name);
    }
  });
}

// 渲染饼图
function addHighCharts(pieId, data, size, title){
  $("#" + pieId).highcharts({
    chart: {
      backgroundColor: "rgba(255, 255, 255, 0)",
      plotBorderColor: null,
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: null,
      plotShadow: false,
      width: size,
      height: size
    },
    tooltip: {
      pointFormat: "<b>{point.percentage:.1f}%</b>"
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    title: {
      text: title,
      margin: -10
    },
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: false
        }
      }
    },
    series: [{
      type: "pie",
      name: data.name,
      data: data.data
    }]
  });
}

// 添加GIS图标
function addGif(){
  var data = [{
    x: 117.558,
    y: 37.489
  }, {
    x: 117.758,
    y: 37.889
  }];
  //var features = getLayersByName(map,'test')[0].getSource().getFeatures();
  for(var i in data){
    var f = data[i];
    var eleId = "gif_overlay_" + i;
    $("#overlay").append("<img id=\"" + eleId + "\" src=\"image/alarm.gif\" />");
    var c = [f.x, f.y];
    var ele = document.getElementById(eleId);
    ele.onmouseover = function(e){
      alert(e.target.id);
    };
    //在地图上添加overlay
    lvwMapLib.addOverlay(map, ele, c);
  }
}

// 添加多边形
function addMultiPolygon(){
  var layer = lvwMapLib.createVectorLayer("gonTest");
  //var style=lvwMapLib.createPolygonStyle('#007CFF',2,'#FF0000');
  //layer.setStyle(style);
  layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
  //设置图层透明度
  layer.setOpacity(0.5);
  map.addLayer(layer);
  lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", function(features){
    features.forEach(function(feature){
      //alert(feature);
      // feature.setStyle(lvwMapLib.createPolygonStyle('#f00',4));
      // alert(feature.get('value'));
      // lvwMapLib.flashFeature(feature,3);
    });
  }, function(features){
    features.forEach(function(each){
      //each.setStyle(createPolygonStyle('#007CFF',1));
    });
  });
  var data = [{
    id: "371602",
    value: 1
  }, {
    id: "371621",
    value: 2
  }, {
    id: "371622",
    value: 3
  }, {
    id: "371623",
    value: 4
  }, {
    id: "371624",
    value: 4
  }, {
    id: "371625",
    value: "NO"
  }, {
    id: "371626",
    value: "OK"
  }];
  //创建不同样式
  var style1 = lvwMapLib.createPolygonStyle("#0000000", 1, "#ff0000");
  var style2 = lvwMapLib.createPolygonStyle("#0000000", 1, "#00ff00");
  var style3 = lvwMapLib.createPolygonStyle("#0000000", 1, "#0000ff");
  var style4 = lvwMapLib.createPolygonStyle("#0000000", 1, "#ff00ff");

  var typeName = "bzzdata:cnty_Clip";
  var filter = encodeURIComponent(lvwMapLib.queryAll());
  lvwMapLib.queryWFS("bzdata", typeName, filter, function(result){
    var fs = lvwMapLib.processServiceData("bzdata", result);
    //给要素关联属性数据
    for(var i in fs){
      var f = fs[i];
      for(var n in data){
        if(f.get("ID").substring(0, 6) === data[n].id){
          //设置要素属性值
          f.set("value", data[n].value);
          if(f.get("value") === 1){
            f.setStyle(style1);
          }
          if(f.get("value") === 2){
            f.setStyle(style2);
          }
          if(f.get("value") === 3){
            f.setStyle(style3);
          }
          if(f.get("value") === 4){
            f.setStyle(style4);
          }
          //未匹配到的将使默认样式
          break;
        }
      }
    }
    lvwMapLib.addFeatures(layer, fs);
    map.render();
  });
}

// 计算字符串长度(英文占1个字符，中文汉字占2个字符)
function stringLen(str){
  var len = 0;
  for(var i = 0; i < str.length; i++){
    if(str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94){
      len += 2;
    }else{
      len++;
    }
  }
  return len;
}



