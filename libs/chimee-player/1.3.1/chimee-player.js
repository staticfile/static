
/** chimeePlayer
 * chimee-player v1.3.1
 * (c) 2017 huzunjie
 * Released under MIT
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var styleInject = _interopDefault(require('../node_modules/style-inject/dist/style-inject.es.js'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var Chimee = _interopDefault(require('chimee'));
var chimeeHelper = require('chimee-helper');
var chimeeControl = _interopDefault(require('chimee-plugin-controlbar'));
var popupFactory = _interopDefault(require('chimee-plugin-popup'));
var chimeeContextmenu = _interopDefault(require('chimee-plugin-contextmenu'));
var chimeeLog = _interopDefault(require('chimee-plugin-log'));
var chimeeCenterState = _interopDefault(require('chimee-plugin-center-state'));
var chimeeKernelHls = _interopDefault(require('chimee-kernel-hls'));
var chimeeKernelFlv = _interopDefault(require('chimee-kernel-flv'));

var css = ".chimee-container container{position:relative;display:block;width:100%;height:100%}.chimee-container video{display:block;width:100%;height:100%;background:#000;outline:0}.chimee-container video:focus{outline:0}.chimee-container chimee-center-state-loading{box-sizing:initial}";
styleInject(css);

// import 'babel-polyfill';

Chimee.install(chimeeControl);
Chimee.install(chimeeCenterState);
Chimee.install(chimeeContextmenu);
Chimee.install(chimeeLog);

var ChimeePlayer = function (_Chimee) {
  _inherits(ChimeePlayer, _Chimee);

  function ChimeePlayer(config) {
    _classCallCheck(this, ChimeePlayer);

    if (!chimeeHelper.isObject(config)) throw new TypeError('You must pass an Object as config when you new ChimeePlayer');

    // 添加UI插件
    config.plugin = config.plugin || config.plugins;
    if (!chimeeHelper.isArray(config.plugin)) config.plugin = [];
    var innerPlugins = [chimeeControl.name, chimeeCenterState.name, chimeeContextmenu.name, chimeeLog.name];
    var configPluginNames = config.plugin.map(function (item) {
      return chimeeHelper.isObject(item) ? item.name : item;
    });
    innerPlugins.forEach(function (name) {
      if (configPluginNames.indexOf(name) > -1) return;
      config.plugin.push(name);
    });

    // 添加解码器
    if (!chimeeHelper.isObject(config.preset)) {
      config.preset = {
        hls: chimeeKernelHls,
        flv: chimeeKernelFlv
      };
    }

    // 右键菜单的播放暂停
    var _this = _possibleConstructorReturn(this, (ChimeePlayer.__proto__ || _Object$getPrototypeOf(ChimeePlayer)).call(this, config));

    _this.on('play', function () {
      return _this.chimeeContextmenu.updatemenu([{ text: '暂停', action: 'pause' }]);
    });
    _this.on('pause', function () {
      return _this.chimeeContextmenu.updatemenu([{ text: '播放', action: 'play' }]);
    });
    return _this;
  }

  return ChimeePlayer;
}(Chimee);
// 暴露浮层工厂方法


ChimeePlayer.popupFactory = popupFactory;

module.exports = ChimeePlayer;
