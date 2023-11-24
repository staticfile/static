module.exports = function throttle(callback, wait, immediate = false) {
  let timeout = null;
  let initialCall = true;

  return (...args) => {
    const callNow = immediate && initialCall;
    const next = () => {
      callback.apply(this, args);
      timeout = null;
    };

    if (callNow) {
      initialCall = false;
      next();
    }

    if (!timeout) {
      timeout = setTimeout(next, wait);
    }
  };
};
