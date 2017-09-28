/**
 * Spinner Plugin
 */
!function (window) {
    "use strict";

    function Spinner(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Spinner.DEFAULTS, options || {});
        this.init();
    }

    Spinner.DEFAULTS = {
        input: '.J_Input',
        add: '.J_Add',
        minus: '.J_Del',
        unit: 1,
        max: 0,
        min: -1,
        longpress: true,
        callback: null
    };

    Spinner.prototype.init = function () {
        var _this = this,
            options = _this.options;

        _this.$input = $(options.input, _this.$element);
        _this.$add = $(options.add, _this.$element);
        _this.$minus = $(options.minus, _this.$element);

        _this.changeParameters();

        _this.checkParameters();

        _this.bindEvent();
    };

    Spinner.prototype.tapParams = {};

    Spinner.prototype.isNumber = function (val) {
        //return /^([0]|[1-9]\d*)(\.\d{1,2})?$/.test(val);
        return /^\d*$/.test(val);
    };

    Spinner.prototype.FixNumber = function (val) {
        //return parseFloat(val);
        return parseInt(val);
    };

    Spinner.prototype.changeParameters = function () {

        var _this = this,
            options = _this.options;

        var params = [
            {param: 'unit', default: 1},
            {param: 'max', default: 0}
        ];

        $.each(params, function (k, v) {
            var _val = options[v.param],
                _dataVal = _this.$input.data(v.param);

            if (!!_dataVal) {
                _val = _dataVal;
                if (!_this.isNumber(_dataVal)) {
                    _val = options[v.param];
                    if (typeof _val == 'function') {
                        _val = _val();
                    }
                }
            } else {
                if (typeof options[v.param] == 'function') {
                    var _fnVal = options[v.param]();

                    _val = _fnVal;
                    if (!_this.isNumber(_fnVal)) {
                        _val = options[v.param];
                    }
                }
            }

            if (!_this.isNumber(_val)) {
                _val = v.default;
            }

            options[v.param] = _this.FixNumber(_val);
        });
    };

    Spinner.prototype.checkParameters = function () {
        var _this = this,
            options = _this.options,
            value = _this.$input.val();

        if (value) {
            _this.setValue(value);
        } else {
            if (options.max < options.min && options.max != 0) {
                options.max = options.min;
            }

            if (options.min < options.unit && options.min > 0) {
                options.min = options.unit;
            }
            if (options.min % options.unit != 0 && options.min > 0) {
                options.min = options.min - options.min % options.unit;
            }

            if (options.max < options.unit && options.max != 0) {
                options.max = options.unit;
            }
            if (options.max % options.unit != 0) {
                options.max = options.max - options.max % options.unit;
            }
            if (options.min < 0) {
                options.min = options.unit;
            }
            _this.setValue(options.min);
        }
    };

    Spinner.prototype.calculation = function (type) {
        var _this = this,
            options = _this.options,
            max = options.max,
            unit = options.unit,
            min = options.min,
            $input = _this.$input,
            val = _this.FixNumber($input.val());

        if (!!$input.attr('readonly') || !!$input.attr('disabled'))return;

        var newval;
        if (type == 'add') {
            newval = val + unit;
            if (max != 0 && newval > max)return;
        } else {
            newval = val - unit;
            if (newval < min)return;
        }

        _this.setValue(newval);

        options.longpress && _this.longpressHandler(type);
    };

    Spinner.prototype.longpressHandler = function (type) {
        var _this = this;

        var currentDate = new Date().getTime() / 1000,
            intervalTime = currentDate - _this.tapStartTime;

        if (intervalTime < 1) intervalTime = 0.5;

        var secondCount = intervalTime * 10;
        if (intervalTime == 30) secondCount = 50;
        if (intervalTime >= 40) secondCount = 100;

        _this.tapParams.timer = setTimeout(function () {
            _this.calculation(type);
        }, 1000 / secondCount);
    };

    Spinner.prototype.setValue = function (val) {
        var _this = this,
            options = _this.options,
            max = options.max,
            unit = options.unit,
            min = options.min < 0 ? unit : options.min;

        if (!/^(([1-9]\d*)|0)$/.test(val)) val = max;

        if (val > max && max != 0) val = max;

        if (val % unit > 0) {
            val = val - val % unit + unit;
            if (val > max && max != 0) val -= unit;
        }

        if (val < min) val = min - min % unit;

        _this.$input.val(val);

        typeof options.callback == 'function' && options.callback(val, _this.$input);
    };

    Spinner.prototype.bindEvent = function () {
        var _this = this,
            options = _this.options,
            isMobile = YDUI.device.isMobile,
            mousedownEvent = 'mousedown.ydui.spinner',
            mouseupEvent = 'mouseup.ydui.spinner';

        if (isMobile) {
            mousedownEvent = 'touchstart.ydui.spinner';
            mouseupEvent = 'touchend.ydui.spinner';
        }

        _this.$add.on(mousedownEvent, function (e) {
            if (options.longpress) {
                e.preventDefault();
                e.stopPropagation();
                _this.tapStartTime = new Date().getTime() / 1000;

                _this.$add.on(mouseupEvent, function () {
                    _this.clearTapTimer();
                });
            }

            _this.calculation('add');
        });

        _this.$minus.on(mousedownEvent, function (e) {
            if (options.longpress) {
                e.preventDefault();
                e.stopPropagation();

                _this.tapStartTime = new Date().getTime() / 1000;

                _this.$minus.on(mouseupEvent, function () {
                    _this.clearTapTimer();
                });
            }

            _this.calculation('minus');
        });

        _this.$input.on('change.ydui.spinner', function () {
            _this.setValue($(this).val());
        }).on('keydown', function (event) {
            if (event.keyCode == 13) {
                _this.setValue($(this).val());
                return false;
            }
        });
    };

    Spinner.prototype.clearTapTimer = function () {
        var _this = this;
        clearTimeout(_this.tapParams.timer);
    };

    function Plugin(option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                spinner = $this.data('ydui.spinner');

            if (!spinner) {
                $this.data('ydui.spinner', (spinner = new Spinner(this, option)));
            }

            if (typeof option == 'string') {
                spinner[option] && spinner[option].apply(spinner, args);
            }
        });
    }

    $(window).on('load.ydui.spinner', function () {
        $('[data-ydui-spinner]').each(function () {
            var $this = $(this);
            $this.spinner(window.YDUI.util.parseOptions($this.data('ydui-spinner')));
        });
    });

    $.fn.spinner = Plugin;
}(window);
