function hasCssClass(el,cssClass) {
  return el.className.match(new RegExp('(\\s|^)' + cssClass + '(\\s|$)'));
}
function addCssClass(el,cssClass) {
  if (hasCssClass(el,cssClass)) { return false; }
  el.className = el.className + ' ' + cssClass;
  return true;
}
function removeCssClass(el,cssClass) {
  if (!hasCssClass(el,cssClass)) { return false; }
  var reg = new RegExp('(\\s|^)' + cssClass + '(\\s|$)');
  el.className = el.className.replace(reg,' ');
  return true;
}
function dragAndDropSupported() {
  var div = document.createElement('div');
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
}
