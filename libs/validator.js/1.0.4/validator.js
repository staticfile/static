/*!
 * validator.tool v1.0.4
 * Copyright (c) 2016 kenny wang <wowohoo@qq.com> (http://JSLite.io)
 * Licensed under the MIT license.
 * 
 * 轻量级的JavaScript表单验证，字符串验证。没有依赖，支持UMD，~3kb。
 * http://jaywcjlove.github.io/validator.js
 * 
 */
(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }
        g.Validator = f();
    }
})(function() {
    var define, module, exports;
    var regexs = {
        // 匹配 max_length(12) => ["max_length",12]
        rule: /^(.+?)\((.+)\)$/,
        // 数字
        numericRegex: /^[0-9]+$/,
        /**
    * @descrition:邮箱规则
    * 1.邮箱以a-z、A-Z、0-9开头，最小长度为1.
    * 2.如果左侧部分包含-、_、.则这些特殊符号的前面必须包一位数字或字母。
    * 3.@符号是必填项
    * 4.右则部分可分为两部分，第一部分为邮件提供商域名地址，第二部分为域名后缀，现已知的最短为2位。最长的为6为。
    * 5.邮件提供商域可以包含特殊字符-、_、.
    */
        email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
        /**
     * [ip ipv4、ipv6]
     * "192.168.0.0"
     * "192.168.2.3.1.1"
     * "235.168.2.1"
     * "192.168.254.10"
     * "192.168.254.10.1.1"
     */
        ip: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])((\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}|(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){5})$/,
        /**
    * @descrition:判断输入的参数是否是个合格的固定电话号码。
    * 待验证的固定电话号码。
    * 国家代码(2到3位)-区号(2到3位)-电话号码(7到8位)-分机号(3位)
    **/
        fax: /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/,
        /**
    *@descrition:手机号码段规则
    * 13段：130、131、132、133、134、135、136、137、138、139
    * 14段：145、147
    * 15段：150、151、152、153、155、156、157、158、159
    * 17段：170、176、177、178
    * 18段：180、181、182、183、184、185、186、187、188、189
    * 国际码 如：中国(+86)
    */
        phone: /^((\+?[0-9]{1,4})|(\(\+86\)))?(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])\d{8}$/,
        /**
     * @descrition 匹配 URL
     */
        url: /[a-zA-z]+:\/\/[^\s]/
    };
    var _testHook = {
        // 验证合法邮箱
        is_email: function(field) {
            return regexs.email.test(backVal(field));
        },
        // 验证合法 ip 地址
        is_ip: function(field) {
            return regexs.ip.test(backVal(field));
        },
        // 验证传真
        is_fax: function(field) {
            return regexs.fax.test(backVal(field));
        },
        // 验证座机
        is_tel: function(field) {
            return regexs.fax.test(backVal(field));
        },
        // 验证手机
        is_phone: function(field) {
            return regexs.phone.test(backVal(field));
        },
        // 验证URL
        is_url: function(field) {
            return regexs.url.test(backVal(field));
        },
        // 是否为必填
        required: function(field) {
            var value = backVal(field);
            if (field.type === "checkbox" || field.type === "radio") {
                return field.checked === true;
            }
            return value !== null && value !== "";
        },
        // 最大长度
        max_length: function(field, length) {
            if (!regexs.numericRegex.test(length)) return false;
            return backVal(field).length <= parseInt(length, 10);
        },
        // 最小长度
        min_length: function(field, length) {
            if (!regexs.numericRegex.test(length)) return false;
            return backVal(field).length >= parseInt(length, 10);
        }
    };
    var Validator = function(formelm, fields, callback) {
        // 将验证方法绑到 Validator 对象上去
        for (var a in _testHook) this[camelCase(a)] = _testHook[a];
        this.isCallback = callback ? true : false;
        this.callback = callback || function() {};
        this.form = _formElm(formelm) || {};
        this.errors = [];
        this.fields = {};
        this.handles = {};
        // 如果不存在 form 对象
        if (!formelm) return this;
        for (var i = 0, fieldLength = fields.length; i < fieldLength; i++) {
            var field = fields[i];
            // 如果通过不正确，我们需要跳过该领域。
            if (!field.name && !field.names || !field.rules) {
                console.warn(field);
                continue;
            }
            addField(this, field, field.name);
        }
        // 使用 submit 按钮拦截
        var _onsubmit = this.form.onsubmit;
        this.form.onsubmit = function(that) {
            return function(evt) {
                try {
                    return that.validate(evt) && (_onsubmit === undefined || _onsubmit());
                } catch (e) {}
            };
        }(this);
    };
    Validator.prototype = {
        /**
     * [_validator 在提交表单时进行验证。或者直接调用validate]
     * @param  {[type]} evt [description]
     * @return {[type]}     [JSON]
     */
        validate: function(evt) {
            this.handles["ok"] = true;
            this.handles["evt"] = evt;
            this.errors = [];
            for (var key in this.fields) {
                if (this.fields.hasOwnProperty(key)) {
                    var field = this.fields[key] || {}, element = this.form[field.name];
                    if (element && element !== undefined) {
                        field.id = attributeValue(element, "id");
                        field.element = element;
                        field.type = element.length > 0 ? element[0].type : element.type;
                        field.value = attributeValue(element, "value");
                        field.checked = attributeValue(element, "checked");
                        this._validateField(field);
                    }
                }
            }
            if (typeof this.callback === "function") {
                this.callback(this, evt);
            }
            // 如果有错误，停止submit 提交
            if (this.errors.length > 0) {
                if (evt && evt.preventDefault) {
                    evt.preventDefault();
                } else if (event) {
                    // IE 使用的全局变量
                    event.returnValue = false;
                }
            }
            return this;
        },
        _validateField: function(field) {
            var rules = field.rules.split("|"), isEmpty = !field.value || field.value === "" || field.value === undefined;
            for (var i = 0, ruleLength = rules.length; i < ruleLength; i++) {
                var method = rules[i];
                var parts = regexs.rule.exec(method);
                var param = null;
                var failed = false;
                // 解析带参数的验证如 max_length(12)
                if (parts) method = parts[1], param = parts[2];
                if (typeof _testHook[method] === "function") {
                    if (!_testHook[method].apply(this, [ field, param ])) {
                        failed = true;
                    }
                }
                if (regexs[method] && /^regexp\_/.test(method)) {
                    if (!regexs[method].test(field.value)) {
                        failed = true;
                    }
                }
                if (failed) {
                    var message = function() {
                        return field.display.split("|")[i] && field.display.split("|")[i].replace("{{" + field.name + "}}", field.value);
                    }();
                    var existingError;
                    for (j = 0; j < this.errors.length; j += 1) {
                        if (field.element === this.errors[j].element) {
                            existingError = this.errors[j];
                        }
                    }
                    var errorObject = existingError || {
                        id: field.id,
                        display: field.display,
                        element: field.element,
                        name: field.name,
                        message: message,
                        messages: [],
                        rule: method
                    };
                    errorObject.messages.push(message);
                    if (!existingError) this.errors.push(errorObject);
                }
            }
            return this;
        }
    };
    /**
 * [camelCase 将样式属性字符转换成驼峰。]
 * @param  {[type]} string [字符串]
 * @return {[type]}        [字符串]
 */
    function camelCase(string) {
        // Support: IE9-11+
        return string.replace(/\_([a-z])/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    /**
 * [attributeValue 获取节点对象的属性]
 * @param  {[type]} element       [传入节点]
 * @param  {[type]} attributeName [需要获取的属性]
 * @return {[type]}               [返回String，属性值]
 */
    function attributeValue(element, attributeName) {
        var i;
        if (element.length > 0 && (element[0].type === "radio" || element[0].type === "checkbox")) {
            for (i = 0, elementLength = element.length; i < elementLength; i++) {
                if (element[i].checked) {
                    return element[i][attributeName];
                }
            }
            return;
        }
        return element[attributeName];
    }
    /**
 * [addField 构建具有所有需要验证的信息的主域数组]
 * @param {[type]} self      [Validator自己]
 * @param {[type]} field     [description]
 * @param {[type]} nameValue [description]
 */
    function addField(self, field, nameValue) {
        self.fields[nameValue] = {
            name: nameValue,
            display: field.display || nameValue,
            rules: field.rules,
            id: null,
            element: null,
            type: null,
            value: null,
            checked: null
        };
        for (var a in field) {
            if (field.hasOwnProperty(a) && /^regexp\_/.test(a)) {
                regexs[a] = field[a];
            }
        }
    }
    /**
 * [_formElm 获取 dome 节点对象]
 * @param  {[type]} elm [字符串或者节点对象]
 * @return {[type]}     [返回dom节点]
 */
    function _formElm(elm) {
        return typeof elm === "object" ? elm : document.forms[elm];
    }
    /**
 * [backVal 判断 field 是否为字符串 ]
 * @param  {[type]}              [Object or String]
 * @return {[type]}              [String]
 */
    function backVal(field) {
        return typeof field === "string" ? field : field.value;
    }
    return Validator;
});