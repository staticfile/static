/*!
 * MinDB (version 0.1.15) - Database on JavaScript
 * 
 * Will Wen Gunn(iwillwen) and other contributors
 * 
 * @license MIT-license
 * @copyright 2012-2015 iwillwen(willwengunn@gmail.com)
 */
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define("min", [], factory);
  else if(typeof exports === 'object')
    exports["min"] = factory();
  else
    root["min"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  module.exports = __webpack_require__(1).default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  __webpack_require__(2);

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  var _mix = __webpack_require__(23);

  var _mix2 = _interopRequireDefault(_mix);

  var _hash = __webpack_require__(24);

  var _hash2 = _interopRequireDefault(_hash);

  var _list = __webpack_require__(25);

  var _list2 = _interopRequireDefault(_list);

  var _set = __webpack_require__(26);

  var _set2 = _interopRequireDefault(_set);

  var _zset = __webpack_require__(27);

  var _zset2 = _interopRequireDefault(_zset);

  var _mise = __webpack_require__(28);

  var _mise2 = _interopRequireDefault(_mise);

  var _stores = __webpack_require__(29);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  _utils2.default.extend(min, _events.EventEmitter.prototype);
  min.EventEmitter = _events.EventEmitter;
  min.Promise = _events.Promise;

  min.memStore = _stores.memStore;
  min.localStore = _stores.localStore;

  min.store = new _stores.localStore();

  var _keys = min._keys = {};
  var _keysTimer = null;
  var _types = {
    0: 'mix',
    1: 'hash',
    2: 'list',
    3: 'set',
    4: 'zset' // Sorted Set
  };

  /**
   * Fork a new MinDB object
   * @return {Object} new min object
   */
  min.fork = function () {
    var rtn = {};

    var keys = Object.getOwnPropertyNames(this);

    for (var i = 0; i < keys.length; i++) {
      var prop = keys[i];
      if (this.hasOwnProperty(prop)) {
        rtn[prop] = this[prop];
      }
    }

    return rtn;
  };

  /*********
  ** Keys **
  *********/

  /**
   * Delete a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.del = function (key) {
    var _this = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _events.Promise(noop);

    promise.then(function () {
      _this.emit('del', key);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this.save.bind(_this), 1000);
    });

    // Store
    var store = this.store;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating

      var load = function load() {
        // Value processing
        store.remove($key, function (err) {
          if (err) {
            // Error!
            promise.reject(err);
            return callback(err);
          }

          delete _this._keys[key];

          // Done
          promise.resolve(key);
          callback(null, key);
        });
      };

      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        store.remove($key);

        delete this._keys[key];

        // Done
        promise.resolve(key);
        callback(null, key);
      } catch (err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    return promise;
  };

  /**
   * Check a key is exists or not
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.exists = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _events.Promise();

    key = 'min-' + key;

    var handle = function handle(err, value) {
      if (err || !value) {
        promise.resolve(false);
        return callback(null, false);
      }

      promise.resolve(true);
      callback(null, true);
    };

    if (this.store.async) {
      this.store.get(key, handle);
    } else {
      var val = this.store.get(key);
      handle(null, val);
    }

    return promise;
  };

  /**
   * Rename a old key
   * @param  {String}   key      the old key
   * @param  {String}   newKey   the new key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.renamenx = function (key, newKey) {
    var _this2 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise object
    var promise = new _events.Promise(noop);

    promise.then(function (_) {
      _this2.emit('rename', key, newKey);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this2.save.bind(_this2), 5 * 1000);
    });

    try {
      (function () {
        // Error handle
        var reject = function reject(err) {
          promise.reject(err);
          callback(err);
        };

        var type = null;
        var value = null;

        _this2.exists(key).then(function (exists) {
          if (!exists) {
            var err = new Error('no such key');

            reject(err);
          } else {
            return _this2.get(key);
          }
        }).then(function (_value) {
          type = _this2._keys[key];
          value = _value;

          return _this2.del(key);
        }).then(function (_) {
          return _this2.set(newKey, value, callback);
        }).then(function (_) {
          _this2._keys[newKey] = type;
          promise.resolve('OK');
          callback(null, 'OK');
        }, reject);
      })();
    } catch (err) {
      reject(err);
    }

    return promise;
  };

  /**
   * Rename a old key when the old key is not equal to the new key
   * and the old key is exiest.
   * @param  {String}   key      the old key
   * @param  {String}   newKey   the new key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.rename = function (key, newKey) {
    var _this3 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise object
    var promise = new _events.Promise(noop);

    promise.then(function (_) {
      _this3.emit('rename', key, newKey);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this3.save.bind(_this3), 5 * 1000);
    });

    // Error handle
    var reject = function reject(err) {
      promise.reject(err);
      callback(err);
    };

    if (key == newKey) {
      // The origin key is equal to the new key
      reject(new Error('The key is equal to the new key.'));
    } else {
      this.renamenx.apply(this, arguments).then(promise.resolve.bind(promise), promise.reject.bind(promise));
    }
    return promise;
  };

  /**
   * Return the keys which match by the pattern
   * @param  {String}   pattern  Pattern
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.keys = function (pattern) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise object
    var promise = new _events.Promise();

    // Stored keys
    var keys = Object.keys(this._keys);

    // Filter
    var filter = new RegExp(pattern.replace('?', '(.)').replace('*', '(.*)'));

    var ret = [];

    for (var i = 0; i < keys.length; i++) {
      if (keys[i].match(filter)) {
        ret.push(keys[i]);
      }
    }

    // Done
    promise.resolve(ret);
    callback(null, ret);

    return promise;
  };

  /**
   * Return a key randomly
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.randomkey = function () {
    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    // Promise Object
    var promise = new _events.Promise(noop);

    // Stored keys
    var keys = Object.keys(this._keys);

    // Random Key
    var index = Math.round(Math.random() * (keys.length - 1));

    // Done
    var $key = keys[index];
    promise.resolve($key);
    callback(null, $key);

    return promise;
  };

  /**
   * Return the value's type of the key
   * @param  {String}   key      the key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.type = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _events.Promise(noop);

    if (this._keys.hasOwnProperty(key)) {
      promise.resolve(_types[this._keys[key]]);
      callback(null, callback);
    } else {
      promise.resolve(null);
      callback(null, null);
    }

    return promise;
  };

  /**
   * Remove all keys in the db
   * @param  {Function} callback Callback
   * @return {Object}            min
   */
  min.empty = function () {
    var _this4 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var promise = new _events.Promise();
    var keys = Object.keys(this._keys);
    var removeds = 0;

    promise.then(function (len) {
      _this4.emit('empty', len);
      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this4.save.bind(_this4), 5 * 1000);
    });

    var loop = function loop(key) {
      if (key) {
        _this4.del(key, function (err) {
          if (!err) {
            removeds++;
          }

          loop(keys.shift());
        });
      } else {
        promise.resolve(removeds);
        callback(null, removeds);
      }
    };

    loop(keys.shift());

    return promise;
  };

  /**
   * Save the dataset to the Store Interface manually
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.save = function () {
    var _this5 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var promise = new _events.Promise();

    promise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var dump = _ref2[0];
      var strResult = _ref2[1];

      _this5.emit('save', dump, strResult);
    });

    this.set('min_keys', JSON.stringify(this._keys)).then(function (_) {
      return _this5.dump();
    }).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var dump = _ref4[0];
      var strResult = _ref4[1];

      promise.resolve([dump, strResult]);
      callback(dump, strResult);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Return the dataset of MinDB
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.dump = function () {
    var _this6 = this;

    var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var loop = null;
    var promise = new _events.Promise();

    var rtn = {};

    this.keys('*', function (err, keys) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      (loop = function (key) {
        if (key) {
          _this6.get(key).then(function (value) {
            rtn[key] = value;
            loop(keys.shift());
          }, function (err) {
            promise.reject(err);
            callback(err);
          });
        } else {
          var strResult = JSON.stringify(rtn);
          promise.resolve([rtn, strResult]);
          callback(null, rtn, strResult);
        }
      })(keys.shift());
    });

    return promise;
  };

  /**
   * Restore the dataset to MinDB
   * @param  {Object}   dump     dump object
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.restore = function (dump) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    promise.then(function (_) {
      _this7.save(function (_) {
        _this7.emit('restore');
      });
    });

    var keys = Object.keys(dump);

    var done = function done(_) {
      _this7.exists('min_keys').then(function (exists) {
        if (exists) {
          return _this7.get('min_keys');
        } else {
          promise.resolve();
          callback();
        }
      }).then(function (keys) {
        _keys = JSON.parse(keys);

        promise.resolve();
        callback();
      }).catch(function (err) {
        promise.rejeect(err);
        callback(err);
      });
    };

    var loop = function loop(key) {
      if (key) {
        _this7.set(key, dump[key]).then(function (_) {
          loop(keys.shift());
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        done();
      }
    };

    loop(keys.shift());

    return promise;
  };

  var watchers = {};

  /**
   * Watch the command actions of the key
   * @param  {String}   key      key to watch
   * @param  {String}   command  command to watch
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.watch = function (key, command, callback) {
    var _this8 = this;

    if ('undefined' === typeof callback && command.apply) {
      callback = command;
      command = 'set';
    }

    var watcherId = Math.random().toString(32).substr(2);

    if (!watchers[key]) watchers[key] = {};

    watchers[key][watcherId] = function (_key) {
      var _callback;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (_key !== key) return;
      (_callback = callback).call.apply(_callback, [_this8].concat(args));
    };

    watchers[key][watcherId].command = command;

    this.on(command, watchers[key][watcherId]);

    return watcherId;
  };

  /**
   * Unbind the watcher
   * @param  {String} key       key to unwatch
   * @param  {String} watcherId watcher's id
   * @param  {String} command   command
   */
  min.unwatch = function (key, command, watcherId) {
    if ('undefined' === typeof watcherId && !!command) {
      watcherId = command;
      command = 'set';
    }

    this.removeListener(command, watchers[key][watcherId]);
  };

  /**
   * Unbind all the watcher of the key
   * @param  {String} key key to unwatch
   */
  min.unwatchForKey = function (key) {
    var watchersList = watchers[key];

    for (var id in watchersList) {
      var watcher = watchersList[id];
      this.removeListener(watcher.command, watcher);
    }
  };

  // Methods
  _utils2.default.extend(min, _hash2.default);
  _utils2.default.extend(min, _list2.default);
  _utils2.default.extend(min, _set2.default);
  _utils2.default.extend(min, _zset2.default);
  _utils2.default.extend(min, _mise2.default);
  _utils2.default.extend(min, _mix2.default);

  // Apply
  var handle = function handle(err, value) {
    if (err || !value) {
      min._keys = {};
      return;
    }

    try {
      min._keys = JSON.parse(keys);
    } catch (err) {
      min._keys = {};
    }
  };
  if (min.store.async) {
    min.store.get('min-min_keys', handle);
  } else {
    try {
      var val = min.store.get('min-min_keys');
      handle(null, val);
    } catch (err) {
      handle(err);
    }
  }

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  if (!__webpack_require__(3)()) {
    Object.defineProperty(__webpack_require__(4), 'Symbol',
      { value: __webpack_require__(5), configurable: true, enumerable: false,
        writable: true });
  }


/***/ },
/* 3 */
/***/ function(module, exports) {

  'use strict';

  module.exports = function () {
    var symbol;
    if (typeof Symbol !== 'function') return false;
    symbol = Symbol('test symbol');
    try { String(symbol); } catch (e) { return false; }
    if (typeof Symbol.iterator === 'symbol') return true;

    // Return 'true' for polyfills
    if (typeof Symbol.isConcatSpreadable !== 'object') return false;
    if (typeof Symbol.iterator !== 'object') return false;
    if (typeof Symbol.toPrimitive !== 'object') return false;
    if (typeof Symbol.toStringTag !== 'object') return false;
    if (typeof Symbol.unscopables !== 'object') return false;

    return true;
  };


/***/ },
/* 4 */
/***/ function(module, exports) {

  'use strict';

  module.exports = new Function("return this")();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var d              = __webpack_require__(6)
    , validateSymbol = __webpack_require__(19)

    , create = Object.create, defineProperties = Object.defineProperties
    , defineProperty = Object.defineProperty, objPrototype = Object.prototype
    , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null);

  if (typeof Symbol === 'function') NativeSymbol = Symbol;

  var generateName = (function () {
    var created = create(null);
    return function (desc) {
      var postfix = 0, name, ie11BugWorkaround;
      while (created[desc + (postfix || '')]) ++postfix;
      desc += (postfix || '');
      created[desc] = true;
      name = '@@' + desc;
      defineProperty(objPrototype, name, d.gs(null, function (value) {
        // For IE11 issue see:
        // https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
        //    ie11-broken-getters-on-dom-objects
        // https://github.com/medikoo/es6-symbol/issues/12
        if (ie11BugWorkaround) return;
        ie11BugWorkaround = true;
        defineProperty(this, name, d(value));
        ie11BugWorkaround = false;
      }));
      return name;
    };
  }());

  HiddenSymbol = function Symbol(description) {
    if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
    return SymbolPolyfill(description);
  };
  module.exports = SymbolPolyfill = function Symbol(description) {
    var symbol;
    if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
    symbol = create(HiddenSymbol.prototype);
    description = (description === undefined ? '' : String(description));
    return defineProperties(symbol, {
      __description__: d('', description),
      __name__: d('', generateName(description))
    });
  };
  defineProperties(SymbolPolyfill, {
    for: d(function (key) {
      if (globalSymbols[key]) return globalSymbols[key];
      return (globalSymbols[key] = SymbolPolyfill(String(key)));
    }),
    keyFor: d(function (s) {
      var key;
      validateSymbol(s);
      for (key in globalSymbols) if (globalSymbols[key] === s) return key;
    }),
    hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
    isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
      SymbolPolyfill('isConcatSpreadable')),
    iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
    match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
    replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
    search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
    species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
    split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
    toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
    toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
    unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
  });
  defineProperties(HiddenSymbol.prototype, {
    constructor: d(SymbolPolyfill),
    toString: d('', function () { return this.__name__; })
  });

  defineProperties(SymbolPolyfill.prototype, {
    toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
    valueOf: d(function () { return validateSymbol(this); })
  });
  defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('',
    function () { return validateSymbol(this); }));
  defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

  defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
    d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));
  defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
    d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var assign        = __webpack_require__(7)
    , normalizeOpts = __webpack_require__(14)
    , isCallable    = __webpack_require__(15)
    , contains      = __webpack_require__(16)

    , d;

  d = module.exports = function (dscr, value/*, options*/) {
    var c, e, w, options, desc;
    if ((arguments.length < 2) || (typeof dscr !== 'string')) {
      options = value;
      value = dscr;
      dscr = null;
    } else {
      options = arguments[2];
    }
    if (dscr == null) {
      c = w = true;
      e = false;
    } else {
      c = contains.call(dscr, 'c');
      e = contains.call(dscr, 'e');
      w = contains.call(dscr, 'w');
    }

    desc = { value: value, configurable: c, enumerable: e, writable: w };
    return !options ? desc : assign(normalizeOpts(options), desc);
  };

  d.gs = function (dscr, get, set/*, options*/) {
    var c, e, options, desc;
    if (typeof dscr !== 'string') {
      options = set;
      set = get;
      get = dscr;
      dscr = null;
    } else {
      options = arguments[3];
    }
    if (get == null) {
      get = undefined;
    } else if (!isCallable(get)) {
      options = get;
      get = set = undefined;
    } else if (set == null) {
      set = undefined;
    } else if (!isCallable(set)) {
      options = set;
      set = undefined;
    }
    if (dscr == null) {
      c = true;
      e = false;
    } else {
      c = contains.call(dscr, 'c');
      e = contains.call(dscr, 'e');
    }

    desc = { get: get, set: set, configurable: c, enumerable: e };
    return !options ? desc : assign(normalizeOpts(options), desc);
  };


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  module.exports = __webpack_require__(8)()
    ? Object.assign
    : __webpack_require__(9);


/***/ },
/* 8 */
/***/ function(module, exports) {

  'use strict';

  module.exports = function () {
    var assign = Object.assign, obj;
    if (typeof assign !== 'function') return false;
    obj = { foo: 'raz' };
    assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
    return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
  };


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var keys  = __webpack_require__(10)
    , value = __webpack_require__(13)

    , max = Math.max;

  module.exports = function (dest, src/*, …srcn*/) {
    var error, i, l = max(arguments.length, 2), assign;
    dest = Object(value(dest));
    assign = function (key) {
      try { dest[key] = src[key]; } catch (e) {
        if (!error) error = e;
      }
    };
    for (i = 1; i < l; ++i) {
      src = arguments[i];
      keys(src).forEach(assign);
    }
    if (error !== undefined) throw error;
    return dest;
  };


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  module.exports = __webpack_require__(11)()
    ? Object.keys
    : __webpack_require__(12);


/***/ },
/* 11 */
/***/ function(module, exports) {

  'use strict';

  module.exports = function () {
    try {
      Object.keys('primitive');
      return true;
    } catch (e) { return false; }
  };


/***/ },
/* 12 */
/***/ function(module, exports) {

  'use strict';

  var keys = Object.keys;

  module.exports = function (object) {
    return keys(object == null ? object : Object(object));
  };


/***/ },
/* 13 */
/***/ function(module, exports) {

  'use strict';

  module.exports = function (value) {
    if (value == null) throw new TypeError("Cannot use null or undefined");
    return value;
  };


/***/ },
/* 14 */
/***/ function(module, exports) {

  'use strict';

  var forEach = Array.prototype.forEach, create = Object.create;

  var process = function (src, obj) {
    var key;
    for (key in src) obj[key] = src[key];
  };

  module.exports = function (options/*, …options*/) {
    var result = create(null);
    forEach.call(arguments, function (options) {
      if (options == null) return;
      process(Object(options), result);
    });
    return result;
  };


/***/ },
/* 15 */
/***/ function(module, exports) {

  // Deprecated

  'use strict';

  module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  module.exports = __webpack_require__(17)()
    ? String.prototype.contains
    : __webpack_require__(18);


/***/ },
/* 17 */
/***/ function(module, exports) {

  'use strict';

  var str = 'razdwatrzy';

  module.exports = function () {
    if (typeof str.contains !== 'function') return false;
    return ((str.contains('dwa') === true) && (str.contains('foo') === false));
  };


/***/ },
/* 18 */
/***/ function(module, exports) {

  'use strict';

  var indexOf = String.prototype.indexOf;

  module.exports = function (searchString/*, position*/) {
    return indexOf.call(this, searchString, arguments[1]) > -1;
  };


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var isSymbol = __webpack_require__(20);

  module.exports = function (value) {
    if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
    return value;
  };


/***/ },
/* 20 */
/***/ function(module, exports) {

  'use strict';

  module.exports = function (x) {
    return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
  };


/***/ },
/* 21 */
/***/ function(module, exports) {

  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  // Utils
  var utils = {
    noop: function noop() {
      return false;
    },

    // Class Inherits
    inherits: function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },

    // Object Extend
    extend: function extend(target) {
      for (var _len = arguments.length, objs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objs[_key - 1] = arguments[_key];
      }

      for (var i = 0, l = objs.length; i < l; i++) {
        var keys = Object.getOwnPropertyNames(objs[i] || {});

        for (var j = 0; j < keys.length; j++) {
          target[keys[j]] = objs[i][keys[j]];
        }
      }

      return target;
    },
    isNumber: function isNumber(obj) {
      return toString.call(obj) == '[object Number]';
    },
    isUndefined: function isUndefined(val) {
      return val === void 0;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    arrayUnique: function arrayUnique(array) {
      var u = {};
      var ret = [];
      for (var i = 0, l = array.length; i < l; ++i) {
        if (u.hasOwnProperty(array[i]) && !utils.isObject(array[i])) {
          continue;
        }
        ret.push(array[i]);
        u[array[i]] = 1;
      }
      return ret;
    },
    arrayInter: function arrayInter(array) {
      for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        rest[_key2 - 1] = arguments[_key2];
      }

      return utils.arrayUnique(array).filter(function (item) {
        var ret = true;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = rest[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var other = _step.value;

            if (other.indexOf(item) < 0) {
              ret = false;
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

        return ret;
      });
    },
    arrayDiff: function arrayDiff(array) {
      for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        rest[_key3 - 1] = arguments[_key3];
      }

      var inter = utils.arrayInter.apply(utils, [array].concat(rest));
      var union = utils.arrayUnique(array.concat.apply(array, rest));
      return union.filter(function (item) {
        return inter.indexOf(item) < 0;
      });
    },
    flatten: (function (_flatten) {
      function flatten(_x, _x2, _x3, _x4) {
        return _flatten.apply(this, arguments);
      }

      flatten.toString = function () {
        return _flatten.toString();
      };

      return flatten;
    })(function (input, shallow, strict, startIndex) {
      var output = [];
      var idx = 0;
      for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
        var value = input[i];
        if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
          //flatten current level of array or arguments object
          if (!shallow) value = flatten(value, shallow, strict);
          var j = 0,
              len = value.length;
          output.length += len;
          while (j < len) {
            output[idx++] = value[j++];
          }
        } else if (!strict) {
          output[idx++] = value;
        }
      }
      return output;
    })
  };

  exports.default = utils;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

  /* WEBPACK VAR INJECTION */(function(global) {'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.EventEmitter = undefined;
  exports.Promise = Promise;

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var noop = _utils2.default.noop;

  var defaultMaxListeners = 10;

  var EventEmitter = exports.EventEmitter = (function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      this._events = this._events || {};
      this._maxListeners = this._maxListeners || defaultMaxListeners;
    }

    _createClass(EventEmitter, [{
      key: 'setMaxListeners',
      value: function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0) throw TypeError('n must be a positive number');
        this._maxListeners = n;
      }
    }, {
      key: 'emit',
      value: function emit(type) {
        var er = undefined,
            handler = undefined,
            len = undefined,
            args = undefined,
            i = undefined,
            listeners = undefined;

        if (!this._events) this._events = {};

        // If there is no 'error' event listener then throw.
        if (type === 'error') {
          if (!this._events.error || _typeof(this._events.error) === 'object' && !this._events.error.length) {
            er = arguments[1];
            if (this.domain) {
              if (!er) er = new TypeError('Uncaught, unspecified "error" event.');
            } else if (er instanceof Error) {
              throw er; // Unhandled 'error' event
            } else {
                throw TypeError('Uncaught, unspecified "error" event.');
              }
            return false;
          }
        }

        handler = this._events[type];

        if (typeof handler === 'undefined') return false;

        if (typeof handler === 'function') {
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
              len = arguments.length;
              args = new Array(len - 1);
              for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
              }handler.apply(this, args);
          }
        } else if ((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object') {
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++) {
            args[i - 1] = arguments[i];
          }listeners = handler.slice();
          len = listeners.length;
          for (i = 0; i < len; i++) {
            listeners[i].apply(this, args);
          }
        }

        return true;
      }
    }, {
      key: 'addListener',
      value: function addListener(type, listener) {
        var m = undefined;

        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        if (!this._events) this._events = {};

        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (this._events.newListener) this.emit('newListener', type, typeof listener.listener === 'function' ? listener.listener : listener);

        if (!this._events[type])
          // Optimize the case of one listener. Don't need the extra array object.
          this._events[type] = listener;else if (_typeof(this._events[type]) === 'object')
          // If we've already got an array, just append.
          this._events[type].push(listener);else
          // Adding the second element, need to change to array.
          this._events[type] = [this._events[type], listener];

        // Check for listener leak
        if (_typeof(this._events[type]) === 'object' && !this._events[type].warned) {
          m = this._maxListeners;
          if (m && m > 0 && this._events[type].length > m) {
            this._events[type].warned = true;
            console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
            console.trace();
          }
        }

        return this;
      }
    }, {
      key: 'once',
      value: function once(type, listener) {
        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        function g() {
          this.removeListener(type, g);
          listener.apply(this, arguments);
        }

        g.listener = listener;
        this.on(type, g);

        return this;
      }
    }, {
      key: 'removeListener',
      value: function removeListener(type, listener) {
        var list = undefined,
            position = undefined,
            length = undefined,
            i = undefined;

        if (typeof listener !== 'function') throw TypeError('listener must be a function');

        if (!this._events || !this._events[type]) return this;

        list = this._events[type];
        length = list.length;
        position = -1;

        if (list === listener || typeof list.listener === 'function' && list.listener === listener) {
          this._events[type] = undefined;
          if (this._events.removeListener) this.emit('removeListener', type, listener);
        } else if ((typeof list === 'undefined' ? 'undefined' : _typeof(list)) === 'object') {
          for (i = length; i-- > 0;) {
            if (list[i] === listener || list[i].listener && list[i].listener === listener) {
              position = i;
              break;
            }
          }

          if (position < 0) return this;

          if (list.length === 1) {
            list.length = 0;
            this._events[type] = undefined;
          } else {
            list.splice(position, 1);
          }

          if (this._events.removeListener) this.emit('removeListener', type, listener);
        }

        return this;
      }
    }, {
      key: 'removeAllListeners',
      value: function removeAllListeners(type) {
        if (!this._events) return this;

        // not listening for removeListener, no need to emit
        if (!this._events.removeListener) {
          if (arguments.length === 0) this._events = {};else if (this._events[type]) this._events[type] = undefined;
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(this._events);

          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = {};
          return this;
        }

        var listeners = this._events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else {
          // LIFO order
          while (listeners.length) {
            this.removeListener(type, listeners[listeners.length - 1]);
          }
        }
        this._events[type] = undefined;

        return this;
      }
    }, {
      key: 'listeners',
      value: function listeners(type) {
        var ret = undefined;
        if (!this._events || !this._events[type]) ret = [];else if (typeof this._events[type] === 'function') ret = [this._events[type]];else ret = this._events[type].slice();
        return ret;
      }
    }]);

    return EventEmitter;
  })();

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.listenerCount = function (emitter, type) {
    var ret = undefined;
    if (!emitter._events || !emitter._events[type]) ret = 0;else if (typeof emitter._events[type] === 'function') ret = 1;else ret = emitter._events[type].length;
    return ret;
  };
  EventEmitter.inherits = function (ctor) {
    _utils2.default.inherits(ctor, EventEmitter);
  };

  var _Promise = (function () {
    function _Promise() {
      var resolver = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      _classCallCheck(this, _Promise);

      this._settled = false;
      this._success = false;
      this._args = [];
      this._callbacks = [];
      this._onReject = noop;

      resolver(this.resolve.bind(this), this.reject.bind(this));
    }

    _createClass(_Promise, [{
      key: 'then',
      value: function then(onResolve) {
        var _this = this;

        var onReject = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var promise = new _Promise();

        this._onReject = onReject;
        this._callbacks.push(function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var ret = onResolve.apply(_this, args);

          if (ret && typeof ret.then == 'function') {
            ret.then(promise.resolve.bind(promise), promise.reject.bind(promise));
          }
        });

        if (this._settled) {
          if (this._success) {
            this.resolve.apply(this, this._args);
          } else {
            this.onReject.apply(this, this._args);
          }
        }

        return promise;
      }
    }, {
      key: 'catch',
      value: function _catch(onReject) {
        this._onReject = onReject;

        return this;
      }
    }, {
      key: 'resolve',
      value: function resolve() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        for (var i = 0; i < this._callbacks.length; i++) {
          var handler = this._callbacks[i];
          handler.apply(this, args);
        }

        this._args = args;
        this._settled = true;
        this._success = true;
      }
    }, {
      key: 'reject',
      value: function reject() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        this._onReject.apply(this, args);

        this._args = args;
        this._settled = true;
      }
    }]);

    return _Promise;
  })();

  var nativePromise = (global || window).Promise || null;

  function Promise(resolver) {
    var promise = null;
    var resolve = noop;
    var reject = noop;
    resolver = resolver || noop;

    if (nativePromise) {
      promise = new nativePromise(function (_1, _2) {
        resolve = _1;
        reject = _2;

        resolver(_1, _2);
      });
      promise.resolve = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        resolve.apply(promise, args);
      };
      promise.reject = function () {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        reject.apply(promise, args);
      };
    } else {
      promise = new _Promise(resolver);
    }

    return promise;
  }
  /* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  var _keysTimer = null;

  /******************************
  ** Mix(String/Number/Object) **
  ******************************/

  /**
   * Set the value of a key
   * @param  {String}   key      Key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.set = function (key, value, callback) {
    var _this = this;

    // Promise Object
    var promise = new _events.Promise();

    promise.then(function (_) {
      _this.emit('set', key, value);

      if (_keysTimer) {
        clearTimeout(_keysTimer);
      }

      _keysTimer = setTimeout(_this.save.bind(_this), 1000);
    });

    // Store
    var store = this.store;

    // Callback and Promise's shim
    callback = callback || _utils2.default.noop;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function load(_) {
        // Value processing
        var $value = JSON.stringify(value);
        store.set($key, $value, function (err) {
          if (err) {
            // Error!
            promise.reject(err);
            return callback(err);
          }

          _this._keys[key] = 0;

          // Done
          promise.resolve(key);
          callback(null, key, value);
        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      // Value processing
      var $value = JSON.stringify(value);
      store.set($key, $value);
      this._keys[key] = 0;

      // Done
      promise.resolve(key);
      callback(null, key, value);
    }

    return promise;
  };

  /**
   * Set the value of a key, only if the key does not exist
   * @param  {String}   key      the key
   * @param  {Mix}      value    Value
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.setnx = function (key, value) {
    var _this2 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    // Promise Object
    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        callback(err);
        promise.reject(err);
      }

      if (exists) {
        // The key is exists
        return promise.reject(new Error('The key is exists.'));
      } else {
        _this2.set(key, value, callback).then(function (key) {
          // Done
          callback(null, key);
          promise.resolve(key);
        }, function (err) {
          callback(err);
          promise.reject(err);
        });
      }
    });

    return promise;
  };

  /**
   * Set the value and expiration of a key
   * @param  {String}   key      key
   * @param  {Number}   seconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.setex = function (key, seconds, value) {
    var _this3 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    // Promise Object
    var promise = new _events.Promise();

    // TTL
    var timeout = function timeout(_) {
      _this3.del(key, noop);
    };

    // Set
    this.set(key, value, function (err, result) {
      // Done
      setTimeout(timeout, seconds * 1000);
      callback(err, result);
    }).then(function (key) {
      // Done
      setTimeout(timeout, seconds * 1000);
      promise.resolve(key);
      callback(null, key);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Set the value and expiration in milliseconds of a key
   * @param  {String}   key      key
   * @param  {Number}   millionseconds  TTL
   * @param  {Mix}      value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.psetex = function (key, milliseconds, value) {
    var _this4 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    // Promise Object
    var promise = new _events.Promise();

    // TTL
    var timeout = function timeout(_) {
      _this4.del(key, _utils2.default.noop);
    };

    // Set
    this.set(key, value, function (err, result) {
      // Done
      setTimeout(timeout, milliseconds);
      callback(err, result);
    }).then(function (key) {
      // Done
      setTimeout(timeout, milliseconds);
      promise.resolve(key);
      callback(null, key);
    }).catch(promise.reject.bind(promise));

    return promise;
  };

  /**
   * Set multiple keys to multiple values
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mset = function (plainObject) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    // keys
    var keys = Object.keys(plainObject);
    // counter
    var i = 0;

    // the results and errors to return
    var results = [];
    var errors = [];

    // Loop
    var next = function next(key, index) {
      // remove the current element of the plainObject
      delete keys[index];

      _this5.set(key, plainObject[key]).then(function (key) {
        results.push(key);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);

        i++;
        if (keys[i]) {
          return next(keys[i], i);
        } else {
          return out();
        }
      });
    };

    function out() {
      if (errors.length > 0) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Set multiple keys to multiple values, only if none of the keys exist
   * @param  {Object}   plainObject      Object to set
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.msetnx = function (plainObject) {
    var _this6 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();
    var keys = Object.keys(plainObject);
    var i = 0;

    var results = [];
    var errors = [];

    var next = function next(key, index) {
      delete keys[index];

      _this6.setnx(key, plainObject[key]).then(function (key) {
        results.push(key);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);
        out();
      });
    };

    function out() {
      if (errors.length) {
        callback(errors);
        return promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Append a value to a key
   * @param  {String}   key      key
   * @param  {String}   value    value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.append = function (key, value) {
    var _this7 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        var p = new _events.Promise();

        p.resolve('');

        return p;
      }
    }).then(function (currVal) {
      return _this7.set(key, currVal + value);
    }).then(function (_) {
      return _this7.strlen(key);
    }).then(function (len) {
      promise.resolve(len);
      callback(null, len);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the value of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           Promise Object
   */
  min.get = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _events.Promise();

    promise.then(function (value) {
      return _this8.emit('get', key, value);
    });

    // Store
    var store = this.store;

    // Key prefix
    var $key = 'min-' + key;

    if (store.async) {
      // Async Store Operating
      var load = function load(_) {
        // Value processing
        store.get($key, function (err, value) {
          if (err) {
            var _err = new Error('no such key');
            // Error!
            promise.reject(_err);
            return callback(_err);
          }

          if (value) {
            // Done
            try {
              var ret = JSON.parse(value);
              promise.resolve(ret);
              callback(null, ret);
            } catch (err) {
              promise.reject(err);
              callback(err);
            }
          } else {
            var _err2 = new Error('no such key');

            promise.reject(_err2);
            callback(_err2);
          }
        });
      };
      if (store.ready) {
        load();
      } else {
        store.on('ready', load);
      }
    } else {
      try {
        // Value processing
        var _value = this.store.get($key);

        if (_value) {
          try {
            var value = JSON.parse(_value);
            // Done
            promise.resolve(value);
            callback(null, value);
          } catch (err) {
            promise.reject(err);
            callback(err);
          }
        } else {
          var err = new Error('no such key');

          promise.reject(err);
          callback(err);
        }
      } catch (err) {
        // Error!
        promise.reject(err);
        callback(err);
      }
    }

    return promise;
  };

  min.getrange = function (key, start, end) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (value) {
      return _this9.emit('getrange', key, start, end, value);
    });

    var len = end - start + 1;

    this.get(key).then(function (value) {
      var val = value.substr(start, len);

      promise.resolve(val);
      callback(null, val);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the values of a set of keys
   * @param  {Array}   keys      the keys
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.mget = function (keys) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    // Promise Object
    var promise = new _events.Promise();

    var multi = this.multi();

    for (var i = 0; i < keys.length; i++) {
      multi.get(keys[i]);
    }

    multi.exec(function (err, results) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      callback(err);
      promise.resolve(results);
    });

    return promise;
  };

  /**
   * Set the value of a key and return its old value
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.getset = function (key, value) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    promise.then(function (old) {
      return _this10.emit('getset', key, value, old);
    });

    var _value = null;

    this.get(key).then(function ($value) {
      _value = $value;

      return _this10.set(key, value);
    }).then(function (_) {
      promise.resolve(_value);
      callback(null, _value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the length of a key
   * @param  {String}   key      Key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.strlen = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    this.get(key).then(function (value) {
      if ('string' === typeof value) {
        var len = value.length;

        promise.resolve(len);
        callback(null, len);
      } else {
        var err = new TypeError();

        promise.reject(err);
        callback(err);
      }
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Increment the integer value of a key by one
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incr = function (key) {
    var _this11 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    promise.then(function (value) {
      return _this11.emit('incr', key, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this11.get(key);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this11.set(key, ++curr);
    }).then(function (key) {
      return _this11.get(key);
    }).then(function (value) {
      promise.resolve(value);
      callback(null, value, key);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Increment the integer value of a key by the given amount
   * @param  {String}   key      key
   * @param  {Number}   increment increment
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.incrby = function (key, increment) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    promise.then(function (value) {
      return _this12.emit('incrby', key, increment, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this12.get(key);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseFloat(curr);

      return _this12.set(key, curr + increment);
    }).then(function (key, value) {
      promise.resolve(value);
      callback(null, value);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.incrbyfloat = min.incrby;

  min.decr = function (key) {
    var _this13 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    promise.then(function (curr) {
      return _this13.emit('decr', key, curr);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this13.get(key);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this13.set(key, --curr);
    }).then(function (key) {
      return _this13.get(key);
    }).then(function (value) {
      promise.resolve(value);
      callback(null, value, key);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.decrby = function (key, decrement) {
    var _this14 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();
    promise.then(function (curr) {
      return _this14.emit('decrby', key, decrement, curr);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this14.get(key);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseInt(curr))) {
        promise.reject('value wrong');
        return callback('value wrong');
      }

      curr = parseInt(curr);

      return _this14.set(key, curr - decrement);
    }).then(function (key, value) {
      promise.resolve(value);
      callback(null, value);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  /**
   * Set the field in the hash on the key with the value
   * @param  {String}   key      Hash key
   * @param  {String}   field    field to set
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */

  min.hset = function (key, field, value) {
    var _this = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    // check the key status
    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        // fetch the value
        _this.get(key, function (err, body) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          // update the hash
          body[field] = value;

          _this.set(key, body, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            promise.resolve([key, field, value]);
            callback(null, key, field, value);
          });
        });
      } else {
        // create a hash
        var body = {};

        body[field] = value;

        _this.set(key, body, function (err) {
          if (err) {
            reject(err);
            return callback(err);
          }

          _this._keys[key] = 1;

          promise.resolve([key, field, value]);
          callback(null, key, field, value);
        });
      }
    });
    promise.then(function (_) {
      return _this.emit('hset', key, field, value);
    });

    return promise;
  };

  /**
   * Set the value of a hash field, only if the field does not exist
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}            promise
   */
  min.hsetnx = function (key, field, value) {
    var _this2 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    this.hexists(key, field, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (!exists) {
        _this2.hset(key, field, value).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 3);

          var key = _ref2[0];
          var field = _ref2[1];
          var value = _ref2[2];

          promise.resolve([key, field, value]);
          callback(null, key, field, value);
        });
      } else {
        var _err = new Error('The field of the hash is exists');

        promise.reject(_err);
        return callback(_err);
      }
    });

    return promise;
  };

  /**
   * Set multiple hash fields to multiple values
   * @param  {String}   key      key
   * @param  {Object}   docs     values
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmset = function (key, docs) {
    var _this3 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    var keys = Object.keys(docs);

    var i = 0;

    var results = [];
    var errors = [];

    var next = function next(field, index) {
      delete keys[index];

      _this3.hset(key, field, docs[field]).then(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3);

        var key = _ref4[0];
        var field = _ref4[1];
        var value = _ref4[2];

        results.push([key, field, value]);

        i++;
        if (keys[i]) {
          next(keys[i], i);
        } else {
          out();
        }
      }, function (err) {
        errors.push(err);

        i++;
        if (keys[i]) {
          return next(keys[i], i);
        } else {
          return out();
        }
      });
    };

    function out() {
      if (errors.length > 0) {
        callback(errors);
        promise.reject(errors);
      } else {
        callback(null, results);
        promise.resolve(results);
      }
    }

    next(keys[i], i);

    return promise;
  };

  /**
   * Get the value of a hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hget = function (key, field) {
    var _this4 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    this.hexists(key, field, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this4.get(key).then(function (value) {
          var data = value[field];
          promise.resolve(data);
          callback(null, data);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        var _err2 = new Error('no such field');

        promise.reject(_err2);
        callback(_err2);
      }
    });

    return promise;
  };

  /**
   * Get the values of all the given hash fields
   * @param  {String}   key      key
   * @param  {Array}   fields    hash fields
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hmget = function (key, fields) {
    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    var multi = this.multi();

    fields.forEach(function (field) {
      multi.hget(key, field);
    });

    multi.exec(function (err, replies) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      promise.resolve(replies);
      callback(null, replies);
    });

    return promise;
  };

  /**
   * Get all the fields and values in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hgetall = function (key) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        _this5.get(key).then(function (data) {
          promise.resolve(data);
          callback(null, data);
        }).catch(function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        var _err3 = new Error('no such key');

        callback(_err3);
        return promise.reject(_err3);
      }
    });

    return promise;
  };

  /**
   * Delete one hash field
   * @param  {String}   key      key
   * @param  {String}   field    hash field
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hdel = function (key, field) {
    var _this6 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    promise.then(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3);

      var key = _ref6[0];
      var field = _ref6[1];
      var value = _ref6[2];

      _this6.emit('hdel', key, field, value);
    });

    this.hexists(key, field, function (err, exists) {
      if (err) {
        callback(err);
        return promise.reject(err);
      }

      if (exists) {
        _this6.get(key).then(function (data) {
          var removed = data[field];
          delete data[field];

          _this6.set(key, data).then(function (_) {
            promise.resolve([key, field, removed]);
            callback(null, key, field, removed);
          }, function (err) {
            promise.reject(err);
            callback(err);
          });
        }, function (err) {
          return callback(err);
        });
      } else {
        var _err4 = new Error('no such key');

        callback(_err4);
        return promise.reject(_err4);
      }
    });

    return promise;
  };

  /**
   * Get the number of fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hlen = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this7.get(key).then(function (data) {
          var length = Object.keys(data).length;

          promise.resolve(length);
          callback(null, length);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get all the fields in a hash
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.hkeys = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this8.get(key).then(function (data) {
          var keys = Object.keys(data);

          promise.resolve(keys);
          callback(null, keys);
        }, function (err) {
          promise.reject(err);
          callback(err);
        });
      } else {
        promise.resolve([]);
        callback(null, []);
      }
    });

    return promise;
  };

  /**
   * Determine if a hash field exists
   * @param  {String}   key      key of the hash
   * @param  {String}   field    the field
   * @param  {Function} callback Callback
   * @return {Promise}           promise object
   */
  min.hexists = function (key, field) {
    var _this9 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this9.get(key);
      } else {
        promise.resolve(false);
        callback(null, false);
      }
    }).then(function (value) {
      if (value.hasOwnProperty(field)) {
        promise.resolve(true);
        callback(null, true);
      } else {
        promise.resolve(false);
        callback(null, false);
      }
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.hincr = function (key, field) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    promise.then(function (curr) {
      return _this10.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this10.hget(key, field);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        var err = new Error('value wrong');
        promise.reject(err);
        return callback(err);
      }

      curr = parseFloat(curr);

      return _this10.hset(key, field, ++curr);
    }).then(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 3);

      var value = _ref8[2];

      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.hincrby = function (key, field, increment) {
    var _this11 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (curr) {
      _this11.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this11.hget(key, field);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        var err = new Error('value wrong');
        promise.reject(err);
        return callback(err);
      }

      curr = parseFloat(curr);

      return _this11.hset(key, field, curr + increment);
    }).then(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 3);

      var value = _ref10[2];

      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.hincrbyfloat = min.hincrby;

  min.hdecr = function (key, field) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    promise.then(function (curr) {
      _this12.emit('hdecr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this12.hget(key, field);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        var err = new Error('value wrong');
        promise.reject(err);
        return callback(err);
      }

      curr = parseFloat(curr);

      return _this12.hset(key, field, --curr);
    }).then(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 3);

      var value = _ref12[2];

      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.hdecrby = function (key, field, decrement) {
    var _this13 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (curr) {
      return _this13.emit('hincr', key, field, curr);
    });

    this.hexists(key, field).then(function (exists) {
      if (exists) {
        return _this13.hget(key, field);
      } else {
        var p = new _events.Promise();

        p.resolve(0);

        return p;
      }
    }).then(function (curr) {
      if (isNaN(parseFloat(curr))) {
        var err = new Error('value wrong');
        promise.reject(err);
        return callback(err);
      }

      curr = parseFloat(curr);

      return _this13.hset(key, field, curr - decrement);
    }).then(function (_ref13) {
      var _ref14 = _slicedToArray(_ref13, 3);

      var value = _ref14[2];

      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.hdecrbyfloat = min.hdecrby;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var noop = _utils2.default.noop;
  var min = {};
  exports.default = min;

  /******************************
  **           List            **
  ******************************/

  /**
   * Prepend one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */

  min.lpush = function (key) {
    var _this = this;

    for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }

    var promise = new _events.Promise();
    var callback = noop;

    if (values[values.length - 1].apply) {
      callback = values.splice(values.length - 1)[0];
    }

    promise.then(function (len) {
      return _this.emit('lpush', key, values, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.unshift.apply(data, values);

          _this.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = values.slice();

        _this.set(key, data, function (err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          _this._keys[key] = 2;

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpushx = function (key) {
    var _this2 = this;

    for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      values[_key2 - 1] = arguments[_key2];
    }

    var promise = new _events.Promise();
    var callback = noop;

    if (values[values.length - 1].apply) {
      callback = values.splice(values.length - 1)[0];
    }

    promise.then(function (len) {
      return _this2.emit('lpush', key, values, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this2.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var err = new Error('The list is empty.');

            callback(err);
            return promise.reject(err);
          }

          data.unshift.apply(data, values);

          _this2.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var _err = new Error('no such key');

        callback(_err);
        return promise.reject(_err);
      }
    });

    return promise;
  };

  /**
   * Append one or multiple values to a list
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpush = function (key) {
    var _this3 = this;

    for (var _len3 = arguments.length, values = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      values[_key3 - 1] = arguments[_key3];
    }

    var promise = new _events.Promise();
    var callback = noop;

    if (values[values.length - 1].apply) {
      callback = values.splice(values.length - 1)[0];
    }

    promise.then(function (len) {
      return _this3.emit('rpush', key, values, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this3.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          data.push.apply(data, values);

          _this3.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var data = values.slice();

        _this3.set(key, data, function (err) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          promise.resolve(1);
          callback(null, 1);
        });
      }
    });

    return promise;
  };

  /**
   * Prepend a value to a list, only if the list exists
   * @param  {String}   key      key
   * @param  {Mix}   value       value
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpushx = function (key) {
    var _this4 = this;

    for (var _len4 = arguments.length, values = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      values[_key4 - 1] = arguments[_key4];
    }

    var promise = new _events.Promise();
    var callback = noop;

    if (values[values.length - 1].apply) {
      callback = values.splice(values.length - 1)[0];
    }

    promise.then(function (len) {
      return _this4.emit('rpush', key, values, len);
    });

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this4.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (!data.length) {
            var _err2 = new Error('The list is empty.');

            callback(_err2);
            return promise.reject(_err2);
          }

          data.push.apply(data, values);

          _this4.set(key, data, function (err) {
            if (err) {
              promise.reject(err);
              return callback(err);
            }

            var length = data.length;

            promise.resolve(length);
            callback(null, length);
          });
        });
      } else {
        var _err3 = new Error('no such key');

        callback(_err3);
        return promise.reject(_err3);
      }
    });

    return promise;
  };

  /**
   * Remove and get the first element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.lpop = function (key) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();
    var val = null;

    promise.then(function (value) {
      return _this5.emit('lpop', key, value);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (data) {
      val = data.shift();

      return _this5.set(key, data);
    }).then(function (_) {
      promise.resolve(val);
      callback(null, val);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Remove and get the last element in a list
   * @param  {String}   key      key
   * @param  {Function} callback Callback
   * @return {Promise}           promise
   */
  min.rpop = function (key) {
    var _this6 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    promise.then(function (value) {
      return _this6.emit('rpop', key, value);
    });

    var value = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this6.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (data) {
      value = data.pop();

      return _this6.set(key, data);
    }).then(function (_) {
      promise.resolve(value);
      callback(null, value);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get the length of a list
   * @param  {String}   key      key
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.llen = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this7.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          var length = data.length;

          promise.resolve(length);
          callback(null, length);
        });
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    });

    return promise;
  };

  /**
   * Get a range of elements from a list
   * @param  {String}   key      key
   * @param  {Number}   start    min score
   * @param  {Number}   stop     max score
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrange = function (key, start, stop) {
    var _this8 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    this.exists(key, function (err, exists) {
      if (err) {
        promise.reject(err);
        return callback(err);
      }

      if (exists) {
        _this8.get(key, function (err, data) {
          if (err) {
            promise.reject(err);
            return callback(err);
          }

          if (stop < 0) {
            stop = data.length + stop;
          }

          var values = data.slice(start, stop + 1);

          promise.resolve(values);
          callback(null, values);
        });
      } else {
        promise.resolve([]);
        callback(null, []);
      }
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   count    count to remove
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lrem = function (key, count, value) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (removeds) {
      return _this9.emit('lrem', key, count, value, removeds);
    });

    var removeds = 0;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this9.get(key);
      } else {
        promise.resolve(0);
        callback(null, 0);
      }
    }).then(function (data) {
      switch (true) {
        case count > 0:
          for (var i = 0; i < data.length && removeds < count; i++) {
            if (data[i] === value) {
              data.splice(i, 1)[0];

              removeds++;
            }
          }
          break;
        case count < 0:
          for (var i = data.length - 1; i >= 0 && removeds < -count; i--) {
            if (data[i] === value) {
              data.splice(i, 1)[0];

              removeds++;
            }
          }
          break;
        case count == 0:
          for (var i = data.length - 1; i >= 0; i--) {
            if (data[i] === value) {
              data.splice(i, 1)[0];

              removeds++;
            }
          }
          break;
      }

      return _this9.set(key, data);
    }).then(function () {
      promise.resolve(removeds);
      callback(null, removeds);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Remove elements from a list
   * @param  {String}   key      key
   * @param  {Number}   index    position to set
   * @param  {Mix}      value    value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lset = function (key, index, value) {
    var _this10 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (len) {
      return _this10.emit('lset', key, index, value, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this10.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      if (index < 0 && data.length > 0) {
        index = data.length + index;
      }

      if (!data[index] || !data.length) {
        throw new Error('Illegal index');
      }

      if (data.length == index) {
        data.push(value);
      } else {
        data[index] = value;
      }

      return _this10.set(key, data);
    }).then(function () {
      promise.resolve();
      callback(null);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Trim a list to the specified range
   * @param  {String}   key      key
   * @param  {Number}   start    start
   * @param  {Number}   stop     stop
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.ltrim = function (key, start, stop) {
    var _this11 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    this.exists(key).then(function (exists) {
      if (!exists) {
        throw new Error('no such key');
      }

      return _this11.get(key);
    }).then(function (data) {
      if (start < 0) {
        start = data.length + start;
      }

      if (stop < 0) {
        stop = data.length + stop;
      }

      var values = data.slice(start, stop + 1);

      return _this11.set(key, values);
    }).then(function () {
      return _this11.get(key);
    }).then(function (values) {
      promise.resolve(values);
      callback(null, values, key);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Get an element from a list by its index
   * @param  {String}   key      key
   * @param  {Number}   index    index
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lindex = function (key, index) {
    var _this12 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();

    this.exists(key).then(function (exists) {
      if (!exists) {
        var err = new Error('no such key');

        promise.reject(err);
        return callback(err);
      }

      return _this12.get(key);
    }).then(function (data) {
      if (index > data.length - 1) {
        throw new Error('Illegal index');
      }

      var value = data[index];

      promise.resolve(value);
      callback(null, value);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Insert an element before another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertBefore = function (key, pivot, value) {
    var _this13 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (len) {
      return _this13.emit('linsertBefore', key, pivot, value, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this13.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var index = data.indexOf(pivot);

      if (index < 0) {
        promise.resolve(-1);
        callback(null, -1);
        return;
      }

      var prev = data.slice(0, index);
      var next = data.slice(index);

      var newData = prev.slice();
      newData.push.apply(newData, [value].concat(_toConsumableArray(next)));

      return _this13.set(key, newData);
    }).then(function (key) {
      if (key.substr) {
        return _this13.get(key);
      }
    }).then(function (data) {
      promise.resolve(data.length);
      callback(null, data.length);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Insert an element after another element in a list
   * @param  {String}   key      key
   * @param  {Mix}   pivot       pivot
   * @param  {Mix}   value       value
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.linsertAfter = function (key, pivot, value) {
    var _this14 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise();

    promise.then(function (len) {
      return _this14.emit('linsertAfter', key, pivot, value, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this14.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var index = data.indexOf(pivot) + 1;

      if (index < 0) {
        promise.resolve(-1);
        callback(null, -1);
        return;
      }

      var prev = data.slice(0, index);
      var next = data.slice(index);

      var newData = prev.slice();
      newData.push.apply(newData, [value].concat(_toConsumableArray(next)));

      return _this14.set(key, newData);
    }).then(function (key) {
      if (key.substr) {
        return _this14.get(key);
      }
    }).then(function (data) {
      promise.resolve(data.length);
      callback(null, data.length);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  /**
   * Remove the last element in a list, append it to another list and return it
   * @param  {String}   src      source
   * @param  {String}   dest     destination
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.rpoplpush = function (src, dest) {
    var _this15 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();
    var value = null;

    promise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var value = _ref2[0];
      var len = _ref2[1];
      return _this15.emit('rpoplpush', src, dest, value, len);
    });

    this.rpop(src).then(function (_) {
      return _this15.lpush(dest, value = _);
    }).then(function (length) {
      promise.resolve([value, length]);
      callback(null, value, length);
    }, function (err) {
      callback(err);
      promise.reject(err);
    });

    return promise;
  };

  /**
   * Remove the last element in a list, append it to another list and return it
   * @param  {String}   src      source
   * @param  {String}   dest     destination
   * @param  {Function} callback callback
   * @return {Promise}           promise
   */
  min.lpoprpush = function (src, dest) {
    var _this16 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise();
    var value = null;

    promise.then(function (value, len) {
      return _this16.emit('lpoprpush', src, dest, value, len);
    });

    this.lpop(src).then(function (_) {
      return _this16.rpush(dest, value = _);
    }).then(function (length) {
      promise.resolve(value, length);
      callback(null, value, length);
    }, function (err) {
      callback(err);
      promise.reject(err);
    });

    return promise;
  };

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  /******************************
  **           Set             **
  ******************************/

  min.sadd = function (key) {
    var _this = this;

    for (var _len = arguments.length, members = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      members[_key - 1] = arguments[_key];
    }

    var promise = new _events.Promise(noop);

    promise.then(function (len) {
      return _this.emit('sadd', key, len);
    });

    var added = 0;

    var callback = noop;

    if (members[members.length - 1] instanceof Function) {
      callback = members.pop();
    }

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this.get(key);
      } else {
        var data = _utils2.default.arrayUnique(members);

        return _this.set(key, data);
      }
    }).then(function () {
      if (Array.isArray(arguments[0])) {
        var data = arguments[0];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var curr = _step.value;

            if (data.indexOf(curr) >= 0) {
              continue;
            } else {
              data.push(curr);
              added++;
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

        return _this.set(key, data);
      } else if (typeof arguments[0] === 'string') {
        added += members.length;

        _this._keys[key] = 3;

        promise.resolve(added);
        callback(null, added);
      }
    }).then(function (_) {
      _this._keys[key] = 3;

      promise.resolve(added);
      callback(null, added);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.srem = function (key) {
    var _this2 = this;

    for (var _len2 = arguments.length, members = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      members[_key2 - 1] = arguments[_key2];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    promise.then(function (len) {
      return _this2.emit('srem', key, members, len);
    });

    var removeds = 0;

    if (members[members.length - 1] instanceof Function) {
      callback = members.pop();
    }

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this2.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = members[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var curr = _step2.value;

          var i = data.indexOf(curr);
          if (i >= 0) {
            data.splice(i, 1);
            removeds++;
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

      return _this2.set(key, data);
    }).then(function (_) {

      _this2._keys[key] = 3;

      promise.resolve(removeds);
      callback(null, removeds);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.smembers = function (key) {
    var _this3 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this3.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (members) {
      promise.resolve(members);
      callback(null, members);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sismember = function (key, value) {
    var _this4 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this4.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (members) {
      var res = members.indexOf(value) >= 0 ? true : false;

      promise.resolve(res);
      callback(null, res);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.scard = function (key) {
    var _this5 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var length = data.length;

      promise.resolve(length);
      callback(null, length);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.smove = function (src, dest, member) {
    var _this6 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    promise.then(function (ok) {
      return _this6.emit('smove', src, dest, member, ok);
    });

    this.exists(src).then(function (exists) {
      if (exists) {
        return _this6.sismember(src, member);
      } else {
        throw new Error('no such key');
      }
    }).then(function (isMember) {
      if (isMember) {
        return _this6.srem(src, member);
      } else {
        throw new Error('no such member');
      }
    }).then(function () {
      return _this6.sadd(dest, member);
    }).then(function (_) {
      _this6._keys[dest] = 3;
      promise.resolve(1);
      callback(null, 1);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.srandmember = function (key) {
    var _this7 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (members) {
      var index = Math.floor(Math.random() * members.length) || 0;

      var member = members[index];

      promise.resolve(member);
      callback(null, member);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.spop = function (key) {
    var _this8 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise(noop);

    promise.then(function (value) {
      return _this8.emit('spop', key, value);
    });

    var member = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this8.srandmember(key);
      } else {
        promise.resolve(null);
        callback(null, null);
      }
    }).then(function (_member) {
      member = _member;

      return _this8.srem(key, member);
    }).then(function (_) {
      promise.resolve(member);
      callback(null, member);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sunion = function () {
    var _this9 = this;

    for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      keys[_key3] = arguments[_key3];
    }

    var promise = new _events.Promise(noop);

    var callback = noop;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = [];

    var loop = function loop(index) {
      var curr = keys[index];

      if (curr) {
        _this9.exists(curr).then(function (exists) {
          if (exists) {
            return _this9.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            members = members.concat(data);
          }

          loop(++index);
        }, function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        members = _utils2.default.arrayUnique(members);
        promise.resolve(members);
        callback(null, members);
      }
    };

    loop(0);

    return promise;
  };

  min.sunionstore = function (dest) {
    var _this10 = this;

    for (var _len4 = arguments.length, keys = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      keys[_key4 - 1] = arguments[_key4];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    promise.then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var length = _ref2[0];
      var members = _ref2[1];
      return _this10.emit('sunionstore', dest, keys, length, members);
    });

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var members = null;

    this.sunion.apply(this, keys).then(function (_members) {
      members = _members;

      return _this10.del(dest);
    }).then(function () {
      return _this10.sadd.apply(_this10, [dest].concat(_toConsumableArray(members)));
    }).then(function (length) {
      promise.resolve([length, members]);
      callback(null, length, members);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sinter = function () {
    var _this11 = this;

    for (var _len5 = arguments.length, keys = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      keys[_key5] = arguments[_key5];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var memberRows = [];

    var loop = function loop(index) {
      var curr = keys[index];

      if (curr) {
        _this11.exists(curr).then(function (exists) {
          if (exists) {
            return _this11.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            memberRows.push(data);
          }

          loop(++index);
        }, function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        var members = _utils2.default.arrayInter.apply(_utils2.default, memberRows);
        promise.resolve(members);
        callback(null, members);
      }
    };
    loop(0);

    return promise;
  };

  min.sinterstore = function (dest) {
    var _this12 = this;

    for (var _len6 = arguments.length, keys = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      keys[_key6 - 1] = arguments[_key6];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    promise.then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var length = _ref4[0];
      var members = _ref4[1];
      return _this12.emit('sinterstore', dest, keys, length, members);
    });

    var members = null;

    this.sinter.apply(this, keys).then(function (_members) {
      members = _members;

      return _this12.del(dest);
    }).then(function () {
      return _this12.sadd.apply(_this12, [dest].concat(_toConsumableArray(members)));
    }).then(function (length) {
      promise.resolve([members.length, members]);
      callback(null, members.length, members);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.sdiff = function () {
    var _this13 = this;

    for (var _len7 = arguments.length, keys = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      keys[_key7] = arguments[_key7];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    var memberRows = [];

    var loop = function loop(index) {
      var curr = keys[index];

      if (curr) {
        _this13.exists(curr).then(function (exists) {
          if (exists) {
            return _this13.get(curr);
          } else {
            loop(++index);
          }
        }).then(function (data) {
          if (Array.isArray(data)) {
            memberRows.push(data);
          }

          loop(++index);
        }).catch(function (err) {
          promise.reject(err);
          return callback(err);
        });
      } else {
        var members = _utils2.default.arrayDiff.apply(_utils2.default, memberRows);

        promise.resolve(members);
        callback(null, members);
      }
    };
    loop(0);

    return promise;
  };

  min.sdiffstore = function (dest) {
    var _this14 = this;

    for (var _len8 = arguments.length, keys = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
      keys[_key8 - 1] = arguments[_key8];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    if (keys[keys.length - 1] instanceof Function) {
      callback = keys.pop();
    }

    promise.then(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var length = _ref6[0];
      var members = _ref6[1];
      return _this14.emit('sdiffstore', dest, keys, length, members);
    });

    var members = null;

    this.sdiff.apply(this, keys).then(function (_members) {
      members = _members;

      return _this14.del(dest);
    }).then(function (exists) {
      return _this14.sadd.apply(_this14, [dest].concat(_toConsumableArray(members)));
    }).then(function (length) {
      promise.resolve([length, members]);
      callback(null, length, members);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  /******************************
  **         Sorted Set        **
  ******************************/

  min.zadd = function (key, score, member) {
    var _this = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    promise.then(function (len) {
      return _this.emit('zadd', key, score, member, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this.get(key);
      } else {
        var score2HashsMap = {};
        score2HashsMap[score] = [0];

        return _this.set(key, {
          // members
          ms: [member],
          // mapping hash to score
          hsm: { 0: score },
          // mapping score to hash
          shm: score2HashsMap
        });
      }
    }).then(function (_key) {
      if ('string' === typeof _key) {
        _this._keys[key] = 4;

        promise.resolve(1, 1);
        callback(null, 1, 1);
      } else if ('object' === (typeof _key === 'undefined' ? 'undefined' : _typeof(_key))) {
        var data = _key;

        if (data.ms.indexOf(member) >= 0) {
          var len = data.ms.length;

          promise.resolve(0, len);
          return callback(null, 0, len);
        }

        // new hash
        var hash = data.ms.length;
        // append the new member
        data.ms.push(member);

        // mapping hash to score
        data.hsm[hash] = score;

        // mapping score to hash
        if (Array.isArray(data.shm[score])) {
          data.shm[score].push(hash);
        } else {
          data.shm[score] = [hash];
        }

        return _this.set(key, data);
      }
    }).then(function () {
      return _this.get(key);
    }).then(function (data) {
      _this._keys[key] = 4;

      var len = data.ms.length;

      promise.resolve(1, len);
      callback(null, 1, len);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zcard = function (key) {
    var _this2 = this;

    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this2.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var len = data.ms.filter(Boolean).length;

      promise.resolve(len);
      callback(null, len);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zcount = function (key, min, max) {
    var _this3 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    promise.then(function (len) {
      return _this3.emit('zcount', key, min, max, value, len);
    });

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this3.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var len = hashs.map(function (hash) {
        return hash.length;
      }).reduce(function (a, b) {
        return a + b;
      });

      promise.resolve(len);
      callback(null, len);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrem = function (key) {
    var _this4 = this;

    for (var _len = arguments.length, members = Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
      members[_key2 - 1] = arguments[_key2];
    }

    var promise = new _events.Promise(noop);
    var callback = noop;

    if (members[members.length - 1] instanceof Function) {
      callback = members.pop();
    }

    promise.then(function (removeds) {
      return _this4.emit('zrem', key, members, removeds);
    });

    var removeds = 0;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this4.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var p = new _events.Promise(noop);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var hash = _step.value;

          var i = data.ms.indexOf(hash);

          if (i >= 0) {
            delete data.ms[i];
            var score = data.hsm[i];
            delete data.hsm[i];

            var ii = data.shm[String(score)].indexOf(i);
            if (ii >= 0) {
              data.shm[String(score)].splice(ii, 1);
            }

            removeds++;
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

      p.resolve(data);

      return p;
    }).then(function (data) {
      return _this4.set(key, data);
    }).then(function (_) {
      promise.resolve(removeds);
      callback(null, removeds);
    }).catch(function (err) {
      promise.reject(err);
      callback(null, err);
    });

    return promise;
  };

  min.zscore = function (key, member) {
    var _this5 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this5.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hash = data.ms.indexOf(member);

      if (hash >= 0) {
        var score = data.hsm[hash];

        promise.resolve(score);
        callback(null, score);
      } else {
        var err = new Error('This member does not be in the set');

        promise.reject(err);
        callback(err);
      }
    });

    return promise;
  };

  min.zrange = function (key, min, max) {
    var _this6 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this6.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).map(function (s) {
        return parseFloat(s);
      }).sort().filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var members = hashs.map(function (hash) {
        return hash.map(function (row) {
          return data.ms[row];
        });
      }).reduce(function (a, b) {
        return a.concat(b);
      });

      promise.resolve(members);
      callback(null, members);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    promise.withScore = function () {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      var p = new _events.Promise(noop);

      promise.then(function (members) {
        var multi = _this6.multi();

        members.forEach(function (member) {
          return multi.zscore(key, member);
        });

        multi.exec(function (err, replies) {
          if (err) {
            callback(err);
            return p.reject(err);
          }

          var rtn = replies.map(function (reply, ii) {
            return {
              member: members[ii],
              score: reply
            };
          });

          p.resolve(rtn);
          callback(null, rtn);
        });
      });

      return p;
    };

    return promise;
  };

  min.zrevrange = function (key, min, max) {
    var _this7 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this7.get(key);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (data) {
      var hashs = Object.keys(data.shm).map(function (s) {
        return parseFloat(s);
      }).sort(function (a, b) {
        return b > a;
      }).filter(function (score) {
        return min <= score && score <= max;
      }).map(function (score) {
        return data.shm[score];
      });

      var members = hashs.map(function (hash) {
        return hash.map(function (row) {
          return data.ms[row];
        });
      }).reduce(function (a, b) {
        return a.concat(b);
      });

      promise.resolve(members);
      callback(null, members);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    promise.withScore = function () {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

      var p = new _events.Promise(noop);

      promise.then(function (members) {
        var multi = _this7.multi();

        members.forEach(function (member) {
          return multi.zscore(key, member);
        });

        multi.exec(function (err, replies) {
          if (err) {
            callback(err);
            return p.reject(err);
          }

          var rtn = replies.map(function (reply, ii) {
            return {
              member: members[ii],
              score: reply
            };
          });

          p.resolve(rtn);
          callback(null, rtn);
        });
      });

      return p;
    };

    return promise;
  };

  min.zincrby = function (key, increment, member) {
    var _this8 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    promise.then(function (score) {
      return _this8.emit('zincrby', key, increment, member, score);
    });

    var newScore = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this8.zscore(key, member);
      } else {
        _this8.zadd(key, 0, member, callback).then(promise.resolve.bind(promise), promise.reject.bind(promise));
      }
    }).then(function (_) {
      return _this8.get(key);
    }).then(function (data) {
      var hash = data.ms.indexOf(member);
      var score = data.hsm[hash];

      newScore = score + increment;

      var ii = data.shm[score].indexOf(hash);
      data.shm[score].splice(ii, 1);

      data.hsm[hash] = newScore;
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash);
      } else {
        data.shm[newScore] = [hash];
      }

      return _this8.set(key, data);
    }).then(function (_) {
      promise.resolve(newScore);
      callback(null, newScore);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zdecrby = function (key, decrement, member) {
    var _this9 = this;

    var callback = arguments.length <= 3 || arguments[3] === undefined ? noop : arguments[3];

    var promise = new _events.Promise(noop);

    promise.then(function (score) {
      return _this9.emit('zdecrby', keys, decrement, member, score);
    });

    var newScore = null;

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this9.zscore(key, member);
      } else {
        var err = new Error('no such key');

        promise.reject(err);
        callback(err);
      }
    }).then(function (_) {
      return _this9.get(key);
    }).then(function (data) {
      var hash = data.ms.indexOf(member);
      var score = data.hsm[hash];

      newScore = score - decrement;

      var ii = data.shm[score].indexOf(hash);
      data.shm[score].splice(ii, 1);

      data.hsm[hash] = newScore;
      if (data.shm[newScore]) {
        data.shm[newScore].push(hash);
      } else {
        data.shm[newScore] = [hash];
      }

      return _this9.set(key, data);
    }).then(function (_) {
      promise.resolve(newScore);
      callback(null, newScore);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrank = function (key, member) {
    var _this10 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this10.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var scores = Object.keys(data.shm).map(function (s) {
        return parseFloat(s);
      }).sort();
      var score = parseFloat(data.hsm[data.ms.indexOf(member)]);

      var rank = scores.indexOf(score) + 1;

      promise.resolve(rank);
      callback(null, rank);
    }).catch(function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

  min.zrevrank = function (key, member) {
    var _this11 = this;

    var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

    var promise = new _events.Promise(noop);

    this.exists(key).then(function (exists) {
      if (exists) {
        return _this11.get(key);
      } else {
        throw new Error('no such key');
      }
    }).then(function (data) {
      var scores = Object.keys(data.shm).map(function (s) {
        return parseFloat(s);
      }).sort();
      var score = parseFloat(data.hsm[data.ms.indexOf(member)]);

      var rank = scores.reverse().indexOf(score) + 1;

      promise.resolve(rank);
      callback(null, rank);
    }, function (err) {
      promise.reject(err);
      callback(err);
    });

    return promise;
  };

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _utils = __webpack_require__(21);

  var _utils2 = _interopRequireDefault(_utils);

  var _events = __webpack_require__(22);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var noop = _utils2.default.noop;

  var min = {};
  exports.default = min;

  /******************************
  **            Mise           **
  ******************************/

  var Multi = (function () {
    function Multi(_min) {
      var _this = this;

      _classCallCheck(this, Multi);

      this.queue = [];
      this.last = null;
      this.state = 0;
      this.min = _min;

      var keys = Object.getOwnPropertyNames(_min);

      for (var i = 0; i < keys.length; i++) {
        var prop = keys[i];

        if ('function' === typeof _min[prop]) {
          (function (method) {
            _this[method] = function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              _this.queue.push({
                method: method,
                args: args
              });

              return _this;
            };
          })(prop);
        }
      }
    }

    _createClass(Multi, [{
      key: 'exec',
      value: function exec() {
        var _this2 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        var promise = new _events.Promise();
        var results = [];

        var loop = function loop(task) {
          if (task) {
            _this2.min[task.method].apply(_this2.min, task.args).then(function () {
              for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }

              if (args.length > 1) {
                results.push(args);
              } else {
                results.push(args[0]);
              }
              loop(_this2.queue.shift());
            }).catch(function (err) {
              promise.reject(err);
              callback(err, results);
            });
          } else {
            promise.resolve(results);
            callback(null, results);
          }
        };

        loop(this.queue.shift());

        return promise;
      }
    }]);

    return Multi;
  })();

  min.multi = function () {
    return new Multi(this);
  };

  var Sorter = (function () {
    function Sorter(key, _min) {
      var _this3 = this;

      var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

      _classCallCheck(this, Sorter);

      this.min = _min;
      this.callback = callback;
      this.result = [];
      this.keys = {};
      this.promise = new _events.Promise(noop);
      this.sortFn = function (a, b) {
        if (_utils2.default.isNumber(a) && _utils2.default.isNumber(b)) {
          return a - b;
        } else {
          return JSON.stringify(a) > JSON.stringify(b);
        }
      };

      var run = function run(_) {
        _this3.min.exists(key).then(function (exists) {
          if (exists) {
            return _this3.min.get(key);
          } else {
            return new Error('no such key');
          }
        }).then(function (value) {
          var p = new _events.Promise(noop);

          switch (true) {
            case Array.isArray(value):
              p.resolve(value);
              break;
            case value.ms && Array.isArray(value.ms):
              p.resolve(value.ms);
              break;

            default:
              return new Error('content type wrong');
          }

          return p;
        }).then(function (data) {
          _this3.result = data.sort(_this3.sortFn);

          _this3.result.forEach(function (chunk) {
            _this3.keys[chunk] = chunk;
          });

          _this3.promise.resolve(_this3.result);
          _this3.callback(null, _this3.result);
        }).catch(function (err) {
          _this3.promise.reject(err);
          _this3.callback(err);
        });
      };

      // Promise Shim
      var loop = function loop(methods) {
        var curr = methods.shift();

        if (curr) {
          _this3[curr] = function () {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return _this3.promise[curr].apply(_this3.promise, args);
          };

          loop(methods);
        } else {
          run();
        }
      };

      loop(['then', 'done']);
    }

    _createClass(Sorter, [{
      key: 'by',
      value: function by(pattern) {
        var _this4 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var src2ref = {};
        var aviKeys = [];

        // TODO: Sort by hash field
        var field = null;

        if (pattern.indexOf('->') > 0) {
          var i = pattern.indexOf('->');
          field = pattern.substr(i + 2);
          pattern = pattern.substr(0, pattern.length - i);
        }

        this.min.keys(pattern).then(function (keys) {
          var filter = new RegExp(pattern.replace('?', '(.)').replace('*', '(.*)'));

          for (var i = 0; i < keys.length; i++) {
            var symbol = filter.exec(keys[i])[1];

            if (_this4.result.indexOf(symbol) >= 0) {
              src2ref[keys[i]] = symbol;
            }
          }

          aviKeys = Object.keys(src2ref);

          return _this4.min.mget(aviKeys.slice());
        }).then(function (values) {
          var reverse = {};

          for (var i = 0; i < values.length; i++) {
            reverse[JSON.stringify(values[i])] = aviKeys[i];
          }

          values.sort(_this4.sortFn);

          var newResult = values.map(function (value) {
            return reverse[JSON.stringify(value)];
          }).map(function (key) {
            return src2ref[key];
          });

          _this4.result = newResult;

          _this4.promise.resolve(newResult);
          callback(null, newResult);
        }).catch(function (err) {
          _this4.promise.reject(err);
          callback(err);
          _this4.callback(err);
        });

        return this;
      }
    }, {
      key: 'asc',
      value: function asc() {
        var _this5 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        this.sortFn = function (a, b) {
          if (_utils2.default.isNumber(a) && _utils2.default.isNumber(b)) {
            return a - b;
          } else {
            return JSON.stringify(a) > JSON.stringify(b);
          }
        };

        var handle = function handle(result) {
          _this5.result = result.sort(_this5.sortFn);

          _this5.promise.resolve(_this5.result);
          callback(null, _this5.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'desc',
      value: function desc() {
        var _this6 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        this.sortFn = function (a, b) {
          if (_utils2.default.isNumber(a) && _utils2.default.isNumber(b)) {
            return b - a;
          } else {
            return JSON.stringify(a) < JSON.stringify(b);
          }
        };

        var handle = function handle(result) {
          _this6.result = result.sort(_this6.sortFn);

          _this6.promise.resolve(_this6.result);
          callback(null, _this6.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'get',
      value: function get(pattern) {
        var _this7 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        var handle = function handle(_result) {
          var result = [];

          var loop = function loop(res) {
            var curr = res.shift();

            if (!_utils2.default.isUndefined(curr)) {
              if (Array.isArray(curr)) {
                var key = _this7.keys[curr[0]];

                _this7.min.get(pattern.replace('*', key)).then(function (value) {
                  curr.push(value);
                  result.push(curr);

                  loop(res);
                }, function (err) {
                  _this7.promise.reject(err);
                  callback(err);
                });
              } else if (curr.substr || _utils2.default.isNumber(curr)) {
                (function () {
                  var key = _this7.keys[curr];

                  _this7.min.get(pattern.replace('*', key)).then(function (value) {
                    result.push([value]);
                    if (value.substr || _utils2.default.isNumber(value)) {
                      _this7.keys[value] = key;
                    } else {
                      _this7.keys[JSON.stringify(value)] = key;
                    }

                    loop(res);
                  }, function (err) {
                    _this7.promise.reject(err);
                    callback(err);
                  });
                })();
              }
            } else {
              _this7.result = result;

              _this7.promise.resolve(result);
              callback(null, result);
            }
          };

          loop(_result.slice());
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'hget',
      value: function hget(pattern, field) {
        var _this8 = this;

        var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

        var handle = function handle(_result) {
          var result = [];

          var loop = function loop(res) {
            var curr = res.shift();

            if (!_utils2.default.isUndefined(curr)) {
              if (Array.isArray(curr)) {
                var key = _this8.keys[curr[0]];

                _this8.min.hget(pattern.replace('*', key), field).then(function (value) {
                  curr.push(value);
                  result.push(curr);

                  loop(res);
                }, function (err) {
                  _this8.promise.reject(err);
                  callback(err);
                });
              } else if (curr.substr || _utils2.default.isNumber(curr)) {
                (function () {
                  var key = _this8.keys[curr];

                  _this8.min.hget(pattern.replace('*', key)).then(function (value) {
                    result.push([value]);
                    if (value.substr || _utils2.default.isNumber(value)) {
                      _this8.keys[value] = key;
                    } else {
                      _this8.keys[JSON.stringify(value)] = key;
                    }

                    loop(res);
                  }, function (err) {
                    _this8.promise.reject(err);
                    callback(err);
                  });
                })();
              }
            } else {
              _this8.result = result;

              _this8.promise.resolve(result);
              callback(null, result);
            }
          };

          loop(_result.slice());
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'limit',
      value: function limit(offset, count) {
        var _this9 = this;

        var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

        var handle = function handle(result) {
          _this9.result = result.splice(offset, count);

          _this9.promise.resolve(_this9.result);
          callback(null, _this9.result);
        };

        if (this.promise.ended) {
          handle(this.result);
        } else {
          this.promise.once('resolve', handle);
        }

        return this;
      }
    }, {
      key: 'flatten',
      value: function flatten() {
        var _this10 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        if (this.promise.ended) {
          var rtn = [];

          for (var i = 0; i < this.result.length; i++) {
            for (var j = 0; j < this.result[i].length; j++) {
              rtn.push(this.result[i][j]);
            }
          }

          this.result = rtn;

          this.promise.resolve(rtn);
          callback(null, rtn);
        } else {
          this.promise.once('resolve', function (result) {
            var rtn = [];

            for (var i = 0; i < result.length; i++) {
              for (var j = 0; j < result[i].length; j++) {
                rtn.push(result[i][j]);
              }
            }

            _this10.result = rtn;

            _this10.promise.resolve(rtn);
            callback(null, rtn);
          });
        }

        return this;
      }
    }, {
      key: 'store',
      value: function store(dest) {
        var _this11 = this;

        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        if (this.promise.ended) {
          this.min.set(dest, this.result).then(function (_) {
            _this11.promise.resolve(_this11.result);
            callback(null, _this11.result);
          }, function (err) {
            _this11.promise.reject(err);
            callback(err);
          });
        } else {
          this.promise.once('resolve', function (result) {
            _this11.min.set(dest, result).then(function (_) {
              _this11.promise.resolve(result);
              callback(null, result);
            }, function (err) {
              _this11.promise.reject(err);
              callback(err);
            });
          });
        }

        return this;
      }
    }]);

    return Sorter;
  })();

  min.sort = function (key) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];
    return new Sorter(key, undefined, callback);
  };

  var Scanner = (function () {
    function Scanner(cursor, pattern, count, min) {
      _classCallCheck(this, Scanner);

      pattern = pattern || '*';

      this.cursor = cursor || 0;
      this.pattern = new RegExp(pattern.replace('*', '(.*)'));
      this.limit = count > -1 ? count : 10;
      this.end = this.cursor;

      this.parent = min;
    }

    _createClass(Scanner, [{
      key: 'scan',
      value: function scan() {
        var _this12 = this;

        var callback = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

        var rtn = [];

        this.parent.get('min_keys').then(function (data) {
          data = JSON.parse(data);

          var keys = Object.keys(data);

          var scan = function scan(ii) {
            var key = keys[ii];

            if (key && _this12.pattern.test(key) && key !== 'min_keys') {
              rtn.push(key);

              if (++_this12.end - _this12.cursor >= _this12.limit) {
                return callback(null, rtn, _this12.end);
              }
            } else if (!key) {
              _this12.end = 0;
              return callback(null, rtn, _this12.end);
            }

            return scan(++ii);
          };

          scan(_this12.cursor);
        }, function (err) {
          callback(err);
        });

        return this;
      }
    }, {
      key: 'match',
      value: function match(pattern) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        this.pattern = new RegExp(pattern.replace('*', '(.*)'));
        this.end = this.cursor;

        return this.scan(callback);
      }
    }, {
      key: 'count',
      value: function count(_count) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

        this.limit = _count;
        this.end = this.cursor;

        return this.scan(callback);
      }
    }]);

    return Scanner;
  })();

  min.scan = function (cursor) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

    var scanner = new Scanner(cursor, null, -1, undefined);

    scanner.scan(callback);

    return scanner;
  };

/***/ },
/* 29 */
/***/ function(module, exports) {

  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var memStore = exports.memStore = (function () {
    function memStore() {
      _classCallCheck(this, memStore);
    }

    _createClass(memStore, [{
      key: "get",
      value: function get(key) {
        if (sessionStorage) {
          return sessionStorage.getItem(key);
        } else {
          return false;
        }
      }
    }, {
      key: "set",
      value: function set(key, value) {
        if (sessionStorage) {
          return sessionStorage.setItem(key, value);
        } else {
          return false;
        }
      }
    }, {
      key: "remove",
      value: function remove(key) {
        if (sessionStorage) {
          return sessionStorage.removeItem(key);
        } else {
          return false;
        }
      }
    }]);

    return memStore;
  })();

  var localStore = exports.localStore = (function () {
    function localStore() {
      _classCallCheck(this, localStore);
    }

    _createClass(localStore, [{
      key: "get",
      value: function get(key) {
        if (localStorage) {
          return localStorage.getItem(key);
        } else {
          return false;
        }
      }
    }, {
      key: "set",
      value: function set(key, value) {
        if (localStorage) {
          return localStorage.setItem(key, value);
        } else {
          return false;
        }
      }
    }, {
      key: "remove",
      value: function remove(key) {
        if (localStorage) {
          return localStorage.removeItem(key);
        } else {
          return false;
        }
      }
    }]);

    return localStore;
  })();

/***/ }
/******/ ])
});
;