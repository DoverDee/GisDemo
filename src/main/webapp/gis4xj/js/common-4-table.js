//创建者：DL
//创建目的：根据【查询结果数据】和不同参数动态构建表格HTML标签字符串
//创建时间：2018-06
/**
 * 创建表头HTML
 * @param theadArr 表头名称数组
 * @param hasTheadTag 是否带thead标签
 * @returns {string}
 */
function createThead(theadArr, hasTheadTag){
  var _tHeadHtml = "";
  if(hasTheadTag){
    _tHeadHtml += "<thead>";
  }
  _tHeadHtml += "<tr>";
  for(var i in theadArr){
    if(theadArr.hasOwnProperty(i)){
      _tHeadHtml += "<th>" + theadArr[i] + "</th>";
    }
  }
  _tHeadHtml += "</tr>";
  if(hasTheadTag){
    _tHeadHtml += "</thead>";
  }
  return _tHeadHtml;
}

/**
 * 创建表体HTML,用于常规表格
 * @param tbodyList 表格List数据集
 * @param listKey list字段名称,数组
 * @param hasTbody 是否带有tbody标签,true or false
 * @param hasDetailTd 是否带有"详情"列,true or false，若为true则listKey[lastIndex]="操作"
 * @param dataValueKey 给tr标签data-value属性赋某些list字段值，是listKey的子集,数组
 * @param hasIndex 是否带索引序列,true or false，若为true则listKey[0]="序号"，若为false则不必为startIndex赋值
 * @param startIndex 索引序列，当hasIndex为true的情况下，默认始终从1开始，若赋值则应该为pageSize*pageNum+1；否则不带索引列
 * @returns {string}
 */
function createTbody(tbodyList, listKey, hasTbody, hasDetailTd, dataValueKey, hasIndex, startIndex){
  var _tbodyHtml = "";
  if(hasTbody){
    _tbodyHtml += "<body>";
  }
  for(var i in tbodyList){
    if(tbodyList.hasOwnProperty(i)){
      if(dataValueKey){
        var dvArr = [];
        for(var dvk in dataValueKey){
          if(dataValueKey.hasOwnProperty(dvk)){
            dvArr.push(tbodyList[i][dataValueKey[dvk]]);
          }
        }
        _tbodyHtml += "<tr data-values=" + dvArr.join(",") + ">";
      }else{
        _tbodyHtml += "<tr>";
      }

      if(hasIndex){
        if(startIndex){
          _tbodyHtml += "<td>" + (parseInt(i) + 1 + startIndex) + "</td>";
        }else{
          _tbodyHtml += "<td>" + (parseInt(i) + 1) + "</td>";
        }
      }

      for(var j in listKey){
        if(listKey.hasOwnProperty(j)){
          _tbodyHtml += "<td>" + tbodyList[i][listKey[j]] + "</td>";
        }
      }

      if(hasDetailTd){
        _tbodyHtml += "<td><span>详情</span></td>";
      }

      _tbodyHtml += "</tr>";
    }
  }
  if(hasTbody){
    _tbodyHtml += "</body>";
  }
  return _tbodyHtml;
}

/**
 * 创建表体HTML,专用于统计表格
 * @param tbodyList 表格List数据集
 * @param listKey list字段名称,数组
 * @param hasStaticTr 是否带有统计行,true or false
 * @param staticKey 需要统计的列名称，是listKey的子集,数组
 * @param hasIndex 是否带索引序列,true or false，若为true则thead的listKey[0]="序号"
 * @returns {string}
 */
function createTbodyForStatic(tbodyList, listKey, hasStaticTr, staticKey, hasIndex){
  var _tbodyHtml = "";
  var staticArr = [];
  for(var o in staticKey){
    if(staticKey.hasOwnProperty(o)){
      staticArr.push(0);
    }
  }
  _tbodyHtml += "<body>";
  for(var i in tbodyList){
    if(tbodyList.hasOwnProperty(i)){
      _tbodyHtml += "<tr>";
      if(hasIndex){
        _tbodyHtml += "<td>" + (parseInt(i) + 1) + "</td>";
      }
      for(var j in listKey){
        if(listKey.hasOwnProperty(j)){
          _tbodyHtml += "<td>" + tbodyList[i][listKey[j]] + "</td>";
        }
      }
      if(hasStaticTr){
        for(var k in staticKey){
          if(staticKey.hasOwnProperty(k)){
            staticArr[k] = parseInt(staticArr[k]) + parseInt(tbodyList[i][staticKey[k]]);
          }
        }
      }
      _tbodyHtml += "</tr>";
    }
  }
  if(hasStaticTr){
    _tbodyHtml += "<tr>";
    if(hasIndex){
      _tbodyHtml += "<td>/</td>";
    }
    _tbodyHtml += "<td>合计</td>";
    for(var sa in staticArr){
      if(staticArr.hasOwnProperty(sa)){
        _tbodyHtml += "<td>" + staticArr[sa] + "</td>";
      }
    }
    _tbodyHtml += "</tr>";
  }
  _tbodyHtml += "</body>";
  return _tbodyHtml;
}

/**
 * 创建表体HTML,专用于单条记录，像ul>li一样展示key/value
 * @param data 单行数据集
 * @param keyValueArr 字段名称和字段标识组成的二维数组,[[字段名称0,字段标识0],[字段名称1,字段标识1]..]
 * @param hasIndex 是否带索引序列,true or false，若为true则listKey[0]="序号"
 */
function createTbodyForLikeUlli(data, keyValueArr, hasIndex){
  var _tbodyHtml = "";
  _tbodyHtml += "<tbody>";
  for(var i in keyValueArr){
    if(keyValueArr.hasOwnProperty(i)){
      _tbodyHtml += "<tr>";
      if(hasIndex){
        _tbodyHtml += "<td>" + (parseInt(i) + 1) + "</td>";
      }
      _tbodyHtml += "<td>" + keyValueArr[i][0] + "</td>";
      _tbodyHtml += "<td>" + data[keyValueArr[i][1]] + "</td>";
      _tbodyHtml += "</tr>";
    }
  }
  _tbodyHtml += "</tbody>";
  return _tbodyHtml;
}