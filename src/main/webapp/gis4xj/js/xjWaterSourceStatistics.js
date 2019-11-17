//定义全局变量引用父页面Window和Document
// var $fatherWin = parent;
var $fatherDoc = $(window.parent.document);

//构建查询条件HTML
function createHtmlStatisticalCdt(ctlPrefix){
  //对象切换后则立即清除Overlays
  map.getOverlays().clear();
  //对象切换后则立清除查询结果
  $("#slRst>table").empty();
  $("#scRst").empty();

  var staCdt = "<label for=\"indexType\">" + "统计指标" + "：</label>";
  staCdt += "<select id=\"indexType\" type=\"text\">";
  staCdt += "<option value=\"pleaseSelect\">--请选择--</option>";
  var qtv = objConfig[ctlPrefix].statistics;
  for(var keyO in qtv){
    if(qtv.hasOwnProperty(keyO)){
      staCdt += "<option value=" + keyO + ">" + qtv[keyO] + "</option>";
    }
  }
  staCdt += "</select>&nbsp;&nbsp;";
  staCdt += "<label for=\"staPerspective\">" + "统计视角" + "：</label>";
  staCdt += "<select id=\"staPerspective\" type=\"text\">";
  staCdt += "<option value=\"pleaseSelect\">--请选择--</option>";
  staCdt += "<option value=\"GEO_CITY\">行政区</option>";
  staCdt += "<option value=\"GEO_BAST2ND\">流域</option>";
  staCdt += "<option value=\"GEO_WRZ2ND\">水资源分区</option>";
  staCdt += "</select>";
  staCdt += "<input id=\"staSubmit\" type=\"button\" value=\"查询\"/>";
  staCdt += "<input id=\"staExcel\" type=\"button\" value=\"导出\"/>";

  $("#staCdt").html(staCdt);
  activeFormBtn(ctlPrefix);
}

//激活查询条件中的按钮点击事件
function activeFormBtn(ctlPrefix){
  $("#staCdt>input[type=\"button\"]").click(function(){
    //统计指标
    var indexType = $("#indexType").val();
    //统计视角
    var staPerspective = $("#staPerspective").val();
    if("pleaseSelect" === indexType){
      alert("请选择统计指标");
      $("#indexType").focus();
      return false;
    }
    if("pleaseSelect" === staPerspective){
      alert("请选择统计视角");
      $("#staPerspective").focus();
      return false;
    }
    var cdtJson = {
      indexType: indexType,
      staPerspective: staPerspective
    };
    var btnType = $(this).attr("id");
    // alert(ctlPrefix + "--" + btnType);
    if("staSubmit" === btnType){
      formActionForSta(ctlPrefix, cdtJson);
    }else if("staExcel" === btnType){
      formActionForStaExcel(ctlPrefix, cdtJson);
    }
  });
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
        $("#scRst").empty();
        alert("服务错误，请联系管理员！");
        return false;
      }

      var staList = ds["staList"];
      var slHtml = createHtmlForStaResultList(ctlPrefix, cdtJson, staList);
      $("#slRst>table").html(slHtml);
      //激活查询列表结果中的点击事件（视情况开发）
      //activeQueryResultOperateDetailClick(ctlPrefix, staList);
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
  slHtml += "<thead><tr>";
  switch(cdtJson.staPerspective){
    case "GEO_CITY":
      slHtml += "<th>行政区</th>";
      break;
    case "GEO_BAST2ND":
      slHtml += "<th>流域</th>";
      break;
    case "GEO_WRZ2ND":
      slHtml += "<th>水资源分区</th>";
      break;
  }
  switch(ctlPrefix){
    case "gisPump":
      switch(cdtJson.indexType){
        case "0":
          slHtml += "<th>大（1）型</th>";
          slHtml += "<th>大（2）型</th>";
          slHtml += "<th>中型</th>";
          slHtml += "<th>小（1）型</th>";
          slHtml += "<th>小（2）型</th>";
          slHtml += "</tr></thead>";
          slHtml += "<tbody>";
          var gradeSum = [0, 0, 0, 0, 0];
          for(var i in staList){
            if(staList.hasOwnProperty(i)){
              slHtml += "<tr>";
              slHtml += "<td>" + staList[i].NM + "</td>";
              slHtml += "<td>" + staList[i].SO + "</td>";
              slHtml += "<td>" + staList[i].ST + "</td>";
              slHtml += "<td>" + staList[i].SH + "</td>";
              slHtml += "<td>" + staList[i].SF + "</td>";
              slHtml += "<td>" + staList[i].SI + "</td>";
              slHtml += "</tr>";
              gradeSum[0] += parseInt(staList[i].SO);
              gradeSum[1] += parseInt(staList[i].ST);
              gradeSum[2] += parseInt(staList[i].SH);
              gradeSum[3] += parseInt(staList[i].SF);
              gradeSum[4] += parseInt(staList[i].SI);
            }
          }
          slHtml += "<tr>";
          slHtml += "<td>合计</td>";
          slHtml += "<td>" + gradeSum[0] + "</td>";
          slHtml += "<td>" + gradeSum[1] + "</td>";
          slHtml += "<td>" + gradeSum[2] + "</td>";
          slHtml += "<td>" + gradeSum[3] + "</td>";
          slHtml += "<td>" + gradeSum[4] + "</td>";
          slHtml += "</tr>";
          slHtml += "</tbody>";
          break;
        case "1":
          slHtml += "<th>排水泵站</th>";
          slHtml += "<th>供水泵站</th>";
          slHtml += "<th>供排结合泵站</th>";
          slHtml += "</tr></thead>";
          slHtml += "<tbody>";
          var typeSum = [0, 0, 0];
          for(var j in staList){
            if(staList.hasOwnProperty(j)){
              slHtml += "<tr>";
              slHtml += "<td>" + staList[j].NM + "</td>";
              slHtml += "<td>" + staList[j].SO + "</td>";
              slHtml += "<td>" + staList[j].ST + "</td>";
              slHtml += "<td>" + staList[j].SH + "</td>";
              slHtml += "</tr>";
              typeSum[0] += parseInt(staList[j].SO);
              typeSum[1] += parseInt(staList[j].ST);
              typeSum[2] += parseInt(staList[j].SH);
            }
          }
          slHtml += "<tr>";
          slHtml += "<td>合计</td>";
          slHtml += "<td>" + typeSum[0] + "</td>";
          slHtml += "<td>" + typeSum[1] + "</td>";
          slHtml += "<td>" + typeSum[2] + "</td>";
          slHtml += "</tr>";
          slHtml += "</tbody>";
          break;
        case "2":
          slHtml += "<th>在用良好</th>";
          slHtml += "<th>在用故障</th>";
          slHtml += "<th>停用</th>";
          slHtml += "</tr></thead>";
          slHtml += "<tbody>";
          var staSum = [0, 0, 0];
          for(var k in staList){
            if(staList.hasOwnProperty(k)){
              slHtml += "<tr>";
              slHtml += "<td>" + staList[k].NM + "</td>";
              slHtml += "<td>" + staList[k].SO + "</td>";
              slHtml += "<td>" + staList[k].ST + "</td>";
              slHtml += "<td>" + staList[k].SH + "</td>";
              slHtml += "</tr>";
              staSum[0] += parseInt(staList[k].SO);
              staSum[1] += parseInt(staList[k].ST);
              staSum[2] += parseInt(staList[k].SH);
            }
          }
          slHtml += "<tr>";
          slHtml += "<td>合计</td>";
          slHtml += "<td>" + staSum[0] + "</td>";
          slHtml += "<td>" + staSum[1] + "</td>";
          slHtml += "<td>" + staSum[2] + "</td>";
          slHtml += "</tr>";
          slHtml += "</tbody>";
          break;
      }
      break;
    case "gisGateP":

      break;
    case "gisHypo":

      break;
    case "gisCws":

      break;
    case "gisPdo":

      break;
    case "gisWint":

      break;
    case "gisOther":
      break;
  }
  return slHtml;
}

//构建查询结果Chart的HTML
function createStaChart(ctlPrefix, cdtJson, staList){
  var _chartTitle = "";
  var _xTitle;
  var _yTitle;
  var _categories = [];
  var _series = [];

  switch(cdtJson.staPerspective){
    case "GEO_CITY":
      _chartTitle += "行政区划";
      _xTitle = "行政区划";
      break;
    case "GEO_BAST2ND":
      _chartTitle += "流域";
      _xTitle = "流域";
      break;
    case "GEO_WRZ2ND":
      _chartTitle += "水资源分区";
      _xTitle = "水资源分区";
      break;
  }
  _chartTitle += "视角下";

  switch(ctlPrefix){
    case "gisPump":
      _yTitle = "泵站工程个数";
      var _nameData;
      switch(cdtJson.indexType){
        case "0":
          _chartTitle += "泵站工程规模统计";
          _nameData = {"大（1）型": [], "大（2）型": [], "中型": [], "小（1）型": [], "小（2）型": []};
          for(var i in staList){
            if(staList.hasOwnProperty(i)){
              _categories.push(staList[i].NM);
              _nameData["大（1）型"].push(staList[i].SO);
              _nameData["大（2）型"].push(staList[i].ST);
              _nameData["中型"].push(staList[i].SH);
              _nameData["小（1）型"].push(staList[i].SF);
              _nameData["小（2）型"].push(staList[i].SI);
            }
          }
          break;
        case "1" :
          _chartTitle += "泵站工程类型统计";
          _nameData = {"排水泵站": [], "供水泵站": [], "供排结合泵站": []};
          for(var j in staList){
            if(staList.hasOwnProperty(j)){
              _categories.push(staList[j].NM);
              _nameData["排水泵站"].push(staList[j].SO);
              _nameData["供水泵站"].push(staList[j].ST);
              _nameData["供排结合泵站"].push(staList[j].SH);
            }
          }
          break;
        case "2":
          _chartTitle += "泵站工程运行状况统计";
          _nameData = {"在用良好": [], "在用故障": [], "停用": []};
          for(var k in staList){
            if(staList.hasOwnProperty(k)){
              _categories.push(staList[k].NM);
              _nameData["在用良好"].push(staList[k].SO);
              _nameData["在用故障"].push(staList[k].ST);
              _nameData["停用"].push(staList[k].SH);
            }
          }
          break;
      }
      for(var key in _nameData){
        if(_nameData.hasOwnProperty(key)){
          _series.push({name: key, data: _nameData[key]})
        }
      }
      break;
    case "gisGateP":
      switch(cdtJson.staPerspective){
        case "GEO_CITY":
          break;
        case "GEO_BAST2ND" :
          break;
        case "GEO_WRZ2ND":
          break;
      }
      break;
    case "gisHypo":

      break;
    case "gisCws":

      break;
    case "gisPdo":

      break;
    case "gisWint":

      break;
    case "gisOther":
      break;
  }
  Highcharts.chart('scRst', {
    chart: {
      type: 'column'
    },
    title: {
      text: _chartTitle
    },
    xAxis: {
      categories: _categories,
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
    series: _series
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
    /**
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
     break;*/
    case "other" :
      break;
  }
  $fatherDoc.find("#dialogWrapper").show();
}
