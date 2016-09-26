(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["fetch"] = factory();
	else
		root["fetch"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Request = __webpack_require__(1)
	var Response = __webpack_require__(5)
	var Headers = __webpack_require__(2)
	var Transport = __webpack_require__(6)

	if (![].forEach) {
	    Array.prototype.forEach = function (fn, scope) {
	        'use strict'
	        var i, len
	        for (i = 0, len = this.length; i < len; ++i) {
	            if (i in this) {
	                fn.call(scope, this[i], i, this)
	            }
	        }
	    }
	}
	if (!'司徒正美'.trim) {
	    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
	    String.prototype.trim = function () {
	        return this.replace(rtrim, '')
	    }
	}
	function headers(xhr) {
	    var head = new Headers()
	    if (xhr.getAllResponseHeaders) {
	        var headerStr = xhr.getAllResponseHeaders() || ''
	        if (/\S/.test(headerStr)) {
	            //http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
	            var headerPairs = headerStr.split('\u000d\u000a');
	            for (var i = 0; i < headerPairs.length; i++) {
	                var headerPair = headerPairs[i];
	                // Can't use split() here because it does the wrong thing
	                // if the header value has the string ": " in it.
	                var index = headerPair.indexOf('\u003a\u0020')
	                if (index > 0) {
	                    var key = headerPair.substring(0, index).trim()
	                    var value = headerPair.substring(index + 2).trim()
	                    head.append(key, value)
	                }
	            }
	        }
	    }
	    return head
	}
	function fetch(input, init) {
	    return new Promise(function (resolve, reject) {
	        var request
	        if (!init && (init instanceof Request)) {
	            request = input
	        } else {
	            request = new Request(input, init)
	        }
	        request.headers.set('X-Requested-With', 'XMLHttpRequest')

	        var xhr = new Transport(request)
	        function responseURL() {
	            if ('responseURL' in xhr) {
	                return xhr.responseURL
	            }
	            // Avoid security warnings on getResponseHeader when not allowed by CORS
	            if (xhr.getResponseHeader && /^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	                return xhr.getResponseHeader('X-Request-URL')
	            }

	            return
	        }

	        xhr.on('load', function (event) {
	            var options = {
	                status: event.status,
	                statusText: event.statusText,
	                headers: headers(event),
	                url: responseURL()
	            }
	            var body = 'response' in event ? event.response : event.responseText
	            resolve(new Response(body, options))
	        })
	        xhr.on('error', function () {
	            reject(new TypeError('Network request failed'))
	        })
	        xhr.on('timeout', function () {
	            reject(new TypeError('Network request timeout'))
	        })

	        xhr.open(request.method, request.url, true)

	        request.headers.forEach(function (value, name) {
	            xhr.setRequestHeader(name, value)
	        })

	        xhr.send(typeof request._body === 'undefined' ? null : request._body)
	    })
	}

	if (!/[native code]/.test(window.fetch)) {
	    window.fetch = fetch
	}
	if (typeof avalon === 'function') {
	    avalon.fetch = fetch
	}
	module.exports = fetch

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Headers = __webpack_require__(2)
	var Body = __webpack_require__(4)

	function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (input instanceof Request) {
	        if (input.bodyUsed) {
	            throw new TypeError('Already read')
	        }
	        this.url = input.url
	        this.credentials = input.credentials
	        if (!options.headers) {
	            this.headers = new Headers(input.headers)
	        }
	        this.method = input.method
	        this.mode = input.mode
	        if (!body) {
	            body = input._body
	            input.bodyUsed = true
	        }
	    } else {
	        this.url = input
	    }

	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	        this.headers = new Headers(options.headers)
	    }
	    this.method = (options.method || this.method || 'GET').toUpperCase()
	    this.mode = options.mode || this.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	        throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	}

	Request.prototype.clone = function () {
	    return new Request(this)
	}

	var F = function(){} 
	F.prototype = Body.prototype 
	Request.prototype = new F() 

	module.exports = Request

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var support = __webpack_require__(3)

	function Headers(headers) {
	    this.map = {}
	    if (headers instanceof Headers) {
	        headers.forEach(function (value, name) {
	            this.append(name, value)
	        }, this)

	    } else if (headers) {
	        for (var name in headers) {
	            if (headers.hasOwnProperty(name)) {
	                this.append(name, headers[name])
	            }
	        }

	    }
	}

	Headers.prototype.append = function (name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	        list = []
	        this.map[name] = list
	    }
	    list.push(value)
	}

	Headers.prototype['delete'] = function (name) {
	    delete this.map[normalizeName(name)]
	}

	Headers.prototype.get = function (name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	}

	Headers.prototype.getAll = function (name) {
	    return this.map[normalizeName(name)] || []
	}

	Headers.prototype.has = function (name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	}

	Headers.prototype.set = function (name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	}

	Headers.prototype.forEach = function (callback, thisArg) {
	    for (var name in this.map) {
	        if (this.map.hasOwnProperty(name)) {
	            this.map[name].forEach(function (value) {
	                callback.call(thisArg, value, name, this)
	            }, this)
	        }
	    }
	}

	Headers.prototype.keys = function () {
	    var items = []
	    this.forEach(function (value, name) {
	        items.push(name)
	    })
	    return iteratorFor(items)
	}

	Headers.prototype.values = function () {
	    var items = []
	    this.forEach(function (value) {
	        items.push(value)
	    })
	    return iteratorFor(items)
	}

	Headers.prototype.entries = function () {
	    var items = []
	    this.forEach(function (value, name) {
	        items.push([name, value])
	    })
	    return iteratorFor(items)
	}

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	  }

	function normalizeName(name) {
	    if (typeof name !== 'string') {
	        name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	        throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	}

	function normalizeValue(value) {
	    if (typeof value !== 'string') {
	        value = String(value)
	    }
	    return value
	}

	module.exports = Headers

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	    searchParams: 'URLSearchParams' in window,
	    iterable: 'Symbol' in window && 'iterator' in window,
	    blob: 'FileReader' in window && 'Blob' in window && (function () {
	        try {
	            new Blob()
	            return true
	        } catch (e) {
	            return false
	        }
	    })(),
	    formData: 'FormData' in window,
	    arrayBuffer: 'ArrayBuffer' in window
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var support = __webpack_require__(3)

	function Body() {
	    this.bodyUsed = false
	}
	var p = Body.prototype

	'text,blob,formData,json,arrayBuffer'.replace(/\w+/g, function (method) {
	    p[method] = function () {
	        return consumeBody(this).then(function (body) {
	            return convertBody(body, method)
	        })
	    }
	})

	p._initBody = function (body) {
	    this._body = body
	    if (!this.headers.get('content-type')) {
	        var a = bodyType(body)
	        switch (a) {
	            case 'text':
	                this.headers.set('content-type', 'text/plain;charset=UTF-8')
	                break
	            case 'blob':
	                if (body && body.type) {
	                    this.headers.set('content-type', body.type)
	                }
	                break
	            case 'searchParams':
	                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
	                break
	        }
	    }
	}

	function consumeBody(body) {
	    if (body.bodyUsed) {
	        return Promise.reject(new TypeError('Already read'))
	    } else {
	        body.bodyUsed = true
	        return Promise.resolve(body._body)
	    }
	}

	function convertBody(body, to) {
	    var from = bodyType(body)
	    if (body === null || body === void 0 || !from || from === to) {
	        return Promise.resolve(body)
	    } else if (map[to] && map[to][from]) {
	        return map[to][from](body)
	    } else {
	        return Promise.reject(new Error('Convertion from ' + from + ' to ' + to + ' not supported'))
	    }
	}


	var map = {
	    text: {
	        json: function (body) {//json --> text
	            return Promise.resolve(JSON.stringify(body))
	        },
	        blob: function (body) {//blob --> text
	            return blob2text(body)
	        },
	        searchParams: function (body) {//searchParams --> text
	            return Promise.resolve(body.toString())
	        }
	    },
	    json: {
	        text: function (body) {//text --> json
	            return Promise.resolve(parseJSON(body))
	        },
	        blob: function (body) {//blob --> json
	            return blob2text(body).then(parseJSON)
	        }
	    },
	    formData: {
	        text: function (body) {//text --> formData
	            return text2formData(body)
	        }
	    },
	    blob: {
	        text: function (body) {//json --> blob
	            return Promise.resolve(new Blob([body]))
	        },
	        json: function (body) {//json --> blob
	            return Promise.resolve(new Blob([JSON.stringify(body)]))
	        }
	    },
	    arrayBuffer: {
	        blob: function (body) {
	            return blob2ArrayBuffer(body)
	        }
	    }
	}

	function bodyType(body) {
	    if (typeof body === 'string') {
	        return 'text'
	    } else if (support.blob && (body instanceof Blob)) {
	        return 'blob'
	    } else if (support.formData && (body instanceof FormData)) {
	        return 'formData'
	    } else if (support.searchParams && (body instanceof URLSearchParams)) {
	        return 'searchParams'
	    } else if (body && typeof body === 'object') {
	        return 'json'
	    } else {
	        return null
	    }
	}


	function reader2Promise(reader) {
	    return new Promise(function (resolve, reject) {
	        reader.onload = function () {
	            resolve(reader.result)
	        }
	        reader.onerror = function () {
	            reject(reader.error)
	        }
	    })
	}
	/*
	 readAsBinaryString(File|Blob)
	 readAsText(File|Blob [, encoding])
	 readAsDataURL(File|Blob)
	 readAsArrayBuffer(File|Blob)
	 */
	function text2formData(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function (bytes) {
	        if (bytes) {
	            var split = bytes.split('=')
	            var name = split.shift().replace(/\+/g, ' ')
	            var value = split.join('=').replace(/\+/g, ' ')
	            form.append(decodeURIComponent(name), decodeURIComponent(value))
	        }
	    })
	    return Promise.resolve(form)
	}

	function blob2ArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return reader2Promise(reader)
	}

	function blob2text(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return reader2Promise(reader)
	}


	function parseJSON(body) {
	    try {
	        return JSON.parse(body)
	    } catch (ex) {
	        throw 'Invalid JSON'
	    }
	}

	module.exports = Body

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Headers = __webpack_require__(2)
	var Body = __webpack_require__(4)

	function Response(bodyInit, options) {
	    if (!options) {
	        options = {}
	    }

	    this.type = 'default'

	    this.status = options.status
	    if (1223 === this.status) {
	        this.status = 204
	    }
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	}

	var F = function(){} 
	F.prototype = Body.prototype 
	Response.prototype = new F() 

	Response.prototype.clone = function () {
	    return new Response(this._bodyInit, {
	        status: this.status,
	        statusText: this.statusText,
	        headers: new Headers(this.headers),
	        url: this.url
	    })
	}

	Response.error = function () {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	}

	var redirectStatuses = [301, 302, 303, 307, 308]

	Response.redirect = function (url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	        throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	}

	module.exports = Response

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var AXO = __webpack_require__(7)
	var JSONP = __webpack_require__(8)
	var XDR = __webpack_require__(9)
	var XHR = __webpack_require__(10)
	var msie = 0
	if (window.VBArray) {
	    msie = document.documentMode || (window.XMLHttpRequest ? 7 : 6)
	}

	function Transport(request) {
	    if (msie === 8 || msie === 9) {
	        this.core = new XDR(request)
	    } else if (!msie) {
	        this.core = new XHR(request)
	    } else if (msie <= 7) {
	        if (request.credentials === 'include') {
	            this.core = new JSONP(request)
	        } else {
	            this.core = new AXO(request)
	        }
	    }
	}

	var p = Transport.prototype
	p.on = function (type, fn) {
	    this.core.on(type, fn)
	}

	p.setRequestHeader = function (a, b) {
	    if (this.core.setRequestHeader) {
	        this.core.setRequestHeader(a, b)
	    }
	}

	p.open = function (a, b, c, d, e) {
	    if (this.core.open) {
	        this.core.open(a, b, c, d, e)
	    }
	}

	p.send = function (a) {
	    if (this.core.send) {
	        this.core.send(a)
	    }
	}

	p.abort = function () {
	    if (this.core.abort) {
	        this.core.abort()
	    }
	}

	module.exports = Transport

/***/ },
/* 7 */
/***/ function(module, exports) {

	

	module.exports = function AXO(opts) {
	    var xhr = new ActiveXObject('Microsoft.XMLHTTP')
	    
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	            if (/^2\d\d|1224/.test(xhr.status)) {
	                events['load'] && events['load'](xhr)
	            } else {
	                events['error'] && events['error']()
	            }
	        }
	    }
	    var events = {}
	    xhr.on = function (type, fn) {
	        events[type] = fn
	    }

	    xhr.abort = function () {
	        events = {}
	    }
	    if (opts.timeout === 'number') {
	        setTimeout(function () {
	            events['timeout'] && events['timeout']()
	            xhr.abort()
	        }, opts.timeout)
	    }
	    return xhr
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	
	function JSONP(opts) {
	    var callbackFunction = opts.jsonpCallbackFunction || generateCallbackFunction();
	    var jsonpCallback = opts.jsonpCallback || 'callback'
	    var xhr = document.createElement('script')
	    if (xhr.charset) {
	        xhr.charset = opts.charset
	    }
	    xhr.onerror = xhr[useOnload ? 'onload' : 'onreadystatechange'] = function (e) {
	        var execute = /loaded|complete|undefined/i.test(xhr.readyState)
	        if (e && e.type === 'error') {
	            events['error'] && events['error']()
	        } else if (execute) {
	            setTimeout(function () {
	                xhr.abort()
	            }, 0)
	        }
	    }

	    var events = {}
	    xhr.on = function (type, fn) {
	        events[type] = fn
	    }
	    xhr.abort = function () {
	        events = {}
	        removeNode(xhr)
	        clearFunction(callbackFunction)
	    }
	    xhr.open = function (a, url) {
	        window[callbackFunction] = function (response) {
	            events['load'] && events['load']({
	                status: 200,
	                statusText: 'ok',
	                response: response
	            })
	            clearFunction(callbackFunction)
	        }
	        var head = document.getElementsTagName('head')[0]

	        url += (url.indexOf('?') === -1) ? '?' : '&';
	        xhr.setAttribute('src', url + jsonpCallback + '=' + callbackFunction);
	        head.insertBefore(xhr, head.firstChild)
	        if (opts.timeout === 'number') {
	            setTimeout(function () {
	                events['timeout'] && events['timeout']()
	                xhr.abort()
	            }, opts.timeout)
	        }
	    }
	}


	function generateCallbackFunction() {
	    return ('jsonp' + Math.random()).replace(/0\./, '')
	}

	// Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined' error if request timeout
	function clearFunction(functionName) {
	    // IE8 throws an exception when you try to delete a property on window
	    // http://stackoverflow.com/a/1824228/751089
	    try {
	        delete window[functionName];
	    } catch (e) {
	        window[functionName] = undefined;
	    }
	}

	var f = document.createDocumentFragment()
	var useOnload = 'textContent' in document

	function removeNode(node) {
	    f.appendChild(node)
	    f.removeChild(node)
	    node.onload = onerror = onreadystatechange = function () {
	    }
	    return node
	}

	module.exports = JSONP

/***/ },
/* 9 */
/***/ function(module, exports) {

	//https://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx
	module.exports = function XDR(opts) {
	    var xhr = new XDomainRequest()
	    'load,error,timeout'.replace(/\w+/g, function (method) {
	        xhr['on' + method] = function () {
	            if (events[method]) {
	                events[method](xhr)
	            }
	        }
	    })
	    var events = {}
	    xhr.on = function (type, fn) {
	        events[type] = fn
	    }
	    xhr.onabort = function () {
	        events = {}
	    }
	    if (opts.timeout === 'number') {
	        xhr.timeout = opts.timeout
	    }
	    return xhr
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	
	module.exports = function XHR(opts) {
	    var xhr = new XMLHttpRequest
	    'load,error,timeout'.replace(/\w+/g, function (method) {
	        xhr['on' + method] = function () {
	            if (events[method]) {
	                events[method](xhr)
	            }
	        }
	    })
	    var events = {}
	    xhr.on = function (type, fn) {
	        events[type] = fn
	    }
	    xhr.onabort = function () {
	        events = {}
	    }
	    if (opts.credentials === 'include') {
	        xhr.withCredentials = true
	    }

	    if ('responseType' in xhr && ('Blob' in window)) {
	        xhr.responseType = 'blob'
	    }
	    return xhr
	}

/***/ }
/******/ ])
});
;