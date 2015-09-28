"function" == typeof window.__scriptCSS__ || (window.__scriptCSS__ = function(styleContent) {
  var styleNode = document.createElement("style");
  styleNode.setAttribute("type", "text/css");
  if(styleNode.styleSheet){
    styleNode.styleSheet.cssText = styleContent;
  }else{
    styleNode.appendChild(document.createTextNode(styleContent));
  }
  document.getElementsByTagName("head")[0].appendChild(styleNode);
});