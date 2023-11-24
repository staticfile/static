function on(elSelector, eventName, selector, fn) {
  const element = (elSelector === 'document') ? document : document.querySelector(elSelector);

  element.addEventListener(eventName, (event) => {
    const possibleTargets = element.querySelectorAll(selector);
    const { target } = event;

    for (let i = 0, l = possibleTargets.length; i < l; i += 1) {
      let el = target;
      const p = possibleTargets[i];

      while (el && el !== element) {
        if (el === p) {
          fn.call(p, event);
        }
        el = el.parentNode;
      }
    }
  });
}

module.exports = {
  on,
};
