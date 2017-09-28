/**
 * InfiniteScroll Plugin
 */
!function (window) {
    "use strict";

    var util = window.YDUI.util;

    function InfiniteScroll (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, InfiniteScroll.DEFAULTS, options || {});
        this.init();
    }

    /**
     * 默认参数
     */
    InfiniteScroll.DEFAULTS = {
        binder: window, // 绑定浏览器滚动事件DOM
        initLoad: true, // 是否初始化加载第一屏数据
        pageSize: 0, // 每页请求的数据量
        loadingHtml: '加载中...', // 加载中提示，支持HTML
        doneTxt: '没有更多数据了', // 加载完毕提示
        backposition: false, // 是否从详情页返回列表页重新定位之前位置
        jumpLink: '', // 跳转详情页链接元素
        loadListFn: null, // 加载数据方法
        loadStorageListFn: null // 加载SesstionStorage数据方法
    };

    /**
     * 初始化
     */
    InfiniteScroll.prototype.init = function () {
        var _this = this,
            options = _this.options,
            _location = window.location;

        if (~~options.pageSize <= 0) {
            console.error('[YDUI warn]: 需指定pageSize参数【即每页请求数据的长度】');
            return;
        }

        // 获取页面唯一键，防止多个页面调用数据错乱
        var primaryKey = _location.pathname.toUpperCase().replace(/\/?\.?/g, '');
        if (!primaryKey) {
            primaryKey = 'YDUI_' + _location.host.toUpperCase().replace(/\/?\.?:?/g, '');
        }

        // 保存返回页面定位所需参数的键名
        _this.backParamsKey = primaryKey + '_BACKPARAMS';
        // 保存列表数据的键名
        _this.backParamsListKey = primaryKey + '_LIST_';

        // 在列表底部添加一个标记，用其判断是否滚动至底部
        _this.$element.append(_this.$tag = $('<div class="J_InfiniteScrollTag"></div>'));

        // 初始化赋值列表距离顶部的距离(比如去除导航的高度距离)，用以返回列表定位准确位置
        _this.listOffsetTop = _this.$element.offset().top;

        _this.initLoadingTip();

        // 是否初始化就需要加载第一屏数据
        if (options.initLoad) {
            if (!options.backposition) {
                _this.loadList();
            } else {
                // !util.localStorage.get(_this.backParamsKey) && _this.loadList();
                !util.sessionStorage.get(_this.backParamsKey) && _this.loadList();
            }
        }

        _this.bindScrollEvent();

        if (options.backposition) {
            _this.loadListFromStorage();

            _this.bindLinkEvent();
        }
    };

    /**
     * 初始化加载中提示
     */
    InfiniteScroll.prototype.initLoadingTip = function () {
        var _this = this;

        _this.$element.append(_this.$loading = $('<div class="list-loading">' + _this.options.loadingHtml + '</div>'));
    };

    /**
     * 滚动页面至SesstionStorage储存的坐标
     */
    InfiniteScroll.prototype.scrollPosition = function () {
        var _this = this,
            options = _this.options,
            $binder = $(options.binder);

        var backParams = util.sessionStorage.get(_this.backParamsKey);

        // 滚动页面
        backParams && $binder.stop().animate({scrollTop: backParams.offsetTop}, 0, function () {
            _this.scrolling = false;
        });

        options.backposition && _this.bindLinkEvent();

        // 释放页面滚动权限
        util.pageScroll.unlock();

        // 删除保存坐标页码的存储
        util.sessionStorage.remove(_this.backParamsKey);
    };

    /**
     * 给浏览器绑定滚动事件
     */
    InfiniteScroll.prototype.bindScrollEvent = function () {
        var _this = this,
            $binder = $(_this.options.binder),
            isWindow = $binder.get(0) === window,
            contentHeight = isWindow ? $(window).height() : $binder.height();

        $binder.on('scroll.ydui.infinitescroll', function () {

            if (_this.loading || _this.isDone)return;

            var contentTop = isWindow ? $(window).scrollTop() : $binder.offset().top;

            // 当浏览器滚动到底部时，此时 _this.$tag.offset().top 等于 contentTop + contentHeight
            if (_this.$tag.offset().top <= contentTop + contentHeight + contentHeight / 10) {
                _this.loadList();
            }
        });
    };

    /**
     * 跳转详情页前处理操作
     * description: 点击跳转前储存当前位置以及页面，之后再跳转
     */
    InfiniteScroll.prototype.bindLinkEvent = function () {
        var _this = this,
            options = _this.options;

        if (!options.jumpLink) {
            console.error('[YDUI warn]: 需指定跳转详情页链接元素');
            return;
        }

        $(_this.options.binder).on('click.ydui.infinitescroll', _this.options.jumpLink, function (e) {
            e.preventDefault();

            var $this = $(this),
                page = $this.data('page');

            if (!page) {
                console.error('[YDUI warn]: 跳转链接元素需添加属性[data-page="其所在页码"]');
                return;
            }

            // 储存top[距离顶部的距离]与page[页码]
            util.sessionStorage.set(_this.backParamsKey, {
                offsetTop: $(_this.options.binder).scrollTop() + $this.offset().top - _this.listOffsetTop,
                page: page
            });

            location.href = $this.attr('href');
        });
    };

    /**
     * 加载数据
     */
    InfiniteScroll.prototype.loadList = function () {
        var _this = this,
            options = _this.options;

        _this.loading = true;
        _this.$loading.show();

        if (typeof options.loadListFn == 'function') {

            // 监听外部获取数据方法，以便获取数据
            options.loadListFn().done(function (listArr, page) {
                var len = listArr.length;

                if (~~len <= 0) {
                    console.error('[YDUI warn]: 需在 resolve() 方法里回传本次获取记录集合');
                    return;
                }

                // 当请求的数据小于pageSize[每页请求数据数]，则认为数据加载完毕，提示相应信息
                if (len < options.pageSize) {
                    _this.$element.append('<div class="list-donetip">' + options.doneTxt + '</div>');
                    _this.isDone = true;
                }
                _this.$loading.hide();
                _this.loading = false;

                // 将请求到的数据存入SessionStorage
                if (options.backposition) {
                    util.sessionStorage.set(_this.backParamsListKey + page, listArr);
                }
            });
        }
    };

    /**
     * 从SessionStorage取出数据
     */
    InfiniteScroll.prototype.loadListFromStorage = function () {
        var _this = this,
            storage = util.sessionStorage.get(_this.backParamsKey);

        if (!storage)return;

        // 锁定页面禁止滚动
        util.pageScroll.lock();

        // 总需滚动的页码数
        var pageTotal = storage.page;

        var listArr = [];

        // 根据页码从Storage获取数据所需数据
        for (var i = 1; i <= pageTotal; i++) {
            var _list = util.sessionStorage.get(_this.backParamsListKey + i);

            listArr.push({
                page: i,
                list: _list
            });

            // 判断跳转前数据是否加载完毕
            if (i == pageTotal && _list.length < _this.options.pageSize) {
                _this.$element.append('<div class="list-donetip">' + _this.options.doneTxt + '</div>');
                _this.$loading.hide();
                _this.loading = false;
                _this.isDone = true;
            }
        }

        // 将数据传出外部方法，直至其通知已插入页面后滚动至相应位置
        _this.options.loadStorageListFn(listArr, pageTotal + 1).done(function () {
            _this.scrollPosition();
        });
    };

    function Plugin (option) {
        return this.each(function () {
            new InfiniteScroll(this, option);
        });
    }

    $.fn.infiniteScroll = Plugin;

}(window);
