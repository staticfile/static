/*! Validator.js
 * @author: sofish https://github.com/sofish
 * @copyright: MIT license */

// 约定：以 /\$\w+/ 表示的字符，比如 $item 表示的是一个 jQuery Object
~function ($) {

  var patterns, fields, errorElement, addErrorClass, removeErrorClass, novalidate, validateForm
    , validateFields, radios, removeFromUnvalidFields, asyncValidate, getVal
    , aorbValidate, validateReturn, unvalidFields = []

  // 类型判断
  patterns = {

    // 当前校验的元素，默认没有，在 `validate()` 方法中传入
    // $item: {},

    email: function(text){
      return /^(?:[a-z0-9]+[_\-+.]?)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+.)+([a-z]{2,})+$/i.test(text);
    },

    // 仅支持 8 种类型的 day
    // 20120409 | 2012-04-09 | 2012/04/09 | 2012.04.09 | 以上各种无 0 的状况
    date: function (text) {
      var reg = /^([1-2]\d{3})([-/.])?(1[0-2]|0?[1-9])([-/.])?([1-2]\d|3[01]|0?[1-9])$/
        , taste, d;

      if (!reg.test(text)) return false;

      taste = reg.exec(text);
      year = +taste[1], month = +taste[3] - 1, day = +taste[5];
      d = new Date(year, month, day);

      return year === d.getFullYear() && month === d.getMonth() && day === d.getDate();
    },

    // 手机：仅中国手机适应；以 1 开头，第二位是 3-9，并且总位数为 11 位数字
    mobile: function(text){
      return /^1[3-9]\d{9}$/.test(text);
    },

    // 座机：仅中国座机支持；区号可有 3、4位数并且以 0 开头；电话号不以 0 开头，最 8 位数，最少 7 位数
    //  但 400/800 除头开外，适应电话，电话本身是 7 位数
    // 0755-29819991 | 0755 29819991 | 400-6927972 | 4006927927 | 800...
    tel: function(text){
      return /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/.test(text);
    },

    number: function(text){
      var min = +this.$item.attr('min')
        , max = +this.$item.attr('max')
        , result = /^\-?(?:[1-9]\d*|0)(?:[.]\d)?$/.test(text)
        , text = +text
        , step = +this.$item.attr('step');

      // ignore invalid range silently
      isNaN(min) && (min = text - 1);
      isNaN(max) && (max = text + 1);

      // 目前的实现 step 不能小于 0
      return result && (isNaN(step) || 0 >= step ?
        (text >= min && text <= max) : 0 === (text + min) % step && (text >= min && text <= max));
    },

    // 判断是否在 min / max 之间
    range: function(text){
      return this.number(text);
    },

    // 支持类型:
    // http(s)://(username:password@)(www.)domain.(com/co.uk)(/...)
    // (s)ftp://(username:password@)domain.com/...
    // git://(username:password@)domain.com/...
    // irc(6/s)://host:port/... // 需要测试
    // afp over TCP/IP: afp://[<user>@]<host>[:<port>][/[<path>]]
    // telnet://<user>:<password>@<host>[:<port>/]
    // smb://[<user>@]<host>[:<port>][/[<path>]][?<param1>=<value1>[;<param2>=<value2>]]
    url: function(text){
      var protocols = '((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\\/\\/)?'
        , userInfo = '([a-z0-9]\\w*(\\:[\\S]+)?\\@)?'
        , domain = '([a-z0-9]([\\w]*[a-z0-9])*\\.)?[a-z0-9]\\w*\\.[a-z]{2,}(\\.[a-z]{2,})?'
        , port = '(:\\d{1,5})?'
        , ip = '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'
        , address = '(\\/\\S*)?'
        , domainType = [protocols, userInfo, domain, port, address]
        , ipType = [protocols, userInfo, ip, port, address]
        , validate

      validate = function(type){
        return new RegExp('^' + type.join('') + '$', 'i').test(text);
      };

      return validate(domainType) || validate(ipType);
    },

    // 密码项目前只是不为空就 ok，可以自定义
    password: function(text){
      return this.text(text);
    },

    checkbox: function() {
      return patterns._checker('checkbox');
    },

    // radio 根据当前 radio 的 name 属性获取元素，只要 name 相同的这几个元素中有一个 checked，则验证难过
    radio: function(checkbox){
      return patterns._checker('radio');
    },

    _checker: function(type) {
      // TODO: a better way?!
      var form = this.$item.parents('form').eq(0)
        , identifier = 'input:' + type + '[name="' + this.$item.attr('name') + '"]'
        , result = false
        , $items = $(identifier, form);

      // TODO: a faster way?!
      $items.each(function(i, item){
        if(item.checked && !result) return result = true;
      })

      return result;
    },

    // text[notEmpty] 表单项不为空
    // [type=text] 也会进这项
    text: function(text){

      var max = parseInt(this.$item.attr('maxlength'), 10)
        , noEmpty

      notEmpty = function(text){
        return !!text.length && !/^\s+$/.test(text)
      }

      return isNaN(max) ? notEmpty(text) : notEmpty(text) && text.length <= max;
    }
  }

  // 异步验证
  asyncValidate = function($item, klass, isErrorOnParent){
    var data = $item.data()
      , url = data['url']
      , method = data['method'] || 'get'
      , key = data['key'] || 'key'
      , text = getVal($item)
      , params = {}

    params[key] = text;

    $[method](url, params).success(function(isValidate){
      var message = isValidate ? 'IM VALIDED' : 'unvalid';
      return validateReturn.call(this, $item, klass, isErrorOnParent, message);
    }).error(function(){
        // 异步错误，供调试用，理论上线上不应该继续运行
      });
  }


  // 二选一：二个项中必须的一个项是已经填
  // <input data-aorb="a" >
  // <input data-aorb="b" >
  aorbValidate = function($item, klass, isErrorOnParent){
    var id = $item.data('aorb') === 'a' ? 'b' : 'a'
      , $pair = $('[data-aorb=' + id + ']', $item.parents('form').eq(0))
      , a = [$item, klass, isErrorOnParent]
      , b = [$pair, klass, isErrorOnParent]
      , result = 0

    result += validateReturn.apply(this, a) ? 0 : 1
    result += validateReturn.apply(this, b) ? 0 : 1;

    result = result > 0 ? (removeErrorClass.apply(this, a), removeErrorClass.apply(this, b), false) :
      validateReturn.apply(this, a.concat('unvalid'));

    // 通过则返回 false
    return result;
  }

  // 验证后的返回值
  validateReturn = function($item, klass, parent, message){

    if(!$item) return 'DONT VALIDATE UNEXIST ELEMENT';

    var pattern, type, val, ret, event

    pattern = $item.attr('pattern');
    pattern && pattern.replace('\\', '\\\\');
    type = $item.attr('type') || 'text';
    // hack ie: 像 select 和 textarea 返回的 type 都为 NODENAME 而非空
    type = patterns[type] ? type : 'text';
    val = $.trim(getVal($item));
    event = $item.data('event');

    // HTML5 pattern 支持
    message = message ? message :
      pattern ? ((new RegExp(pattern)).test(val) || 'unvalid') :
        patterns[type](val) || 'unvalid';

    // 返回的错误对象 = {
    //    $el: {jQuery Element Object} // 当前表单项
    //  , type: {String} //表单的类型，如 [type=radio]
    //  , message: {String} // error message，只有两种值
    // }
    // NOTE: 把 jQuery Object 传到 trigger 方法中作为参数，会变成原生的 DOM Object
    if(message === 'unvalid') removeErrorClass($item, klass, parent);
    return /^(?:unvalid|empty)$/.test(message) ? (ret = {
      $el: addErrorClass.call(this, $item, klass, parent, message)
      , type: type
      , error: message
    }, $item.trigger('after:' + event, $item), ret):
      (removeErrorClass.call(this, $item, klass, parent), $item.trigger('after:' + event, $item), false);
  }

  // 获取待校验的项
  fields  = function(identifie, form) {
    return $(identifie, form);
  }

  // 获取待校验项的值
  getVal = function($item){
    return $item.val() || ($item.is('[contenteditable]') ? $item.text() : '');
  }

  // 校验一个表单项
  // 出错时返回一个对象，当前表单项和类型；通过时返回 false
  validate = function($item, klass, parent){
    var async, aorb, type, val, commonArgs, event

    // 把当前元素放到 patterns 对象中备用
    patterns.$item = $item;
    type = $item.attr('type');
    val = getVal($item);

    async = $item.data('url');
    aorb = $item.data('aorb');
    event = $item.data('event');

    commonArgs = [$item, klass, parent]

    // 当指定 `data-event` 的时候在检测前触发自定义事件
    // NOTE: 把 jQuery Object 传到 trigger 方法中作为参数，会变成原生的 DOM Object
    event && $item.trigger('before:' + event, $item);

    // 所有都最先测试是不是 empty，checkbox 是可以有值
    // 但通过来说我们更需要的是 checked 的状态
    // 暂时去掉 radio/checkbox/linkage/aorb 的 notEmpty 检测
    if(!(/^(?:radio|checkbox)$/.test(type) || aorb) && !patterns['text'](val))
      return validateReturn.call(this, $item, klass, parent, 'empty')

    // 二选一验证：有可能为空
    if(aorb) return aorbValidate.apply(this, commonArgs);

    // 异步验证则不进行普通验证
    if(async) return asyncValidate.apply(this, commonArgs);

    // 正常验证返回值
    return validateReturn.call(this, $item, klass, parent);
  }

  // 校验表单项
  validateFields = function($fields, method, klass, parent) {
    // TODO：坐成 delegate 的方式？
    var reSpecialType = /^radio|checkbox/
      , field
    $.each($fields, function(i, f){
      $(f).on(reSpecialType.test(f.type) || "SELECT" === f.tagName ? 'change blur' : method, function(){
        // 如果有错误，返回的结果是一个对象，传入 validedFields 可提供更快的 `validateForm`
        var $items = $(this);
        if (reSpecialType.test(this.type)) {
          $items = $('input[type=' + this.type + '][name=' + this.name + ']',
                     $items.closest('form'));
        }
        $items.each(function(){
          (field = validate.call(this, $(this), klass, parent)) && unvalidFields.push(field);
        });
      })
    })
  }

  // 校验表单：表单通过时返回 false，不然返回所有出错的对象
  validateForm = function ($fields, method, klass, parent) {
    if(method && !validateFields.length) return true;

    unvalidFields = $.map($fields, function(el){
      var field = validate.call(null, $(el), klass, parent);
      if(field) return field;
    })

    return validateFields.length ? unvalidFields : false;
  }

  // 从 unvalidField 中删除
  removeFromUnvalidFields = function($item){
    var obj, index

    // 从 unvalidFields 中删除
    obj = $.grep(unvalidFields, function(item) {
      return item['$el'] = $item;
    })[0];

    if(!obj) return;
    index = $.inArray(obj, unvalidFields);
    unvalidFields.splice(index, 1);
    return unvalidFields;
  }

  // 添加/删除错误 class
  // @param `$item` {jQuery Object} 传入的 element
  // @param [optional] `klass` {String} 当一个 class 默认值是 `error`
  // @param [optional] `parent` {Boolean} 为 true 的时候，class 被添加在当前出错元素的 parentNode 上
  errorElement = function($item, parent){
    return $item.data('parent') ? $item.closest($item.data('parent')) : parent ? $item.parent() : $item;
  }

  addErrorClass = function($item, klass, parent, emptyClass){
    return errorElement($item, parent).addClass(klass + ' ' + emptyClass);
  }

  removeErrorClass = function($item, klass, parent){
    removeFromUnvalidFields.call(this, $item);
    return errorElement($item, parent).removeClass(klass + ' empty unvalid');
  }

  // 添加 `novalidate` 到 form 中，防止浏览器默认的校验（样式不一致并且太丑）
  novalidate = function($form){
    return $form.attr('novalidate') || $form.attr('novalidate', 'true')
  }

  // 真正的操作逻辑开始，yayayayayayaya!
  // 用法：$form.validator(options)
  // 参数：options = {
  //    identifie: {String}, // 需要校验的表单项，（默认是 `[required]`）
  //    klass: {String}, // 校验不通过时错误时添加的 class 名（默认是 `error`）
  //    isErrorOnParent: {Boolean} // 错误出现时 class 放在当前表单项还是（默认是 element 本身）
  //    method: {String | false}, // 触发表单项校验的方法，当是 false 在点 submit 按钮之前不校验（默认是 `blur`）
  //    errorCallback(unvalidFields): {Function}, // 出错时的 callback，第一个参数是出错的表单项集合
  //
  //    before: {Function}, // 表单检验之前
  //    after: {Function}, // 表单校验之后，只有返回 True 表单才可能被提交
  //  }
  $.fn.validator = function(options) {
    var $form = this
      , options = options || {}
      , identifie = options.identifie || '[required]'
      , klass = options.error || 'error'
      , isErrorOnParent = options.isErrorOnParent || false
      , method = options.method || 'blur'
      , before = options.before || function() {return true;}
      , after = options.after || function() {return true;}
      , errorCallback = options.errorCallback || function(fields){}
      , $items = fields(identifie, $form)

    // 防止浏览器默认校验
    novalidate($form);

    // 表单项校验
    method && validateFields.call(this, $items, method, klass, isErrorOnParent);

    // 当用户聚焦到某个表单时去除错误提示
    $form.on('focusin', identifie, function(e) {
      removeErrorClass.call(this, $(this), 'error unvalid empty', isErrorOnParent);
    })

    // 提交校验
    $form.on('submit', function(e){

      before.call(this, $items);
      validateForm.call(this, $items, method, klass, isErrorOnParent);

      // 当指定 options.after 的时候，只有当 after 返回 true 表单才会提交
      return unvalidFields.length ?
        (e.preventDefault(), errorCallback.call(this, unvalidFields)) :
        (after.call(this, e, $items) && true);
    })

  }

}(jQuery);
