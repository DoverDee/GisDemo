//切换（二级）标签菜单选项卡样式
function switchSecondTabMenuStyle($this){
  var _index = $this.index();
  var $cs = $("#ContentSection");
  $this.addClass("beSelected").siblings().removeClass("beSelected");
  $cs.children("div").css("display", "none").eq(_index).css("display", "block");
  var $lis = $("#category>dl>dd li.beSelected");
  if($lis.length > 0){
    var _data = $lis.attr("data-values").split(";");
    if(_index === 1){
      $("#queryFrame")[0].contentWindow.createHtmlForQueryCdt(_data[3].trim());
    }else if(_index === 2){
      $("#staFrame")[0].contentWindow.createHtmlStatisticalCdt(_data[3].trim());
    }
  }
}