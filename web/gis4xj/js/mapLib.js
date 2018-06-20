var lvwMapLib = {
  //初始化地图
  initMap: function(mapDiv){
    var map = this.createMap(mapDiv);
    var baseLayers = mapConfig.baseLayers;
    var userLayers = mapConfig.userLayers;
    for(var i = 0; i < baseLayers.length; i++){
      var baseLayer = baseLayers[i];
      if(baseLayer.type === "tdt"){
        var subLayers = baseLayer.subLayers;
        var tdtLayer = this.createTdtLayer(baseLayer.url, subLayers, baseLayer.name + "_" + subLayers, baseLayer.visible);
        tdtLayer.setZIndex(baseLayer.zIndex);
        map.addLayer(tdtLayer);
      }
    }
    for(var i = 0; i < userLayers.length; i++){
      var userLayer = userLayers[i];
      if(userLayer.type === "wms"){
        var wmsLayer = this.createWmsLayer(userLayer.url, userLayer.subLayers, userLayer.name, userLayer.visible, userLayer.opacity);
        wmsLayer.setZIndex(userLayer.zIndex);
        map.addLayer(wmsLayer);
      }
    }
    map.getView().setCenter(mapConfig.center);
    map.getView().setZoom(mapConfig.initialZoom);
    //map.getView().fit(mapConfig.extent, map.getSize());
    return map;
  },
  //创建地图
  createMap: function(mapDiv){
    var controls = [];
    var arr = mapConfig.controls;
    for(var i in arr){
      if(arr[i] === "FullScreen"){
        controls.push(new ol.control.FullScreen());
      }
      if(arr[i] === "Rotate"){
        controls.push(new ol.control.Rotate());
      }
      if(arr[i] === "Zoom"){
        controls.push(new ol.control.Zoom());
      }
    }
    var map = new ol.Map({
      controls: controls,
      view: new ol.View({
        projection: mapConfig.CRS,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom
      }),
      target: mapDiv
    });
    return map;
  },
  //定位到点并设置分辨率
  zoomTo: function(map, point, zoomLevel){
    map.getView().setCenter(point);
    map.getView().setZoom(zoomLevel);
  },
  //获取center
  getGeoCenter: function(geo){
    var type = geo.getType();
    if(type === "MultiPolygon"){
      var ext = geo.getExtent();
      return this.createPoint((ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2);
    }
    if(type === "MultiLineString"){
      //var lc = geo.getCoordinates();
      var lc = geo.getCoordinates();
      if(lc.length === 1){
        var ptc = lc[0];
      }else{
        var ptc = lc[Math.round(lc.length / 2)];
      }
      return this.createPoint(ptc[0], ptc[1]);
    }
    if(type === "Polygon"){
      var ext = geo.getExtent();
      return this.createPoint((ext[0] + ext[2]) / 2, (ext[1] + ext[3]) / 2);
    }
    if(type === "LineString"){
      var lc = geo.coordinates;
      var ptc = c[Math.round(lc.length / 2)];
      return this.createPoint(ptc[0], ptc[1]);
    }
  },
  //定位到geo
  zoomToGeo: function(map, geo){
    map.getView().fit(geo, map.getSize());
  },
  //获取当前地图范围
  getMapExtent: function(map){
    return map.getView().calculateExtent(map.getSize());
  },
  //eventType可以是：click、pointerMove、zoomChange、centerChange
  addMapEventListener: function(map, eventType, eventHandle){
    if(eventType === "zoomChange"){
      map.getView().on("change:resolution", eventHandle);
    }else if(eventType === "centerChange"){
      map.getView().on("change:center", eventHandle);
    }else{
      map.on(eventType, function(evt){
        var pixel = map.getEventPixel(evt.originalEvent);
        var features = map.getFeaturesAtPixel(pixel);
        eventHandle(features);
        //var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {});
      });
    }
  },
  //显示提示框
  showPopup: function(map, content, width, height, coordinate){
    var popupEle = document.getElementById("popup");
    if(!popupEle){
      $("#overlay").append("<div id=\"popup\" class=\"popup\" style=\"display:none;\"><span id=\"popup-content\" class=\"popup-content\"></span></div>");
      popupEle = document.getElementById("popup");
    }
    var _intWidth = stringLen(content) * 7;
    popupEle.style.display = "block";
    popupEle.style.width = _intWidth + "px";
    popupEle.style.height = height + "px";

    var popupOverlay = map.getOverlayById("popup");
    if(!popupOverlay){
      popupOverlay = this.addOverlay(map, popupEle, coordinate);
    }
    popupOverlay.setPosition(coordinate);

    var contentEle = document.getElementById("popup-content");
    if(contentEle){
      contentEle.innerHTML = content;
    }
  },
  //隐藏弹窗
  hidePopup: function(){
    var overlay = map.getOverlayById("popup");
    if(overlay){
      overlay.setPosition(undefined);
    }
  },
  //添加鼠标HOVER事件覆盖物
  addOverlay: function(map, element, coordinate){
    var overlay = new ol.Overlay({
      id: element.id,
      //positioning: ol.OverlayPositioning.CENTER_CENTER,
      element: element,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      offset: [0, -25]
    });
    overlay.setPosition(coordinate);
    map.addOverlay(overlay);
    return overlay;
    //alert(element.id);
    //alert(map.getOverlays().getLength());
  },
  //添加明显提示覆盖物
  addSpecialOverlay: function(map, element, coordinate){
    var overlay = new ol.Overlay({
      id: element.id,
      //positioning: ol.OverlayPositioning.CENTER_CENTER,
      element: element,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      offset: [-16, -35]
    });
    overlay.setPosition(coordinate);
    map.addOverlay(overlay);
    return overlay;
    //alert(element.id);
    //alert(map.getOverlays().getLength());
  },
  //移除所有Overlay
  clearOverlays: function(map){
    var arr = map.getOverlays().getArray();
    for(var i in arr){
      var overlay = arr[i];
      if(overlay.getId() !== "popup"){
        map.removeOverlay(overlay);
      }
    }
    //map.getOverlays().clear();
  },
  //移除矢量图层所有feature
  clearFeatures: function(layer){
    layer.getSource().clear();
  },
  //创建点
  createPoint: function(x, y){
    var pt = new ol.geom.Point([x, y]);
    return pt;
  },
  //添加事件eventType可以是click、pointerMove
  addSelectEventListener: function(map, layers, eventType, selectedHandle, deselectedHandle){
    var select;
    var condition;
    if(eventType === "click"){
      condition = ol.events.condition.click;
    }
    if(eventType === "pointerMove"){
      condition = ol.events.condition.pointerMove;
    }
    select = new ol.interaction.Select({
      condition: condition,
      layers: layers
    });

    map.addInteraction(select);
    select.on("select", function(e){
      if(deselectedHandle){
        deselectedHandle(e.deselected);
      }
      selectedHandle(e.selected);
    });
  },
  //获取地图图层数
  getLayersCount: function(map){
    return map.getLayers().getLength();
  },
  //创建wms图层
  createWmsLayer: function(url, subLayers, layerName, visible, opacity){
    var layer = new ol.layer.Tile({
      name: layerName,
      visible: visible,
      opacity: opacity,
      source: new ol.source.TileWMS({
        url: url,
        params: {
          "layers": subLayers
        }
      })
    });
    return layer;
  },
  //更新图层为子图层
  setWMSSubLayers: function(map, layerName, subLayers){
    var layer = this.getLayersByName(map, layerName)[0];
    var source = layer.getSource();
    var params = {
      "layers": subLayers
    };
    source.updateParams(params);
    map.render();
  },
  //创建矢量图层
  createVectorLayer: function(layerName){
    var source = new ol.source.Vector();

    //source.addFeatures(features);
    var layer = new ol.layer.Vector({
      name: layerName,
      source: source
    });
    return layer;
  },
  //给矢量图层添加要素
  addFeatures: function(layer, features){
    layer.getSource().addFeatures(features);
  },
  //根据名字查图层
  getLayersByName: function(map, name){
    var layers = [];
    var layerCollection = map.getLayers();
    layerCollection.forEach(function(layer){
      var layerName = layer.get("name");
      if(layerName && name === layerName){
        layers.push(layer);
      }
    });
    return layers;
  },
  //图标点样式
  createIconStyle: function(imgURL, scale){
    var style = new ol.style.Style({
      image: new ol.style.Icon(({
        scale: scale, //图标缩放比例
        opacity: 1, //透明度
        src: imgURL //图标的url
      }))
    });
    return style;
  },
  //圆点样式
  createCircleStyle: function(radius, strokeColor, strokeWidth, fillColor){
    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: radius, //半径
        snapToPixel: false,
        stroke: new ol.style.Stroke({
          color: strokeColor, //边框颜色
          width: strokeWidth //边框宽
        }),
        fill: new ol.style.Fill({
          color: fillColor //填充颜色 '#007CFF'
        })
      })
    });
    return style;
  },
  //线样式
  createLineStyle: function(strokeColor, strokeWidth){
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: strokeColor, //线颜色
        width: strokeWidth //线宽
      })
    });
    return style;
  },
  //面样式
  createPolygonStyle: function(strokeColor, strokeWidth, fillColor){
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: strokeColor, //线颜色
        width: strokeWidth //线宽
      }),
      fill: new ol.style.Fill({
        color: fillColor //填充颜色 '#007CFF'
      })
    });
    return style;
  },
  //清理掉当前的背景图层
  clearBaseLayer: function(map){
    //获取背景图层 包含tms和wmts
    var layers = map.getLayers().getArray();
    if(layers === null || layers.length === 0) return;
    var rmLayers = new Array();
    for(var i = 0; i < layers.length; i++){
      var layer = layers[i];
      if(layer.get("name") !== undefined && layer.get("name").indexOf("baseLayer") !== -1){
        rmLayers.push(layer);
      }
    }
    for(var i in rmLayers){
      map.removeLayer(rmLayers[i]);
    }
  },
  //切换天地图
  switchTdtMap: function(map, type){
    var baseLayer = mapConfig.baseLayers[0];
    this.clearBaseLayer(map);
    switch(type){
      case "vec":
        var l1 = this.createTdtLayer(baseLayer.url, "vec_c", "baseLayer_tdt_ditu", true);
        var l2 = this.createTdtLayer(baseLayer.url, "cva_c", "baseLayer_tdt_ditubz", true);
        l2.setZIndex(2);
        l1.setZIndex(0);
        map.addLayer(l1);
        map.addLayer(l2);
        break;
      case "ter":
        var l1 = this.createTdtLayer(baseLayer.url, "ter_c", "baseLayer_tdt_ditu", true);
        var l2 = this.createTdtLayer(baseLayer.url, "cta_c", "baseLayer_tdt_ditubz", true);
        l2.setZIndex(2);
        l1.setZIndex(0);
        map.addLayer(l1);
        map.addLayer(l2);
        break;
      case "img":
        var l1 = this.createTdtLayer(baseLayer.url, "img_c", "baseLayer_tdt_ditu", true);
        var l2 = this.createTdtLayer(baseLayer.url, "cia_c", "baseLayer_tdt_ditubz", true);
        l2.setZIndex(2);
        l1.setZIndex(0);
        map.addLayer(l1);
        map.addLayer(l2);
        break;
    }
  },
  //添加天地图
  createTdtLayer: function(url, lyr, name, visible){
    var url = url + "?T=" + lyr + "&X={x}&Y={y}&L={z}"; //在线
    var projection = ol.proj.get("EPSG:4326");
    var projectionExtent = [-180, -90, 180, 90];
    var maxResolution = (ol.extent.getWidth(projectionExtent) / (256 * 2));
    var resolutions = new Array(16);
    var z;
    for(z = 0; z < 16; ++z){
      resolutions[z] = maxResolution / Math.pow(2, z);
    }
    var tileOrigin = ol.extent.getTopLeft(projectionExtent);
    var layer = new ol.layer.Tile({
      extent: [-180, -90, 180, 90],
      name: name,
      visible: visible,
      source: new ol.source.TileImage({
        crossOrigin: 'anonymous',
        tileUrlFunction: function(tileCoord){
          var z = tileCoord[0] + 1;
          var x = tileCoord[1];
          var y = -tileCoord[2] - 1;
          var n = Math.pow(2, z + 1);
          x = x % n;
          if(x * n < 0){
            x = x + n;
          }
          return url.replace("{z}", z.toString())
            .replace("{y}", y.toString())
            .replace("{x}", x.toString());
        },
        projection: projection,
        tileGrid: new ol.tilegrid.TileGrid({
          origin: tileOrigin,
          resolutions: resolutions,
          tileSize: 256
        })
      })
    });
    return layer;
  },
  //获取数据服务配置信息
  getDataServiceInfo: function(serviceName){
    var serviceInfo;
    var serviceList = dataConfig.serviceList;
    for(var i in serviceList){
      if(serviceName === dataConfig.serviceList[i].name){
        serviceInfo = dataConfig.serviceList[i];
        break;
      }
    }
    return serviceInfo;
  },
  //查询wfs服务
  queryWFS: function(serviceName, typeName, filter, handleResult){
    var serviceInfo = this.getDataServiceInfo(serviceName);
    if(!serviceInfo){
      alert("queryWFS:数据服务:" + serviceName + "不存在");
      return;
    }
    var baseUrl = dataConfig.proxyUrl + serviceInfo.url;
    var qs = this.getReqData(serviceInfo.version, serviceInfo.outputFormat, typeName, filter);
    var url = baseUrl + qs;
    $.ajax({
      type: "get",
      url: url,
      success: handleResult,
      dataType: "text"
    });
  },
  //处理服务返回数据
  processServiceData: function(serviceName, data){
    var serviceInfo = this.getDataServiceInfo(serviceName);
    if(!serviceInfo){
      alert("processGML:数据服务:" + serviceName + "不存在");
      return;
    }
    var format;
    if(serviceInfo.outputFormat === "GML2"){
      format = new ol.format.GML2();
    }
    if(serviceInfo.outputFormat === "GML3"){
      format = new ol.format.GML3();
    }
    var features = format.readFeatures(data);
    return features;
  },
  //get查询
  getReqData: function(version, outputFormat, typeName, filter){
    var para = "";
    para += "service=WFS";
    para += "&request=GetFeature";
    para += "&version=" + version; //wfs版本：1.0.0  1.1.0  2.0.0
    para += "&outputformat=" + outputFormat; //返回数据格式：GML2  GML3
    para += "&typename=" + typeName; //图层名
    para += "&filter=" + filter;
    return para;
  },
  //查询所有
  queryAll: function(){
    var para = "";
    return para;
  },
  //等于查询
  createEqualFilter: function(fieldName, fieldValue){
    var filter = "";
    filter += "(<Filter xmlns=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\">";
    filter += "<ogc:PropertyIsEqualTo xmlns:ogc=\"http://www.opengis.net/ogc\">";
    filter += "<ogc:PropertyName>" + fieldName + "</ogc:PropertyName>";
    filter += "<ogc:Literal>" + fieldValue + "</ogc:Literal>";
    filter += "</ogc:PropertyIsEqualTo>";
    filter += "</Filter>)";
    return filter;
  },
  //模糊查询
  createLikeFilter: function(fieldName, fieldValue){
    var filter = "";
    filter += "(<Filter xmlns=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\">";
    filter += "<ogc:PropertyIsLike wildCard=\"*\" singleChar=\".\" escape=\"!\" xmlns:ogc=\"http://www.opengis.net/ogc\">";
    filter += "<ogc:PropertyName>" + fieldName + "</ogc:PropertyName>";
    filter += "<ogc:Literal>" + fieldValue + "</ogc:Literal>";
    filter += "</ogc:PropertyIsLike>";
    filter += "</Filter>)";
    return filter;
  },
  //in查询
  createInFilter: function(fieldName, fieldValues){
    if(fieldValues === null || fieldValues.length === 0){
      return null;
    }
    if(fieldValues.length === 1){
      return this.createEqualFilter(fieldName, fieldValues[0].toString());
    }

    var para;
    var filter = "";
    filter += "(<Filter xmlns=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\">";
    filter += "<Or>";

    for(var i in fieldValues){
      if(fieldValues[i] === null){
        continue;
      }
      para = "";
      para += "<ogc:PropertyIsEqualTo xmlns:ogc=\"http://www.opengis.net/ogc\">";
      para += "<ogc:PropertyName>" + fieldName + "</ogc:PropertyName>";
      para += "<ogc:Literal>" + fieldValues[i].toString() + "</ogc:Literal>";
      para += "</ogc:PropertyIsEqualTo>";
      filter += para;
    }

    filter += "</Or>";
    filter += "</Filter>)";
    return filter;
  },
  flashFeature: function(feature, count){
    var start = new Date().getTime();
    var listenerKey;
    var numF = 0;
    var duration = 1500;

    function animate(event){
      var vectorContext = event.vectorContext;
      var frameState = event.frameState;
      var flashGeom = feature.getGeometry().clone();
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
      // radius will be 5 at start and 30 at end.
      var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
      var opacity = ol.easing.easeOut(1 - elapsedRatio);

      var style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(255,0,0," + opacity + ")",
          width: 6
        }),
        fill: new ol.style.Fill({
          color: "rgba(255,0,0," + opacity + ")"
        }),
        image: new ol.style.Circle({
          radius: radius,
          snapToPixel: false,
          stroke: new ol.style.Stroke({
            color: "rgba(255, 0, 0, " + opacity + ")",
            width: 0.25 + opacity
          })
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      if(elapsed > duration){
        ol.Observable.unByKey(listenerKey);
        numF++;
        if(numF < count){
          map.render();
          flashFeature(feature, numF, count);
          return;
        }
        numF = 0;
        return;
      }
      // tell OL3 to continue postcompose animation
      map.render();
    }

    listenerKey = map.on("postcompose", animate);
  }
};