/**
 * listloading
 * xisa
 * 1.1.6(2014-2016)
 */
 /*
    依赖iscroll 
    底层库使用 Zepto 或者 jQuery
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Listloading = factory();
  }
}(this, function() {
    'use strict';

    // 发布订阅
    var publishEvents = (function () {
        var listen,log,obj, one, remove, trigger, __this;
        obj = {};
        __this = this;
        listen = function( key, eventfn ) {  // 订阅
            var stack, _ref;
            stack = ( _ref = obj[key] ) != null ? _ref : obj[ key ] = [];
            return stack.push( eventfn );
        };
        one = function( key, eventfn ) {
            remove( key );
            return listen( key, eventfn );
        };
        remove = function( key ) {  // 解除
            var _ref;
            return ( _ref = obj[key] ) != null ? _ref.length = 0 : void 0;
        };
        trigger = function() {   // 发布
            var fn, stack, _i, _len, _ref, key;
            key = Array.prototype.shift.call( arguments );
            stack = ( _ref = obj[ key ] ) != null ? _ref : obj[ key ] = [];
            for ( _i = 0, _len = stack.length; _i < _len; _i++ ) {
                fn = stack[ _i ];
                if( fn == undefined ) return false;
                if ( fn.apply( __this,  arguments ) === false) {
                    return false;
                }
            }
        }
        return {
            listen: listen,
            one: one,
            remove: remove,
            trigger: trigger
        }
    })();

    // 获取几分钟前、几小时前、几天前等时间差
    function timeDifference (publishTime) {
        var nowTime = Date.parse(new Date());
        var d = (nowTime - publishTime)/1000;
        var d_days = parseInt(d/86400);   // 天
        var d_hours = parseInt(d/3600);   // 时   
        var d_minutes = parseInt(d/60);   // 分
        var d_seconds = parseInt(d);      // 秒
        
        if(d_days > 0 && d_days < 4) {       
            return d_days+"天前";       
        }
        else if(d_days <= 0 && d_hours > 0) {       
            return d_hours + "小时前";       
        }
        else if(d_hours <= 0 && d_minutes > 0) {       
            return d_minutes+"分钟前";       
        }
        else if(d_minutes <= 0 && d_seconds >= 0) {       
            // return d_seconds+"秒前";
            return "刚刚之前";       
        }
        else{       
            var s = new Date(publishTime);
            return s.getFullYear() + '年' + (s.getMonth() + 1) + "月" + s.getDate() + "日 " + s.getHours() + ':' + ':' + s.getMinutes() + ':' + s.getSeconds();
        }
    }

    function Listloading(element, options) {
        this.ele = $(element);
        var id   = this.ele.attr('id');
        // 如果没有ID 则自动创建一个id
        if (!id) {
            id = 'listLoading' + Math.random().toString().replace('0.', '');
            this.ele.attr('id', id);
        }
        this.id       = id;
        this.children = $(this.ele.get(0).children[0]);

        // 如果不配置下拉刷新方法或者直接不传配置 则直接创建iscroll (v1.1.0)
        if (typeof options !== 'object' || !$.isFunction(options.pullDownAction) ) {
            this.iscroll = new IScroll('#' + id, options.iscrollOptions);
            return;
        }
        this.pullUpId   = 'pullUp-' + id;
        this.pullDownId = 'pullDown-' + id;
        this.init(options);
    }

    Listloading.prototype = {
        version: '1.1.6',
        // 初始化
        init: function (options) {
            this.options = {};
            // 上拉刷新文字
            this.options.upLoadmoretxt     = '<i class="icon-up"></i>上拉加载更多';
            // 下拉刷新文字
            this.options.pullDrefreshtxt   = '<i class="icon-down"></i>下拉加载更多';
            // 正在加载中文字
            this.options.loadertxt         = '<i class="icon-loading"></i>正在加载更多';
            // 松开刷新文字
            this.options.Realtimetxt       = '松开刷新';
            // 已经全部加载完毕文字
            this.options.loaderendtxt      = '已显示完全部';
            // 显示区域高度
            this.options.viewHeight        = this.ele.height();

            // 发布订阅注册
            this.options.pullUpActionStr   = 'pullUpActionStr' + this.id;
            this.options.pullDownActionStr = 'pullDownAction' + this.id;

            // 删除发布订阅
            publishEvents.remove(this.options.pullUpActionStr);
            publishEvents.remove(this.options.pullDownActionStr);

            // 继承
            $.extend(this.options, options);
            // 执行render
            this.render();
        },
        // 入口
        render: function () {
            // 创建iscroll
            this.pullDownAction(true);
        },
        // 销毁ListLoading
        destroy: function () {
            // 删除上拉下拉刷新节点
            this.children.css({'-webkit-transform': '', 'transform': ''});
            $('#' + this.pullDownId + ', #' + this.pullUpId).remove();
            this.iscroll.destroy();
        },
        // 刷新listloading
        refresh: function (refresh) {
            // 重新检测是否需要创建上拉加载更多 再做刷新
            this.createPullUpEle(refresh);
        },
        // 创建上拉加载更多
        createPullUpEle: function (refresh) {

            var op             = this.options;
            var children       = this.children;
            children.css('min-height', 'auto');

            var childrenHeight = children.height();
            var pullUpId       = this.pullUpId;
            var viewHeight     = op.viewHeight;
            var pullDownOffset = op.pullDownOffset;
            var iscroll        = this.iscroll;

            op.minScrollHeight = viewHeight + pullDownOffset;   // 最小滚动高度

            // 如果加载更多存在 则不再去load pullUp
            if (this.pullUpEle) {
                // 检测可滚动高度是否小于最小滚动高度
                if(childrenHeight < op.minScrollHeight){
                    this.pullUpEle.remove();
                    this.pullUpEle = null;
                    this.options.pullUpOffset = 0;
                    // 设置最小滚动高度
                    children.css('min-height', op.minScrollHeight);
                }
            } else {
                // 必须有上拉加载方法  可滚动的高度必须大于可显示区域高度才会有上拉加载更多
                if($.isFunction(op.pullUpAction) && childrenHeight > op.minScrollHeight){

                    var html = '<div id="' + pullUpId + '" data-class="pullUpId">' + '<span class="pullUpLabel inlineblock-span">' + op.upLoadmoretxt + '</span></div>';

                    children.append(html);

                    this.pullUpEle = $('#' + pullUpId);

                    // 上拉加载更多容器高度
                    op.pullUpOffset = this.pullUpEle.get(0).offsetHeight;

                }else{
                    // 设置最小滚动高度
                    children.css('min-height', op.minScrollHeight);
                }
            }
            if (iscroll) {

                // 自定义刷新的时候 重置iscroll可以滚动的高度
                if (this.pullUpEle && !refresh) this.pullUpEle.height(0);
                iscroll.refresh();
                // 自定义刷新的时候 重置iscroll可以滚动的高度
                if (this.pullUpEle && !refresh) {
                    this.pullUpEle.removeAttr('style');
                    iscroll.maxScrollY = iscroll.maxScrollY - this.options.pullUpOffset;
                }
                if (iscroll.y === 0 && !refresh) {
                    this.resizeAnimate();
                }
            }
        },
        // 创建上拉下拉刷新节点
        createPullIScroll: function () {
            var op = this.options;
            // 时间
            var timeHtml = '';
            if (op.disableTime) {
                op.endDate = Date.parse(new Date());
                timeHtml = '<span class="time">最后更新时间：<em id="' + this.id + 'time-em">' + timeDifference(op.endDate) + '</em></span>';
            }
            // 下拉加载更多
            var pullDownEle = $('<div id="' + this.pullDownId + '" data-class="pullDownId">' + 
                               '    <span class="pullDownLabel inlineblock-span">' + op.pullDrefreshtxt + '</span>' +
                                    timeHtml + 
                               '</div>');

            pullDownEle.prependTo(this.children);
            this.pullDownEle = pullDownEle;
            this.options.pullDownOffset = pullDownEle.get(0) ? pullDownEle.get(0).offsetHeight : 0;

            // 创建上拉加载更多
            this.createPullUpEle();
        },
        // 设置class和提示
        toggleClassText: function (obj, cls, labelCls, text) {
            obj.attr('class', cls).find('.' + labelCls).html(text);
        },
        // 复位动画
        resizeAnimate: function (y) {
            var iscroll = this.iscroll;
            var pullDownOffset = this.options.pullDownOffset;
            if (!y) {
                y = -pullDownOffset;
            } else {
                // 最大滚动高度
                var maxScrollY = -iscroll.maxScrollY - pullDownOffset;
                // 防止向下滑动两次
                if (-y <= maxScrollY) {
                    y = -maxScrollY;
                }
            }
            iscroll.scrollTo(0, y, 300, IScroll.utils.ease.quadratic);
        },
        // scrollEvent  按下 拖动 停止 三个动作的事件 *****
        scrollEvent: function () {
            var self            = this;
            var op              = this.options;
            var iscroll         = this.iscroll;
            var pullUpId        = this.pullUpId;
            var pullDownEle     = this.pullDownEle;
            var toggleClassText = this.toggleClassText;
            var pullDrefreshtxt = op.pullDrefreshtxt;
            var upLoadmoretxt   = op.upLoadmoretxt;
            var Realtimetxt     = op.Realtimetxt;
            var loadertxt       = op.loadertxt;
            var pullDownOffset  = -op.pullDownOffset;
            
            // 解决微信长按识别二维码
            this.ele.get(0).addEventListener('touchstart', function(e){
                e.returnValue = true;
            });

            // 开始
            iscroll.on('scrollStart', function () {
                var pullUpEle = self.pullUpEle;
                // 开始下拉时间
                self.startPullTime = new Date().getTime();
                // 是否显示时间
                if (op.disableTime) {
                    $('#' + self.id + 'time-em').html(timeDifference(op.endDate));
                }
                
                // 下拉
                if (pullDownEle && pullDownEle.hasClass('loading')) {
                    // 设置class和提示
                    toggleClassText(pullDownEle, '', 'pullDownLabel', pullDrefreshtxt);
                }
                // 上拉
                else if (pullUpEle && pullUpEle.hasClass('loading')) {
                    // 设置class和提示
                    toggleClassText(pullUpEle, '', 'pullUpLabel', upLoadmoretxt);
                }
            });

            // 移动
            iscroll.on('scrollMove', function(){
                var y = this.y;
                var maxScrollY     = this.maxScrollY;
                var pullUpEle      = self.pullUpEle;
                var gapY           = 5;  // 拖动的距离
                var pullDownEleCls = pullDownEle.hasClass('flip');
                var pullUpEleCls   = pullUpEle && pullUpEle.hasClass('flip');
                
                // 下拉刷新 显示向上图标
                if ( y > gapY && !pullDownEleCls ) {
                    // 设置class和提示
                    toggleClassText(pullDownEle, 'flip', 'pullDownLabel', '<i class="icon-up"></i>' + Realtimetxt);
                }
                // 下拉刷新
                else if (y < gapY && pullDownEleCls) {
                    // 设置class和提示
                    toggleClassText(pullDownEle, '', 'pullDownLabel', pullDrefreshtxt);
                } 
                else if (pullUpEle && y < (maxScrollY - gapY) && !pullUpEleCls) {
                    // 设置class和提示
                    toggleClassText(pullUpEle, 'flip', 'pullUpLabel', '<i class="icon-down"></i>' + Realtimetxt);
                } 
                else if (pullUpEle && y > (maxScrollY + gapY) && pullUpEleCls) {
                    // 设置class和提示
                    toggleClassText(pullUpEle, '', 'pullUpLabel', upLoadmoretxt);
                }
            });

            // 结束
            iscroll.on('scrollEnd', function(){
                var y = this.y;
                var maxScrollY = this.maxScrollY;
                var pullUpEle  = self.pullUpEle;
                var nowDate    = new Date();

                // 滚动到底自动加载更多
                if(y === maxScrollY && pullUpEle){
                    toggleClassText(pullUpEle, 'flip', 'pullUpLabel', Realtimetxt);
                }
                // 下拉结束事件
                self.endPullTime     = nowDate.getTime();
                // 间隔时间
                self.totalGapTime    = self.endPullTime - self.startPullTime;
                // 结束时间戳
                self.options.endDate = Date.parse(nowDate);
                
                // 防止拖动过快卡屏
                if( self.totalGapTime < 200 ) {
                    if(y > pullDownOffset && y < 1){
                        // 复位动画
                        self.resizeAnimate();
                    }
                    return;
                }
                if (pullDownEle && pullDownEle.hasClass('flip')) {
                    // 设置class和提示
                    toggleClassText(pullDownEle, 'loading', 'pullDownLabel', loadertxt);    
                    // 下拉刷新     
                    self.pullDownAction();
                }
                else if (pullUpEle && pullUpEle.hasClass('flip')) {
                    // 设置class和提示
                    toggleClassText(pullUpEle, 'loading', 'pullUpLabel', loadertxt);
                    // 上拉加载更多
                    self.pullUpAction();
                }
                else if (y > pullDownOffset && y < 1) {
                    // 复位动画
                    self.resizeAnimate();
                } else if (-maxScrollY >= -y && (maxScrollY + op.pullUpOffset) > y) {
                    // 复位动画
                    self.resizeAnimate(maxScrollY + op.pullUpOffset);
                }
            });
        },
        // 下拉刷新     
        pullDownAction: function (flag) {
            
            // 防止暴力拖拽 计算拖拽的间隔时间
            var intervals         = new Date().getTime() - this.startPullTime;

            var self              = this;
            var op                = this.options;
            var pullDownAction    = op.pullDownAction;
            var pullDownActionStr = op.pullDownActionStr;
            var id                = $('#' + self.id);

            if ($.isFunction(pullDownAction)) {
                // 创建iscroll
                if (!this.iscroll) {
                    publishEvents.listen(pullDownActionStr, function(){
                        // 创建上拉下拉刷新节点
                        self.createPullIScroll();

                        // 默认iscroll配置
                        var obj = {
                            // preventDefault为false这行就是解决onclick失效问题
                            // 为true就是阻止事件冒泡,所以onclick没用  但是开启这个值在微信下面拖动会有问题  滑动结束之后触发不到scrollend
                            // preventDefault: false,
                            startY : -op.pullDownOffset,
                            listLoading: true, // iscroll中_move  433行  刷新bug
                            scrollbars: true   // 显示iscroll滚动条
                            // probeType: 3   // 这个属性是调节在scroll事件触发中探针的活跃度或者频率。有效值有：1, 2, 3。数值越高表示更活跃的探测。探针活跃度越高对CPU的影响就越大。  iscroll-probe.js
                        }

                        // 继承覆盖默认iscroll配置
                        $.extend(obj, op.iscrollOptions);

                        // 创建IScroll
                        self.iscroll = new IScroll('#' + self.id, obj);

                        // iscroll事件
                        self.scrollEvent();
                        // 移除订阅
                        publishEvents.remove(pullDownActionStr);
                    });
                    // 回调
                    pullDownAction(function () {
                        // 执行订阅方法
                        publishEvents.trigger(pullDownActionStr);
                    }, flag);
                }
                // 防止暴力拖拽
                if (intervals >= 400) {
                    publishEvents.listen(pullDownActionStr, function(){
                        // 重新刷新检测是否需要上拉加载更多
                        self.refresh(true);

                        var pullUpEle = self.pullUpEle;
                        // 加载文字
                        if(pullUpEle) {
                            pullUpEle.find('.pullUpLabel').html(op.upLoadmoretxt);
                        } else {
                            // 是否重新需要创建上拉加载更多
                            self.createPullUpEle();
                        }
                        // 加载完毕让动画停留1秒
                        setTimeout(function () {
                            $('body').removeClass('iscroll');
                            // 复位动画
                            self.resizeAnimate();

                            // 数据加载完成后，调用界面更新方法
                            self.iscroll.refresh();
                            // 移除订阅
                            publishEvents.remove(pullDownActionStr);
                        }, 1000);
                    });
                    // 回调
                    pullDownAction(function () {
                        // 加载中禁止拖动
                        $('body').addClass('iscroll');
                        // 执行订阅方法
                        publishEvents.trigger(pullDownActionStr);
                    }, flag);
                }
            }
            
        },
        // 上拉加载更多
        pullUpAction: function () {
            var self            = this;
            // 防止暴力拖拽 计算拖拽的间隔时间
            var intervals       = new Date().getTime() - self.startPullTime;
            var op              = self.options;
            var pullUpAction    = op.pullUpAction;
            var pullUpActionStr = op.pullUpActionStr;
            var iscroll         = self.iscroll;

            if( $.isFunction(pullUpAction)) {
                var top = iscroll.y + op.pullUpOffset;
                if (intervals >= 400){
                    publishEvents.listen(pullUpActionStr, function(){
                        // 重新刷新检测是否需要上拉加载更多
                        self.refresh(true);
                        var pullUpEle  = self.pullUpEle;

                        var loaderText = op.loaderendtxt;
                        // 数据全部加载完毕
                        if( op.pullEnd ){
                            // 加载完毕让动画停留1秒
                            setTimeout(function () {
                                $('body').removeClass('iscroll');
                                // 复位动画
                                self.resizeAnimate(top);
                            }, 1000);
                        }else{
                            $('body').removeClass('iscroll');
                            loaderText = op.upLoadmoretxt;
                            // 数据加载完成后，调用界面更新方法
                            iscroll.refresh();
                        }
                        // 显示加载完毕文字
                        pullUpEle.find('.pullUpLabel').html(loaderText);
                        
                        // 移除订阅
                        publishEvents.remove(pullUpActionStr);

                    });
                    // 回调
                    pullUpAction(function (pullEnd) {
                        // 加载中禁止拖动
                        $('body').addClass('iscroll');
                        // 检查下拉是否完毕
                        op.pullEnd = pullEnd;
                        // 执行订阅方法
                        publishEvents.trigger(pullUpActionStr);
                    });
                } else {
                    // 复位动画
                    self.resizeAnimate(top);
                }
            }
        },
        // 点击事件
        evt: function Events(element, type, eventHandle, flg){
            var touchable = "ontouchstart" in window;
            var clickEvent = touchable ? "touchstart" : "click",
                mouseDownEvent = touchable ? "touchstart" : "mousedown",
                mouseUpEvent = touchable ? "touchend" : "mouseup",
                mouseMoveEvent = touchable ? "touchmove" : "mousemove",
                mouseMoveOutEvent = touchable ? "touchleave" : "mouseout";
            var _returnData = function(evt){
                var neweEvt = {};
                var cev = evt.originalEvent;
                if( cev == undefined ) {
                    cev = evt;
                }
                if(cev.changedTouches){
                    neweEvt.pageX = cev.changedTouches[0].pageX;
                    neweEvt.pageY = cev.changedTouches[0].pageY;
                    neweEvt.clientX = cev.changedTouches[0].clientX;
                    neweEvt.clientY = cev.changedTouches[0].clientY;
                }else{
                    neweEvt.pageX = evt.pageX;
                    neweEvt.pageY = evt.pageY;
                    neweEvt.clientX = evt.clientX;
                    neweEvt.clientY = evt.clientY;
                }
                neweEvt.evt = evt;
                return neweEvt;
            };
            var getTouchPos = function(e){
                return { x : e.clientX , y: e.clientY };
            }
            //计算两点之间距离
            var getDist = function(p1 , p2){
                if(!p1 || !p2) return 0;
                return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
            };
            var _onClick = function(dom, evt, callback){
                var neweEvt = _returnData(evt);
                callback(dom, neweEvt);
            };
            var _onClickDown = function(dom, evt, callback){
                var neweEvt = _returnData(evt);
                callback(dom, neweEvt);
            };
            var _onClickUp = function(dom, evt, callback){
                var neweEvt = _returnData(evt);
                callback(dom, neweEvt);
            };
            var _onMove = function(dom, evt, callback){
                var neweEvt = _returnData(evt);
                callback(dom, neweEvt);
            };
            var _onOut = function(evt, callback){
                var neweEvt = _returnData(evt);
                callback(dom, neweEvt);
            };
            var rootEle = this.ele;
            if( flg == undefined ) {
                flg = true;
            }
            
            switch(type){
                case "mousemove" :
                case "touchmove" :
                    if( flg ) {
                        rootEle.off(mouseMoveEvent, element);
                    }
                    rootEle.on(mouseMoveEvent, element, function(e){
                        _onMove($(this), e, eventHandle);
                    });
                    break;
                case "click" :
                case "tap" :
                    //按下松开之间的移动距离小于20，认为发生了tap
                    var TAP_DISTANCE = 20;
                    var pt_pos;
                    var ct_pos;
                    var startEvtHandler = function(e){
                        var ev = _returnData(e);
                        ct_pos = getTouchPos(ev);
                    };
                    var endEvtHandler = function(dom_,e, fn){
                        // e.stopPropagation();
                        var ev = _returnData(e);
                        var now = Date.now();
                        var pt_pos = getTouchPos(ev);
                        var dist = getDist(ct_pos , pt_pos);
                        if(dist < TAP_DISTANCE) {
                            _onClick(dom_, e, eventHandle);
                        }
                    };
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        if(e.button != 2){ // 防止右键点击触发事件
                            startEvtHandler(e);
                        }
                    });
                    rootEle.on(mouseUpEvent, element, function(e){
                        if(e.button != 2){ // 防止右键点击触发事件
                            var $this = $(this);
                            endEvtHandler($this,e,eventHandle);
                        }
                    });
                    break;
                case "mousedown" :
                case "touchstart" :
                    if( flg ) {
                        rootEle.off(mouseDownEvent, element);
                    }
                    rootEle.on(mouseDownEvent, element, function(e){
                        _onClickDown($(this), e, eventHandle);
                    });
                    break;
                case "mouseup" :
                case "touchend" :
                    if( flg ) {
                        rootEle.off(mouseUpEvent, element);
                    }
                    rootEle.on(mouseUpEvent, element, function(e){
                        _onClickUp($(this), e, eventHandle);
                    });
                    break;
                case "mouseout" :
                    if( flg ) {
                        rootEle.off(mouseMoveOutEvent, element);
                    }
                    rootEle.on(mouseMoveOutEvent, element, function(e){
                        endEvtHandler(e, eventHandle);
                    });
                    break;
            }
        }
    }

    return Listloading;
}));
