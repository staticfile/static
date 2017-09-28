/**
 * PullRefresh Plugin
 */
!function (window) {
    "use strict";

    function PullRefresh(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, PullRefresh.DEFAULTS, options || {});
        this.init();
    }

    PullRefresh.DEFAULTS = {
        loadListFn: null,
        initLoad: true,
        distance: 100
    };

    PullRefresh.prototype.init = function () {
        var _this = this,
            touches = _this.touches;

        _this.$dragTip = $('<div class="pullrefresh-dragtip"><span></span></div>');

        _this.$element.after(_this.$dragTip);

        _this.offsetTop = _this.$element.offset().top;

        _this.initTip();

        _this.bindEvent();

        if (_this.options.initLoad) {
            touches.loading = true;

            typeof _this.options.loadListFn == 'function' && _this.options.loadListFn().done(function () {
                touches.loading = false;
            });
        }
    };

    PullRefresh.prototype.bindEvent = function () {
        var _this = this;

        _this.$element.on('touchstart.ydui.pullrefresh', function (e) {
            _this.onTouchStart(e);
        }).on('touchmove.ydui.pullrefresh', function (e) {
            _this.onTouchMove(e);
        }).on('touchend.ydui.pullrefresh', function (e) {
            _this.onTouchEnd(e);
        });

        _this.stopWeixinDrag();
    };

    PullRefresh.prototype.touches = {
        loading: false,
        startClientY: 0,
        moveOffset: 0,
        isDraging: false
    };

    PullRefresh.prototype.stopWeixinDrag = function () {
        var _this = this;
        $(document.body).on('touchmove.ydui.pullrefresh', function (event) {
            _this.touches.isDraging && event.preventDefault();
        });
    };

    PullRefresh.prototype.onTouchStart = function (event) {
        var _this = this;

        if (_this.touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.$element.offset().top < _this.offsetTop) {
            return;
        }

        _this.touches.startClientY = event.originalEvent.touches[0].clientY;
    };

    PullRefresh.prototype.onTouchMove = function (event) {
        var _this = this,
            _touches = event.originalEvent.touches[0];

        if (_this.touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.touches.startClientY > _touches.clientY || _this.$element.offset().top < _this.offsetTop || _this.touches.loading) {
            return;
        }

        _this.touches.isDraging = true;

        var deltaSlide = _touches.clientY - _this.touches.startClientY;

        _this.$dragTip.find('span').css('opacity', deltaSlide / 100);

        if (deltaSlide >= _this.options.distance) {
            deltaSlide = _this.options.distance;
        }

        _this.$dragTip.find('span').css('transform', 'rotate(' + deltaSlide / 0.25 + 'deg)');

        _this.touches.moveOffset = deltaSlide;

        _this.moveDragTip(deltaSlide);
    };

    PullRefresh.prototype.onTouchEnd = function (event) {

        var _this = this,
            touches = _this.touches;

        if (touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.$element.offset().top < _this.offsetTop) {
            return;
        }

        _this.$dragTip.addClass('pullrefresh-animation-timing');

        if (touches.moveOffset >= _this.options.distance) {
            _this.moveDragTip(_this.options.distance / 1.5);
            _this.$dragTip.find('span').addClass('pullrefresh-loading');
            _this.triggerLoad();
            return;
        }

        _this.touches.isDraging = false;

        _this.resetDragTip();

        _this.resetLoading();
    };

    PullRefresh.prototype.triggerLoad = function () {
        var _this = this,
            touches = _this.touches;

        touches.loading = true;

        typeof _this.options.loadListFn == 'function' && _this.options.loadListFn().done(function () {
            setTimeout(function () {
                _this.$dragTip.css({'transform': 'translate3d(0px, ' + (_this.options.distance / 1.5) + 'px, 0px) scale(0)'});
                _this.resetDragTip();
            }, 200);
        });
    };

    PullRefresh.prototype.resetLoading = function () {
        var _this = this;
        _this.moveDragTip(0);

        _this.$dragTip.find('span').removeClass('pullrefresh-loading').css({'opacity': 0.5, 'transform': 'rotate(0deg)'});
    };

    PullRefresh.prototype.resetDragTip = function () {
        var _this = this,
            touches = _this.touches;

        setTimeout(function () {
            touches.isDraging = false;
            touches.loading = false;
            touches.moveOffset = 0;
            _this.moveDragTip(0);
            _this.resetLoading();
            _this.$dragTip.removeClass('pullrefresh-animation-timing');
        }, 150);
    };

    PullRefresh.prototype.moveDragTip = function (y) {
        this.$dragTip.css({'transform': 'translate3d(0,' + y + 'px,0) scale(1)'});
    };

    PullRefresh.prototype.initTip = function () {
        var _this = this,
            ls = window.localStorage;

        if (ls.getItem('LIST-PULLREFRESH-TIP') == 'YDUI')return;

        _this.$tip = $('<div class="pullrefresh-draghelp"><div><span>下拉更新</span></div></div>');

        _this.$tip.on('click.ydui.pullrefresh', function () {
            $(this).remove();
        });

        _this.$element.after(_this.$tip);
        ls.setItem('LIST-PULLREFRESH-TIP', 'YDUI');

        setTimeout(function () {
            _this.$tip.remove();
        }, 5000);
    };

    function Plugin(option) {
        return this.each(function () {
            var self = this;
            new PullRefresh(self, option);
        });
    }

    $.fn.pullRefresh = Plugin;

}(window);
