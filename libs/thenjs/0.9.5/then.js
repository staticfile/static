'use strict';
/*global module, define, process, console*/

/**
 * then.js, version 0.9.5, 2013/11/17
 * Another very small asynchronous promise tool!
 * https://github.com/teambition/then.js, admin@zensh.com
 * License: MIT
 */

(function () {
    var TRUTH = {},
        slice = [].slice,
        isArray = Array.isArray,
        nextTick = typeof process === 'object' && process.nextTick ? process.nextTick : setTimeout;

    function NOOP() {}
    function isNull(obj) {
        return obj == null;
    }
    function isFunction(fn) {
        return typeof fn === 'function';
    }
    function getError(obj, method, type) {
        return new Error('Argument ' + obj.toString() + ' in "' + method + '" function is not a ' + type + '!');
    }
    function each(defer, array, iterator, context) {
        var i, end, total, resultArray = [];

        function next(index, err, result) {
            total -= 1;
            if (isNull(err)) {
                resultArray[index] = result;
                if (total <= 0) {
                    return defer(null, resultArray);
                }
            } else {
                return defer(err);
            }
        }

        next.nextThenObject = TRUTH;
        if (!isArray(array)) {
            return defer(getError(array, 'each', 'array'));
        } else if (!isFunction(iterator)) {
            return defer(getError(iterator, 'each', 'function'));
        } else {
            total = end = array.length;
            if (total) {
                for (i = 0; i < end; i++) {
                    iterator.call(context, next.bind(null, i), array[i], i, array);
                }
            } else {
                return defer(null, resultArray);
            }
        }
    }
    function eachSeries(defer, array, iterator, context) {
        var end, i = -1, resultArray = [];

        function next(err, result) {
            i += 1;
            if (isNull(err)) {
                resultArray[i - 1] = result;
                if (i < end) {
                    return iterator.call(context, next, array[i], i, array);
                } else {
                    delete resultArray[-1];
                    return defer(null, resultArray);
                }
            } else {
                return defer(err);
            }
        }

        next.nextThenObject = TRUTH;
        if (!isArray(array)) {
            return defer(getError(array, 'eachSeries', 'array'));
        } else if (!isFunction(iterator)) {
            return defer(getError(iterator, 'eachSeries', 'function'));
        } else {
            end = array.length;
            if (end) {
                return next();
            } else {
                return defer(null, resultArray);
            }
        }
    }
    function parallel(defer, array, context) {
        var i, end, total, resultArray = [];

        function next(index, err, result) {
            total -= 1;
            if (isNull(err)) {
                resultArray[index] = result;
                if (total <= 0) {
                    return defer(null, resultArray);
                }
            } else {
                return defer(err);
            }
        }

        next.nextThenObject = TRUTH;
        if (!isArray(array)) {
            return defer(getError(array, 'parallel', 'array'));
        } else {
            total = end = array.length;
            if (!total) {
                return defer(null, resultArray);
            } else {
                for (i = 0; i < end; i++) {
                    if (isFunction(array[i])) {
                        array[i].call(context, next.bind(null, i), i);
                    } else {
                        return defer(getError(array[i], 'parallel', 'function'));
                    }
                }
            }
        }
    }
    function series(defer, array, context) {
        var end, i = -1,
            resultArray = [];

        function next(err, result) {
            i += 1;
            if (isNull(err)) {
                resultArray[i - 1] = result;
                if (i < end) {
                    if (isFunction(array[i])) {
                        return array[i].call(context, next, i);
                    } else {
                        return defer(getError(array[i], 'series', 'function'));
                    }
                } else {
                    delete resultArray[-1];
                    return defer(null, resultArray);
                }
            } else {
                return defer(err);
            }
        }

        next.nextThenObject = TRUTH;
        if (!isArray(array)) {
            return defer(getError(array, 'series', 'array'));
        } else {
            end = array.length;
            if (end) {
                return next();
            } else {
                return defer(null, resultArray);
            }
        }
    }
    function tryNextTick(defer, fn) {
        nextTick(function () {
            try {
                fn();
            } catch (error) {
                defer(error);
            }
        });
    }
    function createHandler(defer, handler) {
        return isFunction(handler) ? handler.nextThenObject ? handler : handler.bind(null, defer) : null;
    }
    function closurePromise(debug) {
        var fail = [], chain = 0,
            Promise = function () {},
            prototype = Promise.prototype;

        function promiseFactory(fn, context) {
            var promise = new Promise(),
                defer = promise.defer.bind(promise);
            defer.nextThenObject = promise;
            fn(defer, context);
            return promise;
        }

        prototype.debug = !debug || isFunction(debug) ? debug :
            typeof console === 'object' && console.log && function () {
                console.log.apply(console, arguments);
            };
        prototype.all = function (allHandler) {
            return promiseFactory(function (defer, self) {
                self._all = createHandler(defer, allHandler);
            }, this);
        };
        prototype.then = function (successHandler, errorHandler) {
            return promiseFactory(function (defer, self) {
                self._success = createHandler(defer, successHandler);
                self._error = createHandler(defer, errorHandler);
            }, this);
        };
        prototype.fail = function (errorHandler) {
            return promiseFactory(function (defer, self) {
                self._fail = createHandler(defer, errorHandler);
                self._success = defer.bind(defer, null);
                if (self._fail) {
                    fail.push(self._fail);
                }
            }, this);
        };
        prototype.each = function (array, iterator, context) {
            return promiseFactory(function (defer, self) {
                self._each = function (dArray, dIterator, dContext) {
                    each(defer, array || dArray, iterator || dIterator, context || dContext);
                };
            }, this);
        };
        prototype.eachSeries = function (array, iterator, context) {
            return promiseFactory(function (defer, self) {
                self._eachSeries = function (dArray, dIterator, dContext) {
                    eachSeries(defer, array || dArray, iterator || dIterator, context || dContext);
                };
            }, this);
        };
        prototype.parallel = function (array, context) {
            return promiseFactory(function (defer, self) {
                self._parallel = function (dArray, dContext) {
                    parallel(defer, array || dArray, context || dContext);
                };
            }, this);
        };
        prototype.series = function (array, context) {
            return promiseFactory(function (defer, self) {
                self._series = function (dArray, dContext) {
                    series(defer, array || dArray, context || dContext);
                };
            }, this);
        };
        prototype.defer = function (err) {
            chain += 1;
            this._error = this._fail ? fail.shift() : this._error;
            this._success = this._success || this._each || this._eachSeries || this._parallel || this._series || NOOP;
            try {
                if (this.debug) {
                    var args = slice.call(arguments);
                    args.unshift('\nResult of chain ' + chain + ':');
                    this.debug.apply(this.debug, args);
                }
                if (this._all) {
                    this._all.apply(this._all.nextThenObject, slice.call(arguments));
                } else if (isNull(err)) {
                    this._success.apply(this._success.nextThenObject, slice.call(arguments, 1));
                } else {
                    throw err;
                }
            } catch (error) {
                if (this._error || fail.length) {
                    this._error = this._error || fail.shift();
                    this._error.call(this._error.nextThenObject, error);
                } else {
                    throw error;
                }
            } finally {
                this._all = NOOP;
            }
        };
        return promiseFactory;
    }
    function eachAndSeriesFactory(fn) {
        return function (array, iterator, context, debug) {
            return closurePromise(debug)(function (defer) {
                tryNextTick(defer, fn.bind(null, defer, array, iterator, context));
            });
        };
    }
    function parallelAndSeriesFactory(fn) {
        return function (array, context, debug) {
            return closurePromise(debug)(function (defer) {
                tryNextTick(defer, fn.bind(null, defer, array, context));
            });
        };
    }
    function thenjs(startFn, context, debug) {
        return closurePromise(debug)(function (defer) {
            tryNextTick(defer, isFunction(startFn) ? startFn.bind(context, defer) : defer);
        });
    }

    thenjs.each = eachAndSeriesFactory(each);
    thenjs.eachSeries = eachAndSeriesFactory(eachSeries);
    thenjs.parallel = parallelAndSeriesFactory(parallel);
    thenjs.series = parallelAndSeriesFactory(series);
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = thenjs;
    } else if (typeof define === 'function') {
        define(function () {
            return thenjs;
        });
    }
    if (typeof window === 'object') {
        window.then = thenjs;
    }
    return thenjs;
})();
