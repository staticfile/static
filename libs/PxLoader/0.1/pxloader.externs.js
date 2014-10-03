/**
 * @constructor
 * @this {PxLoader}
 * @param {Object} settings
 */
function PxLoader(settings) {}
PxLoader.prototype.settings = {};
PxLoader.prototype.add = function(resource) {};


// TODO: improve event info declaration
var PxLoaderProgressInfo = {
    resource: { img: {}, sound: {}, video: {} },
    loaded: {},
    error: {},
    timeout: {},
    completedCount: {},
    totalCount: {}
};

/**
 * @param {function(PxLoaderProgressInfo)} callback
 * @param {string|Array} tags
 */
PxLoader.prototype.addProgressListener = function(callback, tags) {};
/**
 * @param {function(Object)} callback
 * @param {string|Array} tags
 */
PxLoader.prototype.addCompletionListener = function(callback, tags) {};
PxLoader.prototype.start = function(orderedTags) {};
PxLoader.prototype.isBusy = function() {};
PxLoader.prototype.onLoad = function(resource) {};
PxLoader.prototype.onError = function(resource) {};
PxLoader.prototype.onTimeout = function(resource) {};
PxLoader.prototype.log = function(showAll) {};

/**
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
PxLoader.prototype.addImage = function(url, tags, priority) {};
/**
 * @param {*} id
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
PxLoader.prototype.addSound = function(id, url, tags, priority) {};
/**
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
PxLoader.prototype.addVideo = function(url, tags, priority) {};

/**
 * @constructor
 * @this {PxLoaderImage}
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
function PxLoaderImage(url, tags, priority) {}
/**
 * @param {PxLoader} pxLoader
 */
PxLoaderImage.prototype.start = function(pxLoader) {};
PxLoaderImage.prototype.checkStatus = function() {};
PxLoaderImage.prototype.onTimeout = function() {};
PxLoaderImage.prototype.getName = function() {};
PxLoaderImage.prototype.img = {};

/**
 * @constructor
 * @this {PxLoaderSound}
 * @param {*} id
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
function PxLoaderSound(id, url, tags, priority) {}
/**
 * @param {PxLoader} pxLoader
 */
PxLoaderSound.prototype.start = function(pxLoader) {};
PxLoaderSound.prototype.checkStatus = function() {};
PxLoaderSound.prototype.onTimeout = function() {};
PxLoaderSound.prototype.getName = function() {};
PxLoaderSound.prototype.sound = {};

/**
 * @constructor
 * @this {PxLoaderVideo}
 * @param {string} url
 * @param {string|Array} tags
 * @param {number} priority
 */
function PxLoaderVideo(url, tags, priority) {}
/**
 * @param {PxLoader} pxLoader
 */
PxLoaderVideo.prototype.start = function(pxLoader) {};
PxLoaderVideo.prototype.checkStatus = function() {};
PxLoaderVideo.prototype.onTimeout = function() {};
PxLoaderVideo.prototype.getName = function() {};
PxLoaderVideo.prototype.video = {};
