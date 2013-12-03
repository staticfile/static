then.js 0.9.5[![Build Status](https://travis-ci.org/zensh/then.js.png?branch=master)](https://travis-ci.org/zensh/then.js)
====
Another very small asynchronous promise tool! (less than 300 lines)

**能用简单优美的方式将任何同步或异步回调函数转换成then()链式调用！**

## 特征

1. 无需像Q.js那样封装，可以用自然的方式直接把N多异步回调函数写成一个长长的then链；
2. 拥有类似Async.js但更强大的each、eachSeries、parallel、series批量异步组合函数，它们都可在then链上调用；
3. Error收集器fail方法可在任意位置调用，可以调用一次或多次，让你随心所欲处理各种Error。还可以把fail放在末尾当作殿后函数运行（即不管then链成功或失败均运行该函数）；
4. 开启debug模式，可以把每一个then链运行结果输出到debug函数（未定义debug函数则console.log）

## Install

**Node.js:**

    npm install thenjs

**bower:**

    bower install thenjs

**Browser:**

    <script src="/pathTo/then.js"></script>

**with require**

    var then = require('thenjs');

**with define**

    define(['thenjs'], function (then) {
        //...
    });

**注意：then.js需要bind方法和Array.isArray方法支持，IE8及以下请先加载es5-shim.js**


## API

### 概览

####入口函数：（return then对象）

+ then([startHandler], [context], [debug])

+ then.each(array, iterator, [context], [debug])

+ then.eachSeries(array, iterator, [context], [debug])

+ then.parallel(taskFnArray, [context], [debug])

+ then.series(taskFnArray, [context], [debug])

####then对象方法：（return then对象）

+ .then(successHandler, [errorHandler])

+ .all(allHandler)

+ .fail(errorHandler)

+ .each(array, iterator, [context])

+ .eachSeries(array, iterator, [context])

+ .parallel(taskFnArray, [context])

+ .series(taskFnArray, [context])

### 1. 入口函数

#### then([startHandler], [context], [debug])
startHandler是可选的，如果未提供，将直接进入下一个then object。

***Parameters:***

+ **startHander:** function (defer) {}
+ **context:** 为startHandler绑定的this值，下同
+ **debug:** debug为函数或其它真值时就对本then链开启调试模式，逐步将每一个链的defer运行结果用debug函数处理，如果debug为非函数真值，则调用console.log打印，下同

***Return:*** then object

#### then.each(array, iterator, [context], [debug])
将array中的值应用于iterator函数（同步或异步任务），并行执行。iterator的第一个参数defer用于收集err和运行结果，所有结果将形成一个结果数组进入下一个then object，结果数组的顺序与array对应。当所有iterator任务运行完毕，或者defer捕捉到任何一个err，即进入下一个then object。如果array为空数组，结果数组也将为空数组，iterator不会执行而直接进入下一个then object。

***Parameters:***

+ **array:** array apply to iterator
+ **taskIterator:** function (defer, value, index, array) {}
+ **context:** context apply to iterator

***Return:*** then object

#### then.eachSeries(array, iterator, [context], [debug])
将array中的值应用于iterator函数（同步或异步任务），按顺序执行，上一个任务执行完毕才开始执行下一个任务。iterator的第一个参数defer用于收集err和运行结果，所有结果将形成一个结果数组进入下一个then object，结果数组的顺序与array对应。当所有iterator任务运行完毕，或者defer捕捉到任何一个err，即进入下一个then object。如果array为空数组，结果数组也将为空数组，iterator不会执行而直接进入下一个then object。

***Parameters:***

+ **array:** array apply to iterator
+ **taskIterator:** function (defer, value, index, array) {}
+ **context:** context apply to iterator

***Return:*** then object


#### then.parallel(taskFnArray, [context], [debug])
taskFnArray是一系列同步或异步任务函数组成的数组，并行执行。taskFnArray中每一个函数的第一个参数defer用于收集err和运行结果，所有结果将形成一个结果数组进入下一个then object，结果数组的顺序与taskFnArray对应。当所有taskFnArray任务运行完毕，或者defer捕捉了任何一个err，即进入下一个then object。如果taskFnArray为空数组，结果数组也将为空数组，将会直接进入下一个then object。

***Parameters:***

+ **taskFnArray:** [taskFn1, taskFn2, taskFn3, ...]
+ **taskFn in taskFnArray:** function (defer) {}
+ **context:** context apply to iterator

***Return:*** then object

#### then.series(taskFnArray, [context], [debug])
taskFnArray是一系列同步或异步任务函数组成的数组，按顺序执行，上一个任务执行完毕才开始执行下一个任务。taskFnArray中每一个函数的有第一个参数defer用于收集err和运行结果，所有结果将形成一个结果数组进入下一个then object，结果数组的顺序与taskFnArray对应。当所有taskFnArray任务运行完毕，或者defer捕捉了任何一个err，即进入下一个then object。如果taskFnArray为空数组，结果数组也将为空数组，将会直接进入下一个then object。

***Parameters:***

+ **taskFnArray:** [taskFn1, taskFn2, taskFn3, ...]
+ **taskFn in taskFnArray:** function (defer) {}
+ **context:** context apply to iterator

***Return:*** then object


### 2. *then object*的方法

#### .all(allHandler)
若all存在，则上一个then对象无论是捕捉到err还是正常结果，均进入all执行，allHandler可用上层then对象的defer代替`.all(defer)`。

***Parameters:***

+ **allHandler:** function (defer, err, value…) {}

***Return:*** then object

#### .then(successHandler, [errorHandler])
若errorHandler存在，上一个then对象捕捉到err则执行errorHandler，否则执行successHandler， errorHandler可用上层then对象的defer代替，successHandler则不能（否则会把第一个value当作err处理）。

***Parameters:***

+ **successHandler:** function (defer, value…) {}
+ **errorHandler:** function (defer, err) {}

***Return:*** then object

#### .fail(errorHandler)
fail用于捕捉在它之前的then链上发生的任何err。若fail存在，fail之前的then链发生了err，且没有被all的allHandler或then的errorHandler捕捉，则err直接进入最近的fail节点，err发生点与fail之间的then链不会被执行。errorHandler可用上层then对象的defer代替`.fail(defer)`。一个then链可存在0个或多个fail方法，强烈建议then链的最后一个then对象为fail方法。如果then链中没有任何err捕捉器，则err会直接throw。**fail方法可用于运行殿后函数：对一个一条then链，使用`defer(true)`把最后无err运行的then对象导向末端的fail，则该then链不管是正确运行还是发生了err，均会执行末端的fail方法。**

***Parameters:***

+ **errorHandler:** function (defer, err) {}

***Return:*** then object

#### .each(array, iterator, [context])
参数类似then.each。不同在于，一是无debug参数; 当array, iterator, context为null或undefined时，此处的each会查找上一个then对象的输出结果，如果存在，则作为它的运行参数：例如上一个then对象输出`defer(null, array1, iterator1)`，此处为`each(null, null, this)`，则该each会获取array1, iterator1作为为它的参数运行。

#### .eachSeries(array, iterator, [context])
参数类似then.eachSeries。不同处类似上面.each。

#### .parallel(taskFnArray, [context])
参数类似then.eachSeries。不同处类似上面.each。

#### .series(taskFnArray, [context])
参数类似then.eachSeries。不同处类似上面.each。

### 3. 其他说明


1. 关于Error收集器

    then对象的then方法的errorHandler函数、all方法、fail方法均能收集error。其中then方法的errorHandler函数和all方法只能收集上一个then对象产生的error；fail方法则能收集再它之前所有then链产生的error。

2. 关于触发器`defer`

    then.js中最关键的就是`defer`，用于触发下一个then链。从上面可知，入口函数、then方法、all方法、fail方法中的任务函数的第一个参数都被注入了defer方法，**如果任务函数本身是一个defer方法，则不会再被注入defer方法**。

    defer的第一个参数永远是error，如果error存在，则error下一个then对象的Error收集器，如果Error收集器不存在，则抛出error。

    如果异步任务的callback的第一个参数为error，即callback(error, result1, ...)的形式，则可直接用defer代替异步任务的callback。Node.js中的异步函数基本都是这种形式，then.js用起来超方便。

    **如果一个函数体内的同一个defer被多次调用，那么只有最先被触发的那个defer有效**。这个效果类似于`or`：多个异步任务同时进行，最先返回的结果进入下一个then链，其它后返回的结果忽略。

3. 关于fail方法

    `fail`方法能捕捉在它之前的then链中的任何一个error。fail的优先级低于then方法的errorHandler和all方法，即then对象不存在then方法的errorHandler和all方法时error才会进入fail。当then链的某个then对象产生了error时，如果该then对象的下一个then对象存在Error收集器，则error进入该Error收集器，否则error会直接进入then链下游最近的fail方法，其间的then对象均会跳过。



## then.js使用模式

**直链：**

    then(function (defer) {
        // ....
        defer(err, ...);
    }).then(function (defer, value) {
        // ....
        defer(err, ...);
    }, function (defer, err) {
        // ....
        defer(err, ...);
    }).then(function (defer) {
        // ....
        defer(err, ...);
    }).all(function (defer, err, value) {
        // ....
        defer(err, array);
    }).each(null, function (defer, value) {
        // ....
        defer(err, ...);
    }).eachSeries(null, function (defer) {
        // ....
        defer(err, ...);
    }).parallel(null, function (defer) {
        // ....
        defer(err, ...);
    }).series(null, function (defer) {
        // ....
        defer(err, ...);
    }).fail(function (defer, err) {
        // ....
    });


**嵌套：**

    then(function (defer) {
        // ....
        defer(err, ...);
    }).then(function (defer, value) {
        //第二层
        then(function (defer2) {
            // ....
            defer2(err, ...);
        }).then(function (defer2, value) {
            //第三层
            then(function (defer3) {
                // ....
            }).all(defer2); // 返回二层
        }).then(function (defer2) {
            // ....
            defer(err, ...); // 返回一层
        }).fail(defer); // 返回一层
    }).then(function (defer) {
        // ....
        defer(err, ...);
    }).fail(function (defer, err) {
        // ....
    });


**async 嵌套：**

    then(function (defer) {
        // ....
        defer(err, array);
    }).then(function (defer, array) {
        // ....并行执行任务
        then.each(array, function (defer2, value) {
            defer2();
        }, defer);
    }).then(function (defer, array) {
        // ....逐步执行任务
        then.eachSeries(array, function (defer2, value) {
            defer2();
        }, defer);
    }).then(function (defer, array) {
        // ....并行执行任务
        then.parallel([function (defer2) {
            //任务1
            defer2();
        }, function (defer2) {
            //任务2
            defer2();
        }, function (defer2) {
            //任务3
            defer2();
        }, ...], defer);
    }).then(function (defer, array) {
        // ....逐步执行任务
        then.series([function (defer2) {
            //任务1
            defer2();
        }, function (defer2) {
            //任务2
            defer2();
        }, function (defer2) {
            //任务3
            defer2();
        }, ...], defer);
    }).then(function (defer) {
        // ....
        defer(err, ...);
    }).fail(function (defer, err) {
        // ....
    });

**then对象取代callback：**

    function getFileAsync() {
        return then(function (defer) {
            readFile(failname, defer);
        }).then(function (defer, fileContent) {
            // 处理fileContent
            defer(null, result);
        }).fail(function (defer, err) {
            // 处理error
            defer(err);
        });
    }

    getFileAsync().then(function (defer, file) {
        // ....
    }).fail(function(defer, err) {
        // ....
    });



### Who Used

 + AngularJS中文社区：[http://angularjs.cn/]()
 + Teambition：[http://teambition.com/]()


## Examples

**参见demo——test.js**

更多使用案例请参考[jsGen](https://github.com/zensh/jsgen)源代码！
