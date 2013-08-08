/**
* @author xiaojue[designsor@gmail.com]
* @fileoverview lithe main file
* @version 0.1.8
*/
(function(global, undef) {

	var isBrowser = !! (typeof window !== undef && global.navigator && global.document);
	if (isBrowser) {
		var NAMESPACE = {};
		var doc = global.document,
		loc = global.location,
		noop = function() {},
		Arr = Array.prototype,
		Obj = Object,
		ALIAS,
		TIMESTAMP,
		CHARSET = 'utf-8',
		toString = Obj.prototype.toString,
		header = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
		UA = navigator.userAgent,
		scripts = doc.getElementsByTagName('script'),
		currentLoadedScript = scripts[scripts.length - 1],
		attr = function(node, ns) {
			return node.getAttribute(ns);
		},
		BASEPATH = attr(currentLoadedScript, 'data-path') || currentLoadedScript.src || attr(currentLoadedScript, 'src'),
		CONFIG = attr(currentLoadedScript, 'data-config'),
		DEBUG = attr(currentLoadedScript, 'data-debug') === 'true',
		mainjs = attr(currentLoadedScript, 'data-main'),
		baseElement = header.getElementsByTagName('base')[0],
		commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
		jsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
		fetching = {},
		callbacks = {},
		fetched = {},
		circularStack = [],
		anonymouse = [],
		currentlyAddingScript,
		interactiveScript,
		_cgs = [],
		stack = {},
		extend = function(source, options) {
			if (arguments.length === 1) return source;
			else {
				for (var i in options) {
					if (options.hasOwnProperty(i)) source[i] = options[i];
				}
				return source;
			}
		};

		var tool = extend({
			isString: function(v) {
				return toString.call(v) === '[object String]';
			},
			isFunction: function(v) {
				return toString.call(v) === '[object Function]';
			},
			isObject: function(v) {
				return v === Obj(v);
			},
			forEach: Arr.forEach ? function(arr, fn) {
				arr.forEach(fn);
			}: function(arr, fn) {
				for (var i = 0; i < arr.length; i++) fn(arr[i], i, arr);
			},
			filter: Arr.filter ? function(arr, fn) {
				return arr.filter(fn);
			}: function(arr, fn) {
				var ret = [];
				tool.forEach(arr, function(item, i, arr) {
					if (fn(item, i, arr)) ret.push(item);
				});
				return ret;
			},
			map: Arr.map ? function(arr, fn) {
				return arr.map(fn);
			}: function(arr, fn) {
				var ret = [];
				tool.forEach(arr, function(item, i, arr) {
					ret.push(fn(item, i, arr));
				});
				return ret;
			},
			keys: Obj.keys ? Obj.keys: function(o) {
				var ret = [];
				for (var p in o) {
					if (o.hasOwnProperty(p)) ret.push(p);
				}
				return ret;
			},
			indexOf: Arr.indexOf ? function(arr, selector) {
				return arr.indexOf(selector);
			}: function(arr, selector) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] === selector) return i;
				}
				return - 1;
			},
			unique: function(arr) {
				var o = {};
				tool.forEach(arr, function(item) {
					o[item] = 1;
				});
				return tool.keys(o);
			},
			_createNode: function(tag, charset) {
				var node = doc.createElement(tag);
				if (charset) node.charset = charset;
				return node;
			},
			_insertScript: function(node) {
				baseElement ? header.insertBefore(node, baseElement) : header.appendChild(node);
			},
			getScript: function(url, cb, charset) {
				var node = tool._createNode('script', charset);
				node.onload = node.onerror = node.onreadystatechange = function() {
					if (/loaded|complete|undefined/.test(node.readyState)) {
						node.onload = node.onerror = node.onreadystatechange = null;
						if (node.parentNode && ! DEBUG) node.parentNode.removeChild(node);
						node = undef;
						if (tool.isFunction(cb)) cb();
					}
				};
				node.async = 'async';
				node.src = url;
				currentlyAddingScript = node;
				tool._insertScript(node);
				currentlyAddingScript = null;
			},
			_fetch: function(url, cb) {
				if (fetched[url]) {
					cb();
					return;
				}
				if (fetching[url]) {
					callbacks[url].push(cb);
					return;
				}
				fetching[url] = true;
				callbacks[url] = [cb];
				tool.getScript(url, function() {
					fetched[url] = true;
					delete fetching[url];
					var fns = callbacks[url];
					if (fns) {
						delete callbacks[url];
						tool.forEach(fns, function(fn) {
							fn();
						});
					}
				},
				CHARSET);
			},
			getDependencies: function(code) {
				var deps = [];
				code.replace(commentRegExp, '').replace(jsRequireRegExp, function(match, dep) {
					deps.push(dep);
				});
				return tool.unique(deps);
			},
			fixNameSpace: function(id, deps) {
				var ns = tool.findPathNameSpace(id);
				return tool.map(deps, function(dep) {
					var depNamespace = tool.getNameSpace(dep);
					if (ns != depNamespace && depNamespace == '_main') return ns + ':' + dep;
					return dep;
				});
			},
			findPathNameSpace: function(path) {
				for (var ns in NAMESPACE) {
					if (new RegExp('^' + NAMESPACE[ns].basepath).test(path)) return ns;
				}
				return '_main';
			},
			getPureDependencies: function(mod) {
				var id = mod.id;
				//增加命名空间
				mod.dependencies = tool.fixNameSpace(id, mod.dependencies);
				//console.log(id,mod.dependencies);
				var deps = tool.filter(mod.dependencies, function(dep) {
					circularStack.push(id);
					var isCircular = tool.isCircularWaiting(module.cache[dep]);
					if (isCircular) {
						//the circular is ready
						circularStack.push(id);
					}
					circularStack.pop();
					return ! isCircular;
				});
				return tool.createUrl(deps);
			},
			isCircularWaiting: function(mod) {
				if (!mod || mod.status !== module.status.save) return false;
				circularStack.push(mod.uri);
				var deps = mod.dependencies;
				if (deps.length) {
					if (tool.isOverlap(deps, circularStack)) return true;
					for (var i = 0; i < deps.length; i++) {
						if (tool.isCircularWaiting(module.cache[deps[i]])) return true;
					}
				}
				circularStack.pop();
				return false;
			},
			isOverlap: function(arrA, arrB) {
				var arrC = arrA.concat(arrB);
				return arrC.length > tool.unique(arrC).length;
			},
			runModuleContext: function(fn, mod) {
				var ret;
				try {
					ret = fn(mod.require, mod.exports, mod);
				} catch(e) {
					throw mod.id + ':' + e;
				}
				if (ret !== undef) mod.exports = ret;
			},
			dirname: function(path) {
				var s = path.match(/[^?]*(?=\/.*$)/);
				return (s ? s[0] : '.') + '/';
			},
			realpath: function(path) {
				var multiple_slash_re = /([^:\/])\/\/+/g;
				multiple_slash_re.lastIndex = 0;
				if (multiple_slash_re.test(path)) {
					path = path.replace(multiple_slash_re, '$1\/');
				}
				if (path.indexOf('.') === - 1) {
					return path;
				}
				var original = path.split('/'),
				ret = [],
				part;
				for (var i = 0; i < original.length; i++) {
					part = original[i];
					if (part === '..') {
						if (ret.length === 0) {
							throw new Error('The path is invalid: ' + path);
						}
						ret.pop();
					}
					else if (part !== '.') {
						ret.push(part);
					}
				}
				return ret.join('/');
			},
			normalize: function(url) {
				url = tool.realpath(url);
				var lastChar = url.charAt(url.length - 1);
				if (lastChar === '/') {
					return url;
				}
				if (lastChar === '#') {
					url = url.slice(0, - 1);
				}
				else if (url.indexOf('?') === - 1 && ! (/\.(?:js)$/).test(url)) {
					url += '.js';
				}
				if (url.indexOf(':80/') > 0) {
					url = url.replace(':80/', '/');
				}
				return url;
			},
			resolve: function(id, path) {
				var ret = '';
				if (!id) {
					return ret;
					//isRelativePath
				} else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
					if (id.indexOf('./') === 0) {
						id = id.substring(2);
					}
					ret = tool.dirname(path) + id;
				} else if (id.charAt(0) === '/' && id.charAt(1) !== '/') {
					ret = tool.dirname(path) + id.substring(1);
				} else {
					ret = tool.dirname(path) + '/' + id;
				}
				return tool.normalize(ret);
			},
			isAbsolute: function(id) {
				return id.indexOf('://') > 0 || id.indexOf('//') === 0;
			},
			filename: function(path) {
				return path.slice(path.lastIndexOf('/') + 1).replace(/\?.*$/, '');
			},
			getNameSpace: function(id) {
				if (tool.isAbsolute(id)) return '_main';
				else {
					var ns = id.split(':');
					if (ns[1]) return ns[0];
					return '_main';
				}
			},
			replaceDir: function(id, directorys) {
				//只替换一次,且如果路径包含2个dir，也只替换一次,并且只匹配第一个，之后的不匹配
				// UI:../ -> UI/test = ../test
				// UI:../ -> UI/UI/test = ../UI/test
				// UI:../ -> ../a/UI/test = ../a/UI/test [不会替换]
				// UI:../ -> a/UI/test = a/UI/test [不会替换]
				var locks = {};
				for (var k = 0; k < directorys.length; k++) {
					var dir = directorys[k];
					for (var j in dir) {
						var path = dir[j],
						reg = new RegExp("^" + j + "\/");
						if (reg.test(id) && ! locks[id]) {
							id = id.replace(reg, path);
							locks[id] = true;
							break;
						}
					}
					if (locks[id]) break;
				}

				if (tool.isAbsolute(id)) id = tool.normalize(id);
				return id;
			},
			isDir: function(path) {
				return path.lastIndexOf('/') === path.length - 1;
			},
			getAliasDir: function(alias) {
				var dirs = [];
				for (var i in alias) {
					if (tool.isDir(alias[i])) {
						var dir = {};
						dir[i] = alias[i];
						dirs.push(dir);
					}
				}
				return dirs;
			},
			createUrl: function(ids) {
				return tool.map(ids, function(id) {
					//处理namespace
					var namespace = tool.getNameSpace(id);
					if (namespace !== '_main') {
						id = id.split(':')[1];
					}
					//说明此文件为config文件
					if (NAMESPACE.hasOwnProperty(id)) {
						namespace = id;
					}
					var ns = NAMESPACE[namespace];
					if (ns) {
						//alias
						var directorys = tool.getAliasDir(ns.alias);
						if (ns.alias) {
							var aliasPath = ns.alias[id];
							if (aliasPath && ! tool.isDir(aliasPath)) {
								id = aliasPath;
							} else if (directorys.length) {
								id = tool.replaceDir(id, directorys);
							}
						}
						//isAbsolute
						if (!tool.isAbsolute(id)) {
							id = tool.resolve(id, ns.basepath);
						}
						if (ns.timestamp) id = id + '?' + ns.timestamp;
						return id;
					} else {
						throw new Error('the namespace ' + namespace + ' is not found!');
					}
				});
			},
			buildNameSpace: function(cg, cb) {
				tool.addConfigs(cg, function(configs) {
					tool.forEach(configs, function(config) {
						var ns = NAMESPACE[config.name];
						ns.alias = config.alias;
						ns.timestamp = config.timestamp;
					});
					if (cb) cb();
				});
			},
			_hasClear: function(stack, ns) {
				delete stack[ns];
				if (tool.keys(stack).length) return false;
				return true;
			},
			addConfigs: function(cg, cb, len) {
				var oldlen = len || tool.keys(NAMESPACE).length;
				if (tool.keys(NAMESPACE).length === 1) {
					cg.name = '_main';
					cb([cg]);
					return;
				}
				for (var ns in NAMESPACE) {
					var config = NAMESPACE[ns]['config'];
					if (ns === '_main') continue;
					if (stack[ns]) continue;
					(function(config, ns) {
						stack[ns] = true;
						module.use(ns + ':' + config, function(cg) {
							cg.name = ns;
							_cgs.push(cg);
							tool.addNameSpace(cg);
							var newlen = tool.keys(NAMESPACE).length;
							if (newlen > oldlen) tool.addConfigs(cg, cb, newlen);
							var over = tool._hasClear(stack, ns);
							if (over) cb(_cgs);
						});
					})(config, ns);
				}
			},
			addNameSpace: function(cg) {
				if (cg.hasOwnProperty('namespace')) {
					for (var i in cg.namespace) {
						var ns = cg.namespace[i];
						NAMESPACE[i] = {
							basepath: ns.basepath,
							config: ns.config
						};
					}
				}
			},
			getCurrentScript: function() {
				if (currentlyAddingScript) {
					return currentlyAddingScript;
				}
				// For IE6-9 browsers, the script onload event may not fire right
				// after the the script is evaluated. Kris Zyp found that it
				// could query the script nodes and the one that is in "interactive"
				// mode indicates the current script
				// ref: http://goo.gl/JHfFW
				if (interactiveScript && interactiveScript.readyState === "interactive") {
					return interactiveScript;
				}

				var scripts = header.getElementsByTagName("script");

				for (var i = scripts.length - 1; i >= 0; i--) {
					var script = scripts[i];
					if (script.readyState === "interactive") {
						interactiveScript = script;
						return interactiveScript;
					}
				}
				return interactiveScript;

			},
			pathToid: function(path, name) {
				var ns = tool.findPathNameSpace(path);
				name = name || tool.filename(path);
				var url = ns === '_main' ? name: ns + ':' + name;
				return tool.createUrl([url])[0];
			},
			_save: function(url) {
				tool.forEach(anonymouse, function(meta) {
					if (!meta.id) throw new Error('more than ones anonymouse define in one file!');
					meta.id = tool.pathToid(url, meta.id);
					module._save(meta.id, meta);
				});
			}
		});

		NAMESPACE['_main'] = {
			basepath: tool.dirname(BASEPATH),
			config: CONFIG
		};

		function module(id) {
			this.id = id;
			this.status = 0;
			this.dependencies = [];
			this.exports = null;
			this.parent = [];
			this.factory = noop;
		}

		extend(module, {
			cache: {},
			status: {
				'created': 0,
				'save': 1,
				'ready': 2,
				'compiling': 3,
				'compiled': 4
			},
			_get: function(url) {
				return module.cache[url] || (module.cache[url] = new module(url));
			},
			_save: function(url, meta) {
				var mod = this._get(url);
				if (mod.status < module.status.save) {
					mod.id = url || meta.id;
					mod.dependencies = meta.deps;
					mod.factory = meta.factory;
					mod.status = module.status.save;
				}
				//console.log(mod.id,'_saved');
			},
			define: function(id, factory) {
				if (tool.isFunction(id)) {
					factory = id;
					id = undef;
				}
				if (!tool.isFunction(factory)) {
					throw 'define failed';
				}
				var deps = tool.getDependencies(factory.toString());
				var meta = {
					deps: deps,
					factory: factory
				};
				if (id && tool.isAbsolute(id)) meta.id = id;
				if (!meta.id && doc.attachEvent) {
					var script = tool.getCurrentScript();
					if (script) {
						//meta.id = tool.pathToid(script.src);
						meta.id = script.src;
					} else {
						throw new Error('failed to derive:" ' + factory);
					}
				}
				if (meta.id) {
					module._save(meta.id, meta);
				} else {
					meta.id = id;
					anonymouse.push(meta);
				}
			},
			_createUrls: function(ids) {
				tool.isString(ids) && (ids = [ids]);
				var urls = tool.createUrl(ids);
				return urls;
			},
			use: function(ids, cb) {
				var urls = module._createUrls(ids);
				module._fetch(urls, function() {
					var args = tool.map(urls, function(url) {
						return url ? module.cache[url]._compile() : null;
					});
					if (tool.isFunction(cb)) cb.apply(null, args);
				});
			},
			_preload: function(id, cb) {
				var url = module._createUrls(id)[0];
				tool._fetch(url, function() {
					var len = anonymouse.length;
					if (len) {
						if (len > 1) {
							tool._save(url);
						} else {
							module._save(url, anonymouse[0]);
						}
						anonymouse = [];
					}
					cb();
				});
			},
			_fetch: function(urls, cb) {
				var STATUS = module.status,
				loadUris = tool.filter(urls, function(url) {
					return url && (!module.cache[url] || module.cache[url].status < STATUS.ready);
				}),
				restart = function(mod) { (mod || {}).status < STATUS.ready && (mod.status = STATUS.ready); --queue;
					(queue === 0) && cb();
				},
				len = loadUris.length;
				if (len === 0) {
					cb();
					return;
				}
				var queue = len;
				for (var i = 0; i < len; i++) { (function(url) {
						//此处远程模块名和本地cache模块名不匹配，需要处理
						var mod = module._get(url);
						mod.status < module.status.save ? tool._fetch(url, success) : success();
						function success() {
							//before success the define method all ready changed mod and created new dependencies
							//如果define初始化不成功，这里根据顺序，修改为成功的mod
							var len = anonymouse.length;
							if (len) {
								if (len > 1) {
									tool._save(url);
								} else {
									module._save(url, anonymouse[0]);
								}
								anonymouse = [];
							}
							mod = module._get(url);
							//console.log(mod.id,'_success');
							if (mod.status >= STATUS.save) {
								var deps = tool.getPureDependencies(mod);
								if (deps.length) {
									module._fetch(deps, function() {
										restart(mod);
									});
								} else {
									restart(mod);
								}
							} else {
								//404 or no module
								restart();
							}
						}
					})(loadUris[i]);
				}
			}
		});

		extend(module.prototype, {
			_compile: function() {
				var mod = this,
				STATUS = module.status;
				if (mod.status === STATUS.compiled) return mod.exports;
				if (mod.status < STATUS.save) return null;
				mod.status = STATUS.compiling;
				function require(id) {
					//需要处理一下，根据mod增加namespace
					for (var i in mod.dependencies) {
						var dep = mod.dependencies[i],
						ns = tool.getNameSpace(dep);
						if (ns != '_main' && id == dep.split(':')[1]) id = ns + ':' + id;
					}
					id = tool.createUrl([id]);
					var child = module.cache[id];
					if (!child) return null;
					if (child.status === STATUS.compiled) return child.exports;
					child.parent = mod;
					return child._compile();
				}
				require.cache = module.cache;
				mod.require = require;
				mod.exports = {};
				var fun = mod.factory;
				if (tool.isFunction(fun)) {
					tool.runModuleContext(fun, mod);
				}
				mod.status = STATUS.compiled;
				return mod.exports;
			}
		});

		function _start(mainjs, callback) {
			module.use(CONFIG, function(cg) {
				tool.addNameSpace(cg);
				tool.buildNameSpace(cg, function() {
					var _main = NAMESPACE['_main'];
					_main.alias = cg.alias;
					_main.timestamp = cg.timestamp;
					if (cg.basepath) _main.basepath = cg.basepath;
					if (DEBUG && tool.isFunction(cg.debugswitch)) mainjs = cg.debugswitch(mainjs) || mainjs;
					module.use(mainjs, callback);
				});
			});
		}

		//browser api
		global.define = module.define;
		global.lithe = extend({
			use: module.use,
			cache: module.cache,
			NAMESPACE: NAMESPACE,
			start: function(mainjs, callback) {
				//use by prev config loaded
				if (CONFIG) {
					if (DEBUG) {
						_start(mainjs, callback);
					} else {
						module._preload(mainjs, function() {
							_start(mainjs, callback);
						});
					}
				} else {
					module.use(mainjs, callback);
				}
			}
		});

		if (mainjs) global.lithe.start(mainjs);

	} else {
		//node api
		exports.tool = require('./lib/lithe-tool.js');
		exports.hfs = require('./lib/lithe-hfs.js');
	}
})(this);

