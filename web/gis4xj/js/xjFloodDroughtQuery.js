//定义全局变量引用父页面Window和Document
// var $fatherWin = parent;
var $fatherDoc = $(window.parent.document);

//激活查询条件中的按钮点击事件
function buildCdtAndSbumit(ctlPrefix){
  //对象切换后则立即初始化图层
  initialLayers();
  //对象切换后则立清除查询结果
  $("#qlRst>table").empty();
  $("#qlPagination>ul").empty();
  $("#qmRst>table").empty();
  $("#qmPagination>ul").empty();

  // 图层分类对象
  var $categoryObj = $fatherDoc.find("#category>dl>dd li.beSelected");
  if($categoryObj.length !== 1){
    alert("请选择并且仅选择一个查询对象");
    return false;
  }else{
    //对象图层
    var layerObj = $categoryObj.attr("data-values").split(";")[2].trim();
    //对象类型，对应STTP字段值
    var objType = $categoryObj.attr("data-values").split(";")[3].trim();
    //GEO对象类型
    var geoType = $categoryObj.attr("data-values").split(";")[4].trim();
    //对象名称
    var inputVal = $("#inputVal").val();
    //行政区划
    var addVal = $("#address").val();
    //河流
    var riverVal = $("#river").val();
    //水系
    var waterVal = $("#water").val();
    var cdtJson = {
      objType: objType,
      inputVal: inputVal,
      addVal: addVal,
      riverVal: riverVal,
      waterVal: waterVal
    };
    //提交查询
    formActionForQuery(ctlPrefix, geoType, layerObj, cdtJson);
  }
}

//数据库查询并动态构建查询结果的HTML元素
function formActionForQuery(ctlPrefix, geoType, layerObj, cdtJson, pageData){
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
        qlHtml = createHtmlForQueryResultList(ctlPrefix, cdtList, pageData);
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
      activePaginationBarClickForQuery(ctlPrefix, geoType, layerObj, cdtJson, pageData);
      //构建Overlay和feature图层
      if(geoType === "point"){//点
        //数据库查询渲染图层（方式一）
        addOverlayWithOrder(ctlPrefix, cdtList);
        //查询要素过滤渲染图层（方式二）
        addPointByDB(ctlPrefix, cdtList);
      }else if(geoType === "line"){//线
        // addLine("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else if(geoType === "polygon"){//面
        // addPolygon("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else{
        alert("查询对象类型异常！");
      }
    }
  });
}

//导出全部按条件查询的结果到Excel
function formActionForQueryExcel(ctlPrefix){
  // 图层分类对象
  var $categoryObj = $fatherDoc.find("#category>dl>dd li.beSelected");
  if($categoryObj.length !== 1){
    alert("请选择并且仅选择一个查询对象");
    return false;
  }
  //对象类型，对应STTP字段值
  var objType = $categoryObj.attr("data-values").split(";")[3].trim();
  //对象名称
  var inputVal = $("#inputVal").val();
  //行政区划
  var addVal = $("#address").val();
  //河流
  var riverVal = $("#river").val();
  //水系
  var waterVal = $("#water").val();
  window.location.href = ctlPrefix + "/excelForQuery.do?objType=" + objType
    + "&inputVal=" + inputVal + "&addVal=" + addVal + "&riverVal=" + riverVal + "&waterVal=" + waterVal;
}

//构建查询结果列表的HTML
function createHtmlForQueryResultList(ctlPrefix, cdtList, pageData){
  var _index = parseInt(pageData["showCount"]) * (parseInt(pageData["currentPage"]) - 1);
  var theadArr = ["序号", "测站名称", "河流名称", "水系名称", "流域名称", "站址", "隶属行业单位", "操作"];
  var listKey = ["STNM", "RVNM", "HNNM", "BSNM", "STLC", "ATCUNIT"];
  var dataValueKey = ["STCD"];
  var thead = createThead(theadArr, true);
  var tbody = createTbody(cdtList, listKey, true, true, dataValueKey, true, _index);
  return thead + tbody;
}

//构建查询结果列表对应地图列表的HTML
function createHtmlForQueryResultMap(ctlPrefix, cdtList){
  var theadArr = ["序号", "测站名称"];
  var listKey = ["STNM"];
  var dataValueKey = ["LGTD", "LTTD"];
  var thead = createThead(theadArr, true);
  var tbody = createTbody(cdtList, listKey, true, false, dataValueKey, true);
  return thead + tbody;
}

//激活查询列表操作列中的详细点击事件和对应地图列表行点击定位事件
function activeQueryResultOperateDetailClick(ctlPrefix){

  $("#qlRst>table>tbody>tr>td>span").click(function(){
    var _adcd = $(this).parent().parent().attr("data-values");
    showDialogForMap(ctlPrefix, _adcd);
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
  var tb = $fatherDoc.find("#baseInfo>table");
  var keyValueArr = [
    ["测站编码", "STCD"],
    ["测站名称", "STNM"],
    ["河流名称", "RVNM"],
    ["水系名称", "HNNM"],
    ["流域名称", "BSNM"],
    ["经度", "LGTD"],
    ["纬度", "LTTD"],
    ["站址", "STLC"],
    ["行政区划码", "ADDVCD"],
    ["基面名称", "DTMNM"],
    ["基面高程", "DTMEL"],
    ["基面修正值", "DTPR"],
    ["站类", "STTP"],
    ["报汛等级", "FRGRD"],
    ["建站年月", "ESSTYM"],
    ["始报年月", "BGFRYM"],
    ["隶属行业单位", "ATCUNIT"],
    ["信息管理单位", "ADMAUTH"],
    ["交换管理单位", "LOCALITY"],
    ["测站岸别", "STBK"],
    ["测站方位", "STAZT"],
    ["至河口距离", "DSTRVM"],
    ["集水面积", "DRNA"],
    ["拼音码", "PHCD"],
    ["启用标志", "USFL"]
  ];
  var tbcHtml = createTbodyForLikeUlli(data, keyValueArr);
  tb.html(tbcHtml);
  $fatherDoc.find("#dialogWrapper").show();
}



