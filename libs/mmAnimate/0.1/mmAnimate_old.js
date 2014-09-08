define("mmAnimate", ["avalon"], function(avalon) {
    //提供以下原型方法
    //fx, fadeIn fadeToggle fadeOut slideUp, slideDown slideToggle show hide toggle delay resume stop
    var easingMap = {
        "linear": [0.250, 0.250, 0.750, 0.750],
        "ease": [0.250, 0.100, 0.250, 1.000],
        "easeIn": [0.420, 0.000, 1.000, 1.000],
        "easeOut": [0.000, 0.000, 0.580, 1.000],
        "easeInOut": [0.420, 0.000, 0.580, 1.000],
        "easeInQuad": [0.550, 0.085, 0.680, 0.530],
        "easeInCubic": [0.550, 0.055, 0.675, 0.190],
        "easeInQuart": [0.895, 0.030, 0.685, 0.220],
        "easeInQuint": [0.755, 0.050, 0.855, 0.060],
        "easeInSine": [0.470, 0.000, 0.745, 0.715],
        "easeInExpo": [0.950, 0.050, 0.795, 0.035],
        "easeInCirc": [0.600, 0.040, 0.980, 0.335],
        "easeInBack": [0.600, -0.280, 0.735, 0.045],
        "easeOutQuad": [0.250, 0.460, 0.450, 0.940],
        "easeOutCubic": [0.215, 0.610, 0.355, 1.000],
        "easeOutQuart": [0.165, 0.840, 0.440, 1.000],
        "easeOutQuint": [0.230, 1.000, 0.320, 1.000],
        "easeOutSine": [0.390, 0.575, 0.565, 1.000],
        "easeOutExpo": [0.190, 1.000, 0.220, 1.000],
        "easeOutCirc": [0.075, 0.820, 0.165, 1.000],
        "easeOutBack": [0.175, 0.885, 0.320, 1.275],
        "easeInOutQuad": [0.455, 0.030, 0.515, 0.955],
        "easeInOutCubic": [0.645, 0.045, 0.355, 1.000],
        "easeInOutQuart": [0.770, 0.000, 0.175, 1.000],
        "easeInOutQuint": [0.860, 0.000, 0.070, 1.000],
        "easeInOutSine": [0.445, 0.050, 0.550, 0.950],
        "easeInOutExpo": [1.000, 0.000, 0.000, 1.000],
        "easeInOutCirc": [0.785, 0.135, 0.150, 0.860],
        "easeInOutBack": [0.680, -0.550, 0.265, 1.550],
        "custom": [0.000, 0.350, 0.500, 1.300],
        "random": [Math.random().toFixed(3),
            Math.random().toFixed(3),
            Math.random().toFixed(3),
            Math.random().toFixed(3)]
    }

    //http://css3playground.com/flip-card.php
    var animation = avalon.cssName("animation"),
            animationend;
    var prefixJS = animation.replace(/animation/i, "");
    var prefixCSS = prefixJS === "" ? "" : "-" + prefixJS.toLowerCase() + "-";

    var animationend = avalon.eventMap.animationend
    var playState = avalon.cssName("animation-play-state");
    var rfxnum = /^([+\-/*]=)?([\d+.\-]+)([a-z%]*)$/i;
    //=================================参数处理==================================
    function eachNode(that, callback) {
        var node = that[0]
        if (node && node.nodeType === 1) {
            callback.call(node, node)
        }
        return that
    }

    var rformat = /\\?\#{([^{}]+)\}/gm
    function format(str, object) {
        var array = avalon.slice(arguments, 1);
        return str.replace(rformat, function(match, name) {
            if (match.charAt(0) === "\\")
                return match.slice(1);
            var index = Number(name);
            if (index >= 0)
                return array[index];
            if (object && object[name] !== void 0)
                return object[name];
            return '';
        });
    }

    function addOption(opts, p) {
        switch (typeof p) {
            case "object":
                avalon.mix(opts, p);
                delete p.props;
                break;
            case "number":
                opts.duration = p;
                break;
            case "string":
                opts.easing = p;
                break;
            case "function":
                opts.complete = p;
                break;
        }
    }

    function addOptions(duration) {
        var opts = {};
        //如果第二参数是对象
        for (var i = 1; i < arguments.length; i++) {
            addOption(opts, arguments[i]);
        }
        duration = opts.duration;
        duration = /^\d+(ms|s)?$/.test(duration) ? duration + "" : "400ms";
        if (duration.indexOf("s") === -1) {
            duration += "ms";
        }
        opts.duration = duration;
        opts.effect = opts.effect || "fx";
        opts.queue = !!(opts.queue == null || opts.queue); //默认使用列队
        opts.easing = easingMap[opts.easing] ? opts.easing : "easeIn";
        return opts;
    }

    //.fx( properties [, duration ] [, easing ] [, complete ] )
    //.fx( properties, options )
    //两种传参方式,最后都被整成后面一种
    avalon.fn.fx = function(props) {
        var delay = arguments.length === 1 && isFinite(props);//如果只传入时间,就当作延迟
        var opts = {
            queue: true
        };
        if (!delay) {
            opts = addOptions.apply(null, arguments);
            for (var name in props) {
                var p = avalon.cssName(name) || name;
                if (name !== p) {
                    props[p] = props[name]; //转换为驼峰风格并加上必要的私有前缀
                    delete props[name];
                }
            }
        }
        var id = setTimeout("1");//此对象引用的所有元素都共用同一类名,类名是在这id加工而来
        return eachNode(this, function(node) {
            var queue = node.fxQueue || (node.fxQueue = []);
            if (!opts.queue) { //如果不用排队,立即执行
                startAnimation(node, id, props, opts);
            } else {
                if (delay) {
                    queue.push(props); //放入时间
                } else {
                    queue.push([id, props, opts]);
                }
                nextAnimation(node, queue); //通过此方法决定执行与否
            }
        })
    };


    var AnimationRegister = {};
    //CSSStyleRule的模板
    var classRule = "#menu .#{className}{ #{prefix}animation: #{frameName} #{duration} #{easing} " +
            "#{count} #{direction}!important; #{prefix}animation-fill-mode:#{mode}!important;  }";
    //CSSKeyframesRule的模板
    var frameRule = "@#{prefix}keyframes #{frameName}{ 0%{ #{from} } 100%{  #{to} }  }";
    var rautoName = /width|height|top|left/, rautoValue = new RegExp("^$|auto");
    function startAnimation(node, id, props, opts) {
        var effectName = opts.effect;
        var className = "fx_" + effectName + "_" + id;
        var frameName = "keyframe_" + effectName + "_" + id;
        //这里可能要做某些处理, 比如隐藏元素要进行动画, display值不能为none
        var hidden = avalon.css(node, "display") === "none";
        var preproccess = AnimationPreproccess[effectName];
        if (typeof preproccess === "function") {
            var ret = preproccess(node, hidden, props, opts);
            if (ret === false) {
                return;
            }
        }
        if (node.style.display == "none") {
            node.style.display = ""
        }
        //各种回调
        var after = opts.after || avalon.noop;
        var before = opts.before || avalon.noop;
        var complete = opts.complete || avalon.noop;
        var from = [],
                to = [];
        var count = AnimationRegister[className];
        node[className] = props;//保存到元素上，方便stop方法调用
        //让一组元素共用同一个类名
        if (!count) {
            //如果样式表中不存在这两条样式规则
            count = AnimationRegister[className] = 0;
            avalon.each(props, function(key, val) {
                var selector = key.replace(/[A-Z]/g, function(a) {
                    return "-" + a.toLowerCase();
                });
                var parts;
                //处理show toggle hide三个特殊值
                if (val === "toggle") {
                    val = hidden ? "show" : "hide";
                }
                //http://stackoverflow.com/questions/6221411/any-perspectives-on-height-auto-for-css3-transitions-and-animations
                //http://www.cnblogs.com/rubylouvre/archive/2009/09/04/1559557.html
                if (rautoName.test(key) && rautoValue.test(node.style[key])) {
                    node.style[key] = avalon(node).css(key)
                }

                if (val === "show") {
                    from.push(selector + ":0" + (avalon.cssNumber[key] ? "" : "px"));
                } else if (val === "hide") { //hide
                    to.push(selector + ":0" + (avalon.cssNumber[key] ? "" : "px"));
                } else if (parts = rfxnum.exec(val)) {
                    var delta = parseFloat(parts[2]);
                    var unit = avalon.cssNumber[key] ? "" : (parts[3] || "px");
                    if (parts[1]) { //操作符
                        var operator = parts[1].charAt(0);
                        var init = parseFloat(avalon.css(node, key));
                        try {
                            delta = eval(init + operator + delta);
                        } catch (e) {
                            avalon.error("使用-=/+=进行递增递减操作时,单位只能为px, deg", TypeError);
                        }
                    }
                    to.push(selector + ":" + delta + unit);
                } else {
                    to.push(selector + ":" + val);
                }
            });
            var easing = "cubic-bezier( " + easingMap[opts.easing] + " )";
            var mode = effectName === "hide" || effectName == "slideUp" ? "backwards" : "forwards";
            //填空数据
            var rule1 = format(classRule, {
                className: className,
                duration: opts.duration,
                easing: easing,
                frameName: frameName,
                mode: mode,
                prefix: prefixCSS,
                count: opts.revert ? 2 : 1,
                direction: opts.revert ? "alternate" : ""
            });

            var rule2 = format(frameRule, {
                frameName: frameName,
                prefix: prefixCSS,
                from: from.join(";"),
                to:  to.join(";")
            });

            insertCSSRule(rule1);
            insertCSSRule(rule2);
        }
        AnimationRegister[className] = count + 1;
        var fxFn = avalon.bind(node, animationend, function(event) {
            avalon.unbind(node, animationend, fxFn);
            var styles = window.getComputedStyle(node, null);
            // 保存最后的样式
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    node.style[i] = styles[i];
                }
            }
            if (effectName == "slideUp") {
                node.style.display = "none"
            }
            node.classList.remove(className); //移除类名
            stopAnimation(className); //尝试移除keyframe
            after.call(node);
            complete.call(node);
            var queue = node.fxQueue
            if (opts.queue && queue) { //如果在列状,那么开始下一个动画
                queue.busy = 0;
                nextAnimation(node, queue);
            }
        });
        before.call(node);
        node.classList.add(className);
    }
    function nextAnimation(node, queue) {
        if (!queue.busy) {
            queue.busy = 1;
            var args = queue.shift();
            if (isFinite(args)) {//如果是数字
                setTimeout(function() {
                    queue.busy = 0;
                    nextAnimation(node, queue);
                }, args);
            } else if (Array.isArray(args)) {
                startAnimation(node, args[0], args[1], args[2]);
            } else {
                queue.busy = 0;
            }
        }
    }
    function stopAnimation(className) {
        var count = AnimationRegister[className];
        if (count) {
            AnimationRegister[className] = count - 1;
            if (AnimationRegister[className] <= 0) {
                var frameName = className.replace("fx", "keyframe");
                deleteKeyFrames(frameName);
                deleteCSSRule("." + className);
            }
        }
    }
    var AnimationPreproccess = {
        show: function(node, hidden, props) {
            if (hidden) {
                var display = avalon.parseDisplay(node.nodeName);
                node.style.display = display;
                if ("width" in props || "height" in props) { //如果是缩放操作
                    if (display === "inline" && avalon.css(node, "float") === "none") {
                        node.style.display = "inline-block";
                    }
                }
            }
        },
        hide: function(node, hidden, props, opts) {
            if (hidden) {
                return false;
            }
            var style = node.style,
                    overflows;
            if ("width" in props || "height" in props) { //如果是缩放操作
                //确保内容不会溢出,记录原来的overflow属性，因为IE在改变overflowX与overflowY时，overflow不会发生改变
                overflows = [style.overflow, style.overflowX, style.overflowY];
                style.overflow = "hidden";
            }
            var after = opts.after || avalon.noop;
            opts.after = function() {
                this.style.display = "none";
                if (overflows) {
                    ["", "X", "Y"].forEach(function(postfix, index) {
                        style["overflow" + postfix] = overflows[index];
                    });
                }
                after.call(this);
            };
        },
        toggle: function(node, hidden) {
            var fn = AnimationPreproccess[hidden ? "show" : "hide"];
            return fn.apply(null, arguments);
        }
    };
    //========================样式规则相关辅助函数==================================

    var styleElement;

    function insertCSSRule(rule) {
        if (!styleElement) {
            styleElement = document.getElementById("avalonStyle")
        }
        //动态插入一条样式规则
        try {
            var sheet = styleElement.sheet;// styleElement.styleSheet;
            var cssRules = sheet.cssRules; // sheet.rules;
            sheet.insertRule(rule, cssRules.length);
        } catch (e) {
           // avalon.log(e.message + rule);
        }
    }

    function deleteCSSRule(ruleName, keyframes) {
        //删除一条样式规则
        var prop = keyframes ? "name" : "selectorText";
        var name = keyframes ? "@keyframes " : "cssRule ";//调试用
        if (styleElement) {
            var sheet = styleElement.sheet;// styleElement.styleSheet;
            var cssRules = sheet.cssRules;// sheet.rules;
            for (var i = 0, n = cssRules.length; i < n; i++) {
                var rule = cssRules[i];
                if (rule[prop] === ruleName) {
                    sheet.deleteRule(i);
                //    avalon.log("已经成功删除" + name + " " + ruleName);
                    break;
                }
            }
        }
    }

    function deleteKeyFrames(name) {
        //删除一条@keyframes样式规则
        deleteCSSRule(name, true);
    }
    //=============================各种合成动画==================================
    var fxAttrs = [
        ["height", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
        ["width", "marginLeft", "marginRight", "borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],
        ["opacity"]
    ];

    function genFx(type, num) { //生成属性包
        var obj = {};
        fxAttrs.concat.apply([], fxAttrs.slice(0, num)).forEach(function(name) {
            obj[name] = type;
        });
        return obj;
    }

    var effects = {
        slideDown: genFx("show", 1),
        slideUp: genFx("hide", 1),
        slideToggle: genFx("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    };

    avalon.each(effects, function(method, props) {
        avalon.fn[method] = function() {
            var args = [].concat.apply([props, {
                    effect: method
                }], arguments);
            return avalon.fn.fx.apply(this, args);
        };
    });
    ["toggle", "show", "hide"].forEach(function(name, i) {
        var pre = avalon.fn[name];
        avalon.fn[name] = function(a) {
            if (!arguments.length || typeof a === "boolean") {
                return pre.apply(this, arguments);
            } else {
                var args = [].concat.apply([genFx(name, 3), {
                        effect: name
                    }], arguments);
                return avalon.fn.fx.apply(this, args);
            }
        };
    });
    //=============================stop delay pause resume========================
    var duration = avalon.cssName("animation-duration");
    //如果clearQueue为true，是否清空列队
    //如果gotoEnd 为true，是否跳到此动画最后一帧
    avalon.fn.stop = function(clearQueue, gotoEnd) {
        return eachNode(this, function(node) {
            var queue = node.fxQueue || [], inline = node.style;
            for (var j = 0, cls; cls = node.classList[j++]; ) {
                if (/fx_\w+_\d+/.test(cls)) {
                    inline[playState] = "paused";
                    if (gotoEnd) {
                        inline[duration] = "1ms";//让动画都一闪而过
                        inline[playState] = "running";
                    }
                    var names = node[cls];
                    var computed = window.getComputedStyle(node, null);
                    for (var name in names) {
                        inline[name] = computed[name];
                    }
                    if (clearQueue) {
                        queue.length = 0;
                    }
                    inline[playState] = "running";
                    node.classList.remove(cls);
                    delete node[cls];
                    queue.busy = 0;
                    stopAnimation(cls);
                    if (!clearQueue && gotoEnd) {
                        inline[duration] = "";//只闪过当前的
                    }
                    setTimeout(function() {
                        inline[duration] = "";//闪过所有的
                    }, 35);
                    nextAnimation(node, queue);
                }
            }
        });
    };

    avalon.fn.delay = function(number) {
        return this.fx(number);
    };

    avalon.fn.pause = function() {
        return eachNode(this, function() {
            this.style[playState] = "paused";
        });
    };
    avalon.fn.resume = function() {
        return eachNode(this, function() {
            this.style[playState] = "running";
        });
    };
    if (!animationend) {
        if (window.jQuery) {
            var jQueryFn = jQuery.fn
            "anmate,show,hide,toggle,slideDown,slideUp,slideToggle,fadeIn,fadeOut,fadeToggle,delay,stop".replace(avalon.rword, function(method) {
                var name = method === "anmate" ? "fx" : "method"
                avalon.fn[name] = function() {
                    jQuery(this[0])[method].apply(jQueryFn, arguments)
                    return this
                }
            })
        } else {
            avalon.log("请自行加载jQuery1.9以兼容IE6-9")
        }

    }
    return avalon;
});