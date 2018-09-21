'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OFFSETDOT = 18;
copyright();

function getTimeStr(time) {
  var h = Math.floor(time / 3600);
  var m = Math.floor(time % 3600 / 60);
  var s = Math.floor(time % 60);
  h = h >= 10 ? h : '0' + h;
  m = m >= 10 ? m : '0' + m;
  s = s >= 10 ? s : '0' + s;
  return h === '00' ? m + ':' + s : h + ':' + m + ':' + s;
}

function isFullScreen() {
  return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen;
}

function copyright() {
  console.log('\n %c EPlayer 0.2.10 %c eplayer.js.org \n', 'color: #fff; background: linear-gradient(to right,#57a1fc ,#6beaf7); padding:5px;', 'color: #7192c3; background: #ecfaff; padding:5px 0;');
}

function isSafari() {
  return (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  );
}

var Init = function Init(el, data) {
  _classCallCheck(this, Init);

  var html = '\n    <link rel="stylesheet" href="//at.alicdn.com/t/font_836948_g9ctpaubgfq.css">\n    <style>\n      .player {\n        background:#000;\n        width: 100%;\n        height: 100%;\n        position: relative;\n      }\n      .player video {\n        width: 100%;\n        height: 100%;\n      }\n      .player .panel {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%,-50%);\n      }\n      .player .wrap {\n        height: 100%;\n        width: 100%;\n      }\n      .player:hover .controls {\n        opacity: 1\n      }\n      .player .panels .epicon {\n        font-size: 80px\n      }\n      .player .controls {\n        width: 100%;\n        position: absolute;\n        bottom: 0;\n        padding: 0 15px;\n        box-sizing: border-box;\n        opacity: 0;\n        transition: .5s ease-out;\n      }\n      .player .option {\n        position: relative;\n        display:flex;\n        align-items: center;\n        padding: 10px 0;\n      }\n      .player .option-left{\n        display: flex;\n        flex: 1;\n        align-items: center;\n      }\n      .player .option-right{\n        display: flex;\n        flex: 1;\n        align-items: center;\n        justify-content: flex-end\n      }\n      .player .progress-bar {\n        width: 100%;\n        position: relative;\n        cursor: pointer;\n      }\n      .player .volume-progress-bar {\n        width: 100px;\n        position: relative;\n        cursor: pointer;\n      }\n      .player .volume-progress {\n        border-radius:2px;\n        height: 4px;\n        background-color: rgba(255, 255, 255, 0.8);\n      }\n      .player .progress {\n        border-radius:2px;\n        height: 4px;\n        background-color: rgba(255, 255, 255, 0.8);\n      }\n      .player .dot {\n        padding: 20px;\n        position: absolute;\n        top: -18px;\n        left: -18px;\n        transition: 0.01s\n      }\n      .player .dot i {\n        height: 13px;\n        width: 13px;\n        background: ' + data.themeColor + ';\n        position: absolute;\n        border-radius: 50%;\n        top: 50%;\n        left:50%;\n        transform:translate(-50%,-50%)\n      }\n      .player .volume {\n        display: flex;\n        align-items: center;\n        padding-right: 15px;\n      }\n      .player .current-progress {\n        width: 0%;\n        height: 100%;\n        background: ' + data.themeColor + ';\n        position: absolute;\n        border-radius:2px;\n        top: 0;\n        transition: .1s\n      }\n      .player .buffer {\n        width: 0%;\n        height: 100%;\n        background: ' + data.themeColor + ';\n        opacity:.4;\n        position: absolute;\n        border-radius:2px;\n        top: 0;\n        transition: .3s;\n      }\n      .player .time {\n        text-align: center;\n        font-size: 12px;\n        color: #fff;\n        padding-left: 15px;\n      }\n      .player .epicon:hover {\n        color: #fff;\n      }\n      .player .epicon {\n        color: rgba(255, 255, 255, 0.8);\n        cursor: pointer;\n        transition: 0.3s;\n        font-size: 20px;\n      }\n      .player .ep-volume-down,.ep-volume-up,.ep-volume-off {\n        padding-right: 15px\n      }\n      .player .loading {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        margin:-20px 0 0 -20px;\n        width: 40px;\n        height: 40px;\n        border: 4px solid;\n        border-color: rgba(255, 255, 255, 0.8) rgba(255, 255, 255, 0.8) transparent;\n        border-radius: 50%;\n        box-sizing: border-box;\n        animation: loading 1s linear infinite;\n      }\n      @keyframes loading{\n        0%{\n          transform: rotate(0deg);\n        }\n        100%{\n          transform: rotate(360deg);\n        }  \n      }\n      @keyframes display{\n        0%{\n          opacity: 1;\n        }\n        100%{\n          opacity: 0;\n        }\n      }\n    </style>\n    <div class="player">\n      <video src="' + data.src + '" webkit-playsinline playsinline x5-playsinline x-webkit-airplay="allow"></video>\n        <div class="panels">\n          <div class="loading"></div>\n          <i class="epicon ep-play panel" style="display:none;"></i>\n        </div>\n        <div class="controls">\n          <div class="progress-bar">\n            <div class="current-progress"></div>\n            <div class="buffer"></div>\n            <div class="dot">\n              <i></i>\n            </div>\n            <div class="progress"></div>\n          </div>\n          <div class="option">\n            <div class="option-left">\n              <div class="control">\n                <i class="epicon ep-play switch"></i>\n              </div>\n              <div class="time">\n                <span class="current">00:00</span>\n                /\n                <span class="total">00:00</span>\n              </div>\n            </div>\n            <div class="option-right"> \n              <div class="volume">\n                <i class="epicon ep-volume-up volume-button"></i>\n                <div class="volume-progress-bar">\n                  <div class="volume-progress"></div>\n                  <div class="current-progress"></div>\n                  <div class="dot">\n                    <i></i>\n                  </div>\n                </div>\n              </div> \n              <div class="control">\n                <i class="epicon ep-full full"></i>\n              </div>  \n            </div>\n          </div>\n        </div>\n    </div>\n    ';
  el.innerHTML = html;
};

var Hls = function Hls(el, data) {
  _classCallCheck(this, Hls);

  this.src = data.src;
  this.el = el;

  var _Hls = require('hls.js');

  if (_Hls.isSupported()) {
    var hls = new _Hls();
    hls.loadSource(this.src);
    hls.attachMedia(this.el);
  }
};

var Eplayer = function () {
  function Eplayer(el, data) {
    var _this = this;

    _classCallCheck(this, Eplayer);

    this.el = el;
    this.data = data;
    this.h = el.clientHeight;
    this.w = el.clientWidth;

    new Init(this.el, this.data);

    this.video = document.querySelector('.player video');
    this.loading = document.querySelector('.player .loading');
    this.isPlay = document.querySelector('.player .switch');
    this.panel = document.querySelector('.player .panel');
    this.totalTime = document.querySelector('.player .total');
    this.currentTime = document.querySelector('.player .current');
    this.dot = document.querySelector('.player .progress-bar .dot');
    this.vdot = document.querySelector('.player .volume .dot');
    this.full = document.querySelector('.player .full');
    this.progress = document.querySelector('.player .progress');
    this.currentProgress = document.querySelector('.player .current-progress');
    this.currentVolumeProgress = document.querySelector('.player .volume .current-progress');
    this.volumeBtn = document.querySelector('.player .volume-button');
    this.controls = document.querySelector('.player .controls');
    this.buffer = document.querySelector('.player .buffer');
    this.volumeProgress = document.querySelector('.player .volume-progress');

    if (data.src.indexOf('m3u8') !== -1) {
      new Hls(this.video, this.data);
    }

    if (isSafari()) {
      this.loading.style.display = 'none';
      this.panel.style.display = 'block';
    }

    this.tTime = 0;
    this.x = 0;
    this.l = 0;
    this.nl = 0;
    this.nx = 0;
    this.vx = 0;
    this.vl = 0;
    this.vnl = 0;
    this.vnx = 0;
    this.bufferEnd = 0;
    this.isDown = false;

    this.video.onwaiting = function () {
      return _this.waiting();
    };
    this.video.oncanplay = function () {
      return _this.canplay();
    };
    this.isPlay.onclick = function () {
      return _this.play();
    };
    this.panel.onclick = function () {
      return _this.play();
    };
    this.video.ontimeupdate = function () {
      return _this.timeupdate();
    };
    this.progress.onclick = this.currentProgress.onclick = this.buffer.onclick = function (e) {
      return _this.progressClick(e);
    };
    this.volumeProgress.onclick = this.currentVolumeProgress.onclick = function (e) {
      return _this.volumeClick(e);
    };
    this.video.onended = function () {
      return _this.ended();
    };
    this.full.onclick = function () {
      return _this.fullScreen();
    };
    this.dot.onmousedown = function (e) {
      return _this.Dotonmousedown(e);
    };
    this.dot.onmousemove = function (e) {
      return _this.Dotonmousemove(e);
    };
    this.dot.onmouseup = function (e) {
      return _this.Dotonmouseup(e);
    };
    this.vdot.onmousedown = function (e) {
      return _this.Volumeonmousedown(e);
    };
    this.vdot.onmousemove = function (e) {
      return _this.Volumeonmousemove(e);
    };
    this.vdot.onmouseup = function (e) {
      return _this.Volumeonmouseup(e);
    };
    this.volumeBtn.onclick = function () {
      return _this.isVolume();
    };
    window.onresize = function (e) {
      return _this.windowResize(e);
    };
  }

  _createClass(Eplayer, [{
    key: 'waiting',
    value: function waiting() {
      this.loading.style.display = 'block';
    }
  }, {
    key: 'canplay',
    value: function canplay() {
      this.tTime = this.video.duration;
      this.loading.style.display = 'none';
      this.panel.style.display = 'block';
      var tTimeStr = getTimeStr(this.tTime);
      this.totalTime.innerHTML = tTimeStr;
      var vWidth = this.volumeProgress.clientWidth;
      this.video.volume = 0.7;
      this.currentVolumeProgress.style.width = this.video.volume * vWidth + 'px';
      this.vdot.style.left = this.video.volume * vWidth - OFFSETDOT + 'px';
      this.vl = this.video.volume * vWidth;
    }
  }, {
    key: 'play',
    value: function play() {
      if (this.video.paused) {
        this.video.play();
        this.isPlay.classList.remove('ep-play');
        this.isPlay.classList.add('ep-pause');
        this.panel.classList.remove('ep-play');
        this.panel.classList.add('wrap');
      } else {
        this.video.pause();
        this.isPlay.classList.remove('ep-pause');
        this.isPlay.classList.add('ep-play');
        this.panel.classList.remove('wrap');
        this.panel.classList.add('ep-play');
      }
    }
  }, {
    key: 'isVolume',
    value: function isVolume() {
      if (this.video.muted) {
        this.video.muted = false;
        this.volumeBtn.classList.remove('ep-volume-off');
        this.volumeBtn.classList.add('ep-volume-up');
      } else {
        this.video.muted = true;
        this.volumeBtn.classList.remove('ep-volume-up');
        this.volumeBtn.classList.add('ep-volume-off');
      }
    }
  }, {
    key: 'timeupdate',
    value: function timeupdate() {
      var cTime = this.video.currentTime;
      if (this.video.buffered.length) {
        this.bufferEnd = this.video.buffered.end(this.video.buffered.length - 1);
        this.buffer.style.width = this.bufferEnd / this.video.duration * this.progress.clientWidth + 'px';
      }

      var cTimeStr = getTimeStr(cTime);
      this.currentTime.innerHTML = cTimeStr;
      var offsetCom = cTime / this.tTime;
      if (!this.isDown) {
        this.currentProgress.style.width = offsetCom * this.progress.clientWidth + 'px';
        this.dot.style.left = offsetCom * this.progress.clientWidth - OFFSETDOT + 'px';
        this.l = offsetCom * this.progress.clientWidth;
      }
    }
  }, {
    key: 'progressClick',
    value: function progressClick(e) {
      var event = e || window.event;
      if (!this.isDown) {
        this.video.currentTime = event.offsetX / this.progress.offsetWidth * this.video.duration;
      }
    }
  }, {
    key: 'volumeClick',
    value: function volumeClick(e) {
      var event = e || window.event;
      if (!this.isDown) {
        this.vdot.style.left = event.offsetX - OFFSETDOT + 'px';
        this.currentVolumeProgress.style.width = event.offsetX + 'px';
        this.video.volume = event.offsetX / this.volumeProgress.offsetWidth;
      }
    }
  }, {
    key: 'Dotonmousedown',
    value: function Dotonmousedown(e) {
      var event = e || window.event;
      this.x = event.clientX;
      this.l = this.l ? this.l : event.offsetX;
      this.isDown = true;
    }
  }, {
    key: 'Dotonmousemove',
    value: function Dotonmousemove(e) {
      if (this.isDown) {
        var event = e || window.event;

        this.nx = event.clientX;
        this.nl = this.nx - (this.x - this.l);
        if (this.nl <= 0) this.nl = 0;
        if (this.nl >= this.progress.clientWidth) this.nl = this.progress.clientWidth;
        this.dot.style.left = this.nl - OFFSETDOT + 'px';
        this.currentProgress.style.width = this.nl + 'px';
        this.x = this.nx;
        this.l = this.nl;
      }
    }
  }, {
    key: 'Dotonmouseup',
    value: function Dotonmouseup(e) {
      var event = e || window.event;
      this.video.currentTime = this.nl / this.progress.offsetWidth * this.video.duration;
      this.isDown = false;
    }
  }, {
    key: 'Volumeonmousedown',
    value: function Volumeonmousedown(e) {
      var event = e || window.event;
      this.vx = event.clientX;
      this.vl = this.vl !== 0 ? this.vl : event.offsetX;
      this.isDown = true;
    }
  }, {
    key: 'Volumeonmousemove',
    value: function Volumeonmousemove(e) {
      if (this.isDown) {
        var event = e || window.event;

        this.vnx = event.clientX;
        this.vnl = this.vnx - (this.vx - this.vl);
        if (this.vnl <= 0) this.vnl = 0;
        if (this.vnl >= this.volumeProgress.clientWidth) this.vnl = this.volumeProgress.clientWidth;
        this.vdot.style.left = this.vnl - OFFSETDOT + 'px';
        this.currentVolumeProgress.style.width = this.vnl + 'px';
        this.vx = this.vnx;
        this.vl = this.vnl;
      }
    }
  }, {
    key: 'Volumeonmouseup',
    value: function Volumeonmouseup(e) {
      var event = e || window.event;
      this.isDown = false;
      this.video.volume = this.vnl / this.volumeProgress.clientWidth;
    }
  }, {
    key: 'ended',
    value: function ended() {
      this.isPlay.classList.remove('ep-pause');
      this.isPlay.classList.add('ep-play');
      this.currentProgress.style.width = 0;
      this.dot.style.left = 0;
      this.currentTime.innerHTML = getTimeStr();
      this.video.currentTime = 0;
      this.x = this.l = this.nx = this.nl = 0;
      this.isDown = false;
    }
  }, {
    key: 'fullScreen',
    value: function fullScreen() {
      if (isFullScreen()) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        var rfs = this.el.requestFullScreen || this.el.webkitRequestFullScreen || this.el.mozRequestFullScreen || this.el.msRequestFullscreen;

        return rfs.call(this.el);
      }
    }
  }, {
    key: 'windowResize',
    value: function windowResize(e) {
      if (isFullScreen()) {
        this.el.style.height = '100%';
        this.el.style.width = '100%';
      } else {
        this.el.style.height = this.h + 'px';
        this.el.style.width = this.w + 'px';
      }
    }
  }]);

  return Eplayer;
}();

exports.default = Eplayer;