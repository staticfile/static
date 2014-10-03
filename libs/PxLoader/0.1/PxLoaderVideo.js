/*global PxLoader: true, define: true, Video: true */ 

// PxLoader plugin to load video elements
function PxLoaderVideo(url, tags, priority) {
    var self = this;
    var loader = null;

    this.readyEventName = 'canplaythrough';

    try {
        this.vid = new Video();
    } catch(e) {
        this.vid = document.createElement('video');
    }

    this.tags = tags;
    this.priority = priority;

    var onReadyStateChange = function() {
        if (self.vid.readyState !== 4) {
            return;
        }

        removeEventHandlers();
        loader.onLoad(self);
    };

    var onLoad = function() {
        removeEventHandlers();
        loader.onLoad(self);
    };

    var onError = function() {
        removeEventHandlers();
        loader.onError(self);
    };

    var removeEventHandlers = function() {
        self.unbind('load', onLoad);
        self.unbind(self.readyEventName, onReadyStateChange);
        self.unbind('error', onError);
    };

    this.start = function(pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // NOTE: Must add event listeners before the src is set. We
        // also need to use the readystatechange because sometimes
        // load doesn't fire when an video is in the cache.
        self.bind('load', onLoad);
        self.bind(self.readyEventName, onReadyStateChange);
        self.bind('error', onError);

        // sometimes the browser will intentionally stop downloading
        // the video. In that case we'll consider the video loaded
        self.bind('suspend', onLoad);

        self.vid.src = url;
        self.vid.load();
    };

    // called by PxLoader to check status of video (fallback in case
    // the event listeners are not triggered).
    this.checkStatus = function() {
        if (self.vid.readyState !== 4) {
            return;
        }

        removeEventHandlers();
        loader.onLoad(self);
    };

    // called by PxLoader when it is no longer waiting
    this.onTimeout = function() {
        removeEventHandlers();
        if (self.vid.readyState !== 4) {
            loader.onLoad(self);
        } else {
            loader.onTimeout(self);
        }
    };

    // returns a name for the resource that can be used in logging
    this.getName = function() {
        return url;
    };

    // cross-browser event binding
    this.bind = function(eventName, eventHandler) {
        if (self.vid.addEventListener) {
            self.vid.addEventListener(eventName, eventHandler, false);
        } else if (self.vid.attachEvent) {
            self.vid.attachEvent('on' + eventName, eventHandler);
        }
    };

    // cross-browser event un-binding
    this.unbind = function(eventName, eventHandler) {
        if (self.vid.removeEventListener) {
            self.vid.removeEventListener(eventName, eventHandler, false);
        } else if (self.vid.detachEvent) {
            self.vid.detachEvent('on' + eventName, eventHandler);
        }
    };

}

// add a convenience method to PxLoader for adding an image
PxLoader.prototype.addVideo = function(url, tags, priority) {
    var videoLoader = new PxLoaderVideo(url, tags, priority);
    this.add(videoLoader);

    // return the vid element to the caller
    return videoLoader.vid;
};

// AMD module support
if (typeof define === 'function' && define.amd) {
    define('PxLoaderVideo', [], function() {
        return PxLoaderVideo;
    });
}