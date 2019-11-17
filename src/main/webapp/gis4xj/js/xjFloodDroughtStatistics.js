//定义全局变量引用父页面Window和Document
// var $fatherWin = parent;
var $fatherDoc = $(window.parent.document);

//对象切换清楚查询结果
function clearResult(){
  //对象切换后则立即清除Overlays
  map.getOverlays().clear();
  //对象切换后则立清除查询结果
  $("#slRst>table").empty();
  $("#staCRst").empty();
}

//数据库查询并动态构建查询结果的HTML元素
function formActionForSta(ctlPrefix, cdtJson){
  $.ajax({
    type: 'post',
    url: ctlPrefix + "/listAllObjForSta.do",
    data: cdtJson,
    success: function(ds){
      if($.isEmptyObject(ds)){
        $("#slRst>table").empty();
        $("#staCRst").empty();
        alert("服务错误，请联系管理员！");
        return false;
      }

      var staList = ds["staList"];
      $("#slRst>table").html(createHtmlForStaResultList(ctlPrefix, cdtJson, staList));
      createStaChart(ctlPrefix, cdtJson, staList);
      //构建查询图层之前先清除OverLayer
      map.getOverlays().clear();
      //构建带chart的Overlay
      addOverlayWithChart(ctlPrefix, cdtJson, staList, "xjmap:" + cdtJson.staPerspective);
    }
  });
}

//导出全部按条件查询的结果到Excel
function formActionForStaExcel(ctlPrefix, cdtJson){
  window.location.href = ctlPrefix + "/excelForSta.do?indexType=" + cdtJson.indexType + "&staPerspective=" + cdtJson.staPerspective;
}

//构建查询结果列表的HTML
function createHtmlForStaResultList(ctlPrefix, cdtJson, staList){
  var slHtml = "";
  var theadArr = "";
  var listKey = "";
  var staticKey = "";
  switch(cdtJson.indexType){
    case "0":
      theadArr = ["序号", "行政区", "雨量站", "河道水文站", "河道水位站", "水库水文站", "地下水站", "分洪水位站", "气象站", "蒸发站", "堰闸水文站", "潮位站", "泵站", "墒情站"];
      slHtml += createThead(theadArr, true);
      listKey = ["NM", "SO", "ST", "SH", "SF", "SI", "SS", "SE", "SG", "SN", "SV", "SL", "SW"];
      staticKey = ["SO", "ST", "SH", "SF", "SI", "SS", "SE", "SG", "SN", "SV", "SL", "SW"];
      slHtml += createTbodyForStatic(staList, listKey, true, staticKey, true);
      break;
    case "1":
      theadArr = ["序号", "行政区", "停止", "启用", "其他"];
      slHtml += createThead(theadArr, true);
      listKey = ["NM", "SO", "ST", "SR"];
      staticKey = ["SO", "ST", "SR"];
      slHtml += createTbodyForStatic(staList, listKey, true, staticKey, true);
      break;
  }
  return slHtml;
}

//构建查询结果Chart的HTML
function createStaChart(ctlPrefix, cdtJson, staList){
  var _chartTitle = "";
  var _xTitle;
  var _yTitle;
  var keyValueArr;
  var _cs;

  switch(cdtJson.staPerspective){
    case "address":
      _chartTitle += "行政区划";
      _xTitle = "行政区划";
      break;
  }
  _chartTitle += "视角下";
  var _nameData;
  switch(cdtJson.indexType){
    case "0":
      _yTitle = "测站类型个数";
      _chartTitle += "测站类型统计";
      keyValueArr = [["行政区划", "NM"], ["雨量站", "SO"], ["河道水文站", "ST"], ["河道水位站", "SH"],
        ["水库水文站", "SF"], ["地下水站", "SI"], ["分洪水位站", "SS"], ["气象站", "SE"], ["蒸发站", "SG"],
        ["堰闸水文站", "SN"], ["潮位站", "SV"], ["泵站", "SL"], ["墒情站", "SW"]];
      _cs = cteateCategoriesAndSeries(staList, keyValueArr);
      break;
    case "1" :
      _yTitle = "测站状态个数";
      _chartTitle += "测站状态统计";
      keyValueArr = [["行政区划", "NM"], ["停用", "SO"], ["启用", "ST"], ["其他", "SR"]];
      _cs = cteateCategoriesAndSeries(staList, keyValueArr);
      break;
  }

  Highcharts.chart('staCRst', {
    chart: {
      type: 'column'
    },
    title: {
      text: _chartTitle
    },
    xAxis: {
      categories: _cs[0],
      title: {
        text: _xTitle
      },
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: _yTitle
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}:</td>' +
      '<td style="padding:0"><b>{point.y: .0f} 个</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        borderWidth: 0
      }
    },
    series: _cs[1]
  });
}
