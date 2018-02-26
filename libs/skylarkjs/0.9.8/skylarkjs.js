/**
 * skylarkjs - An Elegant JavaScript Library and HTML5 Application Framework.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.8
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop();
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                exports: null
            };
            require(id);
        } else {
            resolved[id] = factory;
        }
    };
    require = globals.require = function(deps,cb) {
        function requireOne(id) {
            if (!map.hasOwnProperty(id)) {
                throw new Error('Module ' + id + ' has not been defined');
            }
            var module = map[id];
            if (!module.exports) {
                var args = [];

                module.deps.forEach(function(dep){
                    args.push(require(dep));
                })

                module.exports = module.factory.apply(window, args);
            }
            return module.exports;
        }
        var onedep = typeof deps === "string";
        if (!cb && onedep) {
            return requireOne(deps);
        }
        if (onedep) {
            deps = [deps];
        }
        var modules = deps.map(function(id){
            return requireOne(id);
        });
        if (cb) {
            cb.apply(null,modules);
        } else {
            return modules;
        }

    };
  }

  factory(define,require);

  function xhrGet(url,callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()   {
        if (this.readyState == 4) {
            callback(this.response || this.responseText);
        }
    }
    xhr.open("GET",url,true);
    xhr.send( null );
  }
  if (!isAmd) {
    var skylarkjs = require("skylarkjs");

    if (isCmd) {
      exports = skylarkjs;
    } else {
      globals.skylarkjs = skylarkjs;
    }
  } else {
    require.config({
        baseUrl : "./"
    });
  }

require([
  "skylarkjs"
], function (skylark,http) {
    xhrGet("./slax-config.json",function(res){
        if (!res) {
            console.error("can't find the slax-config.json!");
            return;
        }
        var cfg = JSON.parse(res);
        if (isAmd) {
            require.config(cfg.runtime);
        }

       
        var initApp = function(spa, _cfg) {
            _cfg = _cfg || cfg;
            if (cfg.contextPath) {
              _cfg.baseUrl = cfg.contextPath;
            }
            var app = spa(_cfg);

            globals.go =  function(path, force) {
                app.go(path, force);
            };

            app.prepare().then(function(){
                app.run();
            });
        };
        if(cfg.spaModule) {
            require([cfg.spaModule], function(spa) {
                if(spa._start) {
                    spa._start().then(function(_cfg){
                        initApp(spa, _cfg);
                    });
                } else {
                    initApp(spa);
                }
            });
        } else {
            initApp(skylark.spa);
        }
    });


});

})(function(define,require) {
define('skylark-langx/skylark',[], function() {
    var skylark = {

    };
    return skylark;
});

define('skylark-utils/skylark',["skylark-langx/skylark"], function(skylark) {
    return skylark;
});

define('skylarkjs/skylark',[
    "skylark-utils/skylark"
], function(skylark) {
    return skylark;
});

define('skylark-langx/langx',["./skylark"], function(skylark) {
    var toString = {}.toString,
        concat = Array.prototype.concat,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        filter = Array.prototype.filter;

    var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments){
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if(around){
            var advised = advice(function(){
                return previous.advice(this, arguments);
            });
            signal = {
                remove: function(){
                    if(advised){
                        advised = dispatcher = advice = null;
                    }
                },
                advice: function(target, args){
                    return advised ?
                        advised.apply(target, args) :  // called the advised function
                        previous.advice(target, args); // cancelled, skip to next one
                }
            };
        }else{
            // create the remove handler
            signal = {
                remove: function(){
                    if(signal.advice){
                        var previous = signal.previous;
                        var next = signal.next;
                        if(!next && !previous){
                            delete dispatcher[type];
                        }else{
                            if(previous){
                                previous.next = next;
                            }else{
                                dispatcher[type] = next;
                            }
                            if(next){
                                next.previous = previous;
                            }
                        }

                        // remove the advice to signal that this signal has been removed
                        dispatcher = advice = signal.advice = null;
                    }
                },
                id: nextId++,
                advice: advice,
                receiveArguments: receiveArguments
            };
        }
        if(previous && !around){
            if(type == "after"){
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while(previous.next && (previous = previous.next)){}
                previous.next = signal;
                signal.previous = previous;
            }else if(type == "before"){
                // add to beginning
                dispatcher[type] = signal;
                signal.next = previous;
                previous.previous = signal;
            }
        }else{
            // around or first one just replaces
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type){
        return function(target, methodName, advice, receiveArguments){
            var existing = target[methodName], dispatcher;
            if(!existing || existing.target != target){
                // no dispatcher in place
                target[methodName] = dispatcher = function(){
                    var executionId = nextId;
                    // before advice
                    var args = arguments;
                    var before = dispatcher.before;
                    while(before){
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    // around advice
                    if(dispatcher.around){
                        var results = dispatcher.around.advice(this, args);
                    }
                    // after advice
                    var after = dispatcher.after;
                    while(after && after.id < executionId){
                        if(after.receiveArguments){
                            var newResults = after.advice.apply(this, args);
                            // change the return value only if a new value was returned
                            results = newResults === undefined ? results : newResults;
                        }else{
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if(existing){
                    dispatcher.around = {advice: function(target, args){
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }


    var createClass = (function() {
        function extendClass(ctor, props, options) {
            // Copy the properties to the prototype of the class.
            var proto = ctor.prototype,
                _super = ctor.superclass.prototype,
                noOverrided = options && options.noOverrided;

            for (var name in props) {
                if (name === "constructor") {
                    continue;
                }

                // Check if we're overwriting an existing function
              proto[name] = typeof props[name] == "function" && !props[name]._constructor && !noOverrided && typeof _super[name] == "function" ?
                      (function(name, fn, superFn) {
                        return function() {
                            var tmp = this.overrided;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this.overrided = superFn;

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);

                            this.overrided = tmp;

                            return ret;
                        };
                    })(name, props[name], _super[name]) :
                    props[name];
            }

            return ctor;
        }

        return function createClass(props, parent, options) {

            var _constructor = props.constructor;
            if (_constructor === Object) {
                _constructor = function() {
                    if (this.init) {
                        this.init.apply(this, arguments);
                    }
                };
            };

            var klassName = props.klassName || "",
                ctor = new Function(
                    "return function " + klassName + "() {" +
                    "var inst = this," +
                    " ctor = arguments.callee;" +
                    "if (!(inst instanceof ctor)) {" +
                    "inst = Object.create(ctor.prototype);" +
                    "}" +
                    "ctor._constructor.apply(inst, arguments);" +
                    "return inst;" +
                    "}"
                )();
            ctor._constructor = _constructor;
            parent = parent || Object;
            // Populate our constructed prototype object
            ctor.prototype = Object.create(parent.prototype);

            // Enforce the constructor to be what we expect
            ctor.prototype.constructor = ctor;
            ctor.superclass = parent;

            // And make this class extendable
            ctor.__proto__ = parent;

            if (!ctor.partial) {
                ctor.partial = function(props, options) {
                    return extendClass(this, props, options);
                };
            }
            if (!ctor.inherit) {
                ctor.inherit = function(props, options) {
                    return createClass(props, this, options);
                };
            }

            ctor.partial(props, options);

            return ctor;
        }
    })();


    function clone( /*anything*/ src,checkCloneMethod) {
        var copy;
        if (src === undefined || src === null) {
            copy = src;
        } else if (checkCloneMethod && src.clone) {
            copy = src.clone();
        } else if (isArray(src)) {
            copy = [];
            for (var i = 0; i < src.length; i++) {
                copy.push(clone(src[i]));
            }
        } else if (isPlainObject(src)) {
            copy = {};
            for (var key in src) {
                copy[key] = clone(src[key]);
            }
        } else {
            copy = src;
        }

        return copy;

    }

    function createEvent(type, props) {
        var e = new CustomEvent(type, props);
        return safeMixin(e, props);
    }
    
    function debounce(fn, wait) {
        var timeout,
            args,
            later = function() {
                fn.apply(null, args);
            };

        return function() {
            args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    var delegate = (function() {
        // boodman/crockford delegation w/ cornford optimization
        function TMP() {}
        return function(obj, props) {
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if (props) {
                mixin(tmp, props);
            }
            return tmp; // Object
        };
    })();


    var Deferred = function() {
        this.promise = new Promise(function(resolve, reject) {
            this._resolve = resolve;
            this._reject = reject;
        }.bind(this));

        this.resolve = Deferred.prototype.resolve.bind(this);
        this.reject = Deferred.prototype.reject.bind(this);
    };

    Deferred.prototype.resolve = function(value) {
        this._resolve.call(this.promise, value);
        return this;
    };

    Deferred.prototype.reject = function(reason) {
        this._reject.call(this.promise, reason);
        return this;
    };


    Deferred.prototype.then = function(callback, errback, progback) {
        return this.promise.then(callback, errback, progback);
    };

    Deferred.all = function(array) {
        return Promise.all(array);
    };

    Deferred.first = function(array) {
        return Promise.race(array);
    };

    Deferred.when = function(valueOrPromise, callback, errback, progback) {
        var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
        var nativePromise = receivedPromise && valueOrPromise instanceof Promise;

        if (!receivedPromise) {
            if (arguments.length > 1) {
                return callback ? callback(valueOrPromise) : valueOrPromise;
            } else {
                return new Deferred().resolve(valueOrPromise);
            }
        } else if (!nativePromise) {
            var deferred = new Deferred(valueOrPromise.cancel);
            valueOrPromise.then(deferred.resolve, deferred.reject, deferred.progress);
            valueOrPromise = deferred.promise;
        }

        if (callback || errback || progback) {
            return valueOrPromise.then(callback, errback, progback);
        }
        return valueOrPromise;
    };

    Deferred.reject = function(err) {
        var d = new Deferred();
        d.reject(err);
        return d.promise;
    };

    Deferred.resolve = function(data) {
        var d = new Deferred();
        d.resolve(data);
        return d.promise;
    };

    Deferred.immediate = Deferred.resolve;

    var Evented = createClass({
        on: function(events, selector, data, callback, ctx, /*used internally*/ one) {
            var self = this,
                _hub = this._hub || (this._hub = {});

            if (isPlainObject(events)) {
                ctx = callback;
                each(events, function(type, fn) {
                    self.on(type, selector, data, fn, ctx, one);
                });
                return this;
            }

            if (!isString(selector) && !isFunction(callback)) {
                ctx = callback;
                callback = data;
                data = selector;
                selector = undefined;
            }

            if (isFunction(data)) {
                ctx = callback;
                callback = data;
                data = null;
            }

            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(name) {
                (_hub[name] || (_hub[name] = [])).push({
                    fn: callback,
                    selector: selector,
                    data: data,
                    ctx: ctx,
                    one: one
                });
            });

            return this;
        },

        one: function(events, selector, data, callback, ctx) {
            return this.on(events, selector, data, callback, ctx, 1);
        },

        trigger: function(e /*,argument list*/ ) {
            if (!this._hub) {
                return this;
            }

            var self = this;

            if (isString(e)) {
                e = new CustomEvent(e);
            }

            e.target = this;

            var args = slice.call(arguments, 1);
            if (isDefined(args)) {
                args = [e].concat(args);
            } else {
                args = [e];
            }
            [e.type || e.name, "all"].forEach(function(eventName) {
                var listeners = self._hub[eventName];
                if (!listeners) {
                    return;
                }

                var len = listeners.length,
                    reCompact = false;

                for (var i = 0; i < len; i++) {
                    var listener = listeners[i];
                    if (e.data) {
                        if (listener.data) {
                            e.data = mixin({}, listener.data, e.data);
                        }
                    } else {
                        e.data = listener.data || null;
                    }
                    listener.fn.apply(listener.ctx, args);
                    if (listener.one) {
                        listeners[i] = null;
                        reCompact = true;
                    }
                }

                if (reCompact) {
                    self._hub[eventName] = compact(listeners);
                }

            });
            return this;
        },

        listened: function(event) {
            var evtArr = ((this._hub || (this._events = {}))[event] || []);
            return evtArr.length > 0;
        },

        listenTo: function(obj, event, callback, /*used internally*/ one) {
            if (!obj) {
                return this;
            }

            // Bind callbacks on obj,
            if (isString(callback)) {
                callback = this[callback];
            }

            if (one) {
                obj.one(event, callback, this);
            } else {
                obj.on(event, callback, this);
            }

            //keep track of them on listening.
            var listeningTo = this._listeningTo || (this._listeningTo = []),
                listening;

            for (var i = 0; i < listeningTo.length; i++) {
                if (listeningTo[i].obj == obj) {
                    listening = listeningTo[i];
                    break;
                }
            }
            if (!listening) {
                listeningTo.push(
                    listening = {
                        obj: obj,
                        events: {}
                    }
                );
            }
            var listeningEvents = listening.events,
                listeningEvent = listeningEvents[event] = listeningEvents[event] || [];
            if (listeningEvent.indexOf(callback) == -1) {
                listeningEvent.push(callback);
            }

            return this;
        },

        listenToOnce: function(obj, event, callback) {
            return this.listenTo(obj, event, callback, 1);
        },

        off: function(events, callback) {
            var _hub = this._hub || (this._hub = {});
            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(name) {
                var evts = _hub[name];
                var liveEvents = [];

                if (evts && callback) {
                    for (var i = 0, len = evts.length; i < len; i++) {
                        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                            liveEvents.push(evts[i]);
                    }
                }

                if (liveEvents.length) {
                    _hub[name] = liveEvents;
                } else {
                    delete _hub[name];
                }
            });

            return this;
        },
        unlistenTo: function(obj, event, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            for (var i = 0; i < listeningTo.length; i++) {
                var listening = listeningTo[i];

                if (obj && obj != listening.obj) {
                    continue;
                }

                var listeningEvents = listening.events;
                for (var eventName in listeningEvents) {
                    if (event && event != eventName) {
                        continue;
                    }

                    listeningEvent = listeningEvents[eventName];

                    for (var j = 0; j < listeningEvent.length; j++) {
                        if (!callback || callback == listeningEvent[i]) {
                            listening.obj.off(eventName, listeningEvent[i], this);
                            listeningEvent[i] = null;
                        }
                    }

                    listeningEvent = listeningEvents[eventName] = compact(listeningEvent);

                    if (isEmptyObject(listeningEvent)) {
                        listeningEvents[eventName] = null;
                    }

                }

                if (isEmptyObject(listeningEvents)) {
                    listeningTo[i] = null;
                }
            }

            listeningTo = this._listeningTo = compact(listeningTo);
            if (isEmptyObject(listeningTo)) {
                this._listeningTo = null;
            }

            return this;
        }
    });

    
    function compact(array) {
        return filter.call(array, function(item) {
            return item != null;
        });
    }

    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                    +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? JSON.parse(value) :
                    value) : value;
        } catch (e) {
            return value;
        }
    }

    function each(obj, callback) {
        var length, key, i, undef, value;

        if (obj) {
            length = obj.length;

            if (length === undef) {
                // Loop object items
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        value = obj[key];
                        if (callback.call(value, key, value) === false) {
                            break;
                        }
                    }
                }
            } else {
                // Loop array items
                for (i = 0; i < length; i++) {
                    value = obj[i];
                    if (callback.call(value, i, value) === false) {
                        break;
                    }
                }
            }
        }

        return this;
    }

    function flatten(array) {
        if (isArrayLike(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (isArrayLike(item)) {
                    for (var j = 0; j < item.length; j++) {
                        result.push(item[j]);
                    }
                } else {
                    result.push(item);
                }
            }
            return result;
        } else {
            return array;
        }
        //return array.length > 0 ? concat.apply([], array) : array;
    }

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    var getAbsoluteUrl = (function() {
        var a;

        return function(url) {
            if (!a) a = document.createElement('a');
            a.href = url;

            return a.href;
        };
    })();

    function getQueryParams(url) {
        var url = url || window.location.href,
            segs = url.split("?"),
            params = {};

        if (segs.length > 1) {
            segs[1].split("&").forEach(function(queryParam) {
                var nv = queryParam.split('=');
                params[nv[0]] = nv[1];
            });
        }
        return params;
    }

    function grep(array, callback) {
        var out = [];

        each(array, function(i, item) {
            if (callback(item, i)) {
                out.push(item);
            }
        });

        return out;
    }

    function inArray(item, array) {
        if (!array) {
            return -1;
        }
        var i;

        if (array.indexOf) {
            return array.indexOf(item);
        }

        i = array.length;
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    }

    function inherit(ctor, base) {
        var f = function() {};
        f.prototype = base.prototype;

        ctor.prototype = new f();
    }

    function isArray(object) {
        return object && object.constructor === Array;
    }

    function isArrayLike(obj) {
        return !isString(obj) && !isHtmlNode(obj) && typeof obj.length == 'number';
    }

    function isBoolean(obj) {
        return typeof(obj) === "boolean";
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    //if (a instanceof _) a = a._wrapped;
    //if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = Object.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (Object.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(b[key]!==undefined && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
    function isEqual(a, b) {
        return eq(a, b);
    }

    function isFunction(value) {
        return type(value) == "function";
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isWindow(obj) {
        return obj && obj == obj.window;
    }

    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }

    function isHtmlNode(obj) {
        return obj && (obj instanceof Node);
    }

    function isNumber(obj) {
        return typeof obj == 'number';
    }

    function isSameOrigin(href) {
        if (href) {
            var origin = location.protocol + '//' + location.hostname;
            if (location.port) {
                origin += ':' + location.port;
            }
            return href.startsWith(origin);
        }
    }


    function isEmptyObject(obj) {
        var name;
        for (name in obj) {
            if (obj[name] !== null) {
                return false;
            }
        }
        return true;
    }

    function makeArray(obj, offset, startWith) {
       if (isArrayLike(obj) ) {
        return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
      }

      // array of single index
      return [ obj ];             
    }

    function map(elements, callback) {
        var value, values = [],
            i, key
        if (isArrayLike(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback.call(elements[i], elements[i], i);
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback.call(elements[key], elements[key], key);
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    function nextTick(fn) {
        requestAnimationFrame(fn);
        return this;
    }

    function proxy(fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function() {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
            }
            return proxyFn;
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return proxy.apply(null, args)
            } else {
                return proxy(fn[context], fn);
            }
        } else {
            throw new TypeError("expected function");
        }
    }


    function toPixel(value) {
        // style values can be floats, client code may want
        // to round for integer pixels.
        return parseFloat(value) || 0;
    }

    var type = (function() {
        var class2type = {};

        // Populate the class2type map
        each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        return function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object";
        };
    })();

    function trim(str) {
        return str == null ? "" : String.prototype.trim.call(str);
    }

    function removeItem(items, item) {
        if (isArray(items)) {
            var idx = items.indexOf(item);
            if (idx != -1) {
                items.splice(idx, 1);
            }
        } else if (isPlainObject(items)) {
            for (var key in items) {
                if (items[key] == item) {
                    delete items[key];
                    break;
                }
            }
        }

        return this;
    }

    function _mixin(target, source, deep, safe) {
        for (var key in source) {
            if (!source.hasOwnProperty(key)) {
                continue;
            }
            if (safe && target[key] !== undefined) {
                continue;
            }
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                _mixin(target[key], source[key], deep, safe);
            } else if (source[key] !== undefined) {
                target[key] = source[key]
            }
        }
        return target;
    }

    function _parseMixinArgs(args) {
        var params = slice.call(arguments, 0);
        target = params.shift(),
            deep = false;
        if (isBoolean(params[params.length - 1])) {
            deep = params.pop();
        }

        return {
            target: target,
            sources: params,
            deep: deep
        };
    }

    function mixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, false);
        });
        return args.target;
    }

    function result(obj, path, fallback) {
        if (!isArray(path)) {
            path = [path]
        };
        var length = path.length;
        if (!length) {
          return isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        for (var i = 0; i < length; i++) {
          var prop = obj == null ? void 0 : obj[path[i]];
          if (prop === void 0) {
            prop = fallback;
            i = length; // Ensure we don't continue iterating.
          }
          obj = isFunction(prop) ? prop.call(obj) : prop;
        }

        return obj;
    }

    function safeMixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, true);
        });
        return args.target;
    }

    function substitute( /*String*/ template,
        /*Object|Array*/
        map,
        /*Function?*/
        transform,
        /*Object?*/
        thisObject) {
        // summary:
        //    Performs parameterized substitutions on a string. Throws an
        //    exception if any parameter is unmatched.
        // template:
        //    a string with expressions in the form `${key}` to be replaced or
        //    `${key:format}` which specifies a format function. keys are case-sensitive.
        // map:
        //    hash to search for substitutions
        // transform:
        //    a function to process all parameters before substitution takes


        thisObject = thisObject || window;
        transform = transform ?
            proxy(thisObject, transform) : function(v) {
                return v;
            };

        function getObject(key, map) {
            if (key.match(/\./)) {
                var retVal,
                    getValue = function(keys, obj) {
                        var _k = keys.pop();
                        if (_k) {
                            if (!obj[_k]) return null;
                            return getValue(keys, retVal = obj[_k]);
                        } else {
                            return retVal;
                        }
                    };
                return getValue(key.split(".").reverse(), map);
            } else {
                return map[key];
            }
        }

        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
            function(match, key, format) {
                var value = getObject(key, map);
                if (format) {
                    value = getObject(format, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            }); // String
    }


    var Stateful = Evented.inherit({
        init : function(attributes, options) {
            var attrs = attributes || {};
            options || (options = {});
            this.cid = uniqueId(this.cidPrefix);
            this.attributes = {};
            if (options.collection) this.collection = options.collection;
            if (options.parse) attrs = this.parse(attrs, options) || {};
            var defaults = result(this, 'defaults');
            attrs = mixin({}, defaults, attrs);
            this.set(attrs, options);
            this.changed = {};
        },

        // A hash of attributes whose current and previous value differ.
        changed: null,

        // The value returned during the last failed validation.
        validationError: null,

        // The default name for the JSON `id` attribute is `"id"`. MongoDB and
        // CouchDB users may want to set this to `"_id"`.
        idAttribute: 'id',

        // The prefix is used to create the client id which is used to identify models locally.
        // You may want to override this if you're experiencing name clashes with model ids.
        cidPrefix: 'c',


        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return clone(this.attributes);
        },


        // Get the value of an attribute.
        get: function(attr) {
          return this.attributes[attr];
        },

        // Returns `true` if the attribute contains a value that is not null
        // or undefined.
        has: function(attr) {
          return this.get(attr) != null;
        },

        // Set a hash of model attributes on the object, firing `"change"`. This is
        // the core primitive operation of a model, updating the data and notifying
        // anyone who needs to know about the change in state. The heart of the beast.
        set: function(key, val, options) {
          if (key == null) return this;

          // Handle both `"key", value` and `{key: value}` -style arguments.
          var attrs;
          if (typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options || (options = {});

          // Run validation.
          if (!this._validate(attrs, options)) return false;

          // Extract attributes and options.
          var unset      = options.unset;
          var silent     = options.silent;
          var changes    = [];
          var changing   = this._changing;
          this._changing = true;

          if (!changing) {
            this._previousAttributes = clone(this.attributes);
            this.changed = {};
          }

          var current = this.attributes;
          var changed = this.changed;
          var prev    = this._previousAttributes;

          // For each `set` attribute, update or delete the current value.
          for (var attr in attrs) {
            val = attrs[attr];
            if (!isEqual(current[attr], val)) changes.push(attr);
            if (!isEqual(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
          }

          // Update the `id`.
          if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

          // Trigger all relevant attribute changes.
          if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
          }

          // You might be wondering why there's a `while` loop here. Changes can
          // be recursively nested within `"change"` events.
          if (changing) return this;
          if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
          }
          this._pending = false;
          this._changing = false;
          return this;
        },

        // Remove an attribute from the model, firing `"change"`. `unset` is a noop
        // if the attribute doesn't exist.
        unset: function(attr, options) {
          return this.set(attr, void 0, mixin({}, options, {unset: true}));
        },

        // Clear all attributes on the model, firing `"change"`.
        clear: function(options) {
          var attrs = {};
          for (var key in this.attributes) attrs[key] = void 0;
          return this.set(attrs, mixin({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !isEmptyObject(this.changed);
          return this.changed[attr] !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          if (!diff) return this.hasChanged() ? clone(this.changed) : false;
          var old = this._changing ? this._previousAttributes : this.attributes;
          var changed = {};
          for (var attr in diff) {
            var val = diff[attr];
            if (isEqual(old[attr], val)) continue;
            changed[attr] = val;
          }
          return !isEmptyObject(changed) ? changed : false;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;
          return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          return clone(this._previousAttributes);
        },

        // Create a new model with identical attributes to this one.
        clone: function() {
          return new this.constructor(this.attributes);
        },

        // A model is new if it has never been saved to the server, and lacks an id.
        isNew: function() {
          return !this.has(this.idAttribute);
        },

        // Check if the model is currently in a valid state.
        isValid: function(options) {
          return this._validate({}, mixin({}, options, {validate: true}));
        },

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
        _validate: function(attrs, options) {
          if (!options.validate || !this.validate) return true;
          attrs = mixin({}, this.attributes, attrs);
          var error = this.validationError = this.validate(attrs, options) || null;
          if (!error) return true;
          this.trigger('invalid', this, error, mixin(options, {validationError: error}));
          return false;
        }
    });

    var _uid = 1;

    function uid(obj) {
        return obj._uid || (obj._uid = _uid++);
    }

    function uniq(array) {
        return filter.call(array, function(item, idx) {
            return array.indexOf(item) == idx;
        })
    }

    var idCounter = 0;
    function uniqueId (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    }

    function langx() {
        return langx;
    }

    mixin(langx, {
        after: aspect("after"),

        around: aspect("around"),

        before: aspect("before"),

        camelCase: function(str) {
            return str.replace(/-([\da-z])/g, function(a) {
                return a.toUpperCase().replace('-', '');
            });
        },
        clone: clone,

        compact: compact,

        createEvent : createEvent,

        dasherize: dasherize,

        debounce: debounce,

        delegate: delegate,

        Deferred: Deferred,

        Evented: Evented,

        deserializeValue: deserializeValue,

        each: each,

        flatten: flatten,

        funcArg: funcArg,

        getQueryParams: getQueryParams,

        inArray: inArray,

        isArray: isArray,

        isArrayLike: isArrayLike,

        isBoolean: isBoolean,

        isDefined: function(v) {
            return v !== undefined;
        },

        isDocument: isDocument,

        isEmptyObject: isEmptyObject,

        isEqual: isEqual,

        isFunction: isFunction,

        isHtmlNode: isHtmlNode,

        isObject: isObject,

        isPlainObject: isPlainObject,

        isNumber: isNumber,

        isString: isString,

        isSameOrigin: isSameOrigin,

        isWindow: isWindow,

        klass: function(props, parent, options) {
            return createClass(props, parent, options);
        },

        lowerFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        makeArray: makeArray,

        map: map,

        mixin: mixin,

        nextTick: nextTick,

        proxy: proxy,

        removeItem: removeItem,

        result : result,
        
        returnTrue: function() {
            return true;
        },

        returnFalse: function() {
            return false;
        },

        safeMixin: safeMixin,

        serializeValue: function(value) {
            return JSON.stringify(value)
        },

        Stateful: Stateful,

        substitute: substitute,

        toPixel: toPixel,

        trim: trim,

        type: type,

        uid: uid,

        uniq: uniq,

        uniqueId: uniqueId,

        upperFirst: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        URL: window.URL || window.webkitURL

    });

    return skylark.langx = langx;
});
/**
 * skylark-router - An Elegant HTML5 Routing Framework.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.6-beta
 * @link www.skylarkjs.org
 * @license MIT
 */
define('skylark-router/router',[
    "skylark-langx/skylark",
    "skylark-langx/langx"
], function(skylark, langx) {

    var _curCtx,
        _prevCtx,
        _baseUrl,
        _homePath,
        _routes = {},
        _cache = {},
        _hub = new langx.Evented();

    function createEvent(type,props) {
        var e = new CustomEvent(type,props);
        return langx.safeMixin(e, props);
    }

    var Route = langx.Evented.inherit({
        klassName: "Route",
        init: function(name, setting) {
            setting = langx.mixin({}, setting);
            var pathto = setting.pathto || "",
                pattern = pathto,
                paramNames = pattern.match(/\:([a-zA-Z0-9_]+)/g);
            if (paramNames !== null) {
                paramNames = paramNames.map(function(paramName) {
                    return paramName.substring(1);
                });
                pattern = pattern.replace(/\:([a-zA-Z0-9_]+)/g, '(.*?)');
            } else {
                paramNames = [];
            }
            if (pattern === "*") {
                pattern = "(.*)";
            } else {
                pattern = pattern.replace("/", "\\/");
            }

            this._setting = setting;
            this.name = name;
            this.pathto = pathto;
            this.paramNames = paramNames;
            this.params = pattern;
            this.regex = new RegExp("^" + pattern + "$", "");

            var self = this;
            ["entering", "entered", "exiting", "exited"].forEach(function(eventName) {
                if (langx.isFunction(setting[eventName])) {
                    self.on(eventName, setting[eventName]);
                }
            });
        },

        enter: function(ctx,query) {
            if (query) {
                var r = this._entering(ctx),
                    self = this;

                return langx.Deferred.when(r).then(function(){
                    var e = createEvent("entering", {
                        route: self,
                        result: true
                    });

                    self.trigger(e);

                    return e.result;
                });
            } else {
                this._entered(ctx);

                this.trigger(createEvent("entered", langx.safeMixin({
                    route: this
                }, ctx)));
                return this;
            }
        },

        exit: function(ctx, query) {
            if (query) {
                var ok = this._exiting(ctx);
                if (!ok) {
                    return false;
                }

                var e = createEvent("exiting", {
                    route: this,
                    result: true
                });

                this.trigger(e);

                return e.result;
            } else {
                this._exited(ctx);
                this.trigger(createEvent("exited", langx.safeMixin({
                    route: this
                }, ctx)));

                return this;
            }
        },

        match: function(path) {
            var names = this.paramNames,
                x = path.indexOf('?'),
                path = ~x ? path.slice(0, x) : decodeURIComponent(path),
                m = this.regex.exec(path);

            if (!m) {
                return false
            };

            var params = {};
            for (var i = 1, len = m.length; i < len; ++i) {
                var name = names[i - 1],
                    val = decodeURIComponent(m[i]);
                params[name] = val;
            }

            return params;
        },

        path: function(params) {
            var path = this.pathto;
            if (params) {
                path = path.replace(/:([a-zA-Z0-9_]+)/g, function(match, paramName) {
                    return params[paramName];
                });
            }
            return path;
        },

        _entering: function(ctx) {
            return true;
        },
        _entered: function(ctx) {
            return true;
        },
        _exiting: function(ctx) {
            return true;
        },
        _exited: function(ctx) {
            return true;
        },
    });

    function current() {
        return _curCtx;
    }

    // refresh the current route
    function dispatch(ctx) {

        if (_curCtx) {
            var ret = _curCtx.route.exit({
                path: _curCtx.path,
                params: _curCtx.params
            }, true);
            if (!ret) {
                return;
            }
        }

        _prevCtx = _curCtx;
        _curCtx = ctx;
        if (!_curCtx.route) {
            var m = map(_curCtx.path);
            _curCtx.route = m.route;
            _curCtx.params = m.params;
        }

        var r = _curCtx.route.enter({
            force: _curCtx.force,
            path: _curCtx.path,
            params: _curCtx.params
        },true);

        langx.Deferred.when(r).then(function() {
            _hub.trigger(createEvent("routing", {
                current: _curCtx,
                previous: _prevCtx
            }));

            _curCtx.route.enter({
                path: _curCtx.path,
                params: _curCtx.params
            },false);

            if (_prevCtx) {
                _prevCtx.route.exit({
                    path: _prevCtx.path,
                    params: _prevCtx.params
                }, false);
            }

            _hub.trigger(createEvent("routed", {
                current: _curCtx,
                previous: _prevCtx
            }));
        });
    }

    function go(path, force) {
        if (!force && _curCtx && _curCtx.path == path) {
            return false;
        }
        var ctx = map(path);
        if (ctx) {
            ctx.path = path;

            if (router.useHistoryApi) {
                var state = {
                    force: force,
                    path: path
                }

                window.history.pushState(state, document.title, (_baseUrl + path).replace("//", "/"));
                window.dispatchEvent(createEvent("popstate", {
                    state: state
                }));
            } else if (router.useHashbang) {
                var newHash = "#!" + path;
                if (window.location.hash !== newHash) {
                    window.location.hash = newHash;
                } else {
                    dispatch(ctx);
                };
            } else {
                dispatch(ctx);
            }
        }
        return true;
    }

    function map(path, noCache) {
        var finded = false;
        if (!noCache) {
            finded = _cache[path];
            if (finded) {
                return finded;
            }
        }
        langx.each(_routes, function(name, route) {
            var ret = route.match(path);
            if (ret) {
                finded = {
                    route: route,
                    params: ret
                }
                return false;
            }
            return true;
        });
        if (finded && !noCache) {
            _cache[path] = finded;
        }
        return finded;
    }

    function path(routeName, params) {
        var route = _routes[routeName],
            path;
        if (route) {
            path = route.path(params);
        }
        return path;
    }

    function previous() {
        return _prevCtx;
    }

    function baseUrl(path) {
        if (langx.isDefined(path)) {
            _baseUrl = path;
            return this;
        } else {
            return _baseUrl;
        }
    }

    function hub(){
        return _hub;
    }

    function homePath(path) {
        if (langx.isDefined(path)) {
            _homePath = path;
            return this;
        } else {
            return _homePath;
        }
    }

    function route(name, setting) {
        if (langx.isDefined(setting)) {
            var settings = {};
            settings[name] = setting;
            routes(settings);
            return this;
        } else {
            return _routes[name];
        }
    }

    function routes(settings) {
        if (!langx.isDefined(settings)) {
            return langx.mixin({}, _routes);
        } else {
            for (var name in settings) {
                _routes[name] = new router.Route(name, settings[name]);
            }
        }
    }

    //starts routing urls
    function start() {
        if (router.useHashbang == null && router.useHistoryApi == null) {
            if (window.location.host  && window.history.pushState) {
                //web access
                router.useHistoryApi = true;
            } else {
                // local access
                router.useHashbang = true;
            }
        }

        var initPath = "";

        if (router.useHistoryApi) {
            initPath = window.location.pathname;
            if (_baseUrl === undefined) {
                _baseUrl = initPath.replace(/\/$/, "");
            }
            initPath = initPath.replace(_baseUrl, "") || _homePath || "/";
        } else if (router.useHashbang) {
            initPath = window.location.hash.replace("#!", "") || _homePath || "/";
        } else {
            initPath = "/";
        }

        if (!initPath.startsWith("/")) {
            initPath = "/" + initPath;
        }
        /*
        eventer.on(document.body, "click", "a[href]", function(e) {
            var elm = e.currentTarget,
                url = elm.getAttribute("href");

            if (url == "#") {
                return;
            }
            if (url && langx.isSameOrigin(elm.href)) {
                if (url.indexOf(_baseUrl) === 0) {
                    url = url.substr(_baseUrl.length);
                    eventer.stop(e);
                    url = url.replace('#!', '');
                    go(url);
                }
            }
        });
        */
        if (router.useHistoryApi) {
            window.addEventListener("popstate", function(e) {
                if(e.state) dispatch(e.state);
                e.preventDefault();
            });
        } else if (router.useHashbang) {
            window.addEventListener("hashchange", function(e) {
                dispatch({
                    path: window.location.hash.replace(/^#!/, "")
                });
                e.preventDefault();
            });
        }

        go(initPath);
    }

    var router = function() {
        return router;
    };

    langx.mixin(router, {
        "Route": Route,

        // Current path being processed
        "current": current,

        // Changes the current path
        "go": go,

        "map": map,

        "hub": hub,

        "off": function() {
            _hub.off.apply(_hub, arguments);
        },

        "on": function() {
            _hub.on.apply(_hub, arguments);
        },

        "one": function() {
            _hub.one.apply(_hub, arguments);
        },

        // Returns the path of the named route
        "path": path,

        "previous": previous,

        "baseUrl": baseUrl,

        "homePath": homePath,

        "route": route,

        "routes": routes,

        //starts routing urls
        "start": start,

        "trigger": function(e) {
            _hub.trigger(e);
            return this;
        },

        "useHistoryApi": null,
        "useHashbang": null
    });

    return skylark.router = router;
});

define('skylarkjs/router',[
    "skylark-router/router"
], function(router) {
    return router;
});

define('skylark-spa/spa',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-router/router"
], function(skylark, langx, router) {
    var Deferred = langx.Deferred;

    function createEvent(type, props) {
        var e = new CustomEvent(type, props);
        return langx.safeMixin(e, props);
    }

    var Route = router.Route = router.Route.inherit({
        klassName: "SpaRoute",

        init: function(name, setting) {
            this.overrided(name, setting);
            this.content = setting.content;
            this.forceRefresh = setting.forceRefresh;
            this.data = setting.data;
            //this.lazy = !!setting.lazy;
            var self = this;
            ["preparing", "rendering", "rendered"].forEach(function(eventName) {
                if (langx.isFunction(setting[eventName])) {
                    self.on(eventName, setting[eventName]);
                }
            });
        },

        _entering: function(ctx) {
            if (this.forceRefresh || ctx.force || !this._prepared) {
                return this.prepare();
            }
            return this;
        },

        getConfigData: function(key) {
            return key ? this.data[key] : this.data;
        },

        getNamedValue: function() {
            return window.location.pathname.match(this.regex);
        },

        prepare: function() {
            var d = new Deferred(),
                setting = this._setting,
                controllerSetting = setting.controller,
                controller = this.controller,

                self = this,
                content = setting.content,
                contentPath = setting.contentPath;

            require([controllerSetting.type], function(type) {
                controller = self.controller = new type(controllerSetting);
                d.resolve();
            });

            return d.then(function() {
                var e = createEvent("preparing", {
                    route: self,
                    result: true
                });
                self.trigger(e);
                return Deferred.when(e.result).then(function() {
                    self._prepared = true;
                });
            });
        },

        render: function(ctx) {
            var e = createEvent("rendering", {
                route: this,
                context: ctx,
                content: this.content
            });
            this.trigger(e);
            return e.content;
        },

        trigger: function(e) {
            var controller = this.controller;
            if (controller) {
                return controller.perform(e);
            } else {
                return this.overrided(e);
            }
        }
    });

    var RouteController = langx.Evented.inherit({
        klassName: "SpaRouteController",

        init: function(route, setting) {
            setting = setting || {};
            this.content = setting.content;
            this.data = setting.data;
        },

        getConfigData: function(key) {
            return key ? this.data[key] : this.data;
        },

        perform: function(e) {
            var eventName = e.type;
            if (this[eventName]) {
                return this[eventName].call(this, e);
            }

        }
    });

    var Page = langx.Evented.inherit({
        klassName: "SpaPage",

        init: function(params) {
            params = langx.mixin({
                "routeViewer": "body"
            }, params);

            this._params = params;
            this._rvc = document.querySelector(params.routeViewer);
            this._router = router;

            router.on("routed", langx.proxy(this, "refresh"));
        },

        prepare: function() {

        },

        //Refreshes the route
        refresh: function() {
            var curCtx = router.current(),
                prevCtx = router.previous();
            var content = curCtx.route.render(curCtx);
            if (content===undefined || content===null) {
                return;
            }
            if (langx.isString(content)) {
                this._rvc.innerHTML = content;
            } else {
                this._rvc.innerHTML = "";
                this._rvc.appendChild(content);
            }
            curCtx.route.trigger(createEvent("rendered", {
                route: curCtx.route,
                content: content
            }));
        }
    });

    var Plugin = langx.Evented.inherit({
        klassName: "SpaPlugin",

        init: function(name, setting) {
            this.name = name;

            if (langx.isString(setting.hookers)) {
                setting.hookers = setting.hookers.split(" ");
            }
            this._setting = setting;
        },

        isHooked: function(eventName) {
            var hookers = this._setting.hookers || [];
            return hookers.indexOf(eventName) > -1;
        },

        prepare: function() {
            var d = new Deferred(),
                setting = this._setting,
                controllerSetting = setting.controller,
                controller = this.controller,
                self = this;
            require([controllerSetting.type], function(type) {
                controller = self.controller = new type(controllerSetting);
                router.on(setting.hookers, {
                    plugin: self
                }, langx.proxy(controller.perform, controller));
                d.resolve();
            });
            return d.then(function() {
                var e = createEvent("preparing", {
                    plugin: self,
                    result: true
                });
                self.trigger(e);
                return Deferred.when(e.result).then(function() {
                    self._prepared = true;
                });
            });
        },

        trigger: function(e) {
            var controller = this.controller;
            if (controller) {
                return controller.perform(e);
            } else {
                return this.overrided(e);
            }
        }
    });

    var PluginController = langx.Evented.inherit({
        klassName: "SpaPluginController",

        init: function(plugin) {
            this.plugin = plugin;
        },

        perform: function(e) {
            var eventName = e.type;
            if (this[eventName]) {
                return this[eventName].call(this, e);
            }

        }
    });

    var Application = langx.Evented.inherit({
        klassName: "SpaApplication",

        init: function(config) {
            if (app) {
                return app;
            }
            var plugins = this._plugins = {};

            config = this._config = langx.mixin({
                plugins: {}
            }, config, true);

            langx.each(config.plugins, function(pluginName, setting) {
                plugins[pluginName] = new Plugin(pluginName, setting);
            });

            router.routes(config.routes);

            this._router = router;

            this._page = new spa.Page(config.page);

            document.title = config.title;
            var baseUrl = config.baseUrl;
            if (baseUrl === undefined) {
                baseUrl = config.baseUrl = (new langx.URL(document.baseURI)).pathname;
            }
            router.baseUrl(baseUrl);

            if (config.homePath) {
                router.homePath(config.homePath);
            }

            app = this;
        },

        getConfig: function(key) {
            return key ? this._config[key] : this._config;
        },

        go: function(path, force) {
            router.go(path, force);
            return this;
        },

        page: function() {
            return this._page;
        },

        prepare: function() {
            if (this._prepared) {
                return Deferred.resolve();
            }
            var self = this;

            var promises0 = langx.map(this._plugins, function(plugin, name) {
                if (plugin.isHooked("starting")) {
                    return plugin.prepare();
                }
            });

            return Deferred.all(promises0).then(function() {
                router.trigger(createEvent("starting", {
                    spa: self
                }));
                var promises1 = langx.map(router.routes(), function(route, name) {
                        if (route.lazy === false) {
                            return route.prepare();
                        }
                    }),
                    promises2 = langx.map(self._plugins, function(plugin, name) {
                        if (!plugin.isHooked("starting")) {
                            return plugin.prepare();
                        }
                    });


                return Deferred.all(promises1.concat(promises2)).then(function() {
                    self._prepared = true;
                });
            });
        },

        run: function() {
            this._router.start();
            router.trigger(createEvent("started", {
                spa: this
            }));
        }
    });

    var app;
    var spa = function(config) {
        if (!app) {
            window[config.name || "app"] = app = new spa.Application(config);
        }

        return app;
    }

    langx.mixin(spa, {
        "Application": Application,

        "Page": Page,

        "Plugin": Plugin,
        "PluginController": PluginController,

        "Route": Route,
        "RouteController": RouteController

    });

    return skylark.spa = spa;
});

define('skylarkjs/spa',[
    "skylark-spa/spa"
], function(spa) {
    return spa;
});

define('skylarkjs/langx',[
    "skylark-langx/langx"
], function(langx) {
    return langx;
});

define('skylarkjs/core',[
    "./skylark",
    "./router",
    "./spa",
    "./langx"
], function(skylark) {
    return skylark;
})
;
define('skylark-utils/langx',[
    "skylark-langx/langx"
], function(langx) {
    return langx;
});

define('skylark-utils/browser',[
    "./skylark",
    "./langx"
], function(skylark,langx) {
    var checkedCssProperties = {
        "transitionproperty": "TransitionProperty",
    };

    var css3PropPrefix = "",
        css3StylePrefix = "",
        css3EventPrefix = "",

        cssStyles = {},
        cssProps = {},

        vendorPrefix,
        vendorPrefixRE,
        vendorPrefixesRE = /^(Webkit|webkit|O|Moz|moz|ms)(.*)$/,

        document = window.document,
        testEl = document.createElement("div"),

        matchesSelector = testEl.webkitMatchesSelector ||
        testEl.mozMatchesSelector ||
        testEl.oMatchesSelector ||
        testEl.matchesSelector,

        testStyle = testEl.style;

    for (var name in testStyle) {
        var matched = name.match(vendorPrefixRE || vendorPrefixesRE);
        if (matched) {
            if (!vendorPrefixRE) {
                vendorPrefix = matched[1];
                vendorPrefixRE = new RegExp("^(" + vendorPrefix + ")(.*)$");

                css3StylePrefix = vendorPrefix;
                css3PropPrefix = '-' + vendorPrefix.toLowerCase() + '-';
                css3EventPrefix = vendorPrefix.toLowerCase();
            }

            cssStyles[langx.lowerFirst(matched[2])] = name;
            var cssPropName = langx.dasherize(matched[2]);
            cssProps[cssPropName] = css3PropPrefix + cssPropName;

        }
    }


    function normalizeCssEvent(name) {
        return css3EventPrefix ? css3EventPrefix + name : name.toLowerCase();
    }

    function normalizeCssProperty(name) {
        return cssProps[name] || name;
    }

    function normalizeStyleProperty(name) {
        return cssStyles[name] || name;
    }

    function browser() {
        return browser;
    }

    langx.mixin(browser, {
        css3PropPrefix: css3PropPrefix,

        normalizeStyleProperty: normalizeStyleProperty,

        normalizeCssProperty: normalizeCssProperty,

        normalizeCssEvent: normalizeCssEvent,

        matchesSelector: matchesSelector,

        location: function() {
            return window.location;
        },

        support : {}

    });

    testEl = null;

    return skylark.browser = browser;
});

define('skylarkjs/browser',[
    "skylark-utils/browser"
], function(browser) {
    return browser;
});

define('skylark-utils/styler',[
    "./skylark",
    "./langx"
], function(skylark, langx) {
    var every = Array.prototype.every,
        forEach = Array.prototype.forEach,
        camelCase = langx.camelCase,
        dasherize = langx.dasherize;

    function maybeAddPx(name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    var cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        classReCache = {

        };

    function classRE(name) {
        return name in classReCache ?
            classReCache[name] : (classReCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) return svg ? klass.baseVal : klass
        svg ? (klass.baseVal = value) : (node.className = value)
    }


    var elementDisplay = {};

    function defaultDisplay(nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function show(elm) {
        styler.css(elm, "display", "");
        if (styler.css(elm, "display") == "none") {
            styler.css(elm, "display", defaultDisplay(elm.nodeName));
        }
        return this;
    }

    function isInvisible(elm) {
        return styler.css(elm, "display") == "none" || styler.css(elm, "opacity") == 0;
    }

    function hide(elm) {
        styler.css(elm, "display", "none");
        return this;
    }

    function addClass(elm, name) {
        if (!name) return this
        var cls = className(elm),
            names;
        if (langx.isString(name)) {
            names = name.split(/\s+/g);
        } else {
            names = name;
        }
        names.forEach(function(klass) {
            var re = classRE(klass);
            if (!cls.match(re)) {
                cls += (cls ? " " : "") + klass;
            }
        });

        className(elm, cls);

        return this;
    }

    function css(elm, property, value) {
        if (arguments.length < 3) {
            var computedStyle,
                computedStyle = getComputedStyle(elm, '')
            if (langx.isString(property)) {
                return elm.style[camelCase(property)] || computedStyle.getPropertyValue(property)
            } else if (langx.isArrayLike(property)) {
                var props = {}
                forEach.call(property, function(prop) {
                    props[prop] = (elm.style[camelCase(prop)] || computedStyle.getPropertyValue(prop))
                })
                return props
            }
        }

        var css = '';
        if (typeof(property) == 'string') {
            if (!value && value !== 0) {
                elm.style.removeProperty(dasherize(property));
            } else {
                css = dasherize(property) + ":" + maybeAddPx(property, value)
            }
        } else {
            for (key in property) {
                if (property[key] === undefined) {
                    continue;
                }
                if (!property[key] && property[key] !== 0) {
                    elm.style.removeProperty(dasherize(key));
                } else {
                    css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                }
            }
        }

        elm.style.cssText += ';' + css;
        return this;
    }


    function hasClass(elm, name) {
        var re = classRE(name);
        return elm.className && elm.className.match(re);
    }

    function removeClass(elm, name) {
        if (name) {
            var cls = className(elm),
                names;

            if (langx.isString(name)) {
                names = name.split(/\s+/g);
            } else {
                names = name;
            }

            names.forEach(function(klass) {
                var re = classRE(klass);
                if (cls.match(re)) {
                    cls = cls.replace(re, " ");
                }
            });

            className(elm, cls.trim());
        } else {
            className(elm,"");
        }

        return this;
    }

    function toggleClass(elm, name, when) {
        var self = this;
        name.split(/\s+/g).forEach(function(klass) {
            if (when === undefined) {
                when = !self.hasClass(elm, klass);
            }
            if (when) {
                self.addClass(elm, klass);
            } else {
                self.removeClass(elm, klass)
            }
        });

        return self;
    }

    var styler = function() {
        return styler;
    };

    langx.mixin(styler, {
        autocssfix: true,
        cssHooks : {

        },
        
        addClass: addClass,
        className: className,
        css: css,
        hasClass: hasClass,
        hide: hide,
        isInvisible: isInvisible,
        removeClass: removeClass,
        show: show,
        toggleClass: toggleClass
    });

    return skylark.styler = styler;
});

define('skylark-utils/noder',[
    "./skylark",
    "./langx",
    "./styler"
], function(skylark, langx, styler) {
    var isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g),
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        div = document.createElement("div"),
        table = document.createElement('table'),
        tableBody = document.createElement('tbody'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr': tableBody,
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            '*': div
        },
        rootNodeRE = /^(?:body|html)$/i,
        map = Array.prototype.map,
        slice = Array.prototype.slice;

    function ensureNodes(nodes, copyByClone) {
        if (!langx.isArrayLike(nodes)) {
            nodes = [nodes];
        }
        if (copyByClone) {
            nodes = map.call(nodes, function(node) {
                return node.cloneNode(true);
            });
        }
        return langx.flatten(nodes);
    }

    function nodeName(elm, chkName) {
        var name = elm.nodeName && elm.nodeName.toLowerCase();
        if (chkName !== undefined) {
            return name === chkName.toLowerCase();
        }
        return name;
    };

    function contents(elm) {
        if (nodeName(elm, "iframe")) {
            return elm.contentDocument;
        }
        return elm.childNodes;
    }

    function html(node, html) {
        if (html === undefined) {
            return node.innerHTML;
        } else {
            this.empty(node);
            html = html || "";
            if (langx.isString(html) || langx.isNumber(html)) {
                node.innerHTML = html;
            } else if (langx.isArrayLike(html)) {
                for (var i = 0; i < html.length; i++) {
                    node.appendChild(html[i]);
                }
            } else {
                node.appendChild(html);
            }
        }
    }

    function clone(node, deep) {
        var self = this,
            clone;

        // TODO: Add feature detection here in the future
        if (!isIE || node.nodeType !== 1 || deep) {
            return node.cloneNode(deep);
        }

        // Make a HTML5 safe shallow copy
        if (!deep) {
            clone = document.createElement(node.nodeName);

            // Copy attribs
            each(self.getAttribs(node), function(attr) {
                self.setAttrib(clone, attr.nodeName, self.getAttrib(node, attr.nodeName));
            });

            return clone;
        }
    }

    function createElement(tag, props,parent) {
        var node = document.createElement(tag);
        if (props) {
            for (var name in props) {
                node.setAttribute(name, props[name]);
            }
        }
        if (parent) {
            append(parent,node);
        }
        return node;
    }

    function createFragment(html) {
        // A special case optimization for a single tag
        html = langx.trim(html);
        if (singleTagRE.test(html)) {
            return [createElement(RegExp.$1)];
        }

        var name = fragmentRE.test(html) && RegExp.$1
        if (!(name in containers)) {
            name = "*"
        }
        var container = containers[name];
        container.innerHTML = "" + html;
        dom = slice.call(container.childNodes);

        dom.forEach(function(node) {
            container.removeChild(node);
        })

        return dom;
    }

    function contains(node, child) {
        return isChildOf(child, node);
    }

    function createTextNode(text) {
        return document.createTextNode(text);
    }

    function doc() {
        return document;
    }

    function empty(node) {
        while (node.hasChildNodes()) {
            var child = node.firstChild;
            node.removeChild(child);
        }
        return this;
    }

    function isChildOf(node, parent,directly) {
        if (directly) {
            return node.parentNode === parent;
        }
        if (document.documentElement.contains) {
            return parent.contains(node);
        }
        while (node) {
            if (parent === node) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    }

    function isDoc(node) {
        return node != null && node.nodeType == node.DOCUMENT_NODE
    }

    function ownerDoc(elm) {
        if (!elm) {
            return document;
        }

        if (elm.nodeType == 9) {
            return elm;
        }

        return elm.ownerDocument;
    }

    function ownerWindow(elm) {
        var doc = ownerDoc(elm);
        return  doc.defaultView || doc.parentWindow;
    } 

    function after(node, placing, copyByClone) {
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone),
                refNode = refNode.nextSibling;

            for (var i = 0; i < nodes.length; i++) {
                if (refNode) {
                    parent.insertBefore(nodes[i], refNode);
                } else {
                    parent.appendChild(nodes[i]);
                }
            }
        }
        return this;
    }

    function before(node, placing, copyByClone) {
        var refNode = node,
            parent = refNode.parentNode;
        if (parent) {
            var nodes = ensureNodes(placing, copyByClone);
            for (var i = 0; i < nodes.length; i++) {
                parent.insertBefore(nodes[i], refNode);
            }
        }
        return this;
    }

    function prepend(node, placing, copyByClone) {
        var parentNode = node,
            refNode = parentNode.firstChild,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            if (refNode) {
                parentNode.insertBefore(nodes[i], refNode);
            } else {
                parentNode.appendChild(nodes[i]);
            }
        }
        return this;
    }

    function append(node, placing, copyByClone) {
        var parentNode = node,
            nodes = ensureNodes(placing, copyByClone);
        for (var i = 0; i < nodes.length; i++) {
            parentNode.appendChild(nodes[i]);
        }
        return this;
    }

    function overlay(elm, params) {
        var overlayDiv = createElement("div", params);
        styler.css(overlayDiv, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0x7FFFFFFF,
            opacity: 0.7
        });
        elm.appendChild(overlayDiv);
        return overlayDiv;

    }



    function remove(node) {
        if (node && node.parentNode) {
            try {
               node.parentNode.removeChild(node);
            } catch (e) {
                console.warn("The node is already removed",e);
            }
         }
        return this;
    }

    function replace(node, oldNode) {
        oldNode.parentNode.replaceChild(node, oldNode);
        return this;
    }

    function throb(elm, params) {
        params = params || {};
        var self = this,
            text = params.text,
            style = params.style,
            time = params.time,
            callback = params.callback,
            timer,
            throbber = this.createElement("div", {
                className: params.className || "throbber",
                style: style
            }),
            _overlay = overlay(throbber, {
                className: 'overlay fade'
            }),
            throb = this.createElement("div", {
                className: "throb"
            }),
            textNode = this.createTextNode(text || ""),
            remove = function() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (throbber) {
                    self.remove(throbber);
                    throbber = null;
                }
            },
            update = function(params) {
                if (params && params.text && throbber) {
                    textNode.nodeValue = params.text;
                }
            };
        throb.appendChild(textNode);
        throbber.appendChild(throb);
        elm.appendChild(throbber);
        var end = function() {
            remove();
            if (callback) callback();
        };
        if (time) {
            timer = setTimeout(end, time);
        }

        return {
            remove: remove,
            update: update
        };
    }

    function traverse(node, fn) {
        fn(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            traverse(node.childNodes[i], fn);
        }
        return this;
    }

    function reverse(node) {
        var firstChild = node.firstChild;
        for (var i = node.children.length - 1; i > 0; i--) {
            if (i > 0) {
                var child = node.children[i];
                node.insertBefore(child, firstChild);
            }
        }
    }

    function wrapper(node, wrapperNode) {
        if (langx.isString(wrapperNode)) {
            wrapperNode = this.createFragment(wrapperNode).firstChild;
        }
        node.parentNode.insertBefore(wrapperNode, node);
        wrapperNode.appendChild(node);
    }

    function wrapperInner(node, wrapperNode) {
        var childNodes = slice.call(node.childNodes);
        node.appendChild(wrapperNode);
        for (var i = 0; i < childNodes.length; i++) {
            wrapperNode.appendChild(childNodes[i]);
        }
        return this;
    }

    function unwrap(node) {
        var child, parent = node.parentNode;
        if (parent) {
            if (this.isDoc(parent.parentNode)) return;
            parent.parentNode.insertBefore(node, parent);
        }
    }

    function noder() {
        return noder;
    }

    langx.mixin(noder, {
        clone: clone,
        contents: contents,

        createElement: createElement,

        createFragment: createFragment,

        contains: contains,

        createTextNode: createTextNode,

        doc: doc,

        empty: empty,

        html: html,

        isChildOf: isChildOf,

        isDoc: isDoc,

        ownerDoc: ownerDoc,

        ownerWindow : ownerWindow,

        after: after,

        before: before,

        prepend: prepend,

        append: append,

        remove: remove,

        replace: replace,

        throb: throb,

        traverse: traverse,

        reverse: reverse,

        wrapper: wrapper,

        wrapperInner: wrapperInner,

        unwrap: unwrap
    });

    return skylark.noder = noder;
});

define('skylark-utils/css',[
    "./skylark",
    "./langx",
    "./noder"
], function(skylark, langx, construct) {

    var head = document.getElementsByTagName("head")[0],
        count = 0,
        sheetsByUrl = {},
        sheetElementsById = {},
        defaultSheetId = _createStyleSheet(),
        defaultSheet = sheetElementsById[defaultSheetId],
        rulesPropName = ("cssRules" in defaultSheet) ? "cssRules" : "rules",
        insertRuleFunc,
        deleteRuleFunc = defaultSheet.deleteRule || defaultSheet.removeRule;

    if (defaultSheet.insertRule) {
        var _insertRule = defaultSheet.insertRule;
        insertRuleFunc = function(selector, css, index) {
            _insertRule.call(this, selector + "{" + css + "}", index);
        };
    } else {
        insertRuleFunc = defaultSheet.addRule;
    }

    function normalizeSelector(selectorText) {
        var selector = [],
            last, len;
        last = defaultSheet[rulesPropName].length;
        insertRuleFunc.call(defaultSheet, selectorText, ';');
        len = defaultSheet[rulesPropName].length;
        for (var i = len - 1; i >= last; i--) {
            selector.push(_sheet[_rules][i].selectorText);
            deleteRuleFunc.call(defaultSheet, i);
        }
        return selector.reverse().join(', ');
    }

    function _createStyleSheet() {
        var link = document.createElement("link"),
            id = (count++);

        link.rel = "stylesheet";
        link.type = "text/css";
        link.async = false;
        link.defer = false;

        head.appendChild(link);
        sheetElementsById[id] = link;

        return id;
    }

    function css() {
        return css;
    }

    langx.mixin(css, {
        createStyleSheet: function(cssText) {
            return _createStyleSheet();
        },

        loadStyleSheet: function(url, loadedCallback, errorCallback) {
            var sheet = sheetsByUrl[url];
            if (!sheet) {
                sheet = sheetsByUrl[url] = {
                    state: 0, //0:unload,1:loaded,-1:loaderror
                    loadedCallbacks: [],
                    errorCallbacks: []
                };
            }

            sheet.loadedCallbacks.push(loadedCallback);
            sheet.errorCallbacks.push(errorCallback);

            if (sheet.state === 1) {
                sheet.node.onload();
            } else if (sheet.state === -1) {
                sheet.node.onerror();
            } else {
                sheet.id = _createStyleSheet();
                var node = sheet.node = sheetElementsById[sheet.id];

                startTime = new Date().getTime();

                node.onload = function() {
                    sheet.state = 1;
                    sheet.state = -1;
                    var callbacks = sheet.loadedCallbacks,
                        i = callbacks.length;

                    while (i--) {
                        callbacks[i]();
                    }
                    sheet.loadedCallbacks = [];
                    sheet.errorCallbacks = [];
                },
                node.onerror = function() {
                    sheet.state = -1;
                    var callbacks = sheet.errorCallbacks,
                        i = callbacks.length;

                    while (i--) {
                        callbacks[i]();
                    }
                    sheet.loadedCallbacks = [];
                    sheet.errorCallbacks = [];
                };

                node.href = sheet.url = url;

                sheetsByUrl[node.url] = sheet;

            }
            return sheet.id;
        },

        deleteSheetRule: function(sheetId, rule) {
            var sheet = sheetElementsById[sheetId];
            if (langx.isNumber(rule)) {
                deleteRuleFunc.call(sheet, rule);
            } else {
                langx.each(sheet[rulesPropName], function(i, _rule) {
                    if (rule === _rule) {
                        deleteRuleFunc.call(sheet, i);
                        return false;
                    }
                });
            }
        },

        deleteRule: function(rule) {
            this.deleteSheetRule(defaultSheetId, rule);
            return this;
        },

        removeStyleSheet: function(sheetId) {
            if (sheetId === defaultSheetId) {
                throw new Error("The default stylesheet can not be deleted");
            }
            var sheet = sheetElementsById[sheetId];
            delete sheetElementsById[sheetId];


            construct.remove(sheet);
            return this;
        },

        findRules: function(selector, sheetId) {
            //return array of CSSStyleRule objects that match the selector text
            var rules = [],
                filters = parseSelector(selector);
            $(document.styleSheets).each(function(i, styleSheet) {
                if (filterStyleSheet(filters.styleSheet, styleSheet)) {
                    $.merge(rules, $(styleSheet[_rules]).filter(function() {
                        return matchSelector(this, filters.selectorText, filters.styleSheet === "*");
                    }).map(function() {
                        return normalizeRule($.support.nativeCSSStyleRule ? this : new CSSStyleRule(this), styleSheet);
                    }));
                }
            });
            return rules.reverse();
        },

        insertRule: function(selector, css, index) {
            return this.insertSheetRule(defaultSheetId, selector, css, index);
        },

        insertSheetRule: function(sheetId, selector, css, index) {
            if (!selector || !css) {
                return -1;
            }

            var sheet = sheetElementsById[sheetId];
            index = index || sheet[rulesPropName].length;

            return insertRuleFunc.call(sheet, selector, css, index);

        }
    });

    return skylark.css = css;
});

define('skylarkjs/css',[
    "skylark-utils/css"
], function(css) {
    return css;
});

define('skylark-utils/finder',[
    "./skylark",
    "./langx",
    "./browser",
    "./noder"
], function(skylark, langx, browser, noder, velm) {
    var local = {},
        filter = Array.prototype.filter,
        slice = Array.prototype.slice,
        nativeMatchesSelector = browser.matchesSelector;

    /*
    ---
    name: Slick.Parser
    description: Standalone CSS3 Selector parser
    provides: Slick.Parser
    ...
    */
    ;
    (function() {

        var parsed,
            separatorIndex,
            combinatorIndex,
            reversed,
            cache = {},
            reverseCache = {},
            reUnescape = /\\/g;

        var parse = function(expression, isReversed) {
            if (expression == null) return null;
            if (expression.Slick === true) return expression;
            expression = ('' + expression).replace(/^\s+|\s+$/g, '');
            reversed = !!isReversed;
            var currentCache = (reversed) ? reverseCache : cache;
            if (currentCache[expression]) return currentCache[expression];
            parsed = {
                Slick: true,
                expressions: [],
                raw: expression,
                reverse: function() {
                    return parse(this.raw, true);
                }
            };
            separatorIndex = -1;
            while (expression != (expression = expression.replace(regexp, parser)));
            parsed.length = parsed.expressions.length;
            return currentCache[parsed.raw] = (reversed) ? reverse(parsed) : parsed;
        };

        var reverseCombinator = function(combinator) {
            if (combinator === '!') return ' ';
            else if (combinator === ' ') return '!';
            else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
            else return '!' + combinator;
        };

        var reverse = function(expression) {
            var expressions = expression.expressions;
            for (var i = 0; i < expressions.length; i++) {
                var exp = expressions[i];
                var last = {
                    parts: [],
                    tag: '*',
                    combinator: reverseCombinator(exp[0].combinator)
                };

                for (var j = 0; j < exp.length; j++) {
                    var cexp = exp[j];
                    if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
                    cexp.combinator = cexp.reverseCombinator;
                    delete cexp.reverseCombinator;
                }

                exp.reverse().push(last);
            }
            return expression;
        };

        var escapeRegExp = (function() {
            // Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
            var from = /(?=[\-\[\]{}()*+?.\\\^$|,#\s])/g,
                to = '\\';
            return function(string) {
                return string.replace(from, to)
            }
        }())

        var regexp = new RegExp(
            "^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|(:+)(<unicode>+)(?:\\((?:(?:([\"'])([^\\13]*)\\13)|((?:\\([^)]+\\)|[^()]*)+))\\))?)"
            .replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
            .replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
            .replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
        );

        function parser(
            rawMatch,

            separator,
            combinator,
            combinatorChildren,

            tagName,
            id,
            className,

            attributeKey,
            attributeOperator,
            attributeQuote,
            attributeValue,

            pseudoMarker,
            pseudoClass,
            pseudoQuote,
            pseudoClassQuotedValue,
            pseudoClassValue
        ) {
            if (separator || separatorIndex === -1) {
                parsed.expressions[++separatorIndex] = [];
                combinatorIndex = -1;
                if (separator) return '';
            }

            if (combinator || combinatorChildren || combinatorIndex === -1) {
                combinator = combinator || ' ';
                var currentSeparator = parsed.expressions[separatorIndex];
                if (reversed && currentSeparator[combinatorIndex])
                    currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
                currentSeparator[++combinatorIndex] = {
                    combinator: combinator,
                    tag: '*'
                };
            }

            var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

            if (tagName) {
                currentParsed.tag = tagName.replace(reUnescape, '');

            } else if (id) {
                currentParsed.id = id.replace(reUnescape, '');

            } else if (className) {
                className = className.replace(reUnescape, '');

                if (!currentParsed.classList) currentParsed.classList = [];
                if (!currentParsed.classes) currentParsed.classes = [];
                currentParsed.classList.push(className);
                currentParsed.classes.push({
                    value: className,
                    regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
                });

            } else if (pseudoClass) {
                pseudoClassValue = pseudoClassValue || pseudoClassQuotedValue;
                pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;

                if (!currentParsed.pseudos) currentParsed.pseudos = [];
                currentParsed.pseudos.push({
                    key: pseudoClass.replace(reUnescape, ''),
                    value: pseudoClassValue,
                    type: pseudoMarker.length == 1 ? 'class' : 'element'
                });

            } else if (attributeKey) {
                attributeKey = attributeKey.replace(reUnescape, '');
                attributeValue = (attributeValue || '').replace(reUnescape, '');

                var test, regexp;

                switch (attributeOperator) {
                    case '^=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue));
                        break;
                    case '$=':
                        regexp = new RegExp(escapeRegExp(attributeValue) + '$');
                        break;
                    case '~=':
                        regexp = new RegExp('(^|\\s)' + escapeRegExp(attributeValue) + '(\\s|$)');
                        break;
                    case '|=':
                        regexp = new RegExp('^' + escapeRegExp(attributeValue) + '(-|$)');
                        break;
                    case '=':
                        test = function(value) {
                            return attributeValue == value;
                        };
                        break;
                    case '*=':
                        test = function(value) {
                            return value && value.indexOf(attributeValue) > -1;
                        };
                        break;
                    case '!=':
                        test = function(value) {
                            return attributeValue != value;
                        };
                        break;
                    default:
                        test = function(value) {
                            return !!value;
                        };
                }

                if (attributeValue == '' && (/^[*$^]=$/).test(attributeOperator)) test = function() {
                    return false;
                };

                if (!test) test = function(value) {
                    return value && regexp.test(value);
                };

                if (!currentParsed.attributes) currentParsed.attributes = [];
                currentParsed.attributes.push({
                    key: attributeKey,
                    operator: attributeOperator,
                    value: attributeValue,
                    test: test
                });

            }

            return '';
        };

        // Slick NS

        var Slick = (this.Slick || {});

        Slick.parse = function(expression) {
            return parse(expression);
        };

        Slick.escapeRegExp = escapeRegExp;

        if (!this.Slick) this.Slick = Slick;

    }).apply(local);


    var simpleClassSelectorRE = /^\.([\w-]*)$/,
        simpleIdSelectorRE = /^#([\w-]*)$/,
        slice = Array.prototype.slice;


    local.parseSelector = local.Slick.parse;


    local.pseudos = {
        // custom pseudos
        'checkbox': function(elm){
            return elm.type === "checkbox";
        },
        'checked': function(elm) {
            return !!elm.checked;
        },

        'contains': function(elm, idx, nodes, text) {
            if ($(this).text().indexOf(text) > -1) return this
        },

        'disabled': function(elm) {
            return !!elm.disabled;
        },

        'enabled': function(elm) {
            return !elm.disabled;
        },

        'eq': function(elm, idx, nodes, value) {
            return (idx == value);
        },

        'focus': function(elm) {
            return document.activeElement === elm && (elm.href || elm.type || elm.tabindex);
        },

        'first': function(elm, idx) {
            return (idx === 0);
        },

        'gt': function(elm, idx, nodes, value) {
            return (idx > value);
        },

        'has': function(elm, idx, nodes, sel) {
            return matches(elm, sel);
        },


        'hidden': function(elm) {
            return !local.pseudos["visible"](elm);
        },

        'last': function(elm, idx, nodes) {
            return (idx === nodes.length - 1);
        },

        'lt': function(elm, idx, nodes, value) {
            return (idx < value);
        },

        'not': function(elm, idx, nodes, sel) {
            return !matches(elm, sel);
        },

        'parent': function(elm) {
            return !!elm.parentNode;
        },

        'radio': function(elm){
            return elm.type === "radio";
        },

        'selected': function(elm) {
            return !!elm.selected;
        },

        'text': function(elm){
            return elm.type === "text";
        },

        'visible': function(elm) {
            return elm.offsetWidth && elm.offsetWidth
        }
    };

    ["first","eq","last"].forEach(function(item){
        local.pseudos[item].isArrayFilter = true;
    });

    local.divide = function(cond) {
        var nativeSelector = "",
            customPseudos = [],
            tag,
            id,
            classes,
            attributes,
            pseudos;


        if (id = cond.id) {
            nativeSelector += ("#" + id);
        }
        if (classes = cond.classes) {
            for (var i = classes.length; i--;) {
                nativeSelector += ("." + classes[i].value);
            }
        }
        if (attributes = cond.attributes) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].operator) {
                    nativeSelector += ("[" + attributes[i].key + attributes[i].operator + JSON.stringify(attributes[i].value)  +"]");
                } else {
                    nativeSelector += ("[" + attributes[i].key + "]");
                }
            }
        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (this.pseudos[part.key]) {
                    customPseudos.push(part);
                } else {
                    if (part.value !== undefined) {
                        nativeSelector += (":" + part.key + "(" + JSON.stringify(part))
                    }
                }
            }
        }

        if (tag = cond.tag) {
            nativeSelector = tag.toUpperCase() + nativeSelector;
        }

        if (!nativeSelector) {
            nativeSelector = "*";
        }

        return {
            nativeSelector: nativeSelector,
            customPseudos: customPseudos
        }

    };

    local.check = function(node, cond, idx, nodes,arrayFilte) {
        var tag,
            id,
            classes,
            attributes,
            pseudos,

            i, part, cls, pseudo;

        if (!arrayFilte) {
            if (tag = cond.tag) {
                var nodeName = node.nodeName.toUpperCase();
                if (tag == '*') {
                    if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
                } else {
                    if (nodeName != (tag || "").toUpperCase()) return false;
                }
            }

            if (id = cond.id) {
                if (node.getAttribute('id') != id) {
                    return false;
                }
            }


            if (classes = cond.classes) {
                for (i = classes.length; i--;) {
                    cls = node.getAttribute('class');
                    if (!(cls && classes[i].regexp.test(cls))) return false;
                }
            }

            if (attributes) {
                for (i = attributes.length; i--;) {
                    part = attributes[i];
                    if (part.operator ? !part.test(node.getAttribute(part.key)) : !node.hasAttribute(part.key)) return false;
                }

            }

        }
        if (pseudos = cond.pseudos) {
            for (i = pseudos.length; i--;) {
                part = pseudos[i];
                if (pseudo = this.pseudos[part.key]) {
                    if ((arrayFilte && pseudo.isArrayFilter) || (!arrayFilte && !pseudo.isArrayFilter)) {
                        if (!pseudo(node, idx, nodes, part.value)) {
                            return false;
                        }
                    }
                } else {
                    if (!arrayFilte && !nativeMatchesSelector.call(node, part.key)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    local.match = function(node, selector) {

        var parsed ;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            parsed = selector;            
        }
        
        if (!parsed) {
            return true;
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            simpleExpCounter = 0,
            i,
            currentExpression;
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];
                if (this.check(node,exp)) {
                    return true;
                }
                simpleExpCounter++;
            }
        }

        if (simpleExpCounter == parsed.length) {
            return false;
        }

        var nodes = this.query(document, parsed),
            item;
        for (i = 0; item = nodes[i++];) {
            if (item === node) {
                return true;
            }
        }
        return false;
    };


    local.filterSingle = function(nodes, exp){
        var matchs = filter.call(nodes, function(node, idx) {
            return local.check(node, exp, idx, nodes,false);
        });    

        matchs = filter.call(matchs, function(node, idx) {
            return local.check(node, exp, idx, matchs,true);
        }); 
        return matchs;
    };

    local.filter = function(nodes, selector) {
        var parsed;

        if (langx.isString(selector)) {
            parsed = local.Slick.parse(selector);
        } else {
            return local.filterSingle(nodes,selector);           
        }

        // simple (single) selectors
        var expressions = parsed.expressions,
            i,
            currentExpression,
            ret = [];
        for (i = 0;
            (currentExpression = expressions[i]); i++) {
            if (currentExpression.length == 1) {
                var exp = currentExpression[0];

                var matchs = local.filterSingle(nodes,exp);  

                ret = langx.uniq(ret.concat(matchs));
            } else {
                throw new Error("not supported selector:" + selector);
            }
        }

        return ret;
 
    };    

    local.combine = function(elm, bit) {
        var op = bit.combinator,
            cond = bit,
            node1,
            nodes = [];

        switch (op) {
            case '>': // direct children
                nodes = children(elm, cond);
                break;
            case '+': // next sibling
                node1 = nextSibling(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '^': // first child
                node1 = firstChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '~': // next siblings
                nodes = nextSiblings(elm, cond);
                break;
            case '++': // next sibling and previous sibling
                var prev = previousSibling(elm, cond, true),
                    next = nextSibling(elm, cond, true);
                if (prev) {
                    nodes.push(prev);
                }
                if (next) {
                    nodes.push(next);
                }
                break;
            case '~~': // next siblings and previous siblings
                nodes = siblings(elm, cond);
                break;
            case '!': // all parent nodes up to document
                nodes = ancestors(elm, cond);
                break;
            case '!>': // direct parent (one level)
                node1 = parent(elm, cond);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!+': // previous sibling
                nodes = previousSibling(elm, cond, true);
                break;
            case '!^': // last child
                node1 = lastChild(elm, cond, true);
                if (node1) {
                    nodes.push(node1);
                }
                break;
            case '!~': // previous siblings
                nodes = previousSiblings(elm, cond);
                break;
            default:
                var divided = this.divide(bit);
                nodes = slice.call(elm.querySelectorAll(divided.nativeSelector));
                if (divided.customPseudos) {
                    for (var i = divided.customPseudos.length - 1; i >= 0; i--) {
                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes,false)
                        });

                        nodes = filter.call(nodes, function(item, idx) {
                            return local.check(item, {
                                pseudos: [divided.customPseudos[i]]
                            }, idx, nodes,true)
                        });                        
                    }
                }
                break;

        }
        return nodes;
    }

    local.query = function(node, selector, single) {


        var parsed = this.Slick.parse(selector);

        var
            founds = [],
            currentExpression, currentBit,
            expressions = parsed.expressions;

        for (var i = 0;
            (currentExpression = expressions[i]); i++) {
            var currentItems = [node],
                found;
            for (var j = 0;
                (currentBit = currentExpression[j]); j++) {
                found = langx.map(currentItems, function(item, i) {
                    return local.combine(item, currentBit)
                });
                if (found) {
                    currentItems = found;
                }
            }
            if (found) {
                founds = founds.concat(found);
            }
        }

        return founds;
    }


    function ancestor(node, selector, root) {
        var rootIsSelector = root && langx.isString(root);
        while (node = node.parentNode) {
            if (matches(node, selector)) {
                return node;
            }
            if (root) {
                if (rootIsSelector) {
                    if (matches(node,root)) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            } 
        }
        return null;
    }

    function ancestors(node, selector,root) {
        var ret = [],
            rootIsSelector = root && langx.isString(root);
        while (node = node.parentNode) {
                ret.push(node);
            if (root) {
                if (rootIsSelector) {
                    if (matches(node,root)) {
                        break;
                    }
                } else if (node == root) {
                    break;
                }
            } 

        }

        if (selector) {
            ret = local.filter(ret,selector);
        }
        return ret;
    }

    function byId(id, doc) {
        doc = doc || noder.doc();
        return doc.getElementById(id);
    }

    function children(node, selector) {
        var childNodes = node.childNodes,
            ret = [];
        for (var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if (node.nodeType == 1) {
                ret.push(node);
            }
        }
        if (selector) {
            ret = local.filter(ret,selector);
        }
        return ret;
    }

    function closest(node, selector) {
        while (node && !(matches(node, selector))) {
            node = node.parentNode;
        }

        return node;
    }

    function descendants(elm, selector) {
        // Selector
        try {
            return slice.call(elm.querySelectorAll(selector));
        } catch (matchError) {
            //console.log(matchError);
        }
        return local.query(elm, selector);
    }

    function descendant(elm, selector) {
        // Selector
        try {
            return elm.querySelector(selector);
        } catch (matchError) {
            //console.log(matchError);
        }
        var nodes = local.query(elm, selector);
        if (nodes.length > 0) {
            return nodes[0];
        } else {
            return null;
        }
    }

    function find(elm,selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        if (matches(elm,selector)) {
            return elm;
        } else {
            return descendant(elm, selector);
        }
    }

    function findAll(elm,selector) {
        if (!selector) {
            selector = elm;
            elm = document.body;
        }
        return descendants(elm, selector);
    }

    function firstChild(elm, selector, first) {
        var childNodes = elm.childNodes,
            node = childNodes[0];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (first) {
                    break;
                }
            }
            node = node.nextSibling;
        }

        return null;
    }

    function lastChild(elm, selector, last) {
        var childNodes = elm.childNodes,
            node = childNodes[childNodes.length - 1];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (last) {
                    break;
                }
            }
            node = node.previousSibling;
        }

        return null;
    }

    function matches(elm, selector) {
        if (!selector || !elm || elm.nodeType !== 1) {
            return false
        }

        if (langx.isString(selector)) {
            try {
                return nativeMatchesSelector.call(elm, selector.replace(/\[([^=]+)=\s*([^'"\]]+?)\s*\]/g, '[$1="$2"]'));
            } catch (matchError) {
                //console.log(matchError);
            }
            return local.match(elm, selector);
        } else if (langx.isArrayLike(selector)) {
            return langx.inArray(elm,selector) > -1;
        } else if (langx.isPlainObject(selector)){    
            return local.check(elm, selector);
        } else {
            return elm === selector;
        }

    }

    function nextSibling(elm, selector, adjacent) {
        var node = elm.nextSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.nextSibling;
        }
        return null;
    }

    function nextSiblings(elm, selector) {
        var node = elm.nextSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }


    function parent(elm, selector) {
        var node = elm.parentNode;
        if (node && (!selector || matches(node, selector))) {
            return node;
        }

        return null;
    }

    function previousSibling(elm, selector, adjacent) {
        var node = elm.previousSibling;
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    return node;
                }
                if (adjacent) {
                    break;
                }
            }
            node = node.previousSibling;
        }
        return null;
    }

    function previousSiblings(elm, selector) {
        var node = elm.previousSibling,
            ret = [];
        while (node) {
            if (node.nodeType == 1) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.previousSibling;
        }
        return ret;
    }

    function siblings(elm, selector) {
        var node = elm.parentNode.firstChild,
            ret = [];
        while (node) {
            if (node.nodeType == 1 && node !== elm) {
                if (!selector || matches(node, selector)) {
                    ret.push(node);
                }
            }
            node = node.nextSibling;
        }
        return ret;
    }

    var finder = function() {
        return finder;
    };

    langx.mixin(finder, {

        ancestor: ancestor,

        ancestors: ancestors,

        byId: byId,

        children: children,

        closest: closest,

        descendant: descendant,

        descendants: descendants,

        find: find,

        findAll: findAll,

        firstChild: firstChild,

        lastChild: lastChild,

        matches: matches,

        nextSibling: nextSibling,

        nextSiblings: nextSiblings,

        parent: parent,

        previousSibling: previousSibling,

        previousSiblings: previousSiblings,

        pseudos: local.pseudos,

        siblings: siblings
    });

    return skylark.finder = finder;
});

define('skylark-utils/datax',[
    "./skylark",
    "./langx",
    "./finder"
], function(skylark, langx, finder) {
    var map = Array.prototype.map,
        filter = Array.prototype.filter,
        camelCase = langx.camelCase,
        deserializeValue = langx.deserializeValue,

        capitalRE = /([A-Z])/g,
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        };

    function setAttribute(elm, name, value) {
        if (value == null) {
            elm.removeAttribute(name);
        } else {
            elm.setAttribute(name, value);
        }
    }

    function attr(elm, name, value) {
        if (value === undefined) {
            if (typeof name === "object") {
                for (var attrName in name) {
                    attr(elm, attrName, name[attrName]);
                }
                return this;
            } else {
                if (elm.hasAttribute(name)) {
                    return elm.getAttribute(name);
                }
            }
        } else {
            elm.setAttribute(name, value);
            return this;
        }
    }

    // Read all "data-*" attributes from a node
    function _attributeData(elm) {
        var store = {}
        langx.each(elm.attributes || [], function(i, attr) {
            if (attr.name.indexOf('data-') == 0) {
                store[camelCase(attr.name.replace('data-', ''))] = deserializeValue(attr.value);
            }
        })
        return store;
    }

    function _store(elm, confirm) {
        var store = elm["_$_store"];
        if (!store && confirm) {
            store = elm["_$_store"] = _attributeData(elm);
        }
        return store;
    }

    function _getData(elm, name) {
        if (name === undefined) {
            return _store(elm, true);
        } else {
            var store = _store(elm);
            if (store) {
                if (name in store) {
                    return store[name];
                }
                var camelName = camelCase(name);
                if (camelName in store) {
                    return store[camelName];
                }
            }
            var attrName = 'data-' + name.replace(capitalRE, "-$1").toLowerCase()
            return attr(elm, attrName);
        }

    }

    function _setData(elm, name, value) {
        var store = _store(elm, true);
        store[camelCase(name)] = value;
    }


    function data(elm, name, value) {

        if (value === undefined) {
            if (typeof name === "object") {
                for (var dataAttrName in name) {
                    _setData(elm, dataAttrName, name[dataAttrName]);
                }
                return this;
            } else {
                return _getData(elm, name);
            }
        } else {
            _setData(elm, name, value);
            return this;
        }
    }

    function removeData(elm, names) {
        if (langx.isString(names)) {
            names = names.split(/\s+/);
        }
        var store = _store(elm, true);
        names.forEach(function(name) {
            delete store[name];
        });
        return this;
    }

    function pluck(nodes, property) {
        return map.call(nodes, function(elm) {
            return elm[property];
        });
    }

    function prop(elm, name, value) {
        name = propMap[name] || name;
        if (value === undefined) {
            return elm[name];
        } else {
            elm[name] = value;
            return this;
        }
    }

    function removeAttr(elm, name) {
        name.split(' ').forEach(function(attr) {
            setAttribute(elm, attr);
        });
        return this;
    }

    function removeProp(elm, name) {
        name.split(' ').forEach(function(prop) {
            delete elm[prop];
        });
        return this;
    }

    function text(elm, txt) {
        if (txt === undefined) {
            return elm.textContent;
        } else {
            elm.textContent = txt == null ? '' : '' + txt;
            return this;
        }
    }

    function val(elm, value) {
        if (value === undefined) {
            if (elm.multiple) {
                // select multiple values
                var selectedOptions = filter.call(finder.find(elm, "option"), (function(option) {
                    return option.selected;
                }));
                return pluck(selectedOptions, "value");
            } else {
                return elm.value;
            }
        } else {
            elm.value = value;
            return this;
        }
    }

    function datax() {
        return datax;
    }

    langx.mixin(datax, {
        attr: attr,

        data: data,

        pluck: pluck,

        prop: prop,

        removeAttr: removeAttr,

        removeData: removeData,

        removeProp: removeProp,

        text: text,

        val: val
    });

    return skylark.datax = datax;
});

define('skylarkjs/datax',[
    "skylark-utils/datax"
], function(datax) {
    return datax;
});

define('skylark-utils/geom',[
    "./skylark",
    "./langx",
    "./styler"
], function(skylark, langx, styler) {
    var rootNodeRE = /^(?:body|html)$/i,
        px = langx.toPixel;

    function offsetParent(elm) {
        var parent = elm.offsetParent || document.body;
        while (parent && !rootNodeRE.test(parent.nodeName) && styler.css(parent, "position") == "static") {
            parent = parent.offsetParent;
        }
        return parent;
    }


    function borderExtents(elm) {
        var s = getComputedStyle(elm);
        return {
            left: px(s.borderLeftWidth , elm),
            top: px(s.borderTopWidth, elm),
            right: px(s.borderRightWidth, elm),
            bottom: px(s.borderBottomWidth, elm)
        }
    }

    //viewport coordinate
    function boundingPosition(elm, coords) {
        if (coords === undefined) {
            return rootNodeRE.test(elm.nodeName) ? { top: 0, left: 0 } : elm.getBoundingClientRect();
        } else {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            relativePosition(elm, {
                top: coords.top - parentOffset.top - mex.top - pbex.top,
                left: coords.left - parentOffset.left - mex.left - pbex.left
            });
            return this;
        }
    }

    function boundingRect(elm, coords) {
        if (coords === undefined) {
            return elm.getBoundingClientRect()
        } else {
            boundingPosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }

    function clientHeight(elm, value) {
        if (value == undefined) {
            return clientSize(elm).height;
        } else {
            return clientSize(elm, {
                height: value
            });
        }
    }

    function clientSize(elm, dimension) {
        if (dimension == undefined) {
            return {
                width: elm.clientWidth,
                height: elm.clientHeight
            }
        } else {
            var isBorderBox = (styler.css(elm, "box-sizing") === "border-box"),
                props = {
                    width: dimension.width,
                    height: dimension.height
                };
            if (!isBorderBox) {
                var pex = paddingExtents(elm);

                if (props.width !== undefined) {
                    props.width = props.width - pex.left - pex.right;
                }

                if (props.height !== undefined) {
                    props.height = props.height - pex.top - pex.bottom;
                }
            } else {
                var bex = borderExtents(elm);

                if (props.width !== undefined) {
                    props.width = props.width + bex.left + bex.right;
                }

                if (props.height !== undefined) {
                    props.height = props.height + bex.top + bex.bottom;
                }

            }
            styler.css(elm, props);
            return this;
        }
        return {
            width: elm.clientWidth,
            height: elm.clientHeight
        };
    }

    function clientWidth(elm, value) {
        if (value == undefined) {
            return clientSize(elm).width;
        } else {
            clientSize(elm, {
                width: value
            });
            return this;
        }
    }

    function contentRect(elm) {
        var cs = clientSize(elm),
            pex = paddingExtents(elm);


        //// On Opera, offsetLeft includes the parent's border
        //if(has("opera")){
        //    pe.l += be.l;
        //    pe.t += be.t;
        //}
        return {
            left: pex.left,
            top: pex.top,
            width: cs.width - pex.left - pex.right,
            height: cs.height - pex.top - pex.bottom
        };
    }

    function getDocumentSize(doc) {
        var documentElement = doc.documentElement,
            body = doc.body,
            max = Math.max,
            scrollWidth = max(documentElement.scrollWidth, body.scrollWidth),
            clientWidth = max(documentElement.clientWidth, body.clientWidth),
            offsetWidth = max(documentElement.offsetWidth, body.offsetWidth),
            scrollHeight = max(documentElement.scrollHeight, body.scrollHeight),
            clientHeight = max(documentElement.clientHeight, body.clientHeight),
            offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

        return {
            width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
            height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
        };
    }

    function height(elm, value) {
        if (value == undefined) {
            return size(elm).height;
        } else {
            size(elm, {
                height: value
            });
            return this;
        }
    }

    function marginExtents(elm) {
        var s = getComputedStyle(elm);
        return {
            left: px(s.marginLeft),
            top: px(s.marginTop),
            right: px(s.marginRight),
            bottom: px(s.marginBottom),
        }
    }


    function paddingExtents(elm) {
        var s = getComputedStyle(elm);
        return {
            left: px(s.paddingLeft),
            top: px(s.paddingTop),
            right: px(s.paddingRight),
            bottom: px(s.paddingBottom),
        }
    }

    //coordinate to the document
    function pagePosition(elm, coords) {
        if (coords === undefined) {
            var obj = elm.getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset
            }
        } else {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                parentOffset = pagePosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            relativePosition(elm, {
                top: coords.top - parentOffset.top - mex.top - pbex.top,
                left: coords.left - parentOffset.left - mex.left - pbex.left
            });
            return this;
        }
    }

    function pageRect(elm, coords) {
        if (coords === undefined) {
            var obj = elm.getBoundingClientRect()
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),
                height: Math.round(obj.height)
            }
        } else {
            pagePosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }

    // coordinate relative to it's parent
    function relativePosition(elm, coords) {
        if (coords == undefined) {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                offset = boundingPosition(elm),
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - pbex.top - mex.top,
                left: offset.left - parentOffset.left - pbex.left - mex.left
            }
        } else {
            var props = {
                top: coords.top,
                left: coords.left
            }

            if (styler.css(elm, "position") == "static") {
                props['position'] = "relative";
            }
            styler.css(elm, props);
            return this;
        }
    }

    function relativeRect(elm, coords) {
        if (coords === undefined) {
            var // Get *real* offsetParent
                parent = offsetParent(elm),
                // Get correct offsets
                offset = boundingRect(elm),
                parentOffset = boundingPosition(parent),
                mex = marginExtents(elm),
                pbex = borderExtents(parent);

            // Subtract parent offsets and element margins
            return {
                top: offset.top - parentOffset.top - pbex.top - mex.top,
                left: offset.left - parentOffset.left - pbex.left - mex.left,
                width: offset.width,
                height: offset.height
            }
        } else {
            relativePosition(elm, coords);
            size(elm, coords);
            return this;
        }
    }

    function scrollIntoView(elm, align) {
        function getOffset(elm, rootElm) {
            var x, y, parent = elm;

            x = y = 0;
            while (parent && parent != rootElm && parent.nodeType) {
                x += parent.offsetLeft || 0;
                y += parent.offsetTop || 0;
                parent = parent.offsetParent;
            }

            return { x: x, y: y };
        }

        var parentElm = elm.parentNode;
        var x, y, width, height, parentWidth, parentHeight;
        var pos = getOffset(elm, parentElm);

        x = pos.x;
        y = pos.y;
        width = elm.offsetWidth;
        height = elm.offsetHeight;
        parentWidth = parentElm.clientWidth;
        parentHeight = parentElm.clientHeight;

        if (align == "end") {
            x -= parentWidth - width;
            y -= parentHeight - height;
        } else if (align == "center") {
            x -= (parentWidth / 2) - (width / 2);
            y -= (parentHeight / 2) - (height / 2);
        }

        parentElm.scrollLeft = x;
        parentElm.scrollTop = y;

        return this;
    }

    function scrollLeft(elm, value) {
        var hasScrollLeft = "scrollLeft" in elm;
        if (value === undefined) {
            return hasScrollLeft ? elm.scrollLeft : elm.pageXOffset
        } else {
            if (hasScrollLeft) {
                elm.scrollLeft = value;
            } else {
                elm.scrollTo(value, elm.scrollY);
            }
            return this;
        }
    }

    function scrollTop(elm, value) {
        var hasScrollTop = "scrollTop" in elm;

        if (value === undefined) {
            return hasScrollTop ? elm.scrollTop : elm.pageYOffset
        } else {
            if (hasScrollTop) {
                elm.scrollTop = value;
            } else {
                elm.scrollTo(elm.scrollX, value);
            }
            return this;
        }
    }

    function size(elm, dimension) {
        if (dimension == undefined) {
            if (langx.isWindow(elm)) {
                return {
                    width: elm.innerWidth,
                    height: elm.innerHeight
                }

            } else if (langx.isDocument(elm)) {
                return getDocumentSize(document);
            } else {
                return {
                    width: elm.offsetWidth,
                    height: elm.offsetHeight
                }
            }
        } else {
            var isBorderBox = (styler.css(elm, "box-sizing") === "border-box"),
                props = {
                    width: dimension.width,
                    height: dimension.height
                };
            if (!isBorderBox) {
                var pex = paddingExtents(elm),
                    bex = borderExtents(elm);

                if (props.width !== undefined && props.width !== "" && props.width !== null) {
                    props.width = props.width - pex.left - pex.right - bex.left - bex.right;
                }

                if (props.height !== undefined && props.height !== "" && props.height !== null) {
                    props.height = props.height - pex.top - pex.bottom - bex.top - bex.bottom;
                }
            }
            styler.css(elm, props);
            return this;
        }
    }

    function width(elm, value) {
        if (value == undefined) {
            return size(elm).width;
        } else {
            size(elm, {
                width: value
            });
            return this;
        }
    }

    function geom() {
        return geom;
    }

    langx.mixin(geom, {
        borderExtents: borderExtents,
        //viewport coordinate
        boundingPosition: boundingPosition,

        boundingRect: boundingRect,

        clientHeight: clientHeight,

        clientSize: clientSize,

        clientWidth: clientWidth,

        contentRect: contentRect,

        getDocumentSize: getDocumentSize,

        height: height,

        marginExtents: marginExtents,

        offsetParent: offsetParent,

        paddingExtents: paddingExtents,

        //coordinate to the document
        pagePosition: pagePosition,

        pageRect: pageRect,

        // coordinate relative to it's parent
        relativePosition: relativePosition,

        relativeRect: relativeRect,

        scrollIntoView: scrollIntoView,

        scrollLeft: scrollLeft,

        scrollTop: scrollTop,

        size: size,

        width: width
    });

    return skylark.geom = geom;
});

define('skylark-utils/eventer',[
    "./skylark",
    "./langx",
    "./browser",
    "./finder",
    "./noder",
    "./datax"
], function(skylark, langx, browser, finder, noder, datax) {
    var mixin = langx.mixin,
        each = langx.each,
        slice = Array.prototype.slice,
        uid = langx.uid,
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: "isDefaultPrevented",
            stopImmediatePropagation: "isImmediatePropagationStopped",
            stopPropagation: "isPropagationStopped"
        },
        readyRE = /complete|loaded|interactive/;

    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            if (!source) {
                source = event;
            }

            langx.each(eventMethods, function(name, predicate) {
                var sourceMethod = source[name];
                event[name] = function() {
                    this[predicate] = langx.returnTrue;
                    return sourceMethod && sourceMethod.apply(source, arguments);
                }
                event[predicate] = langx.returnFalse;
            });
        }
        return event;
    }

    function parse(event) {
        var segs = ("" + event).split(".");
        return {
            type: segs[0],
            ns: segs.slice(1).sort().join(" ")
        };
    }

    //create a custom dom event
    var createEvent = (function() {
        var EventCtors = [
                window["CustomEvent"], // 0 default
                window["CompositionEvent"], // 1
                window["DragEvent"], // 2
                window["Event"], // 3
                window["FocusEvent"], // 4
                window["KeyboardEvent"], // 5
                window["MessageEvent"], // 6
                window["MouseEvent"], // 7
                window["MouseScrollEvent"], // 8
                window["MouseWheelEvent"], // 9
                window["MutationEvent"], // 10
                window["ProgressEvent"], // 11
                window["TextEvent"], // 12
                window["TouchEvent"], // 13
                window["UIEvent"], // 14
                window["WheelEvent"] // 15
            ],
            NativeEvents = {
                "compositionstart": 1, // CompositionEvent
                "compositionend": 1, // CompositionEvent
                "compositionupdate": 1, // CompositionEvent

                "beforecopy": 2, // DragEvent
                "beforecut": 2, // DragEvent
                "beforepaste": 2, // DragEvent
                "copy": 2, // DragEvent
                "cut": 2, // DragEvent
                "paste": 2, // DragEvent

                "drag": 2, // DragEvent
                "dragend": 2, // DragEvent
                "dragenter": 2, // DragEvent
                "dragexit": 2, // DragEvent
                "dragleave": 2, // DragEvent
                "dragover": 2, // DragEvent
                "dragstart": 2, // DragEvent
                "drop": 2, // DragEvent

                "abort": 3, // Event
                "change": 3, // Event
                "error": 3, // Event
                "selectionchange": 3, // Event
                "submit": 3, // Event
                "reset": 3, // Event

                "focus": 4, // FocusEvent
                "blur": 4, // FocusEvent
                "focusin": 4, // FocusEvent
                "focusout": 4, // FocusEvent

                "keydown": 5, // KeyboardEvent
                "keypress": 5, // KeyboardEvent
                "keyup": 5, // KeyboardEvent

                "message": 6, // MessageEvent

                "click": 7, // MouseEvent
                "contextmenu": 7, // MouseEvent
                "dblclick": 7, // MouseEvent
                "mousedown": 7, // MouseEvent
                "mouseup": 7, // MouseEvent
                "mousemove": 7, // MouseEvent
                "mouseover": 7, // MouseEvent
                "mouseout": 7, // MouseEvent
                "mouseenter": 7, // MouseEvent
                "mouseleave": 7, // MouseEvent


                "textInput": 12, // TextEvent

                "touchstart": 13, // TouchEvent
                "touchmove": 13, // TouchEvent
                "touchend": 13, // TouchEvent

                "load": 14, // UIEvent
                "resize": 14, // UIEvent
                "select": 14, // UIEvent
                "scroll": 14, // UIEvent
                "unload": 14, // UIEvent,

                "wheel": 15 // WheelEvent
            }
        ;

        function getEventCtor(type) {
            var idx = NativeEvents[type];
            if (!idx) {
                idx = 0;
            }
            return EventCtors[idx];
        }

        return function(type, props) {
            //create a custom dom event

            if (langx.isString(type)) {
                props = props || {};
            } else {
                props = type || {};
                type = props.type || "";
            }
            var parsed = parse(type);
            type = parsed.type;

            props = langx.mixin({
                bubbles: true,
                cancelable: true
            }, props);

            if (parsed.ns) {
                props.namespace = parsed.ns;
            }

            var ctor = getEventCtor(type),
                e = new ctor(type, props);

            langx.safeMixin(e, props);

            return compatible(e);
        };
    })();

    function createProxy(event) {
        var key,
            proxy = {
                originalEvent: event
            };
        for (key in event) {
            if (key !== "keyIdentifier" && !ignoreProperties.test(key) && event[key] !== undefined) {
                proxy[key] = event[key];
            }
        }
        return compatible(proxy, event);
    }

    var
        specialEvents = {},
        focusinSupported = "onfocusin" in window,
        focus = { focus: "focusin", blur: "focusout" },
        hover = { mouseenter: "mouseover", mouseleave: "mouseout" },
        realEvent = function(type) {
            return hover[type] || (focusinSupported && focus[type]) || type;
        },
        handlers = {},
        EventBindings = langx.klass({
            init: function(target, event) {
                this._target = target;
                this._event = event;
                this._bindings = [];
            },

            add: function(fn, options) {
                var bindings = this._bindings,
                    binding = {
                        fn: fn,
                        options: langx.mixin({}, options)
                    };

                bindings.push(binding);

                var self = this;
                if (!self._listener) {
                    self._listener = function(domEvt) {
                        var elm = this,
                            e = createProxy(domEvt),
                            args = domEvt._args,
                            bindings = self._bindings,
                            ns = e.namespace;

                        if (langx.isDefined(args)) {
                            args = [e].concat(args);
                        } else {
                            args = [e];
                        }

                        langx.each(bindings,function(idx,binding) {
                            var match = elm;
                            if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
                                return false;
                            }
                            var fn = binding.fn,
                                options = binding.options || {},
                                selector = options.selector,
                                one = options.one,
                                data = options.data;

                            if (ns && ns != options.ns && options.ns.indexOf(ns)===-1) {
                                return ;
                            }
                            if (selector) {
                                match = finder.closest(e.target, selector);
                                if (match && match !== elm) {
                                    langx.mixin(e, {
                                        currentTarget: match,
                                        liveFired: elm
                                    });
                                } else {
                                    return ;
                                }
                            }

                            if (langx.isDefined(data)) {
                                e.data = data;
                            }

                            if (one) {
                                self.remove(fn, options);
                            }

                            var result = fn.apply(match, args);

                            if (result === false) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });;
                    };

                    var event = self._event;
                    if (event in hover) {
                        var l = self._listener;
                        self._listener = function(e) {
                            var related = e.relatedTarget;
                            if (!related || (related !== this && !noder.contains(this, related))) {
                                return l.apply(this, arguments);
                            }
                        }
                    }

                    if (self._target.addEventListener) {
                        self._target.addEventListener(realEvent(event), self._listener, false);
                    } else {
                        console.warn("invalid eventer object", self._target);
                    }
                }

            },
            remove: function(fn, options) {
                options = langx.mixin({}, options);

                function matcherFor(ns) {
                    return new RegExp("(?:^| )" + ns.replace(" ", " .* ?") + "(?: |$)");
                }
                var matcher;
                if (options.ns) {
                    matcher = matcherFor(options.ns);
                }

                this._bindings = this._bindings.filter(function(binding) {
                    var removing = (!fn || fn === binding.fn) &&
                        (!matcher || matcher.test(binding.options.ns)) &&
                        (!options.selector || options.selector == binding.options.selector);

                    return !removing;
                });
                if (this._bindings.length == 0) {
                    if (this._target.removeEventListener) {
                        this._target.removeEventListener(realEvent(this._event), this._listener, false);
                    }
                    this._listener = null;
                }
            }
        }),
        EventsHandler = langx.klass({
            init: function(elm) {
                this._target = elm;
                this._handler = {};
            },

            // add a event listener
            // selector Optional
            register: function(event, callback, options) {
                // Seperate the event from the namespace
                var parsed = parse(event),
                    event = parsed.type,
                    specialEvent = specialEvents[event],
                    bindingEvent = specialEvent && (specialEvent.bindType || specialEvent.bindEventName);

                var events = this._handler;

                // Check if there is already a handler for this event
                if (events[event] === undefined) {
                    events[event] = new EventBindings(this._target, bindingEvent || event);
                }

                // Register the new callback function
                events[event].add(callback, langx.mixin({
                    ns: parsed.ns
                }, options)); // options:{selector:xxx}
            },

            // remove a event listener
            unregister: function(event, fn, options) {
                // Check for parameter validtiy
                var events = this._handler,
                    parsed = parse(event);
                event = parsed.type;

                var listener = events[event];

                if (listener) {
                    listener.remove(fn, langx.mixin({
                        ns: parsed.ns
                    }, options));
                }
            }
        }),

        findHandler = function(elm) {
            var id = uid(elm),
                handler = handlers[id];
            if (!handler) {
                handler = handlers[id] = new EventsHandler(elm);
            }
            return handler;
        };

    function off(elm, events, selector, callback) {
        var $this = this
        if (langx.isPlainObject(events)) {
            langx.each(events, function(type, fn) {
                off(elm, type, selector, fn);
            })
            return $this;
        }

        if (!langx.isString(selector) && !langx.isFunction(callback) && callback !== false) {
            callback = selector;
            selector = undefined;
        }

        if (callback === false) {
            callback = langx.returnFalse;
        }

        if (typeof events == "string") {
            if (events.indexOf(",") > -1) {
                events = events.split(",");
            } else {
                events = events.split(/\s/);
            }
        }

        var handler = findHandler(elm);

        if (events) events.forEach(function(event) {

            handler.unregister(event, callback, {
                selector: selector,
            });
        });
        return this;
    }

    function on(elm, events, selector, data, callback, one) {

        var autoRemove, delegator;
        if (langx.isPlainObject(events)) {
            langx.each(events, function(type, fn) {
                on(elm, type, selector, data, fn, one);
            });
            return this;
        }

        if (!langx.isString(selector) && !langx.isFunction(callback)) {
            callback = data;
            data = selector;
            selector = undefined;
        }

        if (langx.isFunction(data)) {
            callback = data;
            data = undefined;
        }

        if (callback === false) {
            callback = langx.returnFalse;
        }

        if (typeof events == "string") {
            if (events.indexOf(",") > -1) {
                events = events.split(",");
            } else {
                events = events.split(/\s/);
            }
        }

        var handler = findHandler(elm);

        events.forEach(function(event) {
            if (event == "ready") {
                return ready(callback);
            }
            handler.register(event, callback, {
                data: data,
                selector: selector,
                one: !!one
            });
        });
        return this;
    }

    function one(elm, events, selector, data, callback) {
        on(elm, events, selector, data, callback, 1);

        return this;
    }

    function stop(event) {
        if (window.document.all) {
            event.keyCode = 0;
        }
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        return this;
    }

    function trigger(evented, type, args) {
        var e;
        if (type instanceof Event) {
            e = type;
        } else {
            e = createEvent(type, args);
        }
        e._args = args;

        var fn = (evented.dispatchEvent || evented.trigger);
        if (fn) {
            fn.call(evented, e);
        } else {
            console.warn("The evented parameter is not a eventable object");
        }

        return this;
    }

    function ready(callback) {
        // need to check if document.body exists for IE as that browser reports
        // document ready when it hasn't yet created the body elm
        if (readyRE.test(document.readyState) && document.body) {
            callback()
        } else {
            document.addEventListener('DOMContentLoaded', callback, false);
        }

        return this;
    }

    var keyCodeLookup = {
        "delete": 46
    };
    //example:
    //shortcuts(elm).add("CTRL+ALT+SHIFT+X",function(){console.log("test!")});
    function shortcuts(elm) {

        var registry = datax.data(elm, "shortcuts");
        if (!registry) {
            registry = {};
            datax.data(elm, "shortcuts", registry);
            var run = function(shortcut, event) {
                var n = event.metaKey || event.ctrlKey;
                if (shortcut.ctrl == n && shortcut.alt == event.altKey && shortcut.shift == event.shiftKey) {
                    if (event.keyCode == shortcut.keyCode || event.charCode && event.charCode == shortcut.charCode) {
                        event.preventDefault();
                        if ("keydown" == event.type) {
                            shortcut.fn(event);
                        }
                        return true;
                    }
                }
            };
            on(elm, "keyup keypress keydown", function(event) {
                if (!(/INPUT|TEXTAREA/.test(event.target.nodeName))) {
                    for (var key in registry) {
                        run(registry[key], event);
                    }
                }
            });

        }

        return {
            add: function(pattern, fn) {
                var shortcutKeys;
                if (pattern.indexOf(",") > -1) {
                    shortcutKeys = pattern.toLowerCase().split(",");
                } else {
                    shortcutKeys = pattern.toLowerCase().split(" ");
                }
                shortcutKeys.forEach(function(shortcutKey) {
                    var setting = {
                        fn: fn,
                        alt: false,
                        ctrl: false,
                        shift: false
                    };
                    shortcutKey.split("+").forEach(function(key) {
                        switch (key) {
                            case "alt":
                            case "ctrl":
                            case "shift":
                                setting[key] = true;
                                break;
                            default:
                                setting.charCode = key.charCodeAt(0);
                                setting.keyCode = keyCodeLookup[key] || key.toUpperCase().charCodeAt(0);
                        }
                    });
                    var regKey = (setting.ctrl ? "ctrl" : "") + "," + (setting.alt ? "alt" : "") + "," + (setting.shift ? "shift" : "") + "," + setting.keyCode;
                    registry[regKey] = setting;
                })
            }

        };

    }

    function eventer() {
        return eventer;
    }

    langx.mixin(eventer, {
        create: createEvent,

        off: off,

        on: on,

        one: one,

        proxy: createProxy,

        ready: ready,

        shortcuts: shortcuts,

        special : specialEvents,

        stop: stop,

        trigger: trigger

    });

    return skylark.eventer = eventer;
});

define('skylark-utils/dnd',[
    "./skylark",
    "./langx",
    "./noder",
    "./datax",
    "./finder",
    "./geom",
    "./eventer",
    "./styler"
],function(skylark, langx,noder,datax,finder,geom,eventer,styler){
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height;


    var DndManager = langx.Evented.inherit({
      klassName : "DndManager",

      init : function() {

      },

      prepare : function(draggable) {
          var e = eventer.create("preparing",{
             dragSource : draggable.elm,
             handleElm : draggable.handleElm
          });
          draggable.trigger(e);
          draggable.dragSource = e.dragSource;
      },

      start : function(draggable,event) {

        var p = geom.pagePosition(draggable.elm);
        this.draggingOffsetX = parseInt(event.pageX - p.left);
        this.draggingOffsetY = parseInt(event.pageY - p.top)

        var e = eventer.create("started",{
          elm : draggable.elm,
          dragSource : draggable.dragSource,
          handleElm : draggable.handleElm,
          ghost : null,

          transfer : {
          }
        });

        draggable.trigger(e);


        this.dragging = draggable;

        if (draggable.draggingClass) {
          styler.addClass(draggable.dragSource,draggable.draggingClass);
        }

        this.draggingGhost = e.ghost;
        if (!this.draggingGhost) {
          this.draggingGhost = draggable.elm;
        }

        this.draggingTransfer = e.transfer;
        if (this.draggingTransfer) {

            langx.each(this.draggingTransfer,function(key,value){
                event.dataTransfer.setData(key, value);
            });
        }

        event.dataTransfer.setDragImage(this.draggingGhost, this.draggingOffsetX, this.draggingOffsetY);

        event.dataTransfer.effectAllowed = "copyMove";

        this.trigger(e);
      },

      over : function() {

      },

      end : function(dropped) {
        var dragging = this.dragging;
        if (dragging) {
          if (dragging.draggingClass) {
            styler.removeClass(dragging.dragSource,dragging.draggingClass);
          }
        }

        var e = eventer.create("ended",{
        });        
        this.trigger(e);


        this.dragging = null;
        this.draggingTransfer = null;
        this.draggingGhost = null;
        this.draggingOffsetX = null;
        this.draggingOffsetY = null;
      }
    });

    var manager = new DndManager(),
        draggingHeight,
        placeholders = [];



    var Draggable = langx.Evented.inherit({
      klassName : "Draggable",

      init : function (elm,params) {
        var self = this;

        self.elm = elm;
        self.draggingClass = params.draggingClass || "dragging",
        self._params = params;

        ["preparing","started", "ended", "moving"].forEach(function(eventName) {
            if (langx.isFunction(params[eventName])) {
                self.on(eventName, params[eventName]);
            }
        });


        eventer.on(elm,{
          "mousedown" : function(e) {
            if (params.handle) {
              self.handleElm = finder.closest(e.target,params.handle);
              if (!self.handleElm) {
                return;
              }
            }
            manager.prepare(self);
            if (self.dragSource) {
              datax.prop(self.dragSource, "draggable", true);
            }
          },

          "mouseup" :   function(e) {
            if (self.dragSource) {
              datax.prop(self.dragSource, "draggable", false);
              self.dragSource = null;
              self.handleElm = null;
            }
          },

          "dragstart":  function(e) {
            datax.prop(self.dragSource, "draggable", false);
            manager.start(self, e);
          },

          "dragend":   function(e){
            eventer.stop(e);

            if (!manager.dragging) {
              return;
            }

            manager.end(false);
          }
        });

      }

    });


    var Droppable = langx.Evented.inherit({
      klassName : "Droppable",

      init : function(elm,params) {
        var self = this,
            draggingClass = params.draggingClass || "dragging",
            hoverClass,
            activeClass,
            acceptable = true;

        self.elm = elm;
        self._params = params;

        ["started","entered", "leaved", "dropped","overing"].forEach(function(eventName) {
            if (langx.isFunction(params[eventName])) {
                self.on(eventName, params[eventName]);
            }
        });

        eventer.on(elm,{
          "dragover" : function(e) {
            e.stopPropagation()

            if (!acceptable) {
              return
            }

            var e2 = eventer.create("overing",{
                overElm : e.target,
                transfer : manager.draggingTransfer,
                acceptable : true
            });
            self.trigger(e2);

            if (e2.acceptable) {
              e.preventDefault() // allow drop

              e.dataTransfer.dropEffect = "copyMove";
            }

          },

          "dragenter" :   function(e) {
            var params = self._params,
                elm = self.elm;

            var e2 = eventer.create("entered",{
                transfer : manager.draggingTransfer
            });

            self.trigger(e2);

            e.stopPropagation()

            if (hoverClass && acceptable) {
              styler.addClass(elm,hoverClass)
            }
          },

          "dragleave":  function(e) {
            var params = self._params,
                elm = self.elm;
            if (!acceptable) return false
            
            var e2 = eventer.create("leaved",{
                transfer : manager.draggingTransfer
            });
            
            self.trigger(e2);

            e.stopPropagation()

            if (hoverClass && acceptable) {
              styler.removeClass(elm,hoverClass);
            }
          },

          "drop":   function(e){
            var params = self._params,
                elm = self.elm;

            eventer.stop(e); // stops the browser from redirecting.

            if (!manager.dragging) return

           // manager.dragging.elm.removeClass('dragging');

            if (hoverClass && acceptable) {
              styler.addClass(elm,hoverClass)
            }

            var e2 = eventer.create("dropped",{
                transfer : manager.draggingTransfer
            });

            self.trigger(e2);

            manager.end(true)
          }
        });

        manager.on("started",function(e){
            var e2 = eventer.create("started",{
                transfer : manager.draggingTransfer,
                acceptable : false
            });

            self.trigger(e2);

            acceptable = e2.acceptable;
            hoverClass = e2.hoverClass;
            activeClass = e2.activeClass;

            if (activeClass && acceptable) {
              styler.addClass(elm,activeClass);
            }

         }).on("ended" , function(e){
            var e2 = eventer.create("ended",{
                transfer : manager.draggingTransfer,
                acceptable : false
            });

            self.trigger(e2);

            if (hoverClass && acceptable) {
              styler.removeClass(elm,hoverClass);
            }
            if (activeClass && acceptable) {
              styler.removeClass(elm,activeClass);
            }

            acceptable = false;
            activeClass = null;
            hoverClass = null;
        });

      }
    });


    function draggable(elm, params) {
      return new Draggable(elm,params);
    }

    function droppable(elm, params) {
      return new Droppable(elm,params);
    }

    function dnd(){
      return dnd;
    }

    langx.mixin(dnd, {
       //params ： {
        //  target : Element or string or function
        //  handle : Element
        //  copy : boolean
        //  placeHolder : "div"
        //  hoverClass : "hover"
        //  start : function
        //  enter : function
        //  over : function
        //  leave : function
        //  drop : function
        //  end : function
        //
        //
        //}
        draggable   : draggable,

        //params ： {
        //  accept : string or function
        //  placeHolder
        //
        //
        //
        //}
        droppable : droppable,

        manager : manager


    });

    return skylark.dnd = dnd;
});

define('skylarkjs/dnd',[
    "skylark-utils/dnd"
], function(dnd) {
    return dnd;
});

define('skylarkjs/eventer',[
    "skylark-utils/eventer"
], function(eventer) {
    return eventer;
});

define('skylark-utils/filer',[
    "./skylark",
    "./langx",
    "./eventer",
    "./styler"
], function(skylark, langx, eventer,styler) {
    var on = eventer.on,
        attr = eventer.attr,
        Deferred = langx.Deferred,

        fileInput,
        fileInputForm,
        fileSelected,
        maxFileSize = 1 / 0;

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    function selectFile(callback) {
        fileSelected = callback;
        if (!fileInput) {
            var input = fileInput = document.createElement("input");

            function selectFiles(pickedFiles) {
                for (var i = pickedFiles.length; i--;) {
                    if (pickedFiles[i].size > maxFileSize) {
                        pickedFiles.splice(i, 1);
                    }
                }
                fileSelected(pickedFiles);
            }

            input.type = "file";
            input.style.position = "fixed",
                input.style.left = 0,
                input.style.top = 0,
                input.style.opacity = .001,
                document.body.appendChild(input);

            input.onchange = function(e) {
                selectFiles(Array.prototype.slice.call(e.target.files));
                // reset to "", so selecting the same file next time still trigger the change handler
                input.value = "";
            };
        }
        fileInput.click();
    }

    function upload(files, url, params) {
        params = params || {};
        var chunkSize = params.chunkSize || 0,
            maxSize = params.maxSize || 0,
            progressCallback = params.progress,
            errorCallback = params.error,
            completedCallback = params.completed,
            uploadedCallback = params.uploaded;


        function uploadOneFile(fileItem,oneFileloadedSize, fileItems) {
            function handleProcess(nowLoadedSize) {
                var t;
                speed = Math.ceil(oneFileloadedSize + nowLoadedSize / ((now() - uploadStartedTime) / 1e3)), 
                percent = Math.round((oneFileloadedSize + nowLoadedSize) / file.size * 100); 
                if (progressCallback) {
                    progressCallback({
                        name: file.name,
                        loaded: oneFileloadedSize + nowLoadedSize,
                        total: file.size,
                        percent: percent,
                        bytesPerSecond: speed,
                        global: {
                            loaded: allLoadedSize + oneFileloadedSize + nowLoadedSize,
                            total: totalSize
                        }
                    });
                }
            }
            var file = fileItem.file,
                uploadChunkSize = chunkSize || file.size,
                chunk = file.slice(oneFileloadedSize, oneFileloadedSize + uploadChunkSize);

            xhr = createXmlHttpRequest();
            //xhr.open("POST", url + 
            //                "?action=upload&path=" + 
            //                encodeURIComponent(path) + 
            //                "&name=" + encodeURIComponent(file.name) + 
            //                "&loaded=" + oneFileloadedSize + 
            //                "&total=" + file.size + 
            //                "&id=" + id + 
            //                "&csrf=" + encodeURIComponent(token) + 
            //                "&resolution=" + 
            //                encodeURIComponent(fileItem.type));
            xhr.upload.onprogress = function(event) {
                handleProcess(event.loaded - (event.total - h.size))
            };
            xhr.onload = function() {
                var response, i;
                xhr.upload.onprogress({
                    loaded: h.size,
                    total: h.size
                });
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    i = {
                        code: -1,
                        message: "Error response is not proper JSON\n\nResponse:\n" + xhr.responseText,
                        data: {
                            fileName: file.name,
                            fileSize: file.size,
                            maxSize: uploadMaxSize,
                            extensions: extensions.join(", ")
                        },
                        extra: extra
                    };
                    errorFileInfos.push(i);
                    if (errorCallback) {
                        errorCallback(i);
                    }
                    return uploadFiles(fileItems)
                }
                if (response.error) {

                    i = {
                        code: response.error.code,
                        message: response.error.message,
                        data: {
                            fileName: file.name,
                            fileSize: file.size,
                            maxSize: uploadMaxSize,
                            extensions: extensions.join(", ")
                        },
                        extra: extra
                    }; 
                    errorFileInfos.push(i); 
                    if (errorCallback) {
                        errorCallback(i);
                    }
                    uploadFiles(fileItems);
                } else {
                    if (!response.error && oneFileloadedSize + uploadChunkSize < file.size) {
                        uploadOneFile(fileItem, oneFileloadedSize + uploadChunkSize, fileItems);
                    } else {
                        if (response.result) {
                            utils.each(response.result, function(e) {
                                e = File.fromJSON(e);
                                uploadFileItems.push(e);

                                if (uploadedCallback) {
                                    uploadedCallback({
                                        file: e
                                    });
                                }
                            }); 

                        } 
                        allLoadedSize += file.size;
                        response.result && k.push(response.result);
                        uploadFiles(fileItems);
                    }                            
                }     

            };
            handleProcess(0);
            xhr.send(createFormData(h));
        }

        function uploadFiles(fileItems) {
            var fileItem = fileItems.shift();
            processedFilesCount++; 
            if (fileItem && fileItem.file.error) {
                uploadFiles(fileItem);
            } else {
                if (uploadingFile) {
                    uploadOneFile(fileItem, null, 0, fileItems);
                } else {

                    if (completedCallback) {
                        completedCallback({
                            files: new FileCollection(uploadFileItems),
                            bytesPerSecond: I,
                            errors: E(D),
                            extra: extra
                        });
                    }
                }  
            }
        }

        var self = this,
            fileItems = [],
            processedFilesCount = -1,
            xhr, 
            totalSize = 0,
            allLoadedSize = 0,
            k = [],
            errorFileInfos = [],
            startedTime = now(),
            I = 0,
            uploadFileItems = [];

        for ( var  i = 0; i < files.length; i++) {
            totalSize += files[i].size;
            fileItems.push({
                file : files[i]
            });
        }        

        uploadFiles(fileItems);
    }


    var filer = function() {
        return filer;
    };

    langx.mixin(filer , {
        dropzone: function(elm, params) {
            params = params || {};
            var hoverClass = params.hoverClass || "dropzone",
                droppedCallback = params.dropped;

            var enterdCount = 0;
            on(elm, "dragenter", function(e) {
                if (e.dataTransfer && e.dataTransfer.types.indexOf("Files")>-1) {
                    eventer.stop(e);
                    enterdCount ++;
                    styler.addClass(elm,hoverClass)
                }
            });

            on(elm, "dragover", function(e) {
                if (e.dataTransfer && e.dataTransfer.types.indexOf("Files")>-1) {
                    eventer.stop(e);
                }
            });


            on(elm, "dragleave", function(e) {
                if (e.dataTransfer && e.dataTransfer.types.indexOf("Files")>-1) {
                    enterdCount--
                    if (enterdCount==0) {
                        styler.removeClass(elm,hoverClass);
                    }
                }
            });

            on(elm, "drop", function(e) {
                if (e.dataTransfer && e.dataTransfer.types.indexOf("Files")>-1) {
                    styler.removeClass(elm,hoverClass)
                    eventer.stop(e);
                    if (droppedCallback) {
                        droppedCallback(e.dataTransfer.files);
                    }
                }
            });


            return this;
        },

        picker: function(elm, params) {
            params = params || {};

            var pickedCallback = params.picked;

            on(elm, "click", function(e) {
                e.preventDefault();
                selectFile(pickedCallback);
            });
            return this;
        },

        readFile : function(file,params) {
            params = params || {};
            var d = new Deferred,
                reader = new FileReader();
            
            reader.onload = function(evt) {
                d.resolve(evt.target.result);
            };
            reader.onerror = function(e) {
                var code = e.target.error.code;
                if (code === 2) {
                    alert('please don\'t open this page using protocol fill:///');
                } else {
                    alert('error code: ' + code);
                }
            };
            
            if (params.asArrayBuffer){
                reader.readAsArrayBuffer(file);
            } else if (params.asDataUrl) {
                reader.readAsDataURL(file);                
            } else if (params.asText) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }

            return d.promise;
        },

        writeFile : function(data,name) {
            if (window.navigator.msSaveBlob) { 
               if (langx.isString(data)) {
                   data = dataURItoBlob(data);
               }
               window.navigator.msSaveBlob(data, name);
            } else {
                var a = document.createElement('a');
                if (data instanceof Blob) {
                    data = langx.URL.createObjectURL(data);
                }
                a.href = data;
                a.setAttribute('download', name || 'noname');
                a.dispatchEvent(new CustomEvent('click'));
            }              
        }


    });

    return skylark.filer = filer;
});

define('skylarkjs/filer',[
    "skylark-utils/filer"
], function(filer) {
    return filer;
});

define('skylarkjs/finder',[
    "skylark-utils/finder"
], function(finder) {
    return finder;
});

define('skylark-utils/fx',[
    "./skylark",
    "./langx",
    "./browser",
    "./geom",
    "./styler",
    "./eventer"
], function(skylark, langx, browser, geom, styler, eventer) {
    var animationName,
        animationDuration,
        animationTiming,
        animationDelay,
        transitionProperty,
        transitionDuration,
        transitionTiming,
        transitionDelay,

        animationEnd = browser.normalizeCssEvent('AnimationEnd'),
        transitionEnd = browser.normalizeCssEvent('TransitionEnd'),

        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform = browser.css3PropPrefix + "transform",
        cssReset = {};


    cssReset[animationName = browser.normalizeCssProperty("animation-name")] =
        cssReset[animationDuration = browser.normalizeCssProperty("animation-duration")] =
        cssReset[animationDelay = browser.normalizeCssProperty("animation-delay")] =
        cssReset[animationTiming = browser.normalizeCssProperty("animation-timing-function")] = "";

    cssReset[transitionProperty = browser.normalizeCssProperty("transition-property")] =
        cssReset[transitionDuration = browser.normalizeCssProperty("transition-duration")] =
        cssReset[transitionDelay = browser.normalizeCssProperty("transition-delay")] =
        cssReset[transitionTiming = browser.normalizeCssProperty("transition-timing-function")] = "";



    function animate(elm, properties, duration, ease, callback, delay) {
        var key,
            cssValues = {},
            cssProperties = [],
            transforms = "",
            that = this,
            endEvent,
            wrappedCallback,
            fired = false,
            hasScrollTop = false;

        if (langx.isPlainObject(duration)) {
            ease = duration.easing;
            callback = duration.complete;
            delay = duration.delay;
            duration = duration.duration;
        }

        if (langx.isString(duration)) {
            duration = fx.speeds[duration];
        }
        if (duration === undefined) {
            duration = fx.speeds.normal;
        }
        duration = duration / 1000;
        if (fx.off) {
            duration = 0;
        }

        if (langx.isFunction(ease)) {
            callback = ease;
            eace = "swing";
        } else {
            ease = ease || "swing";
        }

        if (delay) {
            delay = delay / 1000;
        } else {
            delay = 0;
        }

        if (langx.isString(properties)) {
            // keyframe animation
            cssValues[animationName] = properties;
            cssValues[animationDuration] = duration + "s";
            cssValues[animationTiming] = ease;
            endEvent = animationEnd;
        } else {
            // CSS transitions
            for (key in properties) {
                if (supportedTransforms.test(key)) {
                    transforms += key + "(" + properties[key] + ") ";
                } else {
                    if (key === "scrollTop") {
                        hasScrollTop = true;
                    }
                    cssValues[key] = properties[key];
                    cssProperties.push(langx.dasherize(key));
                }
            }
            endEvent = transitionEnd;
        }

        if (transforms) {
            cssValues[transform] = transforms;
            cssProperties.push(transform);
        }

        if (duration > 0 && langx.isPlainObject(properties)) {
            cssValues[transitionProperty] = cssProperties.join(", ");
            cssValues[transitionDuration] = duration + "s";
            cssValues[transitionDelay] = delay + "s";
            cssValues[transitionTiming] = ease;
        }

        wrappedCallback = function(event) {
            fired = true;
            if (event) {
                if (event.target !== event.currentTarget) {
                    return // makes sure the event didn't bubble from "below"
                }
                eventer.off(event.target, endEvent, wrappedCallback)
            } else {
                eventer.off(elm, animationEnd, wrappedCallback) // triggered by setTimeout
            }
            styler.css(elm, cssReset);
            callback && callback.call(this);
        };

        if (duration > 0) {
            eventer.on(elm, endEvent, wrappedCallback);
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            langx.debounce(function() {
                if (fired) {
                    return;
                }
                wrappedCallback.call(that);
            }, ((duration + delay) * 1000) + 25)();
        }

        // trigger page reflow so new elements can animate
        elm.clientLeft;

        styler.css(elm, cssValues);

        if (duration <= 0) {
            langx.debounce(function() {
                if (fired) {
                    return;
                }
                wrappedCallback.call(that);
            }, 0)();
        }

        if (hasScrollTop) {
            scrollToTop(elm, properties["scrollTop"], duration, callback);
        }

        return this;
    }

    function show(elm, speed, callback) {
        styler.show(elm);
        if (speed) {
            if (!callback && langx.isFunction(speed)) {
                callback = speed;
                speed = "normal";
            }
            styler.css(elm, "opacity", 0)
            animate(elm, { opacity: 1, scale: "1,1" }, speed, callback);
        }
        return this;
    }


    function hide(elm, speed, callback) {
        if (speed) {
            if (!callback && langx.isFunction(speed)) {
                callback = speed;
                speed = "normal";
            }
            animate(elm, { opacity: 0, scale: "0,0" }, speed, function() {
                styler.hide(elm);
                if (callback) {
                    callback.call(elm);
                }
            });
        } else {
            styler.hide(elm);
        }
        return this;
    }

    function scrollToTop(elm, pos, speed, callback) {
        var scrollFrom = parseInt(elm.scrollTop),
            i = 0,
            runEvery = 5, // run every 5ms
            freq = speed * 1000 / runEvery,
            scrollTo = parseInt(pos);

        var interval = setInterval(function() {
            i++;

            if (i <= freq) elm.scrollTop = (scrollTo - scrollFrom) / freq * i + scrollFrom;

            if (i >= freq + 1) {
                clearInterval(interval);
                if (callback) langx.debounce(callback, 1000)();
            }
        }, runEvery);
    }

    function toggle(elm, speed, callback) {
        if (styler.isInvisible(elm)) {
            show(elm, speed, callback);
        } else {
            hide(elm, speed, callback);
        }
        return this;
    }

    function fadeTo(elm, speed, opacity, easing, callback) {
        animate(elm, { opacity: opacity }, speed, easing, callback);
        return this;
    }

    function fadeIn(elm, speed, easing, callback) {
        var target = styler.css(elm, "opacity");
        if (target > 0) {
            styler.css(elm, "opacity", 0);
        } else {
            target = 1;
        }
        styler.show(elm);

        fadeTo(elm, speed, target, easing, callback);

        return this;
    }

    function fadeOut(elm, speed, easing, callback) {
        var _elm = elm,
            complete,
            options = {};

        if (langx.isPlainObject(speed)) {
            options.easing = speed.easing;
            options.duration = speed.duration;
            complete = speed.complete;
        } else {
            options.duration = speed;
            if (callback) {
                complete = callback;
                options.easing = easing;
            } else {
                complete = easing;
            }
        }
        options.complete = function() {
            styler.hide(elm);
            if (complete) {
                complete.call(elm);
            }
        }

        fadeTo(elm, options, 0);

        return this;
    }

    function fadeToggle(elm, speed, ceasing, allback) {
        if (styler.isInvisible(elm)) {
            fadeIn(elm, speed, easing, callback);
        } else {
            fadeOut(elm, speed, easing, callback);
        }
        return this;
    }

    function slideDown(elm,duration,callback) {    
    
        // get the element position to restore it then
        var position = styler.css(elm,'position');
        
        // show element if it is hidden
        show(elm);
        
        // place it so it displays as usually but hidden
        styler.css(elm,{
            position: 'absolute',
            visibility: 'hidden'
        });
        
        // get naturally height, margin, padding
        var marginTop = styler.css(elm,'margin-top');
        var marginBottom = styler.css(elm,'margin-bottom');
        var paddingTop = styler.css(elm,'padding-top');
        var paddingBottom = styler.css(elm,'padding-bottom');
        var height = styler.css(elm,'height');
        
        // set initial css for animation
        styler.css(elm,{
            position: position,
            visibility: 'visible',
            overflow: 'hidden',
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0
        });
        
        // animate to gotten height, margin and padding
        animate(elm,{
            height: height,
            marginTop: marginTop,
            marginBottom: marginBottom,
            paddingTop: paddingTop,
            paddingBottom: paddingBottom
        }, {
            duration : duration,
            complete: function(){
                if (callback) {
                    callback.apply(elm); 
                }
            }    
        }
    );
        
        return this;
    };

    function slideUp(elm,duration,callback) {
        // active the function only if the element is visible
        if (geom.height(elm) > 0) {
                   
            // get the element position to restore it then
            var position = styler.css(elm,'position');
            
            // get the element height, margin and padding to restore them then
            var height = styler.css(elm,'height');
            var marginTop = styler.css(elm,'margin-top');
            var marginBottom = styler.css(elm,'margin-bottom');
            var paddingTop = styler.css(elm,'padding-top');
            var paddingBottom = styler.css(elm,'padding-bottom');
            
            // set initial css for animation
            styler.css(elm,{
                visibility: 'visible',
                overflow: 'hidden',
                height: height,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingTop: paddingTop,
                paddingBottom: paddingBottom
            });
            
            // animate element height, margin and padding to zero
            animate(elm,{
                height: 0,
                marginTop: 0,
                marginBottom: 0,
                paddingTop: 0,
                paddingBottom: 0
            }, { 
                // callback : restore the element position, height, margin and padding to original values
                duration: duration,
                queue: false,
                complete: function(){
                    hide(elm);
                    styler.css(elm,{
                        visibility: 'visible',
                        overflow: 'hidden',
                        height: height,
                        marginTop: marginTop,
                        marginBottom: marginBottom,
                        paddingTop: paddingTop,
                        paddingBottom: paddingBottom
                    });
                    if (callback) {
                        callback.apply(elm); 
                    }
                }
            });
        }
        return this;
    };
    
    /* SlideToggle */
    function slideToggle(elm,duration,callback) {
    
        // if the element is hidden, slideDown !
        if (geom.height(elm) == 0) {
            slideDown(elm,duration,callback);
        } 
        // if the element is visible, slideUp !
        else {
            slideUp(elm,duration,callback);
        }
        return this;
    };


    function fx() {
        return fx;
    }

    langx.mixin(fx, {
        off: false,

        speeds: {
            normal: 400,
            fast: 200,
            slow: 600
        },

        animate: animate,
        fadeIn: fadeIn,
        fadeOut: fadeOut,
        fadeTo: fadeTo,
        fadeToggle: fadeToggle,
        hide: hide,
        scrollToTop: scrollToTop,

        slideDown : slideDown,
        slideToggle : slideToggle,
        slideUp : slideUp,
        show: show,
        toggle: toggle
    });

    return skylark.fx = fx;
});
define('skylarkjs/fx',[
    "skylark-utils/fx"
], function(fx) {
    return fx;
});

define('skylarkjs/geom',[
    "skylark-utils/geom"
], function(geom) {
    return geom;
});

define('skylark-utils/http',[
    "./skylark",
    "./langx"
],function(skylark, langx){
    var Deferred = langx.Deferred,
        blankRE = /^\s*$/,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i;


    function empty() {}

    var ajaxSettings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function() {
            return new window.XMLHttpRequest();
        },
        // MIME types mapping
        // IIS returns Javascript as "application/x-javascript"
        accepts: {
            script: 'text/javascript, application/javascript, application/x-javascript',
            json: 'application/json',
            xml: 'application/xml, text/xml',
            html: 'text/html',
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0,
        // Whether data should be serialized to string
        processData: true,
        // Whether the browser should be allowed to cache GET responses
        cache: true
    }

    function mimeToDataType(mime) {
        if (mime) {
            mime = mime.split(';', 2)[0];
        }
        return mime && (mime == 'text/html' ? 'html' :
            mime == 'application/json' ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
            xmlTypeRE.test(mime) && 'xml') || 'text';
    }

    function appendQuery(url, query) {
        if (query == '') {
            return url;
        }
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }

    function serialize(params, obj, traditional, scope) {
        var type, array = langx.isArray(obj),
            hash = langx.isPlainObject(obj)
        langx.each(obj, function(key, value) {
            type = langx.type(value);
            if (scope) {
                key = traditional ? scope :
                        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']' ;
            }
            // handle data in serializeArray() format
            if (!scope && array) {
                params.add(value.name, value.value);
            // recurse into nested objects
            } else if (type == "array" || (!traditional && type == "object")) {
                serialize(params, value, traditional, key);
            } else {
                params.add(key, value);
            }
        })
    }    

    function param(obj, traditional) {
        var params = []
        params.add = function(key, value) {
            if (langx.isFunction(value)) {
                value = value();
            }
            if (value == null) {
                value = "";
            }
            this.push(escape(key) + '=' + escape(value));
        }
        
        serialize(params, obj, traditional);

        return params.join('&').replace(/%20/g, '+')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (options.processData && options.data && !langx.isString(options.data)) {
            options.data = $.param(options.data, options.traditional)
        }
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
            options.url = appendQuery(options.url, options.data);
            options.data = undefined;
        }
    }

    function ajaxSuccess(data, xhr, settings, deferred) {
        var context = settings.context,
            status = 'success'
        settings.success.call(context, data, status, xhr)
        //if (deferred) deferred.resolveWith(context, [data, status, xhr])
        //triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings, deferred) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        //if (deferred) deferred.rejectWith(context, [xhr, type, error])
        //triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
        ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        //triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        //ajaxStop(settings)
    }    

    function ajax(options) {
        var settings = langx.mixin({}, options),
            deferred = new Deferred();

        langx.safeMixin(settings,ajaxSettings);

        //ajaxStart(settings)
        if (!settings.crossDomain) {
        //    settings.crossDomain = !langx.isSameOrigin(settings.url);
        }

        serializeData(settings);
        var dataType = settings.dataType;

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = xhr.setRequestHeader,
            abortTimeout;

        //if (deferred) deferred.promise(xhr)

        if (!settings.crossDomain) {
            setHeader('X-Requested-With', 'XMLHttpRequest');
        }
        setHeader('Accept', mime || '*/*')
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
        }

        if (settings.headers) {
            for (name in settings.headers) {
                setHeader(name, settings.headers[name]);
            }    
        }
        xhr.setRequestHeader = setHeader;

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script') {
                            (1, eval)(result);
                        } else if (dataType == 'xml') {
                            result = xhr.responseXML
                        } else if (dataType == 'json') {
                            result = blankRE.test(result) ? null : JSON.parse(result);
                        }
                    } catch (e) { 
                        error = e 
                    }

                    if (error) {
                        ajaxError(error, 'parsererror', xhr, settings, deferred);
                    } else {
                        ajaxSuccess(result, xhr, settings, deferred);
                    }
                } else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred);
                }
            }
        }

        /*
        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            ajaxError(null, 'abort', xhr, settings, deferred)
            return xhr
        }

        if (settings.xhrFields)
            for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]
        */
        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async, settings.username, settings.password)

        for (name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }

        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function() {
                xhr.onreadystatechange = empty;
                xhr.abort();
                ajaxError(null, 'timeout', xhr, settings, deferred);
            }, settings.timeout);
        }

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr;
    }


    function get( /* url, data, success, dataType */ ) {
        return ajax(parseArguments.apply(null, arguments))
    }

    function post( /* url, data, success, dataType */ ) {
        var options = parseArguments.apply(null, arguments);
        options.type = 'POST';
        return ajax(options);
    }

    function getJSON( /* url, data, success */ ) {
        var options = parseArguments.apply(null, arguments);
        options.dataType = 'json';
        return ajax(options);
    }    


    function http(){
      return http;
    }

    langx.mixin(http, {
        ajax: ajax,

        get: get,
        
        gtJSON: getJSON,

        post: post

    });

    return skylark.http = http;
});

define('skylarkjs/http',[
    "skylark-utils/http"
], function(http) {
    return http;
});

define('skylark-utils/images',[
    "./skylark",
    "./langx"
], function(skylark,langx) {

  var elementNodeTypes = {
    1: true,
    9: true,
    11: true
  };

  var ImagesLoaded = langx.Evented.inherit({
  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
    init : function(elem, options, onAlways) {
      // coerce ImagesLoaded() without new, to be new ImagesLoaded()
      if ( !( this instanceof ImagesLoaded ) ) {
        return new ImagesLoaded( elem, options, onAlways );
      }
      // use elem as selector string
      if ( typeof elem == 'string' ) {
        elem = document.querySelectorAll( elem );
      }

      this.elements = langx.makeArray( elem );
      this.options = langx.mixin( {}, this.options );

      if ( typeof options == 'function' ) {
        onAlways = options;
      } else {
        langx.mixin( this.options, options );
      }

      if ( onAlways ) {
        this.on( 'always', onAlways );
      }

      this.getImages();

     // HACK check async to allow time to bind listeners
      setTimeout( function() {
        this.check();
      }.bind( this ));

    },

    options : {},

    getImages : function() {
      this.images = [];

      // filter & find items if we have an item selector
      this.elements.forEach( this.addElementImages, this );
    },

    /**
     * @param {Node} element
     */
    addElementImages : function( elem ) {
      // filter siblings
      if ( elem.nodeName == 'IMG' ) {
        this.addImage( elem );
      }
      // get background image on element
      if ( this.options.background === true ) {
        this.addElementBackgroundImages( elem );
      }

      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
        return;
      }
      var childImgs = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var i=0; i < childImgs.length; i++ ) {
        var img = childImgs[i];
        this.addImage( img );
      }

      // get child background images
      if ( typeof this.options.background == 'string' ) {
        var children = elem.querySelectorAll( this.options.background );
        for ( i=0; i < children.length; i++ ) {
          var child = children[i];
          this.addElementBackgroundImages( child );
        }
      }
    },

    addElementBackgroundImages : function( elem ) {
      var style = getComputedStyle( elem );
      if ( !style ) {
        // Firefox returns null if in a hidden iframe https://bugzil.la/548397
        return;
      }
      // get url inside url("...")
      var reURL = /url\((['"])?(.*?)\1\)/gi;
      var matches = reURL.exec( style.backgroundImage );
      while ( matches !== null ) {
        var url = matches && matches[2];
        if ( url ) {
          this.addBackground( url, elem );
        }
        matches = reURL.exec( style.backgroundImage );
      }
    },

    /**
     * @param {Image} img
     */
    addImage : function( img ) {
      var loadingImage = new LoadingImage( img );
      this.images.push( loadingImage );
    },

    addBackground : function( url, elem ) {
      var background = new Background( url, elem );
      this.images.push( background );
    },

    check : function() {
      var _this = this;
      this.progressedCount = 0;
      this.hasAnyBroken = false;
      // complete if no images
      if ( !this.images.length ) {
        this.complete();
        return;
      }

      function onProgress( e ) {
        // HACK - Chrome triggers event before object properties have changed. #83
        setTimeout( function() {
          _this.progress( e );
        });
      }

      this.images.forEach( function( loadingImage ) {
        loadingImage.one( 'progress', onProgress );
        loadingImage.check();
      });
    },

    progress : function( e ) {

      this.progressedCount++;
      this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded;
      // progress event
      this.trigger( langx.createEvent('progress', {
        img : e.img,
        element : e.element,
        message : e.message,
        isLoaded : e.isLoaded
      }));

      // check if completed
      if ( this.progressedCount == this.images.length ) {
        this.complete();
      }

      if ( this.options.debug && console ) {
        console.log( 'progress: ' + message, e.target, e.element );
      }
    },

    complete : function() {
      var eventName = this.hasAnyBroken ? 'fail' : 'done';
      this.isComplete = true;
      this.trigger( eventName);
      this.trigger( 'always');

    }

  });
 

  // --------------------------  -------------------------- //

  var LoadingImage = langx.Evented.inherit({
    init: function( img ) {
      this.img = img;
    },
    check : function() {
      // If complete is true and browser supports natural sizes,
      // try to check for image status manually.
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        // report based on naturalWidth
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      this.proxyImage = new Image();
      this.proxyImage.addEventListener( 'load', this );
      this.proxyImage.addEventListener( 'error', this );
      // bind to image as well for Firefox. #191
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.proxyImage.src = this.img.src;
    },

    getIsImageComplete : function() {
      return this.img.complete && this.img.naturalWidth !== undefined;
    },

    confirm : function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.trigger( langx.createEvent('progress', {
        img : this.img, 
        element : this.img,
        message : message ,
        isLoaded : isLoaded
      }));
    },

    // ----- events ----- //

    // trigger specified handler for event type
    handleEvent : function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    },

    onload : function() {
      this.confirm( true, 'onload' );
      this.unbindEvents();
    },

    onerror : function() {
      this.confirm( false, 'onerror' );
      this.unbindEvents();
    },

    unbindEvents : function() {
      this.proxyImage.removeEventListener( 'load', this );
      this.proxyImage.removeEventListener( 'error', this );
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    },

  });


  // -------------------------- Background -------------------------- //
  var Background = LoadingImage.inherit({

    init : function( url, element ) {
      this.url = url;
      this.element = element;
      this.img = new Image();
    },

    check : function() {
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.img.src = this.url;
      // check if image is already complete
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        this.unbindEvents();
      }
    },

    unbindEvents : function() {
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    },

    confirm : function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.trigger( langx.createEvent('progress', {
        img : this.img,
        element : this.element, 
        message : message,
        isLoaded : isLoaded 
      }));
    }
  });


    function images() {
        return images;
    }

    langx.mixin(images, {
      loaded : ImagesLoaded
    });

    return skylark.images = images;
});

define('skylarkjs/images',[
    "skylark-utils/images"
], function(images) {
    return images;
});

define('skylark-utils/mover',[
    "./skylark",
    "./langx",
    "./noder",
    "./datax",
    "./geom",
    "./eventer",
    "./styler"
],function(skylark, langx,noder,datax,geom,eventer,styler){
    var on = eventer.on,
        off = eventer.off,
        attr = datax.attr,
        removeAttr = datax.removeAttr,
        offset = geom.pagePosition,
        addClass = styler.addClass,
        height = geom.height,
        some = Array.prototype.some,
        map = Array.prototype.map;

    function _place(/*DomNode*/ node, choices, layoutNode, aroundNodeCoords){
        // summary:
        //      Given a list of spots to put node, put it at the first spot where it fits,
        //      of if it doesn't fit anywhere then the place with the least overflow
        // choices: Array
        //      Array of elements like: {corner: 'TL', pos: {x: 10, y: 20} }
        //      Above example says to put the top-left corner of the node at (10,20)
        // layoutNode: Function(node, aroundNodeCorner, nodeCorner, size)
        //      for things like tooltip, they are displayed differently (and have different dimensions)
        //      based on their orientation relative to the parent.   This adjusts the popup based on orientation.
        //      It also passes in the available size for the popup, which is useful for tooltips to
        //      tell them that their width is limited to a certain amount.   layoutNode() may return a value expressing
        //      how much the popup had to be modified to fit into the available space.   This is used to determine
        //      what the best placement is.
        // aroundNodeCoords: Object
        //      Size of aroundNode, ex: {w: 200, h: 50}

        // get {x: 10, y: 10, w: 100, h:100} type obj representing position of
        // viewport over document

        var doc = noder.ownerDoc(node),
            win = noder.ownerWindow(doc),
            view = geom.size(win);

        view.left = 0;
        view.top = 0;

        if(!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body"){
            doc.body.appendChild(node);
        }

        var best = null;

        some.apply(choices, function(choice){
            var corner = choice.corner;
            var pos = choice.pos;
            var overflow = 0;

            // calculate amount of space available given specified position of node
            var spaceAvailable = {
                w: {
                    'L': view.left + view.width - pos.x,
                    'R': pos.x - view.left,
                    'M': view.width
                }[corner.charAt(1)],

                h: {
                    'T': view.top + view.height - pos.y,
                    'B': pos.y - view.top,
                    'M': view.height
                }[corner.charAt(0)]
            };

            if(layoutNode){
                var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
                overflow = typeof res == "undefined" ? 0 : res;
            }

            var bb = geom.size(node);

            // coordinates and size of node with specified corner placed at pos,
            // and clipped by viewport
            var
                startXpos = {
                    'L': pos.x,
                    'R': pos.x - bb.width,
                    'M': Math.max(view.left, Math.min(view.left + view.width, pos.x + (bb.width >> 1)) - bb.width) // M orientation is more flexible
                }[corner.charAt(1)],

                startYpos = {
                    'T': pos.y,
                    'B': pos.y - bb.height,
                    'M': Math.max(view.top, Math.min(view.top + view.height, pos.y + (bb.height >> 1)) - bb.height)
                }[corner.charAt(0)],

                startX = Math.max(view.left, startXpos),
                startY = Math.max(view.top, startYpos),
                endX = Math.min(view.left + view.width, startXpos + bb.width),
                endY = Math.min(view.top + view.height, startYpos + bb.height),
                width = endX - startX,
                height = endY - startY;

            overflow += (bb.width - width) + (bb.height - height);

            if(best == null || overflow < best.overflow){
                best = {
                    corner: corner,
                    aroundCorner: choice.aroundCorner,
                    left: startX,
                    top: startY,
                    width: width,
                    height: height,
                    overflow: overflow,
                    spaceAvailable: spaceAvailable
                };
            }

            return !overflow;
        });

        // In case the best position is not the last one we checked, need to call
        // layoutNode() again.
        if(best.overflow && layoutNode){
            layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
        }


        geom.boundingPosition(node,best);

        return best;
    }

    function at(node, pos, corners, padding, layoutNode){
        var choices = map.apply(corners, function(corner){
            var c = {
                corner: corner,
                aroundCorner: reverse[corner],  // so TooltipDialog.orient() gets aroundCorner argument set
                pos: {x: pos.x,y: pos.y}
            };
            if(padding){
                c.pos.x += corner.charAt(1) == 'L' ? padding.x : -padding.x;
                c.pos.y += corner.charAt(0) == 'T' ? padding.y : -padding.y;
            }
            return c;
        });

        return _place(node, choices, layoutNode);
    }

    function around(
        /*DomNode*/     node,
        /*DomNode|__Rectangle*/ anchor,
        /*String[]*/    positions,
        /*Boolean*/     leftToRight,
        /*Function?*/   layoutNode){

        // summary:
        //      Position node adjacent or kitty-corner to anchor
        //      such that it's fully visible in viewport.
        // description:
        //      Place node such that corner of node touches a corner of
        //      aroundNode, and that node is fully visible.
        // anchor:
        //      Either a DOMNode or a rectangle (object with x, y, width, height).
        // positions:
        //      Ordered list of positions to try matching up.
        //
        //      - before: places drop down to the left of the anchor node/widget, or to the right in the case
        //          of RTL scripts like Hebrew and Arabic; aligns either the top of the drop down
        //          with the top of the anchor, or the bottom of the drop down with bottom of the anchor.
        //      - after: places drop down to the right of the anchor node/widget, or to the left in the case
        //          of RTL scripts like Hebrew and Arabic; aligns either the top of the drop down
        //          with the top of the anchor, or the bottom of the drop down with bottom of the anchor.
        //      - before-centered: centers drop down to the left of the anchor node/widget, or to the right
        //          in the case of RTL scripts like Hebrew and Arabic
        //      - after-centered: centers drop down to the right of the anchor node/widget, or to the left
        //          in the case of RTL scripts like Hebrew and Arabic
        //      - above-centered: drop down is centered above anchor node
        //      - above: drop down goes above anchor node, left sides aligned
        //      - above-alt: drop down goes above anchor node, right sides aligned
        //      - below-centered: drop down is centered above anchor node
        //      - below: drop down goes below anchor node
        //      - below-alt: drop down goes below anchor node, right sides aligned
        // layoutNode: Function(node, aroundNodeCorner, nodeCorner)
        //      For things like tooltip, they are displayed differently (and have different dimensions)
        //      based on their orientation relative to the parent.   This adjusts the popup based on orientation.
        // leftToRight:
        //      True if widget is LTR, false if widget is RTL.   Affects the behavior of "above" and "below"
        //      positions slightly.
        // example:
        //  |   placeAroundNode(node, aroundNode, {'BL':'TL', 'TR':'BR'});
        //      This will try to position node such that node's top-left corner is at the same position
        //      as the bottom left corner of the aroundNode (ie, put node below
        //      aroundNode, with left edges aligned).   If that fails it will try to put
        //      the bottom-right corner of node where the top right corner of aroundNode is
        //      (ie, put node above aroundNode, with right edges aligned)
        //

        // If around is a DOMNode (or DOMNode id), convert to coordinates.
        var aroundNodePos;
        if(typeof anchor == "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor){
            aroundNodePos = domGeometry.position(anchor, true);

            // For above and below dropdowns, subtract width of border so that popup and aroundNode borders
            // overlap, preventing a double-border effect.  Unfortunately, difficult to measure the border
            // width of either anchor or popup because in both cases the border may be on an inner node.
            if(/^(above|below)/.test(positions[0])){
                var anchorBorder = domGeometry.getBorderExtents(anchor),
                    anchorChildBorder = anchor.firstChild ? domGeometry.getBorderExtents(anchor.firstChild) : {t:0,l:0,b:0,r:0},
                    nodeBorder =  domGeometry.getBorderExtents(node),
                    nodeChildBorder = node.firstChild ? domGeometry.getBorderExtents(node.firstChild) : {t:0,l:0,b:0,r:0};
                aroundNodePos.y += Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t);
                aroundNodePos.h -=  Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t+ nodeChildBorder.t) +
                    Math.min(anchorBorder.b + anchorChildBorder.b, nodeBorder.b + nodeChildBorder.b);
            }
        }else{
            aroundNodePos = anchor;
        }

        // Compute position and size of visible part of anchor (it may be partially hidden by ancestor nodes w/scrollbars)
        if(anchor.parentNode){
            // ignore nodes between position:relative and position:absolute
            var sawPosAbsolute = domStyle.getComputedStyle(anchor).position == "absolute";
            var parent = anchor.parentNode;
            while(parent && parent.nodeType == 1 && parent.nodeName != "BODY"){  //ignoring the body will help performance
                var parentPos = domGeometry.position(parent, true),
                    pcs = domStyle.getComputedStyle(parent);
                if(/relative|absolute/.test(pcs.position)){
                    sawPosAbsolute = false;
                }
                if(!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)){
                    var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
                    var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
                    aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
                    aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
                    aroundNodePos.h = bottomYCoord - aroundNodePos.y;
                    aroundNodePos.w = rightXCoord - aroundNodePos.x;
                }
                if(pcs.position == "absolute"){
                    sawPosAbsolute = true;
                }
                parent = parent.parentNode;
            }
        }           

        var x = aroundNodePos.x,
            y = aroundNodePos.y,
            width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width),
            height = "h" in aroundNodePos ? aroundNodePos.h : (kernel.deprecated("place.around: dijit/place.__Rectangle: { x:"+x+", y:"+y+", height:"+aroundNodePos.height+", width:"+width+" } has been deprecated.  Please use { x:"+x+", y:"+y+", h:"+aroundNodePos.height+", w:"+width+" }", "", "2.0"), aroundNodePos.h = aroundNodePos.height);

        // Convert positions arguments into choices argument for _place()
        var choices = [];
        function push(aroundCorner, corner){
            choices.push({
                aroundCorner: aroundCorner,
                corner: corner,
                pos: {
                    x: {
                        'L': x,
                        'R': x + width,
                        'M': x + (width >> 1)
                    }[aroundCorner.charAt(1)],
                    y: {
                        'T': y,
                        'B': y + height,
                        'M': y + (height >> 1)
                    }[aroundCorner.charAt(0)]
                }
            })
        }
        array.forEach(positions, function(pos){
            var ltr =  leftToRight;
            switch(pos){
                case "above-centered":
                    push("TM", "BM");
                    break;
                case "below-centered":
                    push("BM", "TM");
                    break;
                case "after-centered":
                    ltr = !ltr;
                    // fall through
                case "before-centered":
                    push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
                    break;
                case "after":
                    ltr = !ltr;
                    // fall through
                case "before":
                    push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
                    push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
                    break;
                case "below-alt":
                    ltr = !ltr;
                    // fall through
                case "below":
                    // first try to align left borders, next try to align right borders (or reverse for RTL mode)
                    push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
                    push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
                    break;
                case "above-alt":
                    ltr = !ltr;
                    // fall through
                case "above":
                    // first try to align left borders, next try to align right borders (or reverse for RTL mode)
                    push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
                    push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
                    break;
                default:
                    // To assist dijit/_base/place, accept arguments of type {aroundCorner: "BL", corner: "TL"}.
                    // Not meant to be used directly.  Remove for 2.0.
                    push(pos.aroundCorner, pos.corner);
            }
        });

        var position = _place(node, choices, layoutNode, {w: width, h: height});
        position.aroundNodePos = aroundNodePos;

        return position;
    }

    function movable(elm, params) {
        function updateWithTouchData(e) {
            var keys, i;

            if (e.changedTouches) {
                keys = "screenX screenY pageX pageY clientX clientY".split(' ');
                for (i = 0; i < keys.length; i++) {
                    e[keys[i]] = e.changedTouches[0][keys[i]];
                }
            }
        }

        params = params || {};
        var handleEl = params.handle || elm,
            constraints = params.constraints,
            overlayDiv,
            doc = params.document || document,
            downButton,
            start,
            stop,
            drag,
            startX,
            startY,
            originalPos,
            size,
            startedCallback = params.started,
            movingCallback = params.moving,
            stoppedCallback = params.stopped,

            start = function(e) {
                var docSize = geom.getDocumentSize(doc),
                    cursor;

                updateWithTouchData(e);

                e.preventDefault();
                downButton = e.button;
                //handleEl = getHandleEl();
                startX = e.screenX;
                startY = e.screenY;

                originalPos = geom.relativePosition(elm);
                size = geom.size(elm);

                // Grab cursor from handle so we can place it on overlay
                cursor = styler.css(handleEl, "curosr");

                overlayDiv = noder.createElement("div");
                styler.css(overlayDiv, {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: docSize.width,
                    height: docSize.height,
                    zIndex: 0x7FFFFFFF,
                    opacity: 0.0001,
                    cursor: cursor
                });
                noder.append(doc.body, overlayDiv);

                eventer.on(doc, "mousemove touchmove", move).on(doc, "mouseup touchend", stop);

                if (startedCallback) {
                    startedCallback(e);
                }
            },

            move = function(e) {
                updateWithTouchData(e);

                if (e.button !== 0) {
                    return stop(e);
                }

                e.deltaX = e.screenX - startX;
                e.deltaY = e.screenY - startY;

                var l = originalPos.left + e.deltaX,
                    t = originalPos.top + e.deltaY;
                if (constraints) {

                    if (l < constraints.minX) {
                        l = constraints.minX;
                    }

                    if (l > constraints.maxX) {
                        l = constraints.maxX;
                    }

                    if (t < constraints.minY) {
                        t = constraints.minY;
                    }

                    if (t > constraints.maxY) {
                        t = constraints.maxY;
                    }
                }
                geom.relativePosition(elm, {
                    left: l,
                    top: t
                })

                e.preventDefault();
                if (movingCallback) {
                    movingCallback(e);
                }
            },

            stop = function(e) {
                updateWithTouchData(e);

                eventer.off(doc, "mousemove touchmove", move).off(doc, "mouseup touchend", stop);

                noder.remove(overlayDiv);

                if (stoppedCallback) {
                    stoppedCallback(e);
                }
            };

        eventer.on(handleEl, "mousedown touchstart", start);

        return {
            // destroys the dragger.
            remove: function() {
                eventer.off(handleEl);
            }
        }
    }

    function mover(){
      return mover;
    }

    langx.mixin(mover, {
        around : around,

        at: at, 

        movable: movable

    });

    return skylark.mover = mover;
});

define('skylarkjs/mover',[
    "skylark-utils/mover"
], function(mover) {
    return mover;
});

define('skylarkjs/noder',[
    "skylark-utils/noder"
], function(noder) {
    return noder;
});

define('skylark-utils/query',[
    "./skylark",
    "./langx",
    "./noder",
    "./datax",
    "./eventer",
    "./finder",
    "./geom",
    "./styler",
    "./fx"
], function(skylark, langx, noder, datax, eventer, finder, geom, styler, fx) {
    var some = Array.prototype.some,
        push = Array.prototype.push,
        every = Array.prototype.every,
        concat = Array.prototype.concat,
        slice = Array.prototype.slice,
        map = Array.prototype.map,
        filter = Array.prototype.filter,
        forEach = Array.prototype.forEach,
        isQ;

    var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

    var funcArg = langx.funcArg,
        isArrayLike = langx.isArrayLike,
        isString = langx.isString,
        uniq = langx.uniq,
        isFunction = langx.isFunction;

    var type = langx.type,
        isArray = langx.isArray,

        isWindow = langx.isWindow,

        isDocument = langx.isDocument,

        isObject = langx.isObject,

        isPlainObject = langx.isPlainObject,

        compact = langx.compact,

        flatten = langx.flatten,

        camelCase = langx.camelCase,

        dasherize = langx.dasherize,
        children = finder.children;

    function wrapper_map(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            var result = $.map(self, function(elem, idx) {
                return func.apply(context, [elem].concat(params));
            });
            return $(uniq(result));
        }
    }

    function wrapper_selector(func, context, last) {
        return function(selector) {
            var self = this,
                params = slice.call(arguments);
            var result = this.map(function(idx, elem) {
                // if (elem.nodeType == 1) {
                if (elem.querySelector) {
                    return func.apply(context, last ? [elem] : [elem, selector]);
                }
            });
            if (last && selector) {
                return result.filter(selector);
            } else {
                return result;
            }
        }
    }

    function wrapper_selector_until(func, context, last) {
        return function(util, selector) {
            var self = this,
                params = slice.call(arguments);
            if (selector === undefined) {
                selector = util;
                util = undefined;
            }
            var result = this.map(function(idx, elem) {
                // if (elem.nodeType == 1) {
                if (elem.querySelector) {
                    return func.apply(context, last ? [elem, util] : [elem, selector, util]);
                }
            });
            if (last && selector) {
                return result.filter(selector);
            } else {
                return result;
            }
        }
    }


    function wrapper_every_act(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            this.each(function(idx) {
                func.apply(context, [this].concat(params));
            });
            return self;
        }
    }

    function wrapper_every_act_firstArgFunc(func, context, oldValueFunc) {
        return function(arg1) {
            var self = this,
                params = slice.call(arguments);
            forEach.call(self, function(elem, idx) {
                var newArg1 = funcArg(elem, arg1, idx, oldValueFunc(elem));
                func.apply(context, [elem, arg1].concat(params.slice(1)));
            });
            return self;
        }
    }

    function wrapper_some_chk(func, context) {
        return function() {
            var self = this,
                params = slice.call(arguments);
            return some.call(self, function(elem) {
                return func.apply(context, [elem].concat(params));
            });
        }
    }

    function wrapper_name_value(func, context, oldValueFunc) {
        return function(name, value) {
            var self = this,
                params = slice.call(arguments);

            if (langx.isPlainObject(name) || langx.isDefined(value)) {
                forEach.call(self, function(elem, idx) {
                    var newValue;
                    if (oldValueFunc) {
                        newValue = funcArg(elem, value, idx, oldValueFunc(elem, name));
                    } else {
                        newValue = value
                    }
                    func.apply(context, [elem].concat(params));
                });
                return self;
            } else {
                if (self[0]) {
                    return func.apply(context, [self[0], name]);
                }
            }

        }
    }

    function wrapper_value(func, context, oldValueFunc) {
        return function(value) {
            var self = this;

            if (langx.isDefined(value)) {
                forEach.call(self, function(elem, idx) {
                    var newValue;
                    if (oldValueFunc) {
                        newValue = funcArg(elem, value, idx, oldValueFunc(elem));
                    } else {
                        newValue = value
                    }
                    func.apply(context, [elem, newValue]);
                });
                return self;
            } else {
                if (self[0]) {
                    return func.apply(context, [self[0]]);
                }
            }

        }
    }

    var NodeList = langx.klass({
        klassName: "SkNodeList",
        init: function(selector, context) {
            var self = this,
                match, nodes, node, props;

            if (selector) {
                self.context = context = context || noder.doc();

                if (isString(selector)) {
                    // a html string or a css selector is expected
                    self.selector = selector;

                    if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                        match = [null, selector, null];
                    } else {
                        match = rquickExpr.exec(selector);
                    }

                    if (match) {
                        if (match[1]) {
                            // if selector is html
                            nodes = noder.createFragment(selector);

                            if (langx.isPlainObject(context)) {
                                props = context;
                            }

                        } else {
                            node = finder.byId(match[2], noder.ownerDoc(context));

                            if (node) {
                                // if selector is id
                                nodes = [node];
                            }

                        }
                    } else {
                        // if selector is css selector
                        nodes = finder.descendants(context, selector);
                    }
                } else {
                    if (isArray(selector)) {
                        // a dom node array is expected
                        nodes = selector;
                    } else {
                        // a dom node is expected
                        nodes = [selector];
                    }
                    //self.add(selector, false);
                }
            }


            if (nodes) {

                push.apply(self, nodes);

                if (props) {
                    for ( var name  in props ) {
                        // Properties of context are called as methods if possible
                        if ( langx.isFunction( this[ name ] ) ) {
                            this[ name ]( props[ name ] );
                        } else {
                            this.attr( name, props[ name ] );
                        }
                    }
                }
            }

            return self;
        }
    }, Array);

    var query = (function() {
        isQ = function(object) {
            return object instanceof NodeList;
        }
        init = function(selector, context) {
            return new NodeList(selector, context);
        }

        var $ = function(selector, context) {
            if (isFunction(selector)) {
                eventer.ready(function() {
                    selector($);
                });
            } else if (isQ(selector)) {
                return selector;
            } else {
                if (context && isQ(context) && isString(selector)) {
                    return context.find(selector);
                }
                return init(selector, context);
            }
        };

        $.fn = NodeList.prototype;
        langx.mixin($.fn, {
            // `map` and `slice` in the jQuery API work differently
            // from their array counterparts

            map: function(fn) {
                return $(uniq(langx.map(this, function(el, i) {
                    return fn.call(el, i, el)
                })));
            },

            slice: function() {
                return $(slice.apply(this, arguments))
            },

            get: function(idx) {
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },

            toArray: function() {
                return slice.call(this);
            },

            size: function() {
                return this.length
            },

            remove: wrapper_every_act(noder.remove, noder),

            each: function(callback) {
                langx.each(this, callback);
                return this;
            },

            filter: function(selector) {
                if (isFunction(selector)) return this.not(this.not(selector))
                return $(filter.call(this, function(element) {
                    return finder.matches(element, selector)
                }))
            },

            add: function(selector, context) {
                return $(uniq(this.toArray().concat($(selector, context).toArray())));
            },

            is: function(selector) {
                return this.length > 0 && finder.matches(this[0], selector)
            },

            not: function(selector) {
                var nodes = []
                if (isFunction(selector) && selector.call !== undefined)
                    this.each(function(idx) {
                        if (!selector.call(this, idx)) nodes.push(this)
                    })
                else {
                    var excludes = typeof selector == 'string' ? this.filter(selector) :
                        (isArrayLike(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                    this.forEach(function(el) {
                        if (excludes.indexOf(el) < 0) nodes.push(el)
                    })
                }
                return $(nodes)
            },

            has: function(selector) {
                return this.filter(function() {
                    return isObject(selector) ?
                        noder.contains(this, selector) :
                        $(this).find(selector).size()
                })
            },

            eq: function(idx) {
                return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
            },

            first: function() {
                return this.eq(0);
            },

            last: function() {
                return this.eq(-1);
            },

            find: wrapper_selector(finder.descendants, finder),

            closest: wrapper_selector(finder.closest, finder),
            /*
                        closest: function(selector, context) {
                            var node = this[0],
                                collection = false
                            if (typeof selector == 'object') collection = $(selector)
                            while (node && !(collection ? collection.indexOf(node) >= 0 : finder.matches(node, selector)))
                                node = node !== context && !isDocument(node) && node.parentNode
                            return $(node)
                        },
            */


            parents: wrapper_selector(finder.ancestors, finder),

            parentsUntil: wrapper_selector_until(finder.ancestors, finder),


            parent: wrapper_selector(finder.parent, finder),

            children: wrapper_selector(finder.children, finder),

            contents: wrapper_map(noder.contents, noder),

            empty: wrapper_every_act(noder.empty, noder),

            // `pluck` is borrowed from Prototype.js
            pluck: function(property) {
                return langx.map(this, function(el) {
                    return el[property]
                })
            },

            show: wrapper_every_act(fx.show, fx),

            replaceWith: function(newContent) {
                return this.before(newContent).remove();
            },

            wrap: function(structure) {
                var func = isFunction(structure)
                if (this[0] && !func)
                    var dom = $(structure).get(0),
                        clone = dom.parentNode || this.length > 1

                return this.each(function(index) {
                    $(this).wrapAll(
                        func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                    )
                })
            },

            wrapAll: function(wrappingElement) {
                if (this[0]) {
                    $(this[0]).before(wrappingElement = $(wrappingElement));
                    var children;
                    // drill down to the inmost element
                    while ((children = wrappingElement.children()).length) {
                        wrappingElement = children.first();
                    }
                    $(wrappingElement).append(this);
                }
                return this
            },

            wrapInner: function(wrappingElement) {
                var func = isFunction(wrappingElement)
                return this.each(function(index) {
                    var self = $(this),
                        contents = self.contents(),
                        dom = func ? wrappingElement.call(this, index) : wrappingElement
                    contents.length ? contents.wrapAll(dom) : self.append(dom)
                })
            },

            unwrap: function(selector) {
                if (this.parent().children().length === 0) {
                    // remove dom without text
                    this.parent(selector).not("body").each(function() {
                        $(this).replaceWith(document.createTextNode(this.childNodes[0].textContent));
                    });
                } else {
                    this.parent().each(function() {
                        $(this).replaceWith($(this).children())
                    });
                }
                return this
            },

            clone: function() {
                return this.map(function() {
                    return this.cloneNode(true)
                })
            },

            hide: wrapper_every_act(fx.hide, fx),

            toggle: function(setting) {
                return this.each(function() {
                    var el = $(this);
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide()
                })
            },

            prev: function(selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*')
            },

            prevAll: wrapper_selector(finder.previousSibling, finder),

            next: function(selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*')
            },

            nextAll: wrapper_selector(finder.nextSiblings, finder),

            siblings: wrapper_selector(finder.siblings, finder),

            html: wrapper_value(noder.html, noder, noder.html),

            text: wrapper_value(datax.text, datax, datax.text),

            attr: wrapper_name_value(datax.attr, datax, datax.attr),

            removeAttr: wrapper_every_act(datax.removeAttr, datax),

            prop: wrapper_name_value(datax.prop, datax, datax.prop),

            removeProp: wrapper_every_act(datax.removeProp, datax),

            data: wrapper_name_value(datax.data, datax, datax.data),

            removeData: wrapper_every_act(datax.removeData, datax),

            val: wrapper_value(datax.val, datax, datax.val),

            offset: wrapper_value(geom.pageRect, geom, geom.pageRect),

            style: wrapper_name_value(styler.css, styler),

            css: wrapper_name_value(styler.css, styler),

            index: function(elem) {
                if (elem) {
                    return this.indexOf($(elem)[0]);
                } else {
                    return this.parent().children().indexOf(this[0]);
                }
            },

            //hasClass(name)
            hasClass: wrapper_some_chk(styler.hasClass, styler),

            //addClass(name)
            addClass: wrapper_every_act_firstArgFunc(styler.addClass, styler, styler.className),

            //removeClass(name)
            removeClass: wrapper_every_act_firstArgFunc(styler.removeClass, styler, styler.className),

            //toogleClass(name,when)
            toggleClass: wrapper_every_act_firstArgFunc(styler.toggleClass, styler, styler.className),

            scrollTop: wrapper_value(geom.scrollTop, geom),

            scrollLeft: wrapper_value(geom.scrollLeft, geom),

            position: function() {
                if (!this.length) return

                var elem = this[0];

                return geom.relativePosition(elem);
            },

            offsetParent: wrapper_map(geom.offsetParent, geom),
        });

        // for now
        $.fn.detach = $.fn.remove;


        $.fn.size = wrapper_value(geom.size, geom);

        $.fn.width = wrapper_value(geom.width, geom, geom.width);

        $.fn.height = wrapper_value(geom.height, geom, geom.height);

        ['width', 'height'].forEach(function(dimension) {
            var offset, Dimension = dimension.replace(/./, function(m) {
                return m[0].toUpperCase()
            });

            $.fn['outer' + Dimension] = function(margin, value) {
                if (arguments.length) {
                    if (typeof margin !== 'boolean') {
                        value = margin;
                        margin = false;
                    }
                } else {
                    margin = false;
                    value = undefined;
                }

                if (value === undefined) {
                    var el = this[0];
                    if (!el) {
                        return undefined;
                    }
                    var cb = geom.size(el);
                    if (margin) {
                        var me = geom.marginExtents(el);
                        cb.width = cb.width + me.left + me.right;
                        cb.height = cb.height + me.top + me.bottom;
                    }
                    return dimension === "width" ? cb.width : cb.height;
                } else {
                    return this.each(function(idx, el) {
                        var mb = {};
                        var me = geom.marginExtents(el);
                        if (dimension === "width") {
                            mb.width = value;
                            if (margin) {
                                mb.width = mb.width - me.left - me.right
                            }
                        } else {
                            mb.height = value;
                            if (margin) {
                                mb.height = mb.height - me.top - me.bottom;
                            }
                        }
                        geom.size(el, mb);
                    })

                }
            };
        })

        $.fn.innerWidth = wrapper_value(geom.width, geom, geom.width);

        $.fn.innerHeight = wrapper_value(geom.height, geom, geom.height);


        var traverseNode = noder.traverse;

        function wrapper_node_operation(func, context, oldValueFunc) {
            return function(html) {
                var argType, nodes = langx.map(arguments, function(arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ?
                        arg : noder.createFragment(arg)
                });
                if (nodes.length < 1) {
                    return this
                }
                this.each(function(idx) {
                    func.apply(context, [this, nodes, idx > 0]);
                });
                return this;
            }
        }


        $.fn.after = wrapper_node_operation(noder.after, noder);

        $.fn.prepend = wrapper_node_operation(noder.prepend, noder);

        $.fn.before = wrapper_node_operation(noder.before, noder);

        $.fn.append = wrapper_node_operation(noder.append, noder);

        $.fn.insertAfter = function(html) {
            $(html).after(this);
            return this;
        };

        $.fn.insertBefore = function(html) {
            $(html).before(this);
            return this;
        };

        $.fn.appendTo = function(html) {
            $(html).append(this);
            return this;
        };

        $.fn.prependTo = function(html) {
            $(html).prepend(this);
            return this;
        };

        return $
    })();

    (function($) {
        $.fn.on = wrapper_every_act(eventer.on, eventer);

        $.fn.off = wrapper_every_act(eventer.off, eventer);

        $.fn.trigger = wrapper_every_act(eventer.trigger, eventer);


        ('focusin focusout focus blur load resize scroll unload click dblclick ' +
            'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
            'change select keydown keypress keyup error').split(' ').forEach(function(event) {
            $.fn[event] = function(data, callback) {
                return (0 in arguments) ?
                    this.on(event, data, callback) :
                    this.trigger(event)
            }
        });


        $.fn.one = function(event, selector, data, callback) {
            if (!langx.isString(selector) && !langx.isFunction(callback)) {
                callback = data;
                data = selector;
                selector = null;
            }

            if (langx.isFunction(data)) {
                callback = data;
                data = null;
            }

            return this.on(event, selector, data, callback, 1)
        };

        $.fn.animate = wrapper_every_act(fx.animate, fx);

        $.fn.show = wrapper_every_act(fx.show, fx);
        $.fn.hide = wrapper_every_act(fx.hide, fx);
        $.fn.toogle = wrapper_every_act(fx.toogle, fx);
        $.fn.fadeTo = wrapper_every_act(fx.fadeTo, fx);
        $.fn.fadeIn = wrapper_every_act(fx.fadeIn, fx);
        $.fn.fadeOut = wrapper_every_act(fx.fadeOut, fx);
        $.fn.fadeToggle = wrapper_every_act(fx.fadeToggle, fx);

        $.fn.slideDown = wrapper_every_act(fx.slideDown, fx);
        $.fn.slideToggle = wrapper_every_act(fx.slideToggle, fx);
        $.fn.slideUp = wrapper_every_act(fx.slideUp, fx);
    })(query);


    (function($) {
        $.fn.end = function() {
            return this.prevObject || $()
        }

        $.fn.andSelf = function() {
            return this.add(this.prevObject || $())
        }

        $.fn.addBack = function(selector) {
            if (this.prevObject) {
                if (selector) {
                    return this.add(this.prevObject.filter(selector));
                } else {
                    return this.add(this.prevObject);
                }
            } else {
                return this;
            }
        }

        'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property) {
            var fn = $.fn[property]
            $.fn[property] = function() {
                var ret = fn.apply(this, arguments)
                ret.prevObject = this
                return ret
            }
        })
    })(query);


    (function($) {
        $.fn.query = $.fn.find;

        $.fn.place = function(refNode, position) {
            // summary:
            //      places elements of this node list relative to the first element matched
            //      by queryOrNode. Returns the original NodeList. See: `dojo/dom-construct.place`
            // queryOrNode:
            //      may be a string representing any valid CSS3 selector or a DOM node.
            //      In the selector case, only the first matching element will be used
            //      for relative positioning.
            // position:
            //      can be one of:
            //
            //      -   "last" (default)
            //      -   "first"
            //      -   "before"
            //      -   "after"
            //      -   "only"
            //      -   "replace"
            //
            //      or an offset in the childNodes
            if (langx.isString(refNode)) {
                refNode = finder.descendant(refNode);
            } else if (isQ(refNode)) {
                refNode = refNode[0];
            }
            return this.each(function(i, node) {
                switch (position) {
                    case "before":
                        noder.before(refNode, node);
                        break;
                    case "after":
                        noder.after(refNode, node);
                        break;
                    case "replace":
                        noder.replace(refNode, node);
                        break;
                    case "only":
                        noder.empty(refNode);
                        noder.append(refNode, node);
                        break;
                    case "first":
                        noder.prepend(refNode, node);
                        break;
                        // else fallthrough...
                    default: // aka: last
                        noder.append(refNode, node);
                }
            });
        };

        $.fn.addContent = function(content, position) {
            if (content.template) {
                content = langx.substitute(content.template, content);
            }
            return this.append(content);
        };

        $.fn.replaceClass = function(newClass, oldClass) {
            this.removeClass(oldClass);
            this.addClass(newClass);
            return this;
        };

    })(query);


    return skylark.query = query;
});
define('skylarkjs/query',[
    "skylark-utils/query"
], function(query) {
    return query;
});

define('skylark-utils/scripter',[
    "./skylark",
    "./langx",
    "./noder",
    "./finder"
], function(skylark, langx, noder, finder) {

    var head = document.getElementsByTagName('head')[0],
        scriptsByUrl = {},
        scriptElementsById = {},
        count = 0;

    function scripter() {
        return scripter;
    }

    langx.mixin(scripter, {

        loadJavaScript: function(url, loadedCallback, errorCallback) {
            var script = scriptsByUrl[url];
            if (!script) {
                script = scriptsByUrl[url] = {
                    state: 0, //0:unload,1:loaded,-1:loaderror
                    loadedCallbacks: [],
                    errorCallbacks: []
                }
            }

            script.loadedCallbacks.push(loadedCallback);
            script.errorCallbacks.push(errorCallback);

            if (script.state === 1) {
                script.node.onload();
            } else if (script.state === -1) {
                script.node.onerror();
            } else {
                var node = script.node = document.createElement("script"),
                    id = script.id = (count++);

                node.type = "text/javascript";
                node.async = false;
                node.defer = false;
                startTime = new Date().getTime();
                head.appendChild(node);

                node.onload = function() {
                        script.state = 1;

                        var callbacks = script.loadedCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    },
                    node.onerror = function() {
                        script.state = -1;
                        var callbacks = script.errorCallbacks,
                            i = callbacks.length;

                        while (i--) {
                            callbacks[i]();
                        }
                        script.loadedCallbacks = [];
                        script.errorCallbacks = [];
                    };
                node.src = url;

                scriptElementsById[id] = node;
            }
            return script.id;
        },

        deleteJavaScript: function(id) {
            var node = scriptElementsById[id];
            if (node) {
                var url = node.src;
                noder.remove(node);
                delete scriptElementsById[id];
                delete scriptsByUrl[url];
            }
        }
    });

    return skylark.scripter = scripter;
});

define('skylarkjs/scripter',[
    "skylark-utils/scripter"
], function(scripter) {
    return scripter;
});

define('skylarkjs/styler',[
    "skylark-utils/styler"
], function(styler) {
    return styler;
});

define('skylark-utils/velm',[
    "./skylark",
    "./langx",
    "./datax",
    "./dnd",
    "./eventer",
    "./filer",
    "./finder",
    "./fx",
    "./geom",
    "./mover",
    "./noder",
    "./styler"
], function(skylark, langx, datax, dnd, eventer, filer, finder, fx, geom, mover, noder, styler) {
    var map = Array.prototype.map,
        slice = Array.prototype.slice;

    var VisualElement = langx.klass({
        klassName: "VisualElement",

        "init": function(node) {
            if (langx.isString(node)) {
                node = document.getElementById(node);
            }
            this.domNode = node;
        }
    });

    var root = new VisualElement(document.body),
        velm = function(node) {
            if (node) {
                return new VisualElement(node);
            } else {
                return root;
            }
        };

    function _delegator(fn, context) {
        return function() {
            var self = this,
                elem = self.domNode,
                ret = fn.apply(context, [elem].concat(slice.call(arguments)));

            if (ret) {
                if (ret === context) {
                    return self;
                } else {
                    if (ret instanceof HTMLElement) {
                        ret = new VisualElement(ret);
                    } else if (langx.isArrayLike(ret)) {
                        ret = map.call(ret, function(el) {
                            if (el instanceof HTMLElement) {
                                return new VisualElement(ret);
                            } else {
                                return el;
                            }
                        })
                    }
                }
            }
            return ret;
        };
    }

    langx.mixin(velm, {
        batch: function(nodes, action, args) {
            nodes.forEach(function(node) {
                var elm = (node instanceof VisualElement) ? node : velm(node);
                elm[action].apply(elm, args);
            });

            return this;
        },

        root: new VisualElement(document.body),

        VisualElement: VisualElement,

        partial : function(name,fn) {
            var props = {};

            props[name] = fn;

            VisualElement.partial(props);
        },

        delegate: function(names, context) {
            var props = {};

            names.forEach(function(name) {
                props[name] = _delegator(context[name], context);
            });

            VisualElement.partial(props);
        }
    });

    // from ./datax
    velm.delegate([
        "attr",
        "data",
        "prop",
        "removeAttr",
        "removeData",
        "text",
        "val"
    ], datax);

    // from ./dnd
    velm.delegate([
        "draggable",
        "droppable"
    ], dnd);


    // from ./eventer
    velm.delegate([
        "off",
        "on",
        "one",
        "shortcuts",
        "trigger"
    ], eventer);

    // from ./filer
    velm.delegate([
        "picker",
        "dropzone"
    ], filer);

    // from ./finder
    velm.delegate([
        "ancestor",
        "ancestors",
        "children",
        "descendant",
        "find",
        "findAll",
        "firstChild",
        "lastChild",
        "matches",
        "nextSibling",
        "nextSiblings",
        "parent",
        "previousSibling",
        "previousSiblings",
        "siblings"
    ], finder);

    velm.find = function(selector) {
        if (selector === "body") {
            return this.root;
        } else {
            return this.root.descendant(selector);
        }
    };

    // from ./fx
    velm.delegate([
        "animate",
        "fadeIn",
        "fadeOut",
        "fadeTo",
        "fadeToggle",
        "hide",
        "scrollToTop",
        "show",
        "toggle"
    ], fx);


    // from ./geom
    velm.delegate([
        "borderExtents",
        "boundingPosition",
        "boundingRect",
        "clientHeight",
        "clientSize",
        "clientWidth",
        "contentRect",
        "height",
        "marginExtents",
        "offsetParent",
        "paddingExtents",
        "pagePosition",
        "pageRect",
        "relativePosition",
        "relativeRect",
        "scrollIntoView",
        "scrollLeft",
        "scrollTop",
        "size",
        "width"
    ], geom);

    // from ./mover
    velm.delegate([
        "movable"
    ], dnd);


    // from ./noder
    velm.delegate([
        "after",
        "append",
        "before",
        "clone",
        "contains",
        "contents",
        "empty",
        "html",
        "isChildOf",
        "ownerDoc",
        "prepend",
        "remove",
        "replace",
        "reverse",
        "throb",
        "traverse",
        "wrapper",
        "wrapperInner",
        "unwrap"
    ], noder);

    // from ./styler
    velm.delegate([
        "addClass",
        "className",
        "css",
        "hasClass",
        "hide",
        "isInvisible",
        "removeClass",
        "show",
        "toggleClass"
    ], styler);
    
    return skylark.velm = velm;
});

define('skylarkjs/velm',[
    "skylark-utils/velm"
], function(velm) {
    return velm;
});

define('skylark-utils/widget',[
    "./skylark",
    "./langx",
    "./noder",
    "./styler",
    "./geom",
    "./eventer",
    "./query"
], function(skylark,langx,noder,styler,geom,eventer,query) {
  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    function widget() {
        return widget;
    }

	var Widget = langx.Evented.inherit({
        init :function(el,options) {
            if (!langx.isHtmlNode(el)) {
                options = el;
                el = null;
            }
            this.el = el;
            if (options) {
                langx.mixin(this,options);
            }
            if (!this.cid) {
                this.cid = langx.uniqueId('w');
            }
            this._ensureElement();
        },

	    // The default `tagName` of a View's element is `"div"`.
	    tagName: 'div',

	    // jQuery delegate for element lookup, scoped to DOM elements within the
	    // current view. This should be preferred to global lookups where possible.
	    $: function(selector) {
	      return this.$el.find(selector);
	    },

	    // **render** is the core function that your view should override, in order
	    // to populate its element (`this.el`), with the appropriate HTML. The
	    // convention is for **render** to always return `this`.
	    render: function() {
	      return this;
	    },

	    // Remove this view by taking the element out of the DOM, and removing any
	    // applicable Backbone.Events listeners.
	    remove: function() {
	      this._removeElement();
	      this.unlistenTo();
	      return this;
	    },

	    // Remove this view's element from the document and all event listeners
	    // attached to it. Exposed for subclasses using an alternative DOM
	    // manipulation API.
	    _removeElement: function() {
	      this.$el.remove();
	    },

	    // Change the view's element (`this.el` property) and re-delegate the
	    // view's events on the new element.
	    setElement: function(element) {
	      this.undelegateEvents();
	      this._setElement(element);
	      this.delegateEvents();
	      return this;
	    },

	    // Creates the `this.el` and `this.$el` references for this view using the
	    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
	    // context or an element. Subclasses can override this to utilize an
	    // alternative DOM manipulation API and are only required to set the
	    // `this.el` property.
	    _setElement: function(el) {
	      this.$el = widget.$(el);
	      this.el = this.$el[0];
	    },

	    // Set callbacks, where `this.events` is a hash of
	    //
	    // *{"event selector": "callback"}*
	    //
	    //     {
	    //       'mousedown .title':  'edit',
	    //       'click .button':     'save',
	    //       'click .open':       function(e) { ... }
	    //     }
	    //
	    // pairs. Callbacks will be bound to the view, with `this` set properly.
	    // Uses event delegation for efficiency.
	    // Omitting the selector binds the event to `this.el`.
	    delegateEvents: function(events) {
	      events || (events = langx.result(this, 'events'));
	      if (!events) return this;
	      this.undelegateEvents();
	      for (var key in events) {
	        var method = events[key];
	        if (!langx.isFunction(method)) method = this[method];
	        if (!method) continue;
	        var match = key.match(delegateEventSplitter);
	        this.delegate(match[1], match[2], langx.proxy(method, this));
	      }
	      return this;
	    },

	    // Add a single event listener to the view's element (or a child element
	    // using `selector`). This only works for delegate-able events: not `focus`,
	    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
	    delegate: function(eventName, selector, listener) {
	      this.$el.on(eventName + '.delegateEvents' + this.uid, selector, listener);
	      return this;
	    },

	    // Clears all callbacks previously bound to the view by `delegateEvents`.
	    // You usually don't need to use this, but may wish to if you have multiple
	    // Backbone views attached to the same DOM element.
	    undelegateEvents: function() {
	      if (this.$el) this.$el.off('.delegateEvents' + this.uid);
	      return this;
	    },

	    // A finer-grained `undelegateEvents` for removing a single delegated event.
	    // `selector` and `listener` are both optional.
	    undelegate: function(eventName, selector, listener) {
	      this.$el.off(eventName + '.delegateEvents' + this.uid, selector, listener);
	      return this;
	    },

	    // Produces a DOM element to be assigned to your view. Exposed for
	    // subclasses using an alternative DOM manipulation API.
	    _createElement: function(tagName,attrs) {
	      return noder.createElement(tagName,attrs);
	    },

	    // Ensure that the View has a DOM element to render into.
	    // If `this.el` is a string, pass it through `$()`, take the first
	    // matching element, and re-assign it to `el`. Otherwise, create
	    // an element from the `id`, `className` and `tagName` properties.
	    _ensureElement: function() {
	      if (!this.el) {
	        var attrs = langx.mixin({}, langx.result(this, 'attributes'));
	        if (this.id) attrs.id = langx.result(this, 'id');
	        if (this.className) attrs['class'] = langx.result(this, 'className');
	        this.setElement(this._createElement(langx.result(this, 'tagName'),attrs));
	        this._setAttributes(attrs);
	      } else {
	        this.setElement(langx.result(this, 'el'));
	      }
	    },

	    // Set attributes from a hash on this view's element.  Exposed for
	    // subclasses using an alternative DOM manipulation API.
	    _setAttributes: function(attributes) {
	      this.$el.attr(attributes);
	    }
  	});


    langx.mixin(widget, {
    	$ : query,

    	Widget : Widget
    });


    return skylark.widget = widget;
});

define('skylarkjs/widget',[
    "skylark-utils/widget"
], function(widget) {
    return widget;
});

define('skylarkjs/main',[
    "./core",
    "./browser",
    "./css",
    "./datax",
    "./dnd",
    "./eventer",
    "./filer",
    "./finder",
    "./fx",
    "./geom",
    "./http",
    "./images",
    "./mover",
    "./noder",
    "./query",
    "./scripter",
    "./styler",
    "./velm",
    "./widget"
], function(skylark) {
    return skylark;
})
;
define('skylarkjs', ['skylarkjs/main'], function (main) { return main; });


},this);
