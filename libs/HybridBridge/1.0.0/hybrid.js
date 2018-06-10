/**
 * author  : 颜洪毅
 * e-mail  : yhyzgn@gmail.com
 * time    : 2018-05-24 11:07
 * version : 1.0.0
 * desc    : 与原生交互的js插件
 */

(function (fn, extend) {
    if (typeof fn !== "function" || typeof extend !== "object") {
        throw new Error("框架加载错误");
    }

    // 定义框架的访问通道
    window.Hybrid = window.Hy = Hybrid = Hy = fn;

    // 类属性/方法扩展
    for (let key in extend) {
        fn[key] = extend[key];
    }
})(function () {
}, {
    /**
     * 配置参数
     *
     * strict：是否使用严格模式，默认为true。即只有在移动端访问并且传入"urlFlagName=urlFlagValue"参数的情况下才能证明是真正的移动端（用来辨别浏览器和WebView访问）
     * urlFlagName和urlFlagValue：可以辨别是WebView加载的网页还是手机浏览器加载的，如果是WebView加载的网页的话，就可以对页面做相应调整，比如隐藏某些按钮等；
     * bridge：Android端与js交互的桥梁，默认是window.app
     */
    config: {
        // 是否使用严格模式（不仅辨别是否是移动端内核浏览器，还需要判断“config.urlFlagName”参数），默认为true
        strict: true,
        // URL标识名称
        urlFlagName: "platform",
        // URL标识值
        urlFlagValue: "app",
        // Android端交互桥梁名称
        bridge: window.app
    },

    /**
     * 浏览器版本仓库
     */
    browser: {
        versions: function () {
            const u = navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1, // IE内核
                presto: u.indexOf('Presto') > -1, // opera内核
                webKit: u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, // 火狐内核
                mobile: !!u.match(/Android|webOS|iPhone|iPod|BlackBerry/i), // 是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, // android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, // 是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, // 是否iPad
                webApp: u.indexOf('Safari') === -1,// 是否web应该程序，没有头部与底部
                google: u.indexOf('Chrome') > -1 // Google浏览器
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    },

    /**
     * 初始化方法
     * @param config 配置参数（该参数可不传，代表使用默认配置）
     * @param callback 初始化回调方法
     */
    init: function (config, callback) {
        let cb = callback;
        let args = arguments;
        if (document.readyState === "interactive" || document.readyState === "complete") {
            console.log("页面已经加载完成，强制初始化框架！");
            setTimeout(doInit, 1);
        } else {
            console.log("页面未加载完成，加载完成后初始化框架！");
            Hybrid.event(document, "DOMContentLoaded", doInit);
        }

        function doInit() {
            if (args.length === 1) {
                callback = args[0];
                config = null;
            }
            if (config) {
                for (let key in config) {
                    Hybrid.config[key] = config[key];
                }
            }
            Hybrid.environment(function (mobile, android, ios) {
                // 为所有的a标签加上URL标识
                let as = null;
                if (mobile && (as = document.getElementsByTagName("a"))) {
                    let href = null;
                    for (let i = 0; i < as.length; i++) {
                        href = as[i].getAttribute("href");
                        if (href && href.length > 0 && href !== "/") {
                            href = href.replace(/\/$/, "");
                            href += href.indexOf("?") === -1 ? "?" : "&";
                            href += Hybrid.config.urlFlagName + "=" + Hybrid.config.urlFlagValue;
                            as[i].setAttribute("href", href);
                        }
                    }
                }
                cb(mobile, android, ios);
            });
        }
    },

    /**
     * 绑定事件
     * @param element 目标元素
     * @param type 事件类型
     * @param fn 事件方法
     */
    event: function (element, type, fn) {
        element.addEventListener(type, fn, false);
    },

    /**
     * 点击事件
     * @param element 目标元素
     * @param fn 事件方法
     */
    click: function (element, fn) {
        Hybrid.event(element, "click", fn);
    },

    /**
     * 注册方法到window对象，原生才能调用js的方法
     * @param name 方法名称
     * @param fn 方法体
     *
     * 当只传入一个参数时，该参数必须是js对象类型
     */
    register: function (name, fn) {
        if (arguments.length === 2) {
            window[name] = fn;
        } else if (arguments.length === 1 && typeof arguments[0] === "object") {
            for (let key in arguments[0]) {
                window[key] = arguments[0][key];
            }
        }
        else {
            throw new Error("未知的函数注册方式");
        }
    },

    /**
     * js调用原生方法
     * @param fn 方法名称
     * @param args 要传递的参数，必须是js对象类型（该参数可不传，代表不传递任何参数）
     * @param callback 方法调用结果的回调（该参数可不传，代表没有任何回调）
     */
    native: function (fn, args, callback) {
        const outArgs = arguments;
        Hybrid.environment(function (mobile, android, ios) {
            if (mobile) {
                let bridge = android ? Hybrid.config.bridge : ios ? window : undefined;

                if (bridge === undefined || typeof bridge[fn] === "undefined") {
                    return;
                }

                if (outArgs.length === 1) {
                    bridge[fn]();
                } else if (outArgs.length >= 2) {
                    if (typeof outArgs[1] !== "object") {
                        throw new Error("需要传递到原生环境的参数必须是js对象类型");
                    }
                    args = JSON.stringify(args);
                    let result = bridge[fn](args);
                    if (typeof callback === "function") {
                        callback(result);
                    }
                }
            } else {
                throw new Error("该方法仅支持移动端");
            }
        });
    },

    /**
     * 浏览器环境检查
     *
     * 只有携带urlFlag的页面，才算是移动端页面（便于区分wap站和WebView加载的页面）
     *
     * @param callback 回调方法
     */
    environment: function (callback) {
        let urlFlag = Hybrid.urlParam(Hybrid.config.urlFlagName);
        // 是否携带移动端WebView标志
        if (!Hybrid.config.strict || urlFlag === Hybrid.config.urlFlagValue) {
            // 只有非严格模式或者携带urlFlag的页面，才算是移动端页面（便于区分wap站和WebView加载的页面）
            callback(Hybrid.browser.versions.mobile, Hybrid.browser.versions.android, Hybrid.browser.versions.ios);
        } else {
            callback();
        }
    },

    /**
     * 获取URL上的参数
     * @param name 参数名
     * @returns string 参数值
     */
    urlParam: function (name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        let result = window.location.search.substr(1).match(reg);
        if (result != null) {
            return decodeURIComponent(result[2]);
        }
        return "";
    },
});