module.exports = function createArrow(info) {
  const el = document.createElement('div');
  const props = {
    class: info.className,
    style: `top:${info.topOffset}px`,
    title: info.tooltip,
    'data-diff-index': info.diffIndex,
  };
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  el.innerHTML = info.arrowContent;
  return el;
};
