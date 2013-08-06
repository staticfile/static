/*! licensed under MIT, https://github.com/sofish */
var Recorder = (function(R, win, doc) {

  // detect CaptureApi
  R._api = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;


  // support detect
  R.isSupported = !!R._api;

  if(!R.isSupported) return;

  /* play vedio|audio
   * @param el {DOM Element} video/audio element to capture the stream
   * @param type {String} media type, the value can be: 'video', 'audio', or 'both'
   * @param callback {Function} callback to run when the media's metadata is load
   */
  R.play = function(el, type, callback) {

    // only capturing video/audio
    if(!(el && ['VIDEO', 'AUDIO'].indexOf(el.nodeName.toUpperCase()) !== -1)) return;

    var error, success, constraints;

    // notice user when an error occurred
    error = function() {
      alert('an error occurred when the browser trying to record the view stream!');
    }

    // set the video source to the stream when success to connect
    success = function(stream) {
      win.URL = win.URL || win.webkitURL;
      el.src = win.URL ? win.URL.createObjectURL(stream) : stream;
      // render callback when the metadata of the video is loaded

      el.addEventListener('loadedmetadata', function(e) {
        callback && callback(e);
        !el.autoplay && el.play();
      }, false);
    }

    // decide what to capture
    switch (type) {
      case 'video': constraints = { video: true }
        break;
      case 'audio': constraints = { audio: true }
        break;
      default : constraints = {
        video: true,
        audio: true
      }
    }

    // SPECIFIC: navigator.getUserMedia ( constraints, successCallback, errorCallback );
    // NOTE: resolve wrapping error:
    //  `NS_ERROR_XPC_BAD_OP_ON_WN_PROTO: Illegal operation on WrappedNative prototype object`
    navigator.getUserMedia ? navigator.getUserMedia(constraints, success, error) :
      navigator[R._api.name](constraints, success, error);
  }

  /* take picture
   * @param video {DOM Element} the video element
   * @param type {String} 'image/jpeg' by default
   * @return Image {String: DataURL}
   */
  R.snapshot = function(video, type) {

    if (!(video && video.videoHeight)) return;

    // using canvas to generate snapshot
    var canvas = doc.createElement('canvas')
      , ctx = canvas.getContext('2d');

    type = type || 'image/jpeg';

    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;

    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL(type);
  }

  /* upload to server
   * @param url {String} request url
   * @param data {Object} data to send
   * @param callback {Function} the first argument is the response
   */
  R.upload = function(url, data, callback) {

    // make sure url is a String, and, when data exists, it should be an Object
    if((typeof url !== 'string') || (data && Object.prototype.toString.call(data) !== '[object Object]')) return;

    data = data || {};
    callback = callback || function(){};

    var formData = new FormData()
      , xhr = new XMLHttpRequest()
      , dataURItoBlob;

    // covert data-uri to blob
    // copyright: http://stackoverflow.com/a/11954337
    dataURItoBlob = function(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }

      return new Blob([new Uint8Array(array)], {
        type: dataURI.slice(5, dataURI.indexOf(';'))
      });
    };

    // send data with `FormData` format
    Object.keys(data).forEach(function(key) {
      var value = data[key];

      // data-uri to blob
      if(value.slice(0, 10) === 'data:image') value = dataURItoBlob(value);
      formData.append(key, value);
    });

    // listen and apply callback
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        callback.call(this, xhr.response);
        xhr.onreadystatechange = null;
      }
    };

    xhr.open('POST', url);
    xhr.send(formData);
  }

  return R;

})(Recorder || {}, window, document);