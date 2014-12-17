/*! CopyRight: sofish http://github.com/sofish/wechat.js, Licensed under: MIT */
;(function(global, doc) {

  var noop = function() {};

  // map 掉恶心的不统一的 api
  var Wechat = function() {
    this.calls = [];

    this.map = {
      events: {
        friend: 'menu:share:appmessage',
        timeline: 'menu:share:timeline',
        weibo: 'menu:share:weibo',
        email: 'email' // 分享到邮件
      },
      actions: {
        friend: 'sendAppMessage',
        timeline: 'shareTimeline',
        weibo: 'shareWeibo',
        email: 'email'
      },
      direct: {
        network: 'getNetworkType',
        hideToolbar: 'hideToolbar',
        hideOptionMenu: 'hideOptionMenu',
        showOptionMenu: 'showOptionMenu',
        closeWebView: 'closeWindow',      // 关闭webview
        scanQRCode: 'scanQRCode',         //跳转到扫码页面
        imagePreview: 'imagePreview'      //图片预览/查看大图
      }
    };
  };

  // 有些 data 是延时获取的，这时候应该支持传入 callback
  Wechat.prototype._data = function(data, name) {
    if(!data) return {};
    
    var tmp = {};

    for(var p in data) {
      if(!data.hasOwnProperty(p)) return;
      tmp[p] = (typeof data[p] === 'function') ? data[p]() : data[p];
    }

    // 接口命名统一
    tmp.appid = tmp.app;
    tmp.img_url = tmp.img;

    delete tmp.app;
    delete tmp.img;

    // 分享到微博的接口不同
    if(name === 'weibo') {
      tmp.content = tmp.desc;
      tmp.url = tmp.link;

    // 朋友圈的 title 是不显示的，直接拼接
    } else if(name === 'timeline') {
      tmp.title = tmp.title + ' - ' + tmp.desc;

      // Android 下有时候会需要 desc (*-.-)
      tmp.desc = tmp.title;
    } else if(name === 'email') {
      tmp.content = tmp.desc + ' ' + tmp.link;
    }

    return tmp;
  };


  // 处理数据接入
  Wechat.prototype._make = function(obj) {
    if(typeof WeixinJSBridge === 'undefined') return this.calls.push(obj);

    var name = obj.name
      , direct = this.map.direct[name]
      , data = obj.data
      , callback = obj.callback;

    // 直接获取的情况
    if(direct) {
      // 获取用户网络状态的返回值如下：
      // network_type:wifi wifi网络
      // network_type:edge 非wifi,包含3G/2G
      // network_type:fail 网络断开连接
      // network_type:wwan（2g或者3g）
      if(name === 'network') {
        return WeixinJSBridge.invoke(direct, {}, callback);
      // 图片预览/查看大图
      } else if(name === 'imagePreview') {
        return WeixinJSBridge.invoke(direct, data, callback);
      }

      return WeixinJSBridge.call(direct, callback);
    }
    
    // Email 直接处理
    if(name === 'email') return WeixinJSBridge.invoke('sendEmail', this._data(data, name), callback);

    var that = this;
    // 当 WeixinJSBridge 存在则直接绑定事件
    WeixinJSBridge.on(this.map.events[name], function() {
      WeixinJSBridge.invoke(that.map.actions[name], that._data(data, name), callback);
    });
  };

  // 添加监听
  Wechat.prototype.on = function(name, data, callback) {
    if(!name) return;
    if(typeof data === 'function') {
      callback = data;
      data = null;
    }

    this._make({
      name: name,
      data: data,
      callback: callback || noop
    });

    // 返回本身，支持链式
    return this;
  };

  // WeixingJSBridgeReady 后执行绑定的队列
  var ready = function() {
    for(var i = 0, len = wx.calls.length; i < len; i++) {
      wx._make(wx.calls[i]);
    }
  };

  // 对外只分享一个接口，不过会返回本身，可以有备用
  var wx = new Wechat();

  // 创建唯一实例
  var entry =  function() {
    return wx.on.apply(wx, arguments);
  };  

  //spm3 和 cortex 6.x 已经支持自动构建成module
  if (typeof exports !== 'undefined' && module.exports) {
    module.exports = exports = entry;
  } else if (typeof define === 'function') {
    define(function(require, exports, module) {
      module.exports = exports = entry;
    });
  } else {
    //浏览器端直接运行
    global.wechat = global.wechat || entry;
  }
  
  if(typeof WeixinJSBridge === 'undefined'){
    if(doc.addEventListener) {
      doc.addEventListener('WeixinJSBridgeReady', ready, false);
    } else {
      doc.attachEvent('WeixinJSBridgeReady', ready);
      doc.attachEvent('onWeixinJSBridgeReady', ready);
    }
  } else {
    ready();
  }
})(window, document);
