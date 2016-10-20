(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Model = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.defineProperty = function (obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    };

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers.slicedToArray = function () {
      function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"]) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      return function (arr, i) {
        if (Array.isArray(arr)) {
          return arr;
        } else if (Symbol.iterator in Object(arr)) {
          return sliceIterator(arr, i);
        } else {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
      };
    }();

    babelHelpers.toConsumableArray = function (arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      } else {
        return Array.from(arr);
      }
    };

    babelHelpers;

    function camel2Hyphen(str) {
      return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^\-/, '');
    }

    function hyphen2Camel(str) {
      str = str.replace(/\-(\w{1})/g, function (match) {
        return match[1].toUpperCase();
      });
      return str.replace(/^(\w{1})/, function (m) {
        return m.toUpperCase();
      });
    }

    var nativeTypes = new Map([[String, 'string'], [Number, 'number'], [Boolean, 'boolean'], [Object, 'object'], [Array, 'array'], [Date, 'date'], [RegExp, 'regexp'], [Error, 'error']]);

    function checkNativeType(v) {
      return nativeTypes.has(v);
    }

    function nameOfNativeType(v) {
      return nativeTypes.has(v) ? nativeTypes.get(v) : null;
    }

    function detectNativeType(v) {
      // Fallbacks
      if (Array.isArray(v)) return Array;
      if (v instanceof Date) return Date;
      if (v instanceof RegExp) return RegExp;
      if (v instanceof Error) return Error;
      if (v instanceof (Map || Object)) return Map || Object;
      if (v instanceof (WeakMap || Object)) return WeakMap || Object;
      if (v instanceof (Set || Object)) return Set || Object;
      if (v instanceof (WeakSet || Object)) return WeakSet || Object;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nativeTypes.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tuple = _step.value;

          if (tuple[1] === (typeof v === 'undefined' ? 'undefined' : babelHelpers.typeof(v))) return tuple[0];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return Object;
    }

    function merge(target) {
      for (var _len = arguments.length, objs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objs[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var obj = _step2.value;

          var keys = Object.keys(obj);
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var key = _step3.value;

              if (obj.hasOwnProperty(key)) {
                target[key] = obj[key];
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return target;
    }

    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
    }
    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function (n) {
      if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    };

    EventEmitter.prototype.emit = function (type) {
      var er, handler, len, args, i, listeners;

      if (!this._events) this._events = {};

      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          }
          throw TypeError('Uncaught, unspecified "error" event.');
        }
      }

      handler = this._events[type];

      if (isUndefined(handler)) return false;

      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++) {
          listeners[i].apply(this, args);
        }
      }

      return true;
    };

    EventEmitter.prototype.addListener = function (type, listener) {
      var m;

      if (!isFunction(listener)) throw TypeError('listener must be a function');

      if (!this._events) this._events = {};

      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

      if (!this._events[type])
        // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;else if (isObject(this._events[type]))
        // If we've already got an array, just append.
        this._events[type].push(listener);else
        // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];

      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
          }
        }
      }

      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function (type, listener) {
      if (!isFunction(listener)) throw TypeError('listener must be a function');

      var fired = false;

      function g() {
        this.removeListener(type, g);

        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }

      g.listener = listener;
      this.on(type, g);

      return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function (type, listener) {
      var list, position, length, i;

      if (!isFunction(listener)) throw TypeError('listener must be a function');

      if (!this._events || !this._events[type]) return this;

      list = this._events[type];
      length = list.length;
      position = -1;

      if (list === listener || isFunction(list.listener) && list.listener === listener) {
        delete this._events[type];
        if (this._events.removeListener) this.emit('removeListener', type, listener);
      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener || list[i].listener && list[i].listener === listener) {
            position = i;
            break;
          }
        }

        if (position < 0) return this;

        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }

        if (this._events.removeListener) this.emit('removeListener', type, listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function (type) {
      var key, listeners;

      if (!this._events) return this;

      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }

      listeners = this._events[type];

      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        while (listeners.length) {
          this.removeListener(type, listeners[listeners.length - 1]);
        }
      }
      delete this._events[type];

      return this;
    };

    EventEmitter.prototype.listeners = function (type) {
      var ret;
      if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
      return ret;
    };

    EventEmitter.prototype.listenerCount = function (type) {
      if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
      }
      return 0;
    };

    EventEmitter.listenerCount = function (emitter, type) {
      return emitter.listenerCount(type);
    };

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isObject(arg) {
      return (typeof arg === 'undefined' ? 'undefined' : babelHelpers.typeof(arg)) === 'object' && arg !== null;
    }

    function isUndefined(arg) {
      return arg === void 0;
    }

    var Queue = function (_EventEmitter) {
      babelHelpers.inherits(Queue, _EventEmitter);

      function Queue() {
        babelHelpers.classCallCheck(this, Queue);

        var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Queue).call(this));

        _this.__queue = [];
        _this.running = false;
        return _this;
      }

      babelHelpers.createClass(Queue, [{
        key: 'push',
        value: function push(task, callback) {
          this.__queue.push({ task: task, callback: callback });

          return this;
        }
      }, {
        key: 'run',
        value: function run(running) {
          var _this2 = this;

          if (!running) if (this.running) return;

          var curr = this.__queue.shift();

          if (curr) {
            (function () {
              _this2.running = true;
              var task = curr.task;
              var callback = curr.callback;


              task().then(function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                callback.apply(undefined, [null].concat(args));
                _this2.run(_this2.running);
              }).catch(function (err) {
                callback(err);
                _this2.run(_this2.running);
              });
            })();
          } else {
            this.running = false;
            this.emit('idle');
          }

          return this;
        }
      }, {
        key: 'hasNext',
        get: function get() {
          return this.__queue.length !== 0;
        }
      }]);
      return Queue;
    }(EventEmitter);

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache();
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      return this.__data__['delete'](key);
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject$1(value) {
      var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
      return !!value && (type == 'object' || type == 'function');
    }

    var funcTag = '[object Function]';
    var genTag = '[object GeneratorFunction]';
    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto$2.toString;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction$1(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8 which returns 'object' for typed array and weak map constructors,
      // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
      var tag = isObject$1(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = Function.prototype.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return func + '';
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = Function.prototype.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

    /**
     * Checks if `value` is a native function.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     * @example
     *
     * _.isNative(Array.prototype.push);
     * // => true
     *
     * _.isNative(_);
     * // => false
     */
    function isNative(value) {
      if (!isObject$1(value)) {
        return false;
      }
      var pattern = isFunction$1(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = object[key];
      return isNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Checks if `value` is a global object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {null|Object} Returns `value` if it's a global object, else `null`.
     */
    function checkGlobal(value) {
      return value && value.Object === Object ? value : null;
    }

    /** Used to determine if values are of the language type `Object`. */
    var objectTypes = {
      'function': true,
      'object': true
    };

    /** Detect free variable `exports`. */
    var freeExports = objectTypes[typeof exports === 'undefined' ? 'undefined' : babelHelpers.typeof(exports)] && exports && !exports.nodeType ? exports : undefined;

    /** Detect free variable `module`. */
    var freeModule = objectTypes[typeof module === 'undefined' ? 'undefined' : babelHelpers.typeof(module)] && module && !module.nodeType ? module : undefined;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = checkGlobal(freeExports && freeModule && (typeof global === 'undefined' ? 'undefined' : babelHelpers.typeof(global)) == 'object' && global);

    /** Detect free variable `self`. */
    var freeSelf = checkGlobal(objectTypes[typeof self === 'undefined' ? 'undefined' : babelHelpers.typeof(self)] && self);

    /** Detect free variable `window`. */
    var freeWindow = checkGlobal(objectTypes[typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)] && window);

    /** Detect `this` as the global object. */
    var thisGlobal = checkGlobal(objectTypes[babelHelpers.typeof(this)] && this);

    /**
     * Used as a reference to the global object.
     *
     * The `this` value is used if it's the global object to avoid Greasemonkey's
     * restricted `window` object, otherwise the `window` object is used.
     */
    var root = freeGlobal || freeWindow !== (thisGlobal && thisGlobal.window) && freeWindow || freeSelf || thisGlobal || Function('return this')();

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash(),
        'map': new (Map$1 || ListCache)(),
        'string': new Hash()
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
        cache = this.__data__ = new MapCache(cache.__data__);
      }
      cache.set(key, value);
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values ? values.length : 0;

      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var UNORDERED_COMPARE_FLAG = 1;
    var PARTIAL_COMPARE_FLAG$1 = 2;
    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$1,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = bitmask & UNORDERED_COMPARE_FLAG ? new SetCache() : undefined;

      stack.set(array, other);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function (othValue, othIndex) {
            if (!seen.has(othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      return result;
    }

    /** Built-in value references. */
    var _Symbol = root.Symbol;

    /** Built-in value references. */
    var Uint8Array = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function (value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function (value) {
        result[++index] = value;
      });
      return result;
    }

    var UNORDERED_COMPARE_FLAG$1 = 1;
    var PARTIAL_COMPARE_FLAG$2 = 2;
    var boolTag = '[object Boolean]';
    var dateTag = '[object Date]';
    var errorTag = '[object Error]';
    var mapTag = '[object Map]';
    var numberTag = '[object Number]';
    var regexpTag = '[object RegExp]';
    var setTag = '[object Set]';
    var stringTag = '[object String]';
    var symbolTag = '[object Symbol]';
    var arrayBufferTag = '[object ArrayBuffer]';
    var dataViewTag = '[object DataView]';
    var symbolProto = _Symbol ? _Symbol.prototype : undefined;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
          // Coerce dates and booleans to numbers, dates to milliseconds and
          // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
          // not equal.
          return +object == +other;

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case numberTag:
          // Treat `NaN` vs. `NaN` as equal.
          return object != +object ? other != +other : object == +other;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == other + '';

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & PARTIAL_COMPARE_FLAG$2;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= UNORDERED_COMPARE_FLAG$1;
          stack.set(object, other);

          // Recursively compare objects (susceptible to call stack limits).
          return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetPrototype = Object.getPrototypeOf;

    /**
     * Gets the `[[Prototype]]` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {null|Object} Returns the `[[Prototype]]`.
     */
    function getPrototype(value) {
      return nativeGetPrototype(Object(value));
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHas(object, key) {
      // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
      // that are composed entirely of index properties, return `false` for
      // `hasOwnProperty` checks of them.
      return hasOwnProperty$4.call(object, key) || (typeof object === 'undefined' ? 'undefined' : babelHelpers.typeof(object)) == 'object' && key in object && getPrototype(object) === null;
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = Object.keys;

    /**
     * The base implementation of `_.keys` which doesn't skip the constructor
     * property of prototypes or treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      return nativeKeys(Object(object));
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function (object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a
     * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
     * Safari on at least iOS 8.1-8.3 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */
    var getLength = baseProperty('length');

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length,
     *  else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(getLength(value)) && !isFunction$1(value);
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) == 'object';
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]';

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$1 = objectProto$6.toString;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty$5.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString$1.call(value) == argsTag$1);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @type {Function}
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /** `Object#toString` result references. */
    var stringTag$1 = '[object String]';

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$2 = objectProto$7.toString;

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' || !isArray(value) && isObjectLike(value) && objectToString$2.call(value) == stringTag$1;
    }

    /**
     * Creates an array of index keys for `object` values of arrays,
     * `arguments` objects, and strings, otherwise `null` is returned.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array|null} Returns index keys, else `null`.
     */
    function indexKeys(object) {
      var length = object ? object.length : undefined;
      if (isLength(length) && (isArray(object) || isString(object) || isArguments(object))) {
        return baseTimes(length, String);
      }
      return null;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$8;

      return value === proto;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      var isProto = isPrototype(object);
      if (!(isProto || isArrayLike(object))) {
        return baseKeys(object);
      }
      var indexes = indexKeys(object),
          skipIndexes = !!indexes,
          result = indexes || [],
          length = result.length;

      for (var key in object) {
        if (baseHas(object, key) && !(skipIndexes && (key == 'length' || isIndex(key, length))) && !(isProto && key == 'constructor')) {
          result.push(key);
        }
      }
      return result;
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG$3 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$3,
          objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : baseHas(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise$1 = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set$1 = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap$1 = getNative(root, 'WeakMap');

    var mapTag$1 = '[object Map]';
    var objectTag$1 = '[object Object]';
    var promiseTag = '[object Promise]';
    var setTag$1 = '[object Set]';
    var weakMapTag = '[object WeakMap]';
    var dataViewTag$1 = '[object DataView]';

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$3 = objectProto$9.toString;

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map$1);
    var promiseCtorString = toSource(Promise$1);
    var setCtorString = toSource(Set$1);
    var weakMapCtorString = toSource(WeakMap$1);
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function getTag(value) {
      return objectToString$3.call(value);
    }

    // Fallback for data views, maps, sets, and weak maps in IE 11,
    // for data views in Edge, and promises in Node.js.
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1 || Map$1 && getTag(new Map$1()) != mapTag$1 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$1 || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag) {
      getTag = function getTag(value) {
        var result = objectToString$3.call(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag$1;
            case mapCtorString:
              return mapTag$1;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag$1;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    var argsTag$2 = '[object Arguments]';
    var arrayTag$1 = '[object Array]';
    var boolTag$1 = '[object Boolean]';
    var dateTag$1 = '[object Date]';
    var errorTag$1 = '[object Error]';
    var funcTag$1 = '[object Function]';
    var mapTag$2 = '[object Map]';
    var numberTag$1 = '[object Number]';
    var objectTag$2 = '[object Object]';
    var regexpTag$1 = '[object RegExp]';
    var setTag$2 = '[object Set]';
    var stringTag$2 = '[object String]';
    var weakMapTag$1 = '[object WeakMap]';
    var arrayBufferTag$1 = '[object ArrayBuffer]';
    var dataViewTag$2 = '[object DataView]';
    var float32Tag = '[object Float32Array]';
    var float64Tag = '[object Float64Array]';
    var int8Tag = '[object Int8Array]';
    var int16Tag = '[object Int16Array]';
    var int32Tag = '[object Int32Array]';
    var uint8Tag = '[object Uint8Array]';
    var uint8ClampedTag = '[object Uint8ClampedArray]';
    var uint16Tag = '[object Uint16Array]';
    var uint32Tag = '[object Uint32Array]';
    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$2] = typedArrayTags[weakMapTag$1] = false;

    /** Used for built-in method references. */
    var objectProto$10 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$4 = objectProto$10.toString;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    function isTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString$4.call(value)];
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG = 2;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';
    var arrayTag = '[object Array]';
    var objectTag = '[object Object]';
    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = getTag$1(object);
        objTag = objTag == argsTag ? objectTag : objTag;
      }
      if (!othIsArr) {
        othTag = getTag$1(other);
        othTag = othTag == argsTag ? objectTag : othTag;
      }
      var objIsObj = objTag == objectTag && !isHostObject(object),
          othIsObj = othTag == objectTag && !isHostObject(other),
          isSameTag = objTag == othTag;

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
      }
      if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {boolean} [bitmask] The bitmask of comparison flags.
     *  The bitmask may be composed of the following flags:
     *     1 - Unordered comparison
     *     2 - Partial comparison
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, bitmask, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObject$1(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are **not** supported.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent,
     *  else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    /** `Object#toString` result references. */
    var numberTag$2 = '[object Number]';

    /** Used for built-in method references. */
    var objectProto$11 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$5 = objectProto$11.toString;

    /**
     * Checks if `value` is classified as a `Number` primitive or object.
     *
     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
     * classified as numbers, use the `_.isFinite` method.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isNumber(3);
     * // => true
     *
     * _.isNumber(Number.MIN_VALUE);
     * // => true
     *
     * _.isNumber(Infinity);
     * // => true
     *
     * _.isNumber('3');
     * // => false
     */
    function isNumber$1(value) {
      return typeof value == 'number' || isObjectLike(value) && objectToString$5.call(value) == numberTag$2;
    }

    /** `Object#toString` result references. */
    var boolTag$2 = '[object Boolean]';

    /** Used for built-in method references. */
    var objectProto$12 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$6 = objectProto$12.toString;

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isBoolean(false);
     * // => true
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false || isObjectLike(value) && objectToString$6.call(value) == boolTag$2;
    }

    var BaseIndexer = function (_EventEmitter) {
      babelHelpers.inherits(BaseIndexer, _EventEmitter);

      function BaseIndexer(sequence, prefix, key, min) {
        babelHelpers.classCallCheck(this, BaseIndexer);

        var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BaseIndexer).call(this));

        _this.sequence = sequence;
        _this.prefix = prefix;
        _this.key = key;
        _this.__min = min;
        _this.ready = false;
        return _this;
      }

      babelHelpers.createClass(BaseIndexer, [{
        key: 'map',
        value: function map() {
          var _this2 = this;

          this.__min.exists(this.sequence).then(function (exists) {
            if (exists) {
              return _this2.__min.smembers(_this2.sequence);
            } else {
              return Promise.resolve([]);
            }
          }).then(function (keys) {
            var multi = _this2.__min.multi();

            keys.forEach(function (key) {
              return multi.hget(_this2.prefix + ':' + key, _this2.key);
            });

            return multi.exec().then(function (values) {
              return Promise.resolve(values.map(function (val, i) {
                return [keys[i], val];
              }));
            });
          }).then(function (tuples) {
            return Promise.all(tuples.map(function (_ref) {
              var _ref2 = babelHelpers.slicedToArray(_ref, 2);

              var key = _ref2[0];
              var val = _ref2[1];

              var multi = _this2.__min.multi();

              var rtn = _this2.indexMapper(val);
              if (isArray(rtn)) {
                var indexes = rtn;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = indexes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var index = _step.value;

                    multi.sadd(_this2.sequence + ':' + _this2.key + ':index:' + index, key);
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                return multi.exec();
              } else if (isPromise(rtn)) {
                return rtn.then(function (indexes) {
                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                    for (var _iterator2 = indexes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                      var _index = _step2.value;

                      multi.sadd(_this2.sequence + ':' + _this2.key + ':index:' + _index, key);
                    }
                  } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                      }
                    } finally {
                      if (_didIteratorError2) {
                        throw _iteratorError2;
                      }
                    }
                  }

                  return multi.exec();
                });
              }
            }));
          }).then(function () {
            _this2.ready = true;
            _this2.emit('ready');
          });
        }
      }, {
        key: 'add',
        value: function add(key, val) {
          var _this3 = this;

          return new Promise(function (resolve, reject) {
            var rtn = _this3.indexMapper(val);

            if (isArray(rtn)) {
              resolve(rtn);
            } else if (isPromise(rtn)) {
              rtn.then(resolve).catch(reject);
            }
          }).then(function (indexes) {
            var multi = _this3.__min.multi();

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = indexes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var index = _step3.value;

                multi.sadd(_this3.sequence + ':' + _this3.key + ':index:' + index, key);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            return multi.exec();
          });
        }
      }, {
        key: 'remove',
        value: function remove(key, val) {
          var _this4 = this;

          return new Promise(function (resolve, reject) {
            var rtn = _this4.indexMapper(val);

            if (isArray(rtn)) {
              resolve(rtn);
            } else if (isPromise(rtn)) {
              return rtn.then(resolve).catch(reject);
            }
          }).then(function (indexes) {
            var multi = _this4.__min.multi();

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = indexes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var index = _step4.value;

                multi.srem(_this4.sequence + ':' + _this4.key + ':index:' + index, key);
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }

            return multi.exec();
          });
        }
      }, {
        key: 'reindex',
        value: function reindex(key, newValue, oldValue) {
          var _this5 = this;

          return this.remove(key, oldValue).then(function () {
            return _this5.add(key, newValue);
          }).then(function () {
            _this5.emit('updated');

            return Promise.resolve();
          }).catch(function (err) {
            return console.warn('[min-model WARN] ' + err.message);
          });
        }
      }, {
        key: '_search',
        value: function _search(query) {
          var _this6 = this;

          var chainData = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

          return new Promise(function (resolve, reject) {
            var rtn = _this6.indexMapper(query);

            if (isArray(rtn)) {
              resolve(rtn);
            } else if (isPromise(rtn)) {
              rtn.then(function (data) {
                resolve(data);
              }).catch(reject);
            }
          }).then(function (indexes) {
            return Promise.all(indexes.map(function (index) {
              return _this6.__min.exists(_this6.sequence + ':' + _this6.key + ':index:' + index).then(function (exists) {
                if (exists) {
                  return _this6.__min.smembers(_this6.sequence + ':' + _this6.key + ':index:' + index);
                } else {
                  return Promise.resolve([]);
                }
              }).then(function (keys) {
                return Promise.resolve(new Set(keys));
              });
            }));
          }).then(function (keys) {
            var intersect = intersection.apply(undefined, babelHelpers.toConsumableArray(keys));

            return new Promise(function (resolve) {
              if (chainData) {
                resolve(chainData.map(function (item) {
                  return [item._key, item];
                }));
              } else {
                _this6.__min.smembers(_this6.sequence).then(function (_keys) {
                  var multi = _this6.__min.multi();

                  _keys.forEach(function (id) {
                    return multi.hgetall(_this6.prefix + ':' + id);
                  });

                  return multi.exec().then(function (values) {
                    return Promise.resolve(values.map(function (val, i) {
                      return [_keys[i], val];
                    }));
                  });
                }).then(function (v) {
                  return resolve(v);
                });
              }
            }).then(function (data) {
              return Promise.resolve([data, intersect]);
            });
          }).then(function (_ref3) {
            var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

            var data = _ref4[0];
            var intersect = _ref4[1];
            return Promise.resolve(data.filter(function (_ref5) {
              var _ref6 = babelHelpers.slicedToArray(_ref5, 1);

              var key = _ref6[0];
              return intersect.has(key);
            }).map(function (_ref7) {
              var _ref8 = babelHelpers.slicedToArray(_ref7, 2);

              var key = _ref8[0];
              var item = _ref8[1];

              item._key = key;
              return item;
            }));
          });
        }
      }, {
        key: 'search',
        value: function search() {
          return this._search.apply(this, arguments);
        }
      }, {
        key: 'indexMapper',
        value: function indexMapper() {
          // Need to be overwrite
          return [];
        }
      }]);
      return BaseIndexer;
    }(EventEmitter);

    function intersection(set) {
      var ret = new Set();

      for (var _len = arguments.length, sets = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sets[_key - 1] = arguments[_key];
      }

      if (sets.length === 0) return set;

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        var _loop = function _loop() {
          var elem = _step5.value;

          if (sets.map(function (set) {
            return set.has(elem) ? 0 : 1;
          }).reduce(function (a, b) {
            return a + b;
          }) == 0) {
            ret.add(elem);
          }
        };

        for (var _iterator5 = set[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return ret;
    }

    function isPromise(obj) {
      return isFunction$1(obj.then) && isFunction$1(obj.catch);
    }

    var StringIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(StringIndexer, _BaseIndexer);

      function StringIndexer() {
        babelHelpers.classCallCheck(this, StringIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(StringIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(StringIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(str) {
          var set = new Set(str.split(/[\s,\.;\:"'!]/).filter(Boolean).map(function (s) {
            return s.toLowerCase();
          }));

          return [].concat(babelHelpers.toConsumableArray(set));
        }
      }]);
      return StringIndexer;
    }(BaseIndexer);

    var NumberIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(NumberIndexer, _BaseIndexer);

      function NumberIndexer() {
        babelHelpers.classCallCheck(this, NumberIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(NumberIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(NumberIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(number) {
          return [number % 3, number % 5, number % 7];
        }
      }, {
        key: 'search',
        value: function search(query, chainData) {
          var _this2 = this;

          return this._search(query, chainData).then(function (result) {
            return Promise.resolve(result.filter(function (item) {
              return item[_this2.key] === query;
            }));
          });
        }
      }]);
      return NumberIndexer;
    }(BaseIndexer);

    var BooleanIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(BooleanIndexer, _BaseIndexer);

      function BooleanIndexer() {
        babelHelpers.classCallCheck(this, BooleanIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(BooleanIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(BooleanIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(bool) {
          return [bool];
        }
      }]);
      return BooleanIndexer;
    }(BaseIndexer);

    var ObjectIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(ObjectIndexer, _BaseIndexer);

      function ObjectIndexer() {
        babelHelpers.classCallCheck(this, ObjectIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ObjectIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(ObjectIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(obj) {
          return Object.keys(obj).map(function (key) {
            return [key, JSON.stringify(obj[key])];
          }).reduce(function (a, b) {
            return a.concat(b);
          });
        }
      }]);
      return ObjectIndexer;
    }(BaseIndexer);

    var ArrayIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(ArrayIndexer, _BaseIndexer);

      function ArrayIndexer() {
        babelHelpers.classCallCheck(this, ArrayIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ArrayIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(ArrayIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(array) {
          return array.map(function (el) {
            return JSON.stringify(el);
          });
        }
      }]);
      return ArrayIndexer;
    }(BaseIndexer);

    var DateIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(DateIndexer, _BaseIndexer);

      function DateIndexer() {
        babelHelpers.classCallCheck(this, DateIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(DateIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(DateIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(date) {
          return [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCDay()];
        }
      }, {
        key: 'search',
        value: function search(query, chainData) {
          return this._search(query, chainData).then(function (result) {
            return Promise.resolve(query.filter(function (date) {
              return date.getTime() === query.getTime();
            }));
          });
        }
      }]);
      return DateIndexer;
    }(BaseIndexer);

    var ErrorIndexer = function (_BaseIndexer) {
      babelHelpers.inherits(ErrorIndexer, _BaseIndexer);

      function ErrorIndexer() {
        babelHelpers.classCallCheck(this, ErrorIndexer);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ErrorIndexer).apply(this, arguments));
      }

      babelHelpers.createClass(ErrorIndexer, [{
        key: 'indexMapper',


        // Overwrite ::indexMapper
        value: function indexMapper(error) {
          var set = new Set(error.message.split(/[\s,\.;\:"'!]/).filter(Boolean).map(function (s) {
            return s.toLowerCase();
          }));

          return [].concat(babelHelpers.toConsumableArray(set));
        }
      }]);
      return ErrorIndexer;
    }(BaseIndexer);

    function PendingSearchResult(promise, context) {
      var _promise = createPromise();
      var emitter = new EventEmitter();

      _promise.search = function (key, query) {
        return PendingSearchResult(new Promise(function (resolve, reject) {
          emitter.once('ready', function (value) {
            context.search(key, query, value, context).then(resolve).catch(reject);
          });
        }), context);
      };

      promise.then(function (value) {
        _promise.resolve(value);
        emitter.emit('ready', value);
      });

      return _promise;
    }

    function createPromise() {
      var resolve = null;
      var reject = null;

      var promise = new Promise(function (_1, _2) {
        resolve = _1;
        reject = _2;
      });
      promise.resolve = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        resolve.apply(promise, args);
      };
      promise.reject = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        reject.apply(promise, args);
      };

      return promise;
    }

    var typesMap = new Map([['string', StringIndexer], [String, StringIndexer], ['number', NumberIndexer], [Number, NumberIndexer], ['boolean', BooleanIndexer], [Boolean, BooleanIndexer], ['object', ObjectIndexer], [Object, ObjectIndexer], ['array', ArrayIndexer], [Array, ArrayIndexer], ['date', DateIndexer], [Date, DateIndexer], ['error', ErrorIndexer], [Error, ErrorIndexer]]);

    var keysMap = new Map();

    var Index = function (_EventEmitter) {
      babelHelpers.inherits(Index, _EventEmitter);

      function Index(sequence, prefix, key, type, min) {
        babelHelpers.classCallCheck(this, Index);

        var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Index).call(this));

        _this.sequence = sequence;
        _this.prefix = prefix;
        _this.key = key;
        _this.type = type;
        _this.ready = false;
        _this.indexer = null;

        switch (true) {
          case keysMap.has(sequence + ':' + key):
            _this.indexer = new (keysMap.get(sequence + ':' + key))(sequence, prefix, key, min);
            break;

          case typesMap.has(type):
            _this.indexer = new (typesMap.get(type))(sequence, prefix, key, min);
            break;

          default:
            throw new Error('Not support for this type.');
        }

        _this.indexer.map();
        _this.indexer.on('ready', function () {
          _this.ready = true;
          _this.emit('ready');
        }).on('updated', function () {
          return _this.emit('updated');
        });
        return _this;
      }

      babelHelpers.createClass(Index, [{
        key: 'add',
        value: function add(key, val) {
          var _this2 = this;

          if (!this.indexer) throw new ReferenceError('There not indexer available.');

          if (!this.ready) {
            return new Promise(function (resolve, reject) {
              _this2.indexer.once('ready', function () {
                _this2.indexer.add(key, val).then(resolve).catch(reject);
              });
            });
          }

          return this.indexer.add(key, val);
        }
      }, {
        key: 'remove',
        value: function remove(key, val) {
          var _this3 = this;

          if (!this.indexer) throw new ReferenceError('There not indexer available.');

          if (!this.ready) {
            return new Promise(function (resolve, reject) {
              _this3.indexer.once('ready', function () {
                _this3.indexer.remove(key, val).then(resolve).catch(reject);
              });
            });
          }

          return this.indexer.remove(key, val);
        }
      }, {
        key: 'reindex',
        value: function reindex(key, newValue, oldValue) {
          var _this4 = this;

          if (!this.indexer) throw new ReferenceError('There not indexer available.');

          if (!this.ready) {
            return new Promise(function (resolve, reject) {
              _this4.indexer.once('ready', function () {
                _this4.indexer.reindex(key, newValue, oldValue).then(resolve).catch(reject);
              });
            });
          }

          return this.indexer.reindex(key, newValue, oldValue);
        }
      }, {
        key: 'search',
        value: function search(query) {
          var _this5 = this;

          var chainData = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
          var context = arguments[2];

          if (!this.indexer) throw new ReferenceError('There not indexer available.');

          if (!this.ready) {
            return PendingSearchResult(new Promise(function (resolve, reject) {
              _this5.indexer.once('ready', function () {
                _this5.indexer.search(query, chainData).then(resolve).catch(reject);
              });
            }), context);
          }

          return PendingSearchResult(this.indexer.search(query, chainData), context);
        }
      }]);
      return Index;
    }(EventEmitter);

    function setIndexer(type, indexerCtor) {
      typesMap.set(type, indexerCtor);
      typesMap.set(nameOfNativeType(type), indexerCtor);
    }

    function setIndexerForColumn(key, indexerCtor) {
      keysMap.set(key, indexerCtor);
    }

    var prefixSymbol = Symbol('prefix');
    var sequenceSymbol = Symbol('sequence');
    var cacheSymbol = Symbol('cache');
    var indexersSymbol = Symbol('indexers');

    var Model = function (_EventEmitter) {
      babelHelpers.inherits(Model, _EventEmitter);
      babelHelpers.createClass(Model, null, [{
        key: 'use',


        // Set the using MinDB instance
        value: function use(min) {
          this.__min = min;
        }
      }, {
        key: 'setIndexer',
        value: function setIndexer$$(type, indexerCtor) {
          setIndexer(type, indexerCtor);
        }
      }, {
        key: 'setIndexerForColumn',
        value: function setIndexerForColumn$$(key, indexerCtor) {
          setIndexerForColumn(this.sequence + ':' + key, indexerCtor);
        }

        // Create a new Model class

      }, {
        key: 'extend',
        value: function extend(name, columns) {
          var _privates;

          if (name && !columns) {
            throw new Error('Model.extend() should receive 2 arguments, but received 1.');
          }

          if (!isString(name) && !columns) {
            throw new Error('Model.extend() first argument must be a string.');
          }

          var privates = (_privates = {}, babelHelpers.defineProperty(_privates, prefixSymbol, camel2Hyphen(name)), babelHelpers.defineProperty(_privates, sequenceSymbol, camel2Hyphen(name) + 's'), _privates);

          var validateData = {};
          var defaultData = {};
          var methods = {};

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.keys(columns)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var column = _step.value;

              if (isFunction$1(columns[column]) && !checkNativeType(columns[column])) {
                methods[column] = columns[column];
                continue;
              }

              if (checkNativeType(columns[column])) {
                if (isArray(columns[column]) && columns[column].length === 1 && isFunction$1(columns[column][0])) {
                  // TODO: Add Array of Model support
                }

                validateData[column] = columns[column];
                defaultData[column] = columns[column]();
              } else {
                validateData[column] = detectNativeType(columns[column]);
                defaultData[column] = columns[column];
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var toStringTag = hyphen2Camel(name);

          var queue = new Queue();

          var _Model = function (_Model2) {
            babelHelpers.inherits(_Model, _Model2);

            function _Model() {
              babelHelpers.classCallCheck(this, _Model);
              return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_Model).apply(this, arguments));
            }

            babelHelpers.createClass(_Model, [{
              key: Symbol.toStringTag,
              get: function get() {
                return toStringTag;
              }
            }, {
              key: '__min',
              get: function get() {
                return this.constructor.__min;
              }
            }, {
              key: '__queue',
              get: function get() {
                return queue;
              }
            }], [{
              key: 'modelName',
              get: function get() {
                return toStringTag;
              }
            }, {
              key: 'prefix',
              get: function get() {
                return privates[prefixSymbol];
              }
            }, {
              key: 'sequence',
              get: function get() {
                return privates[sequenceSymbol];
              }
            }, {
              key: 'validateData',
              get: function get() {
                return validateData;
              }
            }, {
              key: 'defaultData',
              get: function get() {
                return defaultData;
              }
            }, {
              key: '$methods',
              get: function get() {
                return methods;
              }
            }]);
            return _Model;
          }(Model);

          return _Model;
        }
      }, {
        key: 'BaseIndexer',
        get: function get() {
          return BaseIndexer;
        }
      }]);

      function Model() {
        var key = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var content = arguments[1];
        babelHelpers.classCallCheck(this, Model);

        var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this));

        if (key && content) {
          _this.key = key;
          _this[cacheSymbol] = content;
        } else {
          if (!content) {
            content = key;
            _this.key = Math.random().toString(32).substr(2);
          } else {
            _this.key = key || Math.random().toString(32).substr(2);
          }

          _this[cacheSymbol] = merge({}, _this.constructor.defaultData);

          // Lifecyle: beforeValidate
          if (_this.$methods.beforeValidate) {
            var rtn = _this.$methods.beforeValidate.call(_this, content);

            if (rtn) {
              content = rtn;
            }
          }

          var columns = Object.keys(content);

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _key2 = _step2.value;

              if (!_this.validate(_key2, content[_key2])) {
                throw new TypeError('Type validate failed on column "' + _key2 + '".');
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          _this[cacheSymbol] = merge(_this[cacheSymbol], content);
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          var _loop = function _loop() {
            var name = _step3.value;

            _this[name] = function () {
              var _this$constructor$$me;

              for (var _len = arguments.length, args = Array(_len), _key3 = 0; _key3 < _len; _key3++) {
                args[_key3] = arguments[_key3];
              }

              return (_this$constructor$$me = _this.constructor.$methods[name]).call.apply(_this$constructor$$me, [_this].concat(args));
            };
          };

          for (var _iterator3 = Object.keys(_this.constructor.$methods)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        _this.__queue.push(function () {
          // Lifecyle: beforeStore
          if (_this.$methods.beforeStore) {
            _this.$methods.beforeStore.call(_this);
          }

          return _this.__min.sadd(_this.constructor.sequence, _this.key).then(function () {
            return _this.__min.hmset(_this.hashKey, _this[cacheSymbol]);
          }).then(function () {
            return Promise.all(Object.keys(_this[cacheSymbol]).map(function (key) {
              if (_this.constructor[indexersSymbol] && _this.constructor[indexersSymbol].has(key)) {
                return _this.constructor[indexersSymbol].get(key).add(_this.key, _this[cacheSymbol][key]);
              } else {
                return Promise.resolve();
              }
            }));
          });
        }, function () {

          // Lifecyle: ready
          if (_this.$methods.ready) {
            _this.$methods.ready.call(_this);
          }

          _this.emit('ready', _this);
        });
        _this.__queue.run();
        return _this;
      }

      babelHelpers.createClass(Model, [{
        key: 'getCacheData',
        value: function getCacheData() {
          var key = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          if (!key) {
            return this[cacheSymbol];
          } else {
            return this[cacheSymbol][key];
          }
        }
      }, {
        key: 'get',
        value: function get(key) {
          var _this3 = this;

          if (this[cacheSymbol][key]) {
            return Promise.resolve(this[cacheSymbol][key]);
          } else {
            return this.__min.hget(this.hashKey, 'key').then(function (value) {
              _this3[cacheSymbol][key] = value;
              return Promise.resolve(value);
            });
          }
        }
      }, {
        key: 'set',
        value: function set(key, value) {
          var _this4 = this;

          if (!this.validate(key, value)) {
            throw new TypeError('Type validate failed.');
          }

          var oldValue = this[cacheSymbol][key];

          // Lifecyle: beforeUpdate
          if (this.$methods.beforeUpdate) {
            this.$methods.beforeUpdate.call(this, key, value, oldValue);
          }

          this[cacheSymbol][key] = value;

          return this.__min.hset(this.hashKey, key, value).then(function () {
            if (_this4.constructor[indexersSymbol] && _this4.constructor[indexersSymbol].has(key)) {
              var indexer = _this4.constructor[indexersSymbol].get(key);

              return indexer.reindex(_this4.key, value, oldValue);
            } else {
              return Promise.resolve();
            }
          }).then(function () {
            // Lifecyle: afterUpdate
            if (_this4.$methods.afterUpdate) {
              _this4.$methods.afterUpdate.call(_this4, key, value, oldValue);
            }

            Promise.resolve([key, value]);
          });
        }
      }, {
        key: 'reset',
        value: function reset() {
          var _this5 = this;

          var key = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          if (key) {
            return this.set(key, this.constructor.defaultData[key]);
          }

          var columns = Object.keys(this.constructor.defaultData[key]);

          return Promise.all(columns.map(function (key) {
            return _this5.set(key, _this5.constructor.defaultData[key]);
          }));
        }
      }, {
        key: 'remove',
        value: function remove() {
          var _this6 = this;

          // Lifecyle: beforeRemove
          if (this.$methods.beforeRemove) {
            this.$methods.beforeRemove.call(this);
          }

          return this.__min.srem(this.constructor.sequence, this.key).then(function () {
            return _this6.__min.del(_this6.hashKey);
          }).then(function () {
            return Promise.all(Object.keys(_this6[cacheSymbol]).map(function (key) {
              if (_this6.constructor[indexersSymbol] && _this6.constructor[indexersSymbol].has(key)) {
                return _this6.constructor[indexersSymbol].get(key).remove(_this6.key, _this6[cacheSymbol][key]);
              } else {
                return Promise.resolve();
              }
            }));
          }).then(function () {
            _this6.key = null;
            _this6[cacheSymbol] = null;

            // Lifecyle: afterRemove
            if (_this6.$methods.afterRemove) {
              _this6.$methods.afterRemove.call(_this6);
            }

            return Promise.resolve();
          });
        }
      }, {
        key: 'validate',
        value: function validate(key, value) {
          switch (this.constructor.validateData[key]) {
            case String:
              return isString(value);
              break;

            case Number:
              return isNumber$1(value);
              break;

            case Boolean:
              return isBoolean(value);
              break;

            default:
              return value instanceof (this.constructor.validateData[key] || Object);
          }
        }
      }, {
        key: 'hashKey',
        get: function get() {
          return this.constructor.prefix + ':' + this.key;
        }
      }, {
        key: '$methods',
        get: function get() {
          return this.constructor.$methods;
        }
      }], [{
        key: 'fetch',
        value: function fetch(key) {
          var _this7 = this;

          return this.__min.sismember(this.sequence, key).then(function (res) {
            if (res) {
              return _this7.__min.hgetall(_this7.prefix + ':' + key);
            } else {
              return Promise.reject(new Error('Object not found.'));
            }
          }).then(function (content) {
            return Promise.resolve(new _this7(key, content));
          });
        }
      }, {
        key: 'setIndex',
        value: function setIndex(column) {
          if (!this[indexersSymbol]) {
            this[indexersSymbol] = new Map();
          }

          var type = this.validateData[column];
          var indexer = new Index(this.sequence, this.prefix, column, type, this.__min);

          this[indexersSymbol].set(column, indexer);

          return indexer;
        }
      }, {
        key: 'search',
        value: function search(column, query) {
          var _this8 = this;

          var chainData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

          if (this[indexersSymbol] && this[indexersSymbol].has(column)) {
            var indexer = this[indexersSymbol].get(column);

            return indexer.search(query, chainData, this).then(function (results) {
              return results.map(function (content) {
                return new _this8(content._key, content);
              });
            });
          } else {
            return this.__plainSearch(column, query, chainData).then(function (results) {
              return results.map(function (content) {
                return new _this8(content._key, content);
              });
            });
          }
        }
      }, {
        key: '__plainSearch',
        value: function __plainSearch(column, query) {
          var _this9 = this;

          var chainData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

          if (this.validateData[column] !== detectNativeType(query)) return Promise.reject(new TypeError('Type wrong'));

          // Whole searching
          return PendingSearchResult(new Promise(function (resolve, reject) {
            if (chainData) {
              resolve(chainData.map(function (item) {
                return [item._key, item[column]];
              }));
            } else {
              _this9.__min.smembers(_this9.sequence).then(function (keys) {
                var multi = _this9.__min.multi();

                keys.forEach(function (itemKey) {
                  return multi.hget(_this9.prefix + ':' + itemKey, column);
                });

                return multi.exec().then(function (values) {
                  return Promise.resolve(values.map(function (val, i) {
                    return [keys[i], val];
                  }));
                });
              }).then(resolve).catch(reject);
            }
          }).then(function (tuples) {
            return Promise.resolve(tuples.filter(function (_ref) {
              var _ref2 = babelHelpers.slicedToArray(_ref, 2);

              var _key = _ref2[0];
              var value = _ref2[1];

              if (_this9.validateData[column] === String) return value.includes(query);

              return isEqual(value, query);
            }).map(function (_ref3) {
              var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

              var key = _ref4[0];
              var value = _ref4[1];
              return key;
            }));
          }).then(function (keys) {
            var multi = _this9.__min.multi();

            keys.forEach(function (key) {
              return multi.hgetall(_this9.prefix + ':' + key);
            });

            return multi.exec().then(function (result) {
              return Promise.resolve(result.map(function (item, i) {
                item._key = keys[i];
                return item;
              }));
            });
          }), this);
        }
      }, {
        key: 'dump',
        value: function dump() {
          var _this10 = this;

          return this.__min.exists(this.sequence).then(function (exists) {
            if (exists) {
              return _this10.__min.smembers(_this10.sequence);
            } else {
              return Promise.resolve([]);
            }
          }).then(function (keys) {
            var multi = _this10.__min.multi();

            keys.forEach(function (itemKey) {
              return multi.hgetall(_this10.prefix + ':' + itemKey);
            });

            return multi.exec().then(function (items) {
              return Promise.resolve(items.map(function (item, i) {
                item._key = keys[i];
                return item;
              }));
            });
          });
        }
      }, {
        key: 'allInstances',
        value: function allInstances() {
          var _this11 = this;

          return this.dump().then(function (result) {
            return Promise.resolve(result.map(function (item) {
              return new _this11(item._key, item);
            }));
          });
        }
      }]);
      return Model;
    }(EventEmitter);

    return Model;

}));
//# sourceMappingURL=model.js.map