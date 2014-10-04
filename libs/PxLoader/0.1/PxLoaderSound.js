/*global PxLoader: true, define: true, soundManager: true */ 

// PxLoader plugin to load sound using SoundManager2
function PxLoaderSound(id, url, tags, priority) {
    var self = this,
        loader = null;

    // For iOS and Android, soundManager2 uses a global audio object so we 
    // can't preload multiple sounds. We'll have to hope they load quickly
    // when we need to play them. Unfortunately, SM2 doesn't expose
    // a property to indicate its using a global object. For now we'll
    // use the same tests they use.
    var isIOS = navigator.userAgent.match(/(ipad|iphone|ipod)/i),
        isAndroid = navigator.userAgent.match(/android/i);
    this.useGlobalHTML5Audio = isIOS || isAndroid;

    this.tags = tags;
    this.priority = priority;
    this.sound = soundManager['createSound']({
        'id': id,
        'url': url,
        'autoLoad': false,
        'onload': function() {
            loader.onLoad(self);
        },

        // HTML5-only event: Fires when a browser has chosen to stop downloading.
        // "The user agent is intentionally not currently fetching media data,
        // but does not have the entire media resource downloaded."
        'onsuspend': function() {
            loader.onTimeout(self);
        },

        // Fires at a regular interval when a sound is loading and new data
        // has been received.
        'whileloading': function() {
            var bytesLoaded = this['bytesLoaded'],
                bytesTotal = this['bytesTotal'];

            // TODO: provide percentage complete updates to loader?
            // see if we have loaded the file
            if (bytesLoaded > 0 && (bytesLoaded === bytesTotal)) {
                loader.onLoad(self);
            }
        }
    });

    this.start = function(pxLoader) {
        // we need the loader ref so we can notify upon completion
        loader = pxLoader;

        // can't preload when a single global audio element is used
        if (this.useGlobalHTML5Audio) {
            loader.onTimeout(self);
        } else {
            this.sound['load']();
        }
    };

    this.checkStatus = function() {
        switch(self.sound['readyState']) {
            case 0:
                // uninitialised
                break;
            case 1:
                // loading
                break;
            case 2:
                // failed/error
                loader.onError(self);
                break;
            case 3:
                // loaded/success
                loader.onLoad(self);
                break;
        }
    };

    this.onTimeout = function() {
        loader.onTimeout(self);
    };

    this.getName = function() {
        return url;
    };
}

// add a convenience method to PxLoader for adding a sound
PxLoader.prototype.addSound = function(id, url, tags, priority) {
    var soundLoader = new PxLoaderSound(id, url, tags, priority);
    this.add(soundLoader);
    return soundLoader.sound;
};

// AMD module support
if (typeof define === 'function' && define.amd) {
    define('PxLoaderSound', [], function() {
        return PxLoaderSound;
    });
}