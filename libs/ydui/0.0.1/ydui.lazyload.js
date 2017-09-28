/**
 * LazyLoad Plugin
 * @example $(selector).find("img").lazyLoad();
 */
!function (window) {
    "use strict";

    function LazyLoad (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, LazyLoad.DEFAULTS, options || {});
        this.init();
    }

    LazyLoad.DEFAULTS = {
        attr: 'data-url',
        binder: window,
        placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQIHWN4BQAA7ADrKJeAMwAAAABJRU5ErkJggg=='
    };

    LazyLoad.prototype.init = function () {
        var _this = this;

        _this.bindImgEvent();

        _this.loadImg();

        $(_this.options.binder).on('scroll.ydui.lazyload', function () {
            _this.loadImg();
        });

        $(window).on('resize.ydui.lazyload', function () {
            _this.loadImg();
        });
    };

    /**
     * 加载图片
     */
    LazyLoad.prototype.loadImg = function () {
        var _this = this,
            options = _this.options,
            $binder = $(options.binder);

        var contentHeight = $binder.height(),
            contentTop = $binder.get(0) === window ? $(window).scrollTop() : $binder.offset().top;

        _this.$element.each(function () {
            var $img = $(this);

            var post = $img.offset().top - contentTop,
                posb = post + $img.height();

            // 判断是否位于可视区域内
            if ((post >= 0 && post < contentHeight) || (posb > 0 && posb <= contentHeight)) {
                $img.trigger('appear.ydui.lazyload');
            }
        });
    };

    /**
     * 给所有图片绑定单次自定义事件
     */
    LazyLoad.prototype.bindImgEvent = function () {
        var _this = this,
            options = _this.options;

        _this.$element.each(function () {
            var $img = $(this);

            if ($img.is("img") && !$img.attr("src")) {
                $img.attr("src", options.placeholder);
            }

            $img.one("appear.ydui.lazyload", function () {
                if ($img.is("img")) {
                    $img.attr("src", $img.attr(options.attr));
                }
            });
        });
    };

    $.fn.lazyLoad = function (option) {
        new LazyLoad(this, option);
    };

}(window);
