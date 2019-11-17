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
    //对象图层
    var layerObj = $categoryObj.attr("data-values").split(";")[2].trim();
    //对象类型，对应STTP字段值
    var objType = $categoryObj.attr("data-values").split(";")[3].trim();
    //GEO对象类型
    var geoType = $categoryObj.attr("data-values").split(";")[4].trim();
    //输入框值
    var inputVal = $("#sb").val();
    //行政区划值
    var addVal = $("#address").val();
    //河流值
    var riverVal = $("#river").val();
    //水系值
    var waterVal = $("#water").val();

    var cdtJson = {
      objType: objType,
      inputVal: inputVal,
      addVal: addVal,
      riverVal: riverVal,
      waterVal: waterVal
    };
    formActionForMap("gisStbprp", geoType, layerObj, cdtJson);
  }
}

//数据库查询并动态构建查询结果列表和图层
function formActionForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData){
  if(pageData){
    cdtJson.showCount = pageData["showCount"];
    cdtJson.totalPage = pageData["totalPage"];
    cdtJson.totalResult = pageData["totalResult"];
    cdtJson.currentPage = pageData["currentPage"];
    cdtJson.currentResult = pageData["currentResult"];
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
            _point = cdtList[i].LGTD + "," + cdtList[i].LTTD;
            _index = parseInt(i) + 1;
            _loc = typeof(cdtList[i].STLC) === "undefined" || !cdtList[i].STLC ? "--" : cdtList[i].STLC;
            _path = typeof(cdtList[i].IMG_PATH) === "undefined" || !cdtList[i].IMG_PATH ? "gis/image/img_default.png" : cdtList[i].IMG_PATH;
            resultHtml += "<li>";
            resultHtml += "<div><span class=\"toPoint\" data-values=" + _point + "><nobr><em>" + _index + "</em>" + cdtList[i].STNM + "</nobr></span>";
            resultHtml += "<span>站址：" + _loc + "</span></div>";
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
      activePaginationBarClickForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData);
      //构建Overlay和feature图层
      if(geoType === "point"){//点
        //数据库查询渲染图层（方式一）overlay
        addOverlayWithOrder(ctlPrefix, cdtList);
        //通过查询结果构建要素渲染图层（方式二）feature
        addPointByDB(ctlPrefix, cdtList);
      }else if(geoType === "line"){//线
        // addLine("xjmap:" + layerObj, ctlPrefix, cdtList);
      }else if(geoType === "polygon"){//面
        // addPolygon("xjmap:" + layerObj, ctlPrefix, cdtList);
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
function activePaginationBarClickForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData){
  //跳转到指定页
  $("#toPage").click(function(){
    var _pn = $("#pageNum").valueOf().val();
    // alert(_pn);
    pageData["currentPage"] = _pn;
    formActionForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData);
  });
  //跳转到下一页
  $("#toNext").click(function(){
    var _pn = $("#pageNum").valueOf().val();
    var _cpn = parseInt(_pn) + 1;
    if(_pn < pageData["totalPage"]){
      pageData["currentPage"] = _cpn;
      formActionForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData);
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
      formActionForMap(ctlPrefix, geoType, layerObj, cdtJson, pageData);
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
  tbcHtml += "<tr><td>测站编码</td><td>" + data.STCD + "</td></tr>";
  tbcHtml += "<tr><td>测站名称</td><td>" + data.STNM + "</td></tr>";
  tbcHtml += "<tr><td>河流名称</td><td>" + data.RVNM + "</td></tr>";
  tbcHtml += "<tr><td>水系名称</td><td>" + data.HNNM + "</td></tr>";
  tbcHtml += "<tr><td>流域名称</td><td>" + data.BSNM + "</td></tr>";
  tbcHtml += "<tr><td>经度<sup>°</sup></td><td>" + data.LGTD + "</td></tr>";
  tbcHtml += "<tr><td>纬度</td><td>" + data.LTTD + "</td></tr>";
  tbcHtml += "<tr><td>站址</td><td>" + data.STLC + "</td></tr>";
  tbcHtml += "<tr><td>行政区划码</td><td>" + data.ADDVCD + "</td></tr>";
  tbcHtml += "<tr><td>基面名称</td><td>" + data.DTMNM + "</td></tr>";
  tbcHtml += "<tr><td>基面高程</td><td>" + data.DTMEL + "</td></tr>";
  tbcHtml += "<tr><td>基面修正值</td><td>" + data.DTPR + "</td></tr>";
  tbcHtml += "<tr><td>站类</td><td>" + data.STTP + "</td></tr>";
  tbcHtml += "<tr><td>报汛等级</td><td>" + data.FRGRD + "</td></tr>";
  tbcHtml += "<tr><td>建站年月</td><td>" + data.ESSTYM + "</td></tr>";
  tbcHtml += "<tr><td>始报年月</td><td>" + data.BGFRYM + "</td></tr>";
  tbcHtml += "<tr><td>隶属行业单位</td><td>" + data.ATCUNIT + "</td></tr>";
  tbcHtml += "<tr><td>信息管理单位</td><td>" + data.ADMAUTH + "</td></tr>";
  tbcHtml += "<tr><td>交换管理单位</td><td>" + data.LOCALITY + "</td></tr>";
  tbcHtml += "<tr><td>测站岸别</td><td>" + data.STBK + "</td></tr>";
  tbcHtml += "<tr><td>测站方位</td><td>" + data.STAZT + "</td></tr>";
  tbcHtml += "<tr><td>至河口距离</td><td>" + data.DSTRVM + "</td></tr>";
  tbcHtml += "<tr><td>集水面积</td><td>" + data.DRNA + "</td></tr>";
  tbcHtml += "<tr><td>拼音码</td><td>" + data.PHCD + "</td></tr>";
  tbcHtml += "<tr><td>启用标志</td><td>" + data.USFL + "</td></tr>";

  tb.html(tbcHtml);
  $fatherDoc.find("#dialogWrapper").show();
}


