var nativePromise = window.Promise
if (/native code/.test(nativePromise)) {//判定浏览器是否支持原生Promise
    module.exports = nativePromise
} else {
    var RESOLVED = 0
    var REJECTED = 1
    var PENDING = 2

    //实例化Promise
    function Promise(executor) {

        this.state = PENDING
        this.value = undefined
        this.deferred = []

        var promise = this

        try {
            executor(function (x) {
                promise.resolve(x)
            }, function (r) {
                promise.reject(r)
            })
        } catch (e) {
            promise.reject(e)
        }
    }

    //迅速实例化Promise,指定数据与末来状态
    Promise.resolve = function (x) {
        return new Promise(function (resolve, reject) {
            resolve(x)
        })
    }
    //迅速实例化Promise,指定数据与末来状态
    Promise.reject = function (r) {
        return new Promise(function (resolve, reject) {
            reject(r)
        })
    }
    //Promise.all 接收一个 promise对象的数组作为参数，
    //当这个数组里的所有promise对象全部变为resolve或reject状态的时候，
    //它才会去调用 .then 方法。
    Promise.all = function (iterable) {
        return new Promise(function (resolve, reject) {
            var count = 0, result = []

            if (iterable.length === 0) {
                resolve(result)
            }

            function resolver(i) {
                return function (x) {
                    result[i] = x
                    count += 1

                    if (count === iterable.length) {
                        resolve(result)
                    }
                }
            }

            for (var i = 0; i < iterable.length; i += 1) {
                Promise.resolve(iterable[i]).then(resolver(i), reject)
            }
        })
    }
    //Promise.race 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，
    //就会继续进行后面的处理。换言之,谁的异步时间最短,谁就会被处理.
    Promise.race = function (iterable) {
        return new Promise(function (resolve, reject) {
            for (var i = 0; i < iterable.length; i += 1) {
                Promise.resolve(iterable[i]).then(resolve, reject)
            }
        })
    }

    var p = Promise.prototype
    //构建Promise列队,并将要执行的函数与传参存储到最初的Promise.deferred数组中
    p.then = function then(onResolved, onRejected) {
        var promise = this
        //onResolved, onRejected用于接受上一个Promise的传参
        //它们返回的结果,用于resolve, reject方法执行下一个Promise
        return new Promise(function (resolve, reject) {
            promise.deferred.push([onResolved, onRejected, resolve, reject])
            promise.notify()//执行回调
        })
    }
    //p.then的语法糖
    p.catch = function (onRejected) {
        return this.then(undefined, onRejected)
    }
    p.resolve = function resolve(x) {
        var promise = this

        if (promise.state === PENDING) {
            if (x === promise) {
                throw new TypeError('Promise settled with itself.')
            }

            var called = false

            try {
                var then = x && x['then']
                //如果是Promise或是thenable对象,
                //那么将执行后的结果继续传给现在这个Promise resolve /rejcet
                if (x !== null && typeof x === 'object' && typeof then === 'function') {
                    then.call(x, function (x) {
                        if (!called) {
                            promise.resolve(x)
                        }
                        called = true

                    }, function (r) {
                        if (!called) {
                            promise.reject(r)
                        }
                        called = true
                    })
                    return
                }
            } catch (e) {
                if (!called) {
                    promise.reject(e)
                }
                return
            }

            promise.state = RESOLVED
            promise.value = x
            promise.notify()
        }
    }

    p.reject = function reject(reason) {
        var promise = this

        if (promise.state === PENDING) {
            if (reason === promise) {
                throw new TypeError('Promise settled with itself.')
            }

            promise.state = REJECTED
            promise.value = reason
            promise.notify()
        }
    }

    p.notify = function notify() {
        var promise = this
        //根据Promise规范,必须异步执行存储好的回调
        nextTick(function () {
            if (promise.state !== PENDING) {//确保状态是从pending -> resloved/rejected
                while (promise.deferred.length) {
                    var deferred = promise.deferred.shift(),
                            onResolved = deferred[0],
                            onRejected = deferred[1],
                            resolve = deferred[2],
                            reject = deferred[3]

                    try {
                        if (promise.state === RESOLVED) {
                            if (typeof onResolved === 'function') {
                                resolve(onResolved.call(undefined, promise.value))
                            } else {
                                resolve(promise.value)
                            }
                        } else if (promise.state === REJECTED) {
                            if (typeof onRejected === 'function') {
                                resolve(onRejected.call(undefined, promise.value))
                            } else {
                                reject(promise.value)
                            }
                        }
                    } catch (e) {
                        reject(e)
                    }
                }
            }
        })
    }

    /*视浏览器情况采用最快的异步回调*/
    var nextTick = new function () {// jshint ignore:line
        var tickImmediate = window.setImmediate
        var tickObserver = window.MutationObserver
        if (tickImmediate) {
            return tickImmediate.bind(window)
        }

        var queue = []
        function callback() {
            var n = queue.length
            for (var i = 0; i < n; i++) {
                queue[i]()
            }
            queue = queue.slice(n)
        }

        if (tickObserver) {
            var node = document.createTextNode("avalon")
            new tickObserver(callback).observe(node, {characterData: true})
            var bool = false
            return function (fn) {
                queue.push(fn)
                bool = !bool
                node.data = bool
            }
        }


        return function (fn) {
            setTimeout(fn, 4)
        }
    }

    module.exports = Promise
}

//https://github.com/ecomfe/er/blob/master/src/Deferred.js
//http://jser.info/post/77696682011/es6-promises