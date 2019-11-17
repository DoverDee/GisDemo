//定义全局变量引用父页面Window和Document
// var $fatherWin = parent;
var $fatherDoc = $(window.parent.document);

//构建查询条件并提交
function searchDBForMap(){
  //对象切换后则立即初始化图层
  initialLayers();

  // 图层分类对象
  var $categoryObj = $fatherDoc.find("#category>dl>dd li.beSelected");
  if($categoryObj.length !== 1){
    alert("请选择并且仅选择一个查询对象");
    return false;
  }else{
    var layerObj = $categoryObj.attr("data-values").split(";")[2].trim();
    var ctlPrefix = $categoryObj.attr("data-values").split(";")[3].trim();
    var objType = $categoryObj.attr("data-values").split(";")[4].trim();
    //输入框值
    var inputVal = $("#sb").val();
    //行政区划值
    var offAreaVal = $("#offArea>ul>li.beSelected").attr("data-values");
    //流域值
    var riverAreaVal = $("#riverArea>ul>li.beSelected").attr("data-values");
    //水资源分区值
    var waterAreaVal = $("#waterArea>ul>li.beSelected").attr("data-values");

    // var cdtStr = '"inputVal": "' + inputVal + '", "offAreaVal": "' + offAreaVal + '",riverAreaVal": "' + riverAreaVal + '", "waterAreaVal": "' + waterAreaVal + '"';

    var cdtJson = {
      inputVal: inputVal,
      offAreaVal: offAreaVal,
      riverAreaVal: riverAreaVal,
      waterAreaVal: waterAreaVal
    };
    formActionForMap(ctlPrefix, objType, layerObj, cdtJson);
  }
}

//数据库查询并动态构建查询结果列表和图层
function formActionForMap(ctlPrefix, objType, layerObj, cdtJson, pageData){
  if(pageData){
    cdtJson.showCount = pageData["showCount"];
    cdtJson.totalPage = pageData["totalPage"];
    cdtJson.totalResult = pageData["totalResult"];
    cdtJson.currentPage = pageData["currentPage"];
    cdtJson.currentResult = pageData["currentResult"];
    // cdt += ',"showCount":"' + pageData["showCount"] + '","totalPage":"' + pageData["totalPage"] + '","totalResult":"' + pageData["totalResult"] + '","currentPage":"' + pageData["currentPage"] + '","currentResult":"' + pageData["currentResult"] + '"';
  }
  $.ajax({
    type: 'post',
    url: ctlPrefix + "/listPageObj.do",
    data: cdtJson,
    success: function(datas){
      if($.isEmptyObject(datas)){
        $("#searchResult>ul").empty();
        $("#pagination>ul").empty();
        alert("服务错误，请联系管理员！");
        return false;
      }
      var cdtList = datas["cdtList"];
      var pageData = datas["page"];
      var resultHtml = "";
      var pageHtml = "";
      var _point;
      var _index;
      var _path;
      var _loc;
      var _quota;
      if(cdtList.length !== 0){
        for(var i in cdtList){
          if(cdtList.hasOwnProperty(i)){
            _point = cdtList[i].SMX + "," + cdtList[i].SMY;
            _index = parseInt(i) + 1;
            _loc = typeof(cdtList[i].OBJ_LOC) === "undefined" || !cdtList[i].OBJ_LOC ? "--" : cdtList[i].OBJ_LOC;
            _quota = typeof(cdtList[i].OBJ_QUOTA) === "undefined" || !cdtList[i].OBJ_QUOTA ? "--" : cdtList[i].OBJ_QUOTA;
            _path = typeof(cdtList[i].IMG_PATH) === "undefined" || !cdtList[i].IMG_PATH ? "gis/image/img_default.png" : cdtList[i].IMG_PATH;
            resultHtml += "<li>";
            resultHtml += "<div><span class=\"toPoint\" data-values=" + _point + "><nobr><em>" + _index + "</em>" + cdtList[i].OBJ_NAME + "</nobr></span>";
            resultHtml += "<span><nobr>" + _loc + "</nobr></span>";
            resultHtml += "<span><nobr>" + objConfig[ctlPrefix].mapListQuota[0] + "：" + _quota + objConfig[ctlPrefix].mapListQuota[1] + "</nobr></span></div>";
            resultHtml += "<div><img src=\"" + _path + "\" width=\"98px\" height=\"50px\"/></div>";
            resultHtml += "</li>"
          }
        }
        pageHtml += "<li class=\"speI\"><span>第";
        pageHtml += "<input type=\"number\" id=\"pageNum\" name=\"pageNum\" value=" + pageData["currentPage"] + " min=\"1\" placeholder=\"输入页码点击跳转\"/>页";
        pageHtml += "</span></li>";
        pageHtml += "<li class=\"speH\" id=\"toPage\"><span>跳转</span></li>";
        pageHtml += "<li class=\"speH\" id=\"toPre\"><span>上页</span></li>";
        pageHtml += "<li class=\"speH\" id=\"toNext\"><span>下页</span></li>";
        pageHtml += "<li><span>共" + pageData["totalResult"] + "条</span></li>";
        pageHtml += "<li><span>共" + pageData["totalPage"] + "页</span></li>";
      }else{
        resultHtml = "<h6>未找到满足条件的结果！</h6>";
      }
      //构建列表
      $("#searchResult>ul").html(resultHtml);
      $("#pagination>ul").html(pageHtml);
      activeSearchResultHoverAndClick();
      activePaginationBarClickForMap(ctlPrefix, objType, layerObj, cdtJson, pageData);
      //构建Overlay和feature图层
      if(objType === "point"){//点
        //数据库查询渲染图层（方式一）overlay
        addOverlayWithOrder(ctlPrefix, cdtList);
        //通过查询结果构建要素渲染图层（方式二）feature
        addPointByDB(ctlPrefix, cdtList);
      }else if(objType === "line"){//线
        addLine("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else if(objType === "polygon"){//面
        addPolygon("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else{
        alert("查询对象类型异常！");
      }
      //显示查询结果
      if("block" !== $("#searchResult,#pagination").css("display")){
        $("#searchResult,#pagination").css("display", "block");
      }
    }
  });
}

//激活搜索选择项元素点击事件
function activeSearchSelectItemLiClick(){
  $("#searchSelect>div.item>ul>li").click(function(){
    $(this).siblings().removeClass("beSelected");
    if($(this).hasClass("beSelected")){
      $(this).removeClass("beSelected");
    }else{
      $(this).addClass("beSelected");
    }
    //再次过滤查询
    searchDBForMap();
  });
}

//激活搜索结果列表点击定位事件 和 提示隐藏文字提示框
function activeSearchResultHoverAndClick(){
  /*查询类表点击定位地图*/
  $("div#searchResult>ul>li>div:first-child>span.toPoint").click(function(){
    var point = $(this).attr("data-values").split(",");
    point = [parseFloat(point[0]), parseFloat(point[1])];
    lvwMapLib.zoomTo(map, point, 11);
  });
  $("div#searchResult>ul>li>div:first-child>span.toPoint").hover(function(e){
    var _nobrText = $(this).find("nobr").text();
    var _emText = $(this).find("em").text();
    var _pText = _nobrText.substring(_emText.length);
    if(_pText.length > 9){
      $("#tips").show().html(_pText).css({left: e.clientX, top: e.clientY});
    }
    $(this).find("nobr")[0] = _pText;
  }, function(){
    $("#tips").hide();
  });

}

//激活分页条点击事件
function activePaginationBarClickForMap(ctlPrefix, objType, layerObj, cdtJson, pageData){
  //跳转到指定页
  $("#toPage").click(function(){
    var _pn = $("#pageNum").valueOf().val();
    // alert(_pn);
    pageData["currentPage"] = _pn;
    formActionForMap(ctlPrefix, objType, layerObj, cdtJson, pageData);
  });
  //跳转到下一页
  $("#toNext").click(function(){
    var _pn = $("#pageNum").valueOf().val();
    var _cpn = parseInt(_pn) + 1;
    if(_pn < pageData["totalPage"]){
      pageData["currentPage"] = _cpn;
      formActionForMap(ctlPrefix, objType, layerObj, cdtJson, pageData);
    }else{
      alert("页码已到最大！");
    }
  });
  //跳转掉上一页
  $("#toPre").click(function(){
    var _pn = $("#pageNum").valueOf().val();
    var _cpn = parseInt(_pn) - 1;
    if(_pn > 1){
      pageData["currentPage"] = _cpn;
      formActionForMap(ctlPrefix, objType, layerObj, cdtJson, pageData);
    }else{
      alert("页码已到最小！");
    }
  });
}

// Dialog面板中详细基本信息
function showDialogForMap(ctlPrefix, objCd){
  $.ajax({
    url: ctlPrefix + "/findObjById.do",
    data: {"objCd": objCd},
    dataType: "json",
    success: function(data){
      createDialogDetailHtml(ctlPrefix, data);
    }
  });
}

//根据对象类型构建对话中详细信息模块
function createDialogDetailHtml(ctlPrefix, data){
  var tb = $fatherDoc.find("#baseInfo>table>tbody");
  var tbcHtml = "";
  switch(ctlPrefix){
    case "gisLake":
      tbcHtml += "<tr><td>湖泊代码：</td><td>" + data.LK_CD + "</td></tr>";
      tbcHtml += "<tr><td>湖泊名称：</td><td>" + data.LK_NM + "</td></tr>";
      tbcHtml += "<tr><td>水面面积(km<sup>2</sup>)：</td><td>" + data.WAT_A + "</td></tr>";
      tbcHtml += "<tr><td>咸淡水属性：</td><td>" + data.SFW_PROP + "</td></tr>";
      tbcHtml += "<tr><td>平均水深：</td><td>" + data.AVG_DEP + "</td></tr>";
      tbcHtml += "<tr><td>最大水深：</td><td>" + data.MAX_DEP + "</td></tr>";
      tbcHtml += "<tr><td>湖泊容积(10<sup>6</sup>m<sup>3</sup>)：</td> <td>" + data.LK_V + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisCws" :
      tbcHtml += "<tr><td>农村供水工程代码：</td><td>" + data.CWS_CD + "</td></tr>";
      tbcHtml += "<tr><td>农村供水工程名称：</td><td>" + data.CWS_NM + "</td></tr>";
      tbcHtml += "<tr><td>农村供水工程类型：</td><td>" + data.CWS_TP + "</td></tr>";
      tbcHtml += "<tr><td>设计供水日规模(m<sup>3</sup>)：</td><td>" + data.DES_WS_SCAL + "</td></tr>";
      tbcHtml += "<tr><td>设计供水人口：</td><td>" + data.DES_WS_PP + "</td></tr>";
      tbcHtml += "<tr><td>卫生许可证编号：</td><td>" + data.SAN_LIC_SN + "</td></tr>";
      tbcHtml += "<tr><td>受益行政村数量：</td> <td>" + data.BEN_VIL_NUM + "</td></tr>";
      tbcHtml += "<tr><td>收费形式：</td><td>" + data.CHARG_FORM + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisPump" :
      tbcHtml += "<tr><td>泵站工程代码：</td><td>" + data.PUMP_CD + "</td></tr>";
      tbcHtml += "<tr><td>泵站名称：</td><td>" + data.PUMP_NM + "</td></tr>";
      tbcHtml += "<tr><td>所在地：</td><td>" + data.LOC + "</td></tr>";
      tbcHtml += "<tr><td>工程规模：</td><td>" + data.PROJ_SCAL + "</td></tr>";
      tbcHtml += "<tr><td>泵站类型：</td><td>" + data.PUMP_TP + "</td></tr>";
      tbcHtml += "<tr><td>装机流量(m<sup>3</sup>/s)：</td><td>" + data.INS_Q + "</td></tr>";
      tbcHtml += "<tr><td>设计扬程(m)：</td> <td>" + data.DES_HEAD + "</td></tr>";
      tbcHtml += "<tr><td>水泵数量：</td><td>" + data.PUMP_NUM + "</td></tr>";
      tbcHtml += "<tr><td>设备总取水能力(m<sup>3</sup>/s)：</td><td>" + data.ALL_EQU_WW + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisGateP" :
      tbcHtml += "<tr><td>水闸工程代码：</td><td>" + data.GATE_CD + "</td></tr>";
      tbcHtml += "<tr><td>水闸名称：</td><td>" + data.GATE_NM + "</td></tr>";
      tbcHtml += "<tr><td>所在地：</td><td>" + data.LOC + "</td></tr>";
      tbcHtml += "<tr><td>工程规模：</td><td>" + data.PROJ_SCAL + "</td></tr>";
      tbcHtml += "<tr><td>闸孔数量：</td><td>" + data.GATE_HOLE_NUM + "</td></tr>";
      tbcHtml += "<tr><td>闸孔总净宽：</td><td>" + data.GATE_TW + "</td></tr>";
      tbcHtml += "<tr><td>设计过闸流量(m<sup>3</sup>/s)：</td> <td>" + data.DES_GATE_Q + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisHypo" :
      tbcHtml += "<tr><td>水电站代码：</td><td>" + data.HP_CD + "</td></tr>";
      tbcHtml += "<tr><td>水电站名称：</td><td>" + data.HP_NM + "</td></tr>";
      tbcHtml += "<tr><td>水电站类型：</td><td>" + data.HP_TP + "</td></tr>";
      tbcHtml += "<tr><td>装机容量(kW)：</td><td>" + data.INS_CAP + "</td></tr>";
      tbcHtml += "<tr><td>多年平均发电量(10<sup>4</sup>kW·h)：</td><td>" + data.AVG_EG + "</td></tr>";
      tbcHtml += "<tr><td>所在水库：</td><td>" + data.RES_NM + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisCh" :
      tbcHtml += "<tr><td>渠道工程代码：</td><td>" + data.CHAN_CD + "</td></tr>";
      tbcHtml += "<tr><td>渠道名称：</td><td>" + data.CHAN_NM + "</td></tr>";
      tbcHtml += "<tr><td>渠道级别：</td><td>" + data.CHAN_G + "</td></tr>";
      tbcHtml += "<tr><td>渠道设计流量(m<sup>3</sup>/s)：</td><td>" + data.CHAN_DES_Q + "</td></tr>";
      tbcHtml += "<tr><td>渗漏系数：</td><td>" + data.LEAK_R + "</td></tr>";
      tbcHtml += "<tr><td>渠道长度(m)：</td><td>" + data.CHAN_LEN + "</td></tr>";
      tbcHtml += "<tr><td>衬砌长度(m)：</td> <td>" + data.LIN_LEN + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisDitr" :
      tbcHtml += "<tr><td>引（调）水工程代码：</td><td>" + data.WDE_CD + "</td></tr>";
      tbcHtml += "<tr><td>引（调）水工程名称：</td><td>" + data.WDE_NM + "</td></tr>";
      tbcHtml += "<tr><td>地表水水源地：</td><td>" + data.SWS_CD + "</td></tr>";
      tbcHtml += "<tr><td>输水线路区：</td><td>" + data.LINE_A + "</td></tr>";
      tbcHtml += "<tr><td>输水干线总长(km)：</td><td>" + data.TOT_LINE_LEN + "</td></tr>";
      tbcHtml += "<tr><td>受水区范围：</td><td>" + data.INTK_A + "</td></tr>";
      tbcHtml += "<tr><td>引调水方式：</td><td>" + data.WDE_TP + "</td></tr>";
      tbcHtml += "<tr><td>建设状况：</td><td>" + data.CONS_COND + "</td></tr>";
      tbcHtml += "<tr><td>设计引调水流量(m<sup>3</sup>/s)：</td><td>" + data.DES_WDE_Q + "</td></tr>";
      tbcHtml += "<tr><td>设计年引调水量(10<sup>6</sup>m<sup>3</sup>)：</td><td>" + data.DES_YR_DW + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisPdo" :
      tbcHtml += "<tr><td>入河排污口代码：</td><td>" + data.PDO_CD + "</td></tr>";
      tbcHtml += "<tr><td>入河排污口名称：</td><td>" + data.PDO_NM + "</td></tr>";
      tbcHtml += "<tr><td>排污许可证代码：</td><td>" + data.WDPC_CD + "</td></tr>";
      tbcHtml += "<tr><td>地址：</td><td>" + data.ADDR + "</td></tr>";
      tbcHtml += "<tr><td>入河排污口性质：</td><td>" + data.PDO_TP + "</td></tr>";
      tbcHtml += "<tr><td>建成日期：</td><td>" + data.COMP_DT + "</td></tr>";
      tbcHtml += "<tr><td>排放方式：</td><td>" + data.EMIS_TP + "</td></tr>";
      tbcHtml += "<tr><td>入河方式：</td><td>" + data.IN_RV_TP + "</td></tr>";
      tbcHtml += "<tr><td>排入水体名称：</td><td>" + data.DWB_NM + "</td></tr>";
      tbcHtml += "<tr><td>设计日排污能力(t)：</td><td>" + data.DES_POLL_CAP + "</td></tr>";
      tbcHtml += "<tr><td>排污口管径(mm)：</td><td>" + data.PDO_SIZE + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisWint" :
      tbcHtml += "<tr><td>取水口代码：</td><td>" + data.INT_CD + "</td></tr>";
      tbcHtml += "<tr><td>取水口名称：</td><td>" + data.INT_NM + "</td></tr>";
      tbcHtml += "<tr><td>取水方式：</td><td>" + data.INT_TP + "</td></tr>";
      tbcHtml += "<tr><td>开始取水日期：</td><td>" + data.FROM_INT_DT + "</td></tr>";
      tbcHtml += "<tr><td>许可最大流量(m<sup>3</sup>/s)：</td><td>" + data.MAX_PERM_Q + "</td></tr>";
      tbcHtml += "<tr><td>设计流量(m<sup>3</sup>/s)：</td><td>" + data.DES_Q + "</td></tr>";
      tbcHtml += "<tr><td>许可总取水量(10<sup>4</sup>m<sup>3</sup>)：</td><td>" + data.PERM_WW + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisIrr" :
      tbcHtml += "<tr><td>灌区代码：</td><td>" + data.IRR_CD + "</td></tr>";
      tbcHtml += "<tr><td>灌区名称：</td><td>" + data.IRR_NM + "</td></tr>";
      tbcHtml += "<tr><td>灌区类型：</td><td>" + data.IRR_TP + "</td></tr>";
      tbcHtml += "<tr><td>灌区规模：</td><td>" + data.IRR_SCAL + "</td></tr>";
      tbcHtml += "<tr><td>设计灌溉面积(万亩)：</td><td>" + data.DES_IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>总灌溉面积(万亩)：</td><td>" + data.IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>其中耕地灌溉面积(万亩)：</td><td>" + data.FIELD_IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>运行状况：</td><td>" + data.RUN_COND + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisRiver" :
        tbcHtml += "<tr><td>河流代码：</td><td>" + data.RV_CD + "</td></tr>";
        tbcHtml += "<tr><td>河流名称：</td><td>" + data.RV_NM + "</td></tr>";
        tbcHtml += "<tr><td>河流等级：</td><td>" + data.RV_G + "</td></tr>";
        tbcHtml += "<tr><td>河流长度(千米)：</td><td>" + data.RV_LEN + "</td></tr>";
        tbcHtml += "<tr><td>河流平均比降：</td><td>" + data.RV_AG + "</td></tr>";
        tbcHtml += "<tr><td>是否为内流河：</td><td>" + data.IF_INN_RV + "</td></tr>";
        tb.html(tbcHtml);
        break;
    case "gisBast1st" :
        tbcHtml += "<tr><td>流域代码：</td><td>" + data.BAS_CD + "</td></tr>";
        tbcHtml += "<tr><td>流域名称：</td><td>" + data.BAS_NM + "</td></tr>";
        tbcHtml += "<tr><td>流域等级：</td><td>" + data.BAS_G + "</td></tr>";
        tbcHtml += "<tr><td>流域面积(km<sup>2</sup>)：</td><td>" + data.BAS_A + "</td></tr>";
        tbcHtml += "<tr><td>河系总河长(km)：</td><td>" + data.RS_TOT_LEN + "</td></tr>";
        tbcHtml += "<tr><td>最高点高程：</td><td>" + data.MAX_ELEV + "</td></tr>";
        tbcHtml += "<tr><td>最低点高程：</td> <td>" + data.MIN_ELEV + "</td></tr>";
        tbcHtml += "<tr><td>基面类型：</td> <td>" + data.DAT_TP + "</td></tr>";
        tb.html(tbcHtml);
        break;
    case "gisBast2nd" :
        tbcHtml += "<tr><td>流域代码：</td><td>" + data.BAS_CD + "</td></tr>";
        tbcHtml += "<tr><td>流域名称：</td><td>" + data.BAS_NM + "</td></tr>";
        tbcHtml += "<tr><td>流域等级：</td><td>" + data.BAS_G + "</td></tr>";
        tbcHtml += "<tr><td>流域面积(km<sup>2</sup>)：</td><td>" + data.BAS_A + "</td></tr>";
        tbcHtml += "<tr><td>河系总河长(km)：</td><td>" + data.RS_TOT_LEN + "</td></tr>";
        tbcHtml += "<tr><td>最高点高程：</td><td>" + data.MAX_ELEV + "</td></tr>";
        tbcHtml += "<tr><td>最低点高程：</td> <td>" + data.MIN_ELEV + "</td></tr>";
        tbcHtml += "<tr><td>基面类型：</td> <td>" + data.DAT_TP + "</td></tr>";
        tb.html(tbcHtml);
        break;
  }
  $fatherDoc.find("#dialogWrapper").show();
}


