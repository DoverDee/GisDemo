//定义全局变量引用父页面Window和Document
// var $fatherWin = parent;
var $fatherDoc = $(window.parent.document);

//构建查询条件HTML
function createHtmlForQueryCdt(ctlPrefix){
  //对象切换后则立即初始化图层
  initialLayers();
  //对象切换后则立清除查询结果
  $("#qlRst>table").empty();
  $("#qlPagination>ul").empty();
  $("#qmRst>table").empty();
  $("#qmPagination>ul").empty();

  var queryCdt = "<label for=\"objName\">" + objConfig[ctlPrefix].queryListName + "：</label><input id=\"objName\" type=\"text\" placeholder=\"输入名称\"/>&nbsp;&nbsp;";
  queryCdt += "<label for=\"objType\">" + objConfig[ctlPrefix].queryListType.nm + "：</label>";
  queryCdt += "<select id=\"objType\" type=\"text\">";
  queryCdt += "<option value=\"all\">--全部--</option>";
  var qtv = objConfig[ctlPrefix].queryListType.kv;
  for(var keyO in qtv){
    if(qtv.hasOwnProperty(keyO)){
      queryCdt += "<option value=" + keyO + ">" + qtv[keyO] + "</option>";
    }
  }
  queryCdt += "</select>&nbsp;&nbsp;";
  queryCdt += "<label for=\"objQuotaType\">" + objConfig[ctlPrefix].queryListQuota + "：</label>";
  queryCdt += "<select id=\"objQuotaType\" type=\"text\">";
  queryCdt += "<option value=\"all\">--全部--</option>";
  var qlq = objConfig["compareArray"];
  for(var keyT in qlq){
    if(qlq.hasOwnProperty(keyT)){
      queryCdt += "<option value=" + keyT + ">" + qlq[keyT] + "</option>";
    }
  }
  queryCdt += "</select>";
  queryCdt += "<input id=\"objQuotaVal\" type=\"number\" min=\"0\" placeholder=\"输入数值\"/>&nbsp;&nbsp;";
  queryCdt += "<input id=\"querySubmit\" type=\"button\" value=\"查询\"/>";
  queryCdt += "<input id=\"queryExcel\" type=\"button\" value=\"导出\"/>";

  $("#queryCdt").html(queryCdt);
  activeFormBtn(ctlPrefix);
}

//激活查询条件中的按钮点击事件
function activeFormBtn(ctlPrefix){
  var $categoryObj = $fatherDoc.find("#category>dl>dd li.beSelected");
  var layerObj = $categoryObj.attr("data-values").split(";")[2].trim();
  var queryObjType = $categoryObj.attr("data-values").split(";")[4].trim();
  $("#queryCdt>input[type=\"button\"]").click(function(){
    //对象名称
    var objName = $("#objName").val();
    //对象类型
    var objType = $("#objType").val();
    //对象指标条件
    var objQuotaType = $("#objQuotaType").val();
    //对象指标值
    var objQuotaVal = $("#objQuotaVal").val();
    //var cdtStr = '"objName": "' + objName + '", "objType": "' + objType + '",objQuotaCdt": "' + objQuotaType + '", "objQuotaVal": "' + objQuotaVal + '"';
    if("all" !== objQuotaType && "" === objQuotaVal){
      alert("请输入数值");
      $("#objQuotaVal").focus();
      return false;
    }
    var cdtJson = {
      objName: objName,
      objType: objType,
      objQuotaType: objQuotaType,
      objQuotaVal: objQuotaVal
    };
    var btnType = $(this).attr("id");
    // alert(ctlPrefix + "--" + btnType);
    if("querySubmit" === btnType){
      formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson);
    }else if("queryExcel" === btnType){
      formActionForQueryExcel(ctlPrefix);
    }
  });
}

//数据库查询并动态构建查询结果的HTML元素
function formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData){
  //初始化图层
  initialLayers();
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
    url: ctlPrefix + "/listPageObjForQuery.do",
    data: cdtJson,
    success: function(ds){
      if($.isEmptyObject(ds)){
        $("#qlRst>table").empty();
        $("#qlPagination>ul").empty();
        $("#qmRst>table").empty();
        $("#qmPagination>ul").empty();
        alert("服务错误，请联系管理员！");
        return false;
      }

      var cdtList = ds["cdtList"];
      var pageData = ds["page"];
      var qlHtml = "";
      var qmHtml = "";
      if(cdtList.length !== 0){
        qlHtml = createHtmlForQueryResultList(ctlPrefix, cdtList);
        qmHtml = createHtmlForQueryResultMap(ctlPrefix, cdtList);

        var qlHtmlPage = "<li><span>共" + pageData["totalPage"] + "页</span></li>";
        qlHtmlPage += "<li><span>共" + pageData["totalResult"] + "条</span></li>";
        qlHtmlPage += "<li class=\"speH\" id=\"toQlFirstPage\"><span>首页</span></li>";
        qlHtmlPage += "<li class=\"speH\" id=\"toQlPre\"><span>上页</span></li>";
        qlHtmlPage += "<li class=\"speH\" id=\"toQlNext\"><span>下页</span></li>";
        qlHtmlPage += "<li class=\"speH\" id=\"toQlLastPage\"><span>尾页</span></li>";
        qlHtmlPage += "<li class=\"speH\" id=\"toQlPage\"><span>跳转</span></li>";
        qlHtmlPage += "<li class=\"speI\"><span>第<input type=\"number\" id=\"pageQlNum\" name=\"pageNum\" value=" + pageData["currentPage"] + " min=\"1\" placeholder=\"输入页码点击跳转\"/>页</span></li>";

        var qmHtmlPage = "<li><span>共" + pageData["totalPage"] + "页</span></li>";
        qmHtmlPage += "<li><span>共" + pageData["totalResult"] + "条</span></li>";
        qmHtmlPage += "<li class=\"speH\" id=\"toQmNext\"><span>下页</span></li>";
        qmHtmlPage += "<li class=\"speH\" id=\"toQmPage\"><span>跳转</span></li>";
        qmHtmlPage += "<li class=\"speI\"><span>第<input type=\"number\" id=\"pageQmNum\" name=\"pageNum\" value=" + pageData["currentPage"] + " min=\"1\" placeholder=\"输入页码点击跳转\"/>页</span></li>";
      }else{
        qlHtml = "<h6>未找到满足条件的结果！</h6>";
        qmHtml = "<h6>未找到满足条件的结果！</h6>";
      }

      $("#qlRst>table").html(qlHtml);
      $("#qlPagination>ul").html(qlHtmlPage);
      $("#qmRst>table").html(qmHtml);
      $("#qmPagination>ul").html(qmHtmlPage);
      activeQueryResultOperateDetailClick(ctlPrefix);
      activePaginationBarClickForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
      //构建Overlay和feature图层
      if(queryObjType === "point"){//点
        //数据库查询渲染图层（方式一）
        addOverlayWithOrder(ctlPrefix, cdtList);
        //查询要素过滤渲染图层（方式二）
        addPointByDB(ctlPrefix, cdtList);
      }else if(queryObjType === "line"){//线
        addLine("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else if(queryObjType === "polygon"){//面
        addPolygon("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else{
        alert("查询对象类型异常！");
      }
    }
  });
}

//导出全部按条件查询的结果到Excel
function formActionForQueryExcel(ctlPrefix){
  //对象名称
  var objName = $("#objName").val();
  //对象类型
  var objType = $("#objType").val();
  //对象指标条件
  var objQuotaType = $("#objQuotaType").val();
  //对象指标值
  var objQuotaVal = $("#objQuotaVal").val();
  //var cdtStr = '"objName": "' + objName + '", "objType": "' + objType + '",objQuotaCdt": "' + objQuotaType + '", "objQuotaVal": "' + objQuotaVal + '"';
  if("all" !== objQuotaType && "" === objQuotaVal){
    alert("请输入数值");
    $("#objQuotaVal").focus();
    return false;
  }

  window.location.href = ctlPrefix + "/excelForQuery.do?objName=" + objName + "&objType=" + objType + "&objQuotaType=" + objQuotaType + "&objQuotaVal=" + objQuotaVal;
}

//构建查询结果列表的HTML
function createHtmlForQueryResultList(ctlPrefix, cdtList){
  var qlHtml = "";
  var _index = "";
  switch(ctlPrefix){
    case "gisLake":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>湖泊代码</th>";
      qlHtml += "<th>湖泊名称</th>";
      qlHtml += "<th>湖泊容积</th>";
      qlHtml += "<th>平均水深</th>";
      qlHtml += "<th>咸淡水属性</th>";
      qlHtml += "<th>水面面积</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].LK_V + "</td>";
          qlHtml += "<td>" + cdtList[i].AVG_DEP + "</td>";
          qlHtml += "<td>" + cdtList[i].SFW_PROP + "</td>";
          qlHtml += "<td>" + cdtList[i].WAT_A + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisBast1st":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>流域代码</th>";
      qlHtml += "<th>流域名称</th>";
      qlHtml += "<th>河系总河长</th>";
      qlHtml += "<th>基面类型</th>";
      qlHtml += "<th>流域等级</th>";
      qlHtml += "<th>流域面积</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].RS_TOT_LEN + "</td>";
          qlHtml += "<td>" + cdtList[i].BAS_G + "</td>";
          qlHtml += "<td>" + cdtList[i].BAS_A + "</td>";
          qlHtml += "<td>" + cdtList[i].WAT_A + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisPump":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>泵站工程代码</th>";
      qlHtml += "<th>泵站名称</th>";
      qlHtml += "<th>所在地</th>";
      qlHtml += "<th>工程规模</th>";
      qlHtml += "<th>泵站类型</th>";
      qlHtml += "<th>装机流量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].PROJ_SCAL + "</td>";
          qlHtml += "<td>" + cdtList[i].PUMP_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].INS_Q + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisCh":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>渠道工程代码</th>";
      qlHtml += "<th>渠道名称</th>";
      qlHtml += "<th>渠道长度</th>";
      qlHtml += "<th>渠道级别</th>";
      qlHtml += "<th>渠道设计流量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].CHAN_LEN + "</td>";
          qlHtml += "<td>" + cdtList[i].CHAN_G + "</td>";
          qlHtml += "<td>" + cdtList[i].CHAN_DES_Q + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisGateP":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>水闸工程代码</th>";
      qlHtml += "<th>水闸名称</th>";
      qlHtml += "<th>所在地</th>";
      qlHtml += "<th>工程规模</th>";
      qlHtml += "<th>闸孔数量</th>";
      qlHtml += "<th>设计过闸流量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].PROJ_SCAL + "</td>";
          qlHtml += "<td>" + cdtList[i].GATE_HOLE_NUM + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_GATE_Q + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisHypo":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>水电站代码</th>";
      qlHtml += "<th>水电站名称</th>";
      qlHtml += "<th>所在水库</th>";
      qlHtml += "<th>装机容量</th>";
      qlHtml += "<th>水电站类型</th>";
      qlHtml += "<th>多年平均发电量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].INS_CAP + "</td>";
          qlHtml += "<td>" + cdtList[i].HP_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].AVG_EG + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisDitr":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>引（调）水工程代码</th>";
      qlHtml += "<th>引（调）水工程名称</th>";
      qlHtml += "<th>地表水水源地</th>";
      qlHtml += "<th>受水区范围</th>";
      qlHtml += "<th>引调水方式</th>";
      qlHtml += "<th>输水干线总长</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].INTK_A + "</td>";
          qlHtml += "<td>" + cdtList[i].WDE_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].TOT_LINE_LEN + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisCws":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>农村供水工程代码</th>";
      qlHtml += "<th>农村供水工程名称</th>";
      qlHtml += "<th>管理单位</th>";
      qlHtml += "<th>设计供水日规模</th>";
      qlHtml += "<th>农村供水工程类型</th>";
      qlHtml += "<th>设计供水人口流量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_WS_SCAL + "</td>";
          qlHtml += "<td>" + cdtList[i].CWS_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_WS_PP + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisIrr":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>灌区代码</th>";
      qlHtml += "<th>灌区名称</th>";
      qlHtml += "<th>管理单位</th>";
      qlHtml += "<th>灌区规模</th>";
      qlHtml += "<th>灌区类型</th>";
      qlHtml += "<th>设计灌溉面积</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].IRR_SCAL + "</td>";
          qlHtml += "<td>" + cdtList[i].IRR_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_IRR_A + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisPdo":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>入河排污口代码</th>";
      qlHtml += "<th>入河排污口名称</th>";
      qlHtml += "<th>地址</th>";
      qlHtml += "<th>排污许可证代码</th>";
      qlHtml += "<th>入河排污口性质</th>";
      qlHtml += "<th>设计日排污能力</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].WDPC_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].PDO_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_POLL_CAP + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisWint":
      qlHtml += "<thead><tr>";
      qlHtml += "<th>序号</th>";
      qlHtml += "<th>地表水取水口代码</th>";
      qlHtml += "<th>地表水取水口名称</th>";
      qlHtml += "<th>管理单位</th>";
      qlHtml += "<th>许可最大流量</th>";
      qlHtml += "<th>取水方式</th>";
      qlHtml += "<th>设计流量</th>";
      qlHtml += "<th>操作</th>";
      qlHtml += "</tr></thead>";
      qlHtml += "<tbody>";
      for(var i in cdtList){
        if(cdtList.hasOwnProperty(i)){
          _index = parseInt(i) + 1;
          qlHtml += "<tr>";
          qlHtml += "<td>" + _index + "</td>";
          qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
          qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
          qlHtml += "<td>" + cdtList[i].MAX_PERM_Q + "</td>";
          qlHtml += "<td>" + cdtList[i].INT_TP + "</td>";
          qlHtml += "<td>" + cdtList[i].DES_Q + "</td>";
          qlHtml += "<td><span>详情</span></td>";
          qlHtml += "</tr>"
        }
      }
      qlHtml += "</tbody>";
      break;
    case "gisRiver":
        qlHtml += "<thead><tr>";
        qlHtml += "<th>序号</th>";
        qlHtml += "<th>河流代码</th>";
        qlHtml += "<th>河流名称</th>";
        qlHtml += "<th>所在地</th>";
        qlHtml += "<th>河流等级</th>";
        qlHtml += "<th>河流长度(千米)</th>";
        qlHtml += "<th>操作</th>";
        qlHtml += "</tr></thead>";
        qlHtml += "<tbody>";
        for(var i in cdtList){
          if(cdtList.hasOwnProperty(i)){
            _index = parseInt(i) + 1;
            qlHtml += "<tr>";
            qlHtml += "<td>" + _index + "</td>";
            qlHtml += "<td class=\"forSelected\">" + cdtList[i].OBJ_CD + "</td>";
            qlHtml += "<td>" + cdtList[i].OBJ_NAME + "</td>";
            qlHtml += "<td>" + cdtList[i].OBJ_LOC + "</td>";
            qlHtml += "<td>" + cdtList[i].RV_G + "</td>";
            qlHtml += "<td>" + cdtList[i].RV_LEN + "</td>";
            qlHtml += "<td><span>详情</span></td>";
            qlHtml += "</tr>"
          }
        }
        qlHtml += "</tbody>";
        break;
    case "gisOther":
      break;
  }
  return qlHtml;
}

//构建查询结果列表对应地图列表的HTML
function createHtmlForQueryResultMap(ctlPrefix, cdtList){
  var qmHtml = "";
  var _point = "";
  var _index = "";
  switch(ctlPrefix){
    case "gisLake":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>湖泊名称</th>";
      qmHtml += "<tbody>";
      for(var i0 in cdtList){
        if(cdtList.hasOwnProperty(i0)){
          _point = cdtList[i0].SMX + "," + cdtList[i0].SMY;
          _index = parseInt(i0) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i0].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisBast1st":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>流域名称</th>";
      qmHtml += "<tbody>";
      for(var i1 in cdtList){
        if(cdtList.hasOwnProperty(i1)){
          _point = cdtList[i1].SMX + "," + cdtList[i1].SMY;
          _index = parseInt(i1) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i1].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisPump":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>泵站名称</th>";
      qmHtml += "<tbody>";
      for(var i2 in cdtList){
        if(cdtList.hasOwnProperty(i2)){
          _point = cdtList[i2].SMX + "," + cdtList[i2].SMY;
          _index = parseInt(i2) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i2].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisCh":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>渠道名称</th>";
      qmHtml += "<tbody>";
      for(var i3 in cdtList){
        if(cdtList.hasOwnProperty(i3)){
          _point = cdtList[i3].SMX + "," + cdtList[i3].SMY;
          _index = parseInt(i3) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i3].OBJ_NAME + "</td>";
          qmHtml += "</tr>";
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisGateP":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>水闸名称</th>";
      qmHtml += "<tbody>";
      for(var i4 in cdtList){
        if(cdtList.hasOwnProperty(i4)){
          _point = cdtList[i4].SMX + "," + cdtList[i4].SMY;
          _index = parseInt(i4) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i4].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisHypo":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>水电站名称</th>";
      qmHtml += "<tbody>";
      for(var i5 in cdtList){
        if(cdtList.hasOwnProperty(i5)){
          _point = cdtList[i5].SMX + "," + cdtList[i5].SMY;
          _index = parseInt(i5) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i5].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisDitr":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>引（调）水工程名称</th>";
      qmHtml += "<tbody>";
      for(var i6 in cdtList){
        if(cdtList.hasOwnProperty(i6)){
          _point = cdtList[i6].SMX + "," + cdtList[i6].SMY;
          _index = parseInt(i6) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i6].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisCws":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>农村供水工程名称</th>";
      qmHtml += "<tbody>";
      for(var i7 in cdtList){
        if(cdtList.hasOwnProperty(i7)){
          _point = cdtList[i7].SMX + "," + cdtList[i7].SMY;
          _index = parseInt(i7) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i7].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisIrr":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>灌区名称</th>";
      qmHtml += "<tbody>";
      for(var i8 in cdtList){
        if(cdtList.hasOwnProperty(i8)){
          _point = cdtList[i8].SMX + "," + cdtList[i8].SMY;
          _index = parseInt(i8) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i8].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisPdo":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>入河排污口名称</th>";
      qmHtml += "<tbody>";
      for(var i9 in cdtList){
        if(cdtList.hasOwnProperty(i9)){
          _point = cdtList[i9].SMX + "," + cdtList[i9].SMY;
          _index = parseInt(i9) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i9].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisWint":
      qmHtml += "<thead><tr>";
      qmHtml += "<th>序号</th>";
      qmHtml += "<th>地表水取水口名称</th>";
      qmHtml += "<tbody>";
      for(var i10 in cdtList){
        if(cdtList.hasOwnProperty(i10)){
          _point = cdtList[i10].SMX + "," + cdtList[i10].SMY;
          _index = parseInt(i10) + 1;
          qmHtml += "<tr data-values=" + _point + ">";
          qmHtml += "<td>" + _index + "</td>";
          qmHtml += "<td>" + cdtList[i10].OBJ_NAME + "</td>";
          qmHtml += "</tr>"
        }
      }
      qmHtml += "</tbody>";
      break;
    case "gisRiver":
        qmHtml += "<thead><tr>";
        qmHtml += "<th>序号</th>";
        qmHtml += "<th>河流名称</th>";
        qmHtml += "<tbody>";
        for(var i10 in cdtList){
          if(cdtList.hasOwnProperty(i10)){
            _point = cdtList[i10].SMX + "," + cdtList[i10].SMY;
            _index = parseInt(i10) + 1;
            qmHtml += "<tr data-values=" + _point + ">";
            qmHtml += "<td>" + _index + "</td>";
            qmHtml += "<td>" + cdtList[i10].OBJ_NAME + "</td>";
            qmHtml += "</tr>"
          }
        }
        qmHtml += "</tbody>";
        break;
    case "gisOther":
      break;
  }
  return qmHtml;

}

//激活查询列表操作列中的详细点击事件和对应地图列表行点击定位事件
function activeQueryResultOperateDetailClick(ctlPrefix){
  $("#qlRst>table>tbody>tr>td>span").click(function(){
    var _objCd = $(this).parent().siblings(".forSelected").text();
    // alert(_objCd);
    showDialogForMap(ctlPrefix, _objCd);
  });
  $("#qmRst>table>tbody>tr").click(function(){
    var _point = $(this).attr("data-values").split(",");
    _point = [parseFloat(_point[0]), parseFloat(_point[1])];
    lvwMapLib.zoomTo(map, _point, 11);
  });
}

//激活列表和对应地图分页条点击事件
function activePaginationBarClickForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData){
  //跳转到指定页（列表）
  $("#toQlPage").click(function(){
    var _pnl = $("#pageQlNum").valueOf().val();
    // alert(_pnl);
    pageData["currentPage"] = _pnl;
    formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
  });
  //跳转到指定页（对应地图）
  $("#toQmPage").click(function(){
    var _pnm = $("#pageQmNum").valueOf().val();
    // alert(_pnm);
    pageData["currentPage"] = _pnm;
    formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
  });
  //跳转到尾页
  $("#toQlLastPage").click(function(){
    pageData["currentPage"] = pageData["totalPage"];
    formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
  });
  //跳转到下一页
  $("#toQlNext,#toQmNext").click(function(){
    //由于联动可巧取当前页码
    var _pn = $("#pageQlNum").valueOf().val();
    var _cpn = parseInt(_pn) + 1;
    if(_pn < pageData["totalPage"]){
      pageData["currentPage"] = _cpn;
      formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
    }else{
      alert("页码已到最大！");
    }
  });
  //跳转到上一页
  $("#toQlPre").click(function(){
    var _pn = $("#pageQlNum").valueOf().val();
    var _cpn = parseInt(_pn) - 1;
    if(_pn > 1){
      pageData["currentPage"] = _cpn;
      formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
    }else{
      alert("页码已到最小！");
    }
  });
  //跳转到首页
  $("#toQlFirstPage").click(function(){
    pageData["currentPage"] = 1;
    formActionForQuery(ctlPrefix, queryObjType, layerObj, cdtJson, pageData);
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
    case "gisLake" :
      tbcHtml += "<tr><td>湖泊代码：</td><td>" + data.LK_CD + "</td></tr>";
      tbcHtml += "<tr><td>湖泊名称：</td><td>" + data.LK_NM + "</td></tr>";
      tbcHtml += "<tr><td>水面面积(km<sup>2</sup>)：</td><td>" + data.WAT_A + "</td></tr>";
      tbcHtml += "<tr><td>咸淡水属性：</td><td>" + data.SFW_PROP + "</td></tr>";
      tbcHtml += "<tr><td>平均水深(m)：</td><td>" + data.AVG_DEP + "</td></tr>";
      tbcHtml += "<tr><td>最大水深(m)：</td><td>" + data.MAX_DEP + "</td></tr>";
      tbcHtml += "<tr><td>湖泊容积(10<sup>6</sup>m<sup>3</sup>)：</td> <td>" + data.LK_V + "</td></tr>";
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
    case "gisCh":
      tbcHtml += "<tr><td>渠道工程代码：</td><td>" + data.CHAN_CD + "</td></tr>";
      tbcHtml += "<tr><td>渠道名称：</td><td>" + data.CHAN_NM + "</td></tr>";
      tbcHtml += "<tr><td>渠道级别：</td><td>" + data.CHAN_G + "</td></tr>";
      tbcHtml += "<tr><td>渠道设计流量(m<sup>3</sup>/s)：</td><td>" + data.CHAN_DES_Q + "</td></tr>";
      tbcHtml += "<tr><td>渗漏系数：</td><td>" + data.LEAK_R + "</td></tr>";
      tbcHtml += "<tr><td>渠道长度(m)：</td><td>" + data.CHAN_LEN + "</td></tr>";
      tbcHtml += "<tr><td>衬砌长度(m)：</td><td>" + data.LIN_LEN + "</td></tr>";
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
      tbcHtml += "<tr><td>装机容量：(kW)</td><td>" + data.INS_CAP + "</td></tr>";
      tbcHtml += "<tr><td>多年平均发电量(10<sup>4</sup>kW·h)：</td><td>" + data.AVG_EG + "</td></tr>";
      tbcHtml += "<tr><td>所在水库：</td><td>" + data.RES_NM + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisDitr" :
      tbcHtml += "<tr><td>引（调）水工程代码：</td><td>" + data.WDE_CD + "</td></tr>";
      tbcHtml += "<tr><td>引（调）水工程名称：</td><td>" + data.WDE_NM + "</td></tr>";
      tbcHtml += "<tr><td>地表水水源地：</td><td>" + data.SWS_NM + "</td></tr>";
      tbcHtml += "<tr><td>输水线路区：</td><td>" + data.LINE_A + "</td></tr>";
      tbcHtml += "<tr><td>输水干线总长(KM)：</td><td>" + data.TOT_LINE_LEN + "</td></tr>";
      tbcHtml += "<tr><td>受水区范围：</td><td>" + data.INTK_A + "</td></tr>";
      tbcHtml += "<tr><td>引调水方式：</td><td>" + data.WDE_TP + "</td></tr>";
      tbcHtml += "<tr><td>建设状况：</td><td>" + data.CONS_COND + "</td></tr>";
      tbcHtml += "<tr><td>设计引调水流量(m<sup>3</sup>/s)：</td><td>" + data.DES_WDE_Q + "</td></tr>";
      tbcHtml += "<tr><td>设计年引调水量(10<sup>6</sup>m<sup>3</sup>)：</td><td>" + data.DES_YR_DW + "</td></tr>";
      tb.html(tbcHtml);
      break;
    case "gisIrr" :
      tbcHtml += "<tr><td>灌区代码：</td><td>" + data.IRR_CD + "</td></tr>";
      tbcHtml += "<tr><td>灌区名称：</td><td>" + data.IRR_NM + "</td></tr>";
      tbcHtml += "<tr><td>灌区类型：</td><td>" + data.IRR_TP + "</td></tr>";
      tbcHtml += "<tr><td>灌区规模：</td><td>" + data.IRR_SCAL + "</td></tr>";
      tbcHtml += "<tr><td>设计灌溉面积：</td><td>" + data.DES_IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>总灌溉面积：</td><td>" + data.IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>耕地灌溉面积：</td><td>" + data.FIELD_IRR_A + "</td></tr>";
      tbcHtml += "<tr><td>运行状况：</td><td>" + data.RUN_COND + "</td></tr>";
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
    case "gisRiver" :
      tbcHtml += "<tr><td>河流代码：</td><td>" + data.RV_CD + "</td></tr>";
      tbcHtml += "<tr><td>河流名称：</td><td>" + data.RV_NM + "</td></tr>";
      tbcHtml += "<tr><td>河流等级：</td><td>" + data.RV_G + "</td></tr>";
      tbcHtml += "<tr><td>河流长度(千米)：</td><td>" + data.RV_LEN + "</td></tr>";
      tbcHtml += "<tr><td>河流平均比降：</td><td>" + data.RV_AG + "</td></tr>";
      tbcHtml += "<tr><td>是否为内流河：</td><td>" + data.IF_INN_RV + "</td></tr>";
      tb.html(tbcHtml);
      break;
  }
  $fatherDoc.find("#dialogWrapper").show();
}



