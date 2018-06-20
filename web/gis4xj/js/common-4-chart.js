//创建者：DL
//创建目的：根据【查询结果数据】和不同参数动态构建满足Chart需要的数据类型
//创建时间：2018-06

/**
 * 利用结果集构建chart的categories和series属性值
 * @param dataList 结果集
 * @param keyValueArr 统计类别和统计项目，[["统计类别", "对应的字段值"],["统计项目1","对应的字段1"],["统计项目2","对应的字段2"]..]
 * @returns {Array}
 */
function cteateCategoriesAndSeries(dataList, keyValueArr){
  var _categories = [];
  var _series = [];
  var _nameData = {};
  for(var i = 1; i < keyValueArr.length; i++){
    if(keyValueArr.hasOwnProperty(i)){
      _nameData[keyValueArr[i][0]] = [];
    }
  }
  for(var j in dataList){
    if(dataList.hasOwnProperty(j)){
      _categories.push(dataList[j][keyValueArr[0][1]]);
      for(var k = 1; k < keyValueArr.length; k++){
        if(keyValueArr.hasOwnProperty(k)){
          _nameData[keyValueArr[k][0]].push(dataList[j][keyValueArr[k][1]]);
        }
      }
    }
  }
  for(var key in _nameData){
    if(_nameData.hasOwnProperty(key)){
      _series.push({name: key, data: _nameData[key]})
    }
  }
  return [_categories, _series];
}
