'use strict';
/*global module, process*/

var thenJs = require('../then.min.js');

function getArray(length) {
    // 生成有序数组
    var a = [];
    while (length > 0) {
        a.push(a.length);
        length--;
    }
    return a;
}

function asnycTask() {
    // 虚拟异步回调任务，最后一个参数为callback，异步返回callback之前的所有参数
    var callback = arguments[arguments.length - 1],
        result = [].slice.call(arguments, 0, -1);
    setTimeout(function () {
        callback.apply(callback.nextThenObject, result);
    }, Math.random() * 20);
}

function testThen(test, then, num) {
    // then.js测试主体
    // then(function (defer) {
    // //只响应返回结果最快的一个函数
    //     asnycTask(1, defer);
    //     asnycTask(2, defer);
    //     asnycTask(3, defer);
    // }).then(function (defer, index, sec) {
    //     console.log('First return: ' + index, sec);
    //     test.ok(true, "Coffee thenjs assertion should pass!");
    //     test.done();
    // });
    return then.parallel([
        function (defer) {
            asnycTask(null, num, defer);
        },
        function (defer) {
            asnycTask(null, num + 1, defer);
        },
        function (defer) {
            asnycTask(null, num + 2, defer);
        }
    ]).then(function (defer, result) {
        test.deepEqual(result, [num, num + 1, num + 2], 'Test parallel');
        asnycTask(null, defer);
    }).series([
        function (defer) {
            asnycTask(null, num + 3, defer);
        },
        function (defer) {
            asnycTask(null, num + 4, defer);
        }
    ]).then(function (defer, result) {
        test.deepEqual(result, [num + 3, num + 4], 'Test series');
        asnycTask(num, defer);
    }).then(null, function (defer, err) {
        test.strictEqual(err, num, 'Test errorHandler');
        asnycTask(num, num, defer);
    }).all(function (defer, err, result) {
        test.strictEqual(err, num, 'Test all');
        test.equal(result, num);
        defer(null, [num, num + 1, num + 2]);
    }).each(null, function (defer, value, index) {
        test.equal(value, num + index);
        asnycTask(null, value, defer);
    }).then(function (defer, result) {
        test.deepEqual(result, [num, num + 1, num + 2], 'Test each');
        asnycTask(null, [num, num + 1, num + 2], function (defer, value, index) {
            test.equal(value, num + index);
            asnycTask(null, value, defer);
        }, defer);
    }).eachSeries(null, null).then(function (defer, result) {
        test.deepEqual(result, [num, num + 1, num + 2], 'Test eachSeries');
        throw num;
    }).then(function () {
        test.ok(false, 'This should not run!');
    }).fail(function (defer, err, a) {
        test.strictEqual(err, num, 'Test fail');
        asnycTask(null, num, defer);
    });
}

exports.testThen = function (test) {
    var list = getArray(100);
    thenJs.each(list, function (defer, value) {
        testThen(test, thenJs, value).all(function (defer2, error, result) {
            defer(error, result);
        });
    }).eachSeries(null, function (defer, value) {
        testThen(test, thenJs, value).all(defer);
    }).then(function (defer, result) {
        test.deepEqual(result, list, 'Test each and eachSeries');
        defer(list);
    }).fail(function (defer, err) {
        test.strictEqual(err, list, 'None error');
        test.done();
    });
};