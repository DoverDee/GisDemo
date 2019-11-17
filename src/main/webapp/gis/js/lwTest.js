var map;

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
  test();
}

function test(){
  $("#map_jtBtn").click(function(){
    lvwMapLib.switchTdtMap(map, "vec");
  });
  $("#map_dxBtn").click(function(){
    lvwMapLib.switchTdtMap(map, "ter");
  });
  $("#map_yxBtn").click(function(){
    lvwMapLib.switchTdtMap(map, "img");
  });
  $("#btn1").click(function(){
    lvwMapLib.setWMSSubLayers(map, "userLayer0", "city@bzdata");
  });
  $("#btn2").click(function(){
    lvwMapLib.zoomTo(map, 117.558, 37.489, 11);
  });
  $("#btn3").click(function(){
    addPoint();
  });
  $("#btn4").click(function(){
    addLine();
  });
  $("#btn4-1").click(function(){
    map.removeLayer(lvwMapLib.getLayersByName(map, "lineTest")[0]);
  });
  $("#btn5").click(function(){
    addGif();
  });
  $("#btn6").click(function(){
    addChart();
  });
  $("#btn7").click(function(){
    map.getOverlays().clear();
    lvwMapLib.getFeatures().clear();
  });
  $("#btn8").click(function(){
    addPolygon();
  });
  $("#btn9").click(function(){
    drawDoodleMap();
  });
  $("#btn9-1").click(function(){
    escDraw();
  });
  $("#btn9-2").click(function(){
    clearDrawingBoard();
  });
}

/*function zoomEventHandle(e){
  var view = e.target;
  console.log(view.getZoom());
  console.log(view.getCenter());
  console.log(view.getResolution());
}*/

/* 添加点 */
function addPoint(){
  var data = [{
    x: 117.858,
    y: 37.289,
    name: "测试点1"
  }, {
    x: 117.558,
    y: 37.689,
    name: "测试点2"
  }];
  //创建矢量图层
  var layer = lvwMapLib.createVectorLayer("pointTest");
  //var style=createIconStyle('image/position.png',1);
  //创建样式
  var style = lvwMapLib.createCircleStyle(8, "#ff0000", 2, "#ffff00");
  //给图层设置样式
  layer.setStyle(style);
  //设置图层叠加顺序
  layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
  //给图层添加事件
  lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", ptSelectedHandle, ptDeselectedHandle);
  lvwMapLib.addSelectEventListener(map, [layer], "click", function(features){
    //获取要素属性
    alert(features[0].get("name"));
  }, null);
  //创建要素 设置图层数据源
  for(var i in data){
    var f = new ol.Feature(lvwMapLib.createPoint(data[i].x, data[i].y));
    f.setProperties({
      name: data[i].name
    });
    layer.getSource().addFeature(f);
  }
  //把图层加入地图
  map.addLayer(layer);
}

//指针移动到上方
function ptSelectedHandle(features){
  if(!features){
    return;
  }
  var feature = features[0];
  if(!feature){
    return;
  }
  //获取要素属性
  var name = feature.get("name");
  if(!name){
    return;
  }
  //获取要素几何坐标
  var c = feature.getGeometry().getCoordinates();
  if(name === "测试点1"){
    //显示弹窗
    lvwMapLib.showPopup(popupConfig[0].template, map, name, name, 200, 200, c);
  }else{
    lvwMapLib.showPopup(popupConfig[1].template, map, "", name, 80, 35, c);
  }

}

//指针移动离开
function ptDeselectedHandle(){
  lvwMapLib.hidePopup();
}

/* 添加线 */
function addLine(){
  //var typeName='bzzdata:qysh_clip';
  //图层名
  var typeName = "bzzdata:river_Clip_SmoothLine";
  //var typeName='bzzdata:cnty_Clip';
  //构造查询过滤器--所有-即不过滤
  var filter = encodeURIComponent(lvwMapLib.queryAll());
  //查询wfs服务
  lvwMapLib.queryWFS("bzdata", typeName, filter, queryWFSHandleResult);
}

//解析wfs服务
function queryWFSHandleResult(result){
  //处理查询返回数据 解析得到要素集合
  var fs = lvwMapLib.processServiceData("bzdata", result);
  var layer = lvwMapLib.createVectorLayer("lineTest");
  //var style=createIconStyle('image/alarm.gif',1);
  var style = lvwMapLib.createLineStyle("#007CFF", 1);
  //var style=createPolygonStyle('#007CFF',2,'#FF0000');
  layer.setStyle(style);
  layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
  map.addLayer(layer);
  //给矢量图层添加要素
  lvwMapLib.addFeatures(layer, fs);
  //添加图层要素选择事件
  lvwMapLib.addSelectEventListener(map, [layer], "pointerMove", function(features){
    features.forEach(function(feature){
      //设置选中的要素样式
      feature.setStyle(lvwMapLib.createLineStyle("#f00", 4));
      //flashFeature(feature,3);
    });
  }, function(features){
    features.forEach(function(each){
      //未选中要素样式
      each.setStyle(lvwMapLib.createLineStyle("#007CFF", 1));
    });
  });
}

/* 添加GIS图标 */
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

/* 添加CHART */
function addChart(){
  var data = [{
    name: "滨州",
    x: 117.75875013403663,
    y: 37.189344042429276,
    data: [{
      name: "BZ-ONE",
      y: 40.0,
      color: "#5ab1ef"
    }, {
      name: "BZ-TWO",
      y: 60.0,
      color: "#d87a80"
    }]
  }, {
    name: "滨州BAK",
    x: 117.48166223705149,
    y: 37.51364475012927,
    data: [{
      name: "BAK-ON",
      y: 44.0,
      color: "#5ab1ef"
    }, {
      name: "BAK-OFF",
      y: 56.0,
      color: "#d87a80"
    }]
  }];
  for(var i = 0; i < data.length; i++){
    var d = data[i];
    var pt = [d.x, d.y];
    var pieId = "chart" + i;
    $("#overlay").append("<div id=\'" + pieId + "\'></div>");
    var element = document.getElementById(pieId);
    lvwMapLib.addOverlay(map, element, pt);
    addHighCharts(pieId, d, 100);
  }
}

/* 清除图层overlay或者feature ->尚未实现清除图层feature */

//渲染饼图
function addHighCharts(pieId, data, size){
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
    title: {
      text: ""
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

function addPolygon(){
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

var draw;
var modify;
var snap;

/* 在图层上画多边形图 */
function drawDoodleMap(){
  var layer = lvwMapLib.getLayersByName(map, "DrawingBoard")[0];
  if(layer === undefined || !layer){
    layer = lvwMapLib.createVectorLayer("DrawingBoard");
    layer.setStyle(lvwMapLib.createLineStyle("#f00", 4));
    // layer.setStyle(createIconStyle('image/position.png',1));
    // layer.setStyle(createCircleStyle(8,'#ff0000',2,'#ffff00'));
    layer.setZIndex(lvwMapLib.getLayersCount(map) + 1);
    map.addLayer(layer);
  }
  var source = layer.getSource();
  //map.removeInteraction()
  if(!modify){
    modify = new ol.interaction.Modify({
      source: source
    });
    map.addInteraction(modify);
  }else{
    map.addInteraction(modify);
  }
  if(!draw){
    draw = new ol.interaction.Draw({
      source: source,
      type: "Polygon" //"Point" "LineString" "Polygon" "Circle"
    });
    map.addInteraction(draw);
  }else{
    map.addInteraction(draw);
  }
  if(!snap){
    snap = new ol.interaction.Snap({
      source: source
    });
    map.addInteraction(snap);
  }else{
    map.addInteraction(snap);
  }
}

function escDraw(){
  if(draw){
    map.removeInteraction(draw);
  }
  if(modify){
    map.removeInteraction(modify);
  }
  if(snap){
    map.removeInteraction(snap);
  }
}

function clearDrawingBoard(){
  map.removeLayer(lvwMapLib.getLayersByName(map, "DrawingBoard")[0]);
  escDraw();
}