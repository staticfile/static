//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------


/**
# scrawlImages

## Purpose and features

The Images module adds support for displaying images on canvas elements

* Defines the Picture entity, which can be used to display file images (including animated entity sheets), other &lt;canvas&gt; elements, and &lt;video&gt; elements (experimental)
* Defines the Pattern design, which uses images for entity fillStyle and strokeStyle attributes

@module scrawlImages
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'images')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlImages module adaptions to the Scrawl library object

## New library sections

* scrawl.image - for ScrawlImage objects
* scrawl.img - linking to copies of DOM &lt;img&gt; elements - links to the original elements are stored in scrawl.object
* scrawl.anim - for AnimSheet objects

@class window.scrawl_Images
**/

		/**
Alias for makePattern()
@method newPattern
@deprecated
**/
		my.newPattern = function(items) {
			return my.makePattern(items);
		};
		/**
Alias for makePicture()
@method newPicture
@deprecated
**/
		my.newPicture = function(items) {
			return my.makePicture(items);
		};
		/**
A __factory__ function to generate new Pattern objects
@method makePattern
@param {Object} items Key:value Object argument for setting attributes
@return Pattern object
**/
		my.makePattern = function(items) {
			return new my.Pattern(items);
		};
		/**
A __factory__ function to generate new Picture entitys
@method makePicture
@param {Object} items Key:value Object argument for setting attributes
@return Picture entity object
**/
		my.makePicture = function(items) {
			return new my.Picture(items);
		};

		/**
video support

False if device does not support the video element; true otherwise
@property Device.video
@type Boolean
@default false
**/
		my.work.d.Device.video = false;
		/**
video autoplay support

False if device does not support video autoplay element; true otherwise
@property Device.videoAutoplay
@type Boolean
@default false
**/
		my.work.d.Device.videoAutoplay = false;
		/**
video fullscreen restraint

False if device does not force videos to play in fullscreen mode; true otherwise
@property Device.videoForceFullScreen
@type Boolean
@default false
**/
		my.work.d.Device.videoForceFullScreen = false;
		/**
video as canvas source

False if device does not permit video elements to be used as sources for canvas draw functions
@property Device.videoAsCanvasSource
@type Boolean
@default false
**/
		my.work.d.Device.videoAsCanvasSource = false;

		/**
Check if device supports various video functionalities
@method getImagesDeviceData
@private
**/
		my.Device.prototype.getImagesDeviceData = function() {
			var v = document.createElement('video'),
				c, x, test,
				mp4, mp4Type, webm, webmType, ogg, oggType,
				src, type,
				autoplay = true;

			this.video = false;
			this.videoAutoplay = false;
			this.videoAsCanvasSource = false;
			this.videoForceFullScreen = false;

			//test 1
			this.video = my.xt(v.poster);

			if (this.video && this.canvas) {
				c = document.createElement('canvas');
				c.width = 10;
				c.height = 10;
				x = c.getContext('2d');

				mp4Type = 'video/mp4';
				mp4 = 'data:video/mp4;base64, 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';

				webmType = 'video/webm';
				webm = 'data:video/webm;base64, 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';

				oggType = 'video/ogg';
				ogg = 'data:video/ogg;base64, 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qiCkUlIpFYRUSiolo5RSailVEFIpqZQKQiollVIAANiBAwDYgYVQaMhKACAPAIAwRinGGHNOIqQUY845JxFSijHnnJNKMeacc85JKRlzzDnnpJTOOeecc1JK5pxzzjkppXPOOeeclFJK55xzTkopJYTOQSellNI555wTAABU4AAAEGCjyOYEI0GFhqwEAFIBAAyOY1ma5nmiaJqWJGma53meKJqmJkma5nmeJ4qqyfM8TxRF0TRVled5niiKommqKtcVRdM0TVVVXbIsiqZpmqrqujBN01RV13VdmKZpqqrrui5sW1VV1XVlGbatqqrqurIMXNd1ZdmWgSy7ruzasgAA8AQHAKACG1ZHOCkaCyw0ZCUAkAEAQBiDkEIIIWUQQgohhJRSCAkAABhwAAAIMKEMFBqyEgBIBQAAjLHWWmuttdZAZ6211lprrYDMWmuttdZaa6211lprrbXWUmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaay2llFJKKaWUUkoppZRSSimllFJKBQD6VTgA+D/YsDrCSdFYYKEhKwGAcAAAwBilGHMMQimlVAgx5px0VFqLsUKIMeckpNRabMVzzkEoIZXWYiyecw5CKSnFVmNRKYRSUkottliLSqGjklJKrdVYjDGppNZai63GYoxJKbTUWosxFiNsTam12GqrsRhjayottBhjjMUIX2RsLabaag3GCCNbLC3VWmswxhjdW4ultpqLMT742lIsMdZcAAB3gwMARIKNM6wknRWOBhcashIACAkAIBBSijHGGHPOOeekUow55pxzDkIIoVSKMcaccw5CCCGUjDHmnHMQQgghhFJKxpxzEEIIIYSQUuqccxBCCCGEEEopnXMOQgghhBBCKaWDEEIIIYQQSiilpBRCCCGEEEIIqaSUQgghhFJCKCGVlFIIIYQQQiklpJRSCiGEUkIIoYSUUkophRBCCKWUklJKKaUSSgklhBJSKSmlFEoIIZRSSkoppVRKCaGEEkopJaWUUkohhBBKKQUAABw4AAAEGEEnGVUWYaMJFx6AQkNWAgBkAACQopRSKS1FgiKlGKQYS0YVc1BaiqhyDFLNqVLOIOYklogxhJSTVDLmFEIMQuocdUwpBi2VGELGGKTYckuhcw4AAABBAICAkAAAAwQFMwDA4ADhcxB0AgRHGwCAIERmiETDQnB4UAkQEVMBQGKCQi4AVFhcpF1cQJcBLujirgMhBCEIQSwOoIAEHJxwwxNveMINTtApKnUgAAAAAAAMAPAAAJBcABER0cxhZGhscHR4fICEiIyQCAAAAAAAFwB8AAAkJUBERDRzGBkaGxwdHh8gISIjJAEAgAACAAAAACCAAAQEBAAAAAAAAgAAAAQET2dnUwAAQAAAAAAAAAAjaKehAgAAAEhTii0BRjLV6A+997733vvfe+997733vvfG+8fePvH3j7x94+8fePvH3j7x94+8fePvH3j7x94+8fePvH3gAAAAAAAAAAXm5PqUgABPZ2dTAABLAAAAAAAAACNop6EDAAAAIOuvQAsAAAAAAAAAAAAAAE9nZ1MAAEADAAAAAAAAI2inoQQAAAB/G0m4ATg/8A+997733vvfe+997733vvfK+8B94D7wAB94AAAAD8Kl94D7wH3gAD7wAAAAH4VABem0+pSAAE9nZ1MAAEsDAAAAAAAAI2inoQUAAABc3zKaCwAAAAAAAAAAAAAAT2dnUwAEQAYAAAAAAAAjaKehBgAAAOytEQUBOD/wD733vvfe+997733vvfe+98r7wH3gPvAAH3gAAAAPwqX3gPvAfeAAPvAAAAAfhUAF6bT6lIAAT2dnUwAAQL4AAAAAAACWSy/CAgAAAHsqKaIxAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAKDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg5PZ2dTAAQAxAAAAAAAAJZLL8IDAAAABLWpWwIBAQ4O';

				if (v.canPlayType('video/webm')) {
					type = webmType;
					src = webm;
				}
				else if (v.canPlayType('video/mp4')) {
					type = mp4Type;
					src = mp4;
				}
				else {
					type = oggType;
					src = ogg;
				}
				v.muted = true;
				v.autoplay = true;

				//test 2
				window.addEventListener('mouseup', function myautoplayvideochecker() {
					autoplay = false;
					v.play();
					window.removeEventListener('mouseup', myautoplayvideochecker, false);
				}, false);
				v.addEventListener('playing', function myautoplayvideo() {
					if (autoplay) {
						my.device.videoAutoplay = true;
						v.removeEventListener('playing', myautoplayvideo, false);
					}
				}, false);

				//test 3
				v.addEventListener('playing', function myusevideo() {
					try {
						v.pause();
						v.currentTime = 0.5;
						x.drawImage(v, 50, 50, 10, 10, 0, 0, 10, 10);
						setTimeout(function() {
							test = x.getImageData(0, 0, 1, 1);
							my.device.videoAsCanvasSource = (test.data[3] > 0) ? true : false;
							v.removeEventListener('playing', myusevideo, false);
						}, 50);
					}
					catch (e) {
						my.device.videoAsCanvasSource = false;
						v.removeEventListener('playing', myusevideo, false);
					}
				}, false);

				//test 4
				v.addEventListener('webkitbeginfullscreen', function myforcefullscreenvideo1() {
					v.webkitExitFullScreen();
					my.device.videoForceFullScreen = true;
					v.removeEventListener('webkitbeginfullscreen', myforcefullscreenvideo1, false);
				}, false);
				v.addEventListener('webkitfullscreenchange', function myforcefullscreenvideo2() {
					v.webkitExitFullScreen();
					my.device.videoForceFullScreen = true;
					v.removeEventListener('webkitfullscreenchange', myforcefullscreenvideo2, false);
				}, false);

				v.type = type;
				v.src = src;
			}
		};

		/**
A __factory__ function to convert a entity into a Picture entity

Argument attributes can include any entity positioning and styling values, alongside the following flag:

* __convert__ - when set to true, existing entity will be deleted; default: false

If no name attribute is supplied in the argument object, the new Picture entity will be given the name: SPRITENAME+'_picture'
@method Entity.convertToPicture
@param {Object} items Key:value Object argument for setting attributes
@return Picture entity object
**/
		my.Entity.prototype.convertToPicture = function(items) {
			var image,
				cell,
				engine,
				cellname = my.group[this.group].cell;
			items = my.safeObject(items);
			cell = my.cell[cellname];
			engine = my.context[cellname];
			image = my.prepareConvert(cell, engine, this);
			items.name = items.name || this.name + '_picture';
			items.group = items.group || this.group;
			if (items.convert) {
				my.deleteEntity([this.name]);
			}
			return my.doConvert(image, items);
		};
		/**
A __factory__ function to convert a group of entitys into a single Picture entity

Argument attributes can include any entity positioning and styling values, alongside the following flag:

* __convert__ - when set to true, existing entitys in the group will be deleted; default: false

If no name attribute is supplied in the argument object, the new Picture entity will be given the name: GROUPNAME+'_entity'
@method Group.convertGroupToPicture
@param {Object} items Key:value Object argument for setting attributes
@return Picture entity object; false if no entitys contained in group
**/
		my.Group.prototype.convertGroupToPicture = function(items) {
			var image,
				cell,
				engine;
			items = my.safeObject(items);
			if (this.entitys.length > 0) {
				cell = my.cell[this.cell];
				engine = my.context[this.cell];
				image = my.prepareConvert(cell, engine, this);
				items.name = items.name || this.name + '_entity';
				items.group = items.group || this.name;
				if (items.convert) {
					my.deleteEntity(this.entitys);
				}
				return my.doConvert(image, items);
			}
			return false;
		};
		/**
Helper function for convert functions
@method prepareConvert
@return ImageData object
@private
**/
		my.prepareConvert = function(cell, ctx, obj) {
			var image,
				data,
				left,
				right,
				top,
				bottom,
				pos,
				i,
				iz,
				j,
				jz;
			left = cell.actualWidth;
			right = 0;
			top = cell.actualHeight;
			bottom = 0;
			cell.clear();
			obj.stamp(null, cell.name);
			image = ctx.getImageData(0, 0, cell.actualWidth, cell.actualHeight);
			data = image.data;
			for (i = 0, iz = cell.actualHeight; i < iz; i++) {
				for (j = 0, jz = cell.actualWidth; j < jz; j++) {
					pos = (((i * cell.actualWidth) + j) * 4) + 3;
					if (data[pos] > 0) {
						top = (top > i) ? i : top;
						bottom = (bottom < i) ? i : bottom;
						left = (left > j) ? j : left;
						right = (right < j) ? j : right;
					}
				}
			}
			image = ctx.getImageData(left, top, (right - left + 1), (bottom - top + 1));
			cell.clear();
			return image;
		};
		/**
Helper function for convert functions
@method doConvert
@return Picture entity object
@private
**/
		my.doConvert = function(image, items) {
			var cv = my.work.imageCanvas;
			cv.width = image.width;
			cv.height = image.height;
			my.work.imageCvx.putImageData(image, 0, 0);
			items.url = cv.toDataURL();
			items.width = image.width;
			items.height = image.height;
			image = my.makeImage(items);
			return my.makePicture(items);
		};
		/**
# Pattern

## Instantiation

* scrawl.makePattern()

## Purpose

* Defines a pattern
* Used with entity.strokeStyle and entity.fillStyle attributes

Note that a pattern image will always start at the entity's rotation/reflection (start vector) position, extending in all directions. To move a entity over a 'static' (cell-bound) pattern, more inventive solutions need to be found - for instance a combination of Picture entitys, dedicated cells and the 'source-in' globalCompositeOperation attribute.

Patterns are not restricted to images. A pattern can also be sourced from another cell (canvas element) or even a video element.

## Access

* scrawl.design.PATTERNNAME - for the Pattern design object

@class Pattern
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Pattern = function(items) {
			var temp;
			if (my.isa(items, 'obj') && my.xt(items.url) && !my.xt(items.dynamic)) {
				items.dynamic = true;
				temp = my.makeImage(items);
				items.source = temp.name;
				return my.makePattern(items);
			}
			else {
				items = my.safeObject(items);
				my.Base.call(this, items);
				my.Base.prototype.set.call(this, items);
				this.repeat = items.repeat || 'repeat';
				this.sourceType = this.getSourceType();
				my.design[this.name] = this;
				my.pushUnique(my.designnames, this.name);
				this.makeDesign();
			}
			return this;
		};
		my.Pattern.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Pattern'
@final
**/
		my.Pattern.prototype.type = 'Pattern';
		my.Pattern.prototype.classname = 'designnames';
		my.work.d.Pattern = {
			/**
Drawing parameter
@property repeat
@type String
@default 'repeat'
**/
			repeat: 'repeat',
			/**
CELLNAME, VIDEONAME or IMAGENAME of Pattern source data
@property source
@type String
@default ''
**/
			source: '',
			/**
Drawing flag - when set to true, force the pattern to update each drawing cycle - only required in the simplest scenes where fillStyle and strokeStyle do not change between entities
@property autoUpdate
@type Boolean
@default false
**/
			autoUpdate: false,
			/**
Asynchronous loading of image file from the server - path/to/image file

Used only with __scrawl.makePattern()__ and __Pattern.clone()__ operations. This attribute is not retained
@property url
@type String
@default ''
**/
			/**
Asynchronous loading of image file from the server - function to run once image has successfully loaded

Used only with __scrawl.makePattern()__ and __Pattern.clone()__ operations. This attribute is not retained
@property callback
@type Function
@default undefined
**/
			callback: false,
		};
		my.mergeInto(my.work.d.Pattern, my.work.d.Base);
		/**
Constructor/set helper
@method getSourceType
@return String - one from: 'image', 'cell', 'video'; false on failure to identify source type
**/
		my.Pattern.prototype.getSourceType = function() {
			var contains = my.contains,
				source = this.source;
			if (contains(my.imagenames, source)) {
				return 'image';
			}
			if (contains(my.cellnames, source)) {
				return 'cell';
			}
			if (contains(my.videonames, source)) {
				return 'video';
			}
			return false;
		};
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Pattern.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.sourceType = this.getSourceType();
			this.makeDesign();
			return this;
		};
		/**
Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
@method getData
@return JavaScript pattern object, or String
@private
**/
		my.Pattern.prototype.getData = function(entity, cell) {
			if (!this.sourceType) {
				this.sourceType = this.getSourceType();
				this.makeDesign(entity, cell);
			}
			return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
		};
		/**
Builds &lt;canvas&gt; element's contenxt engine's pattern object
@method makeDesign
@return This
@chainable
@private
**/
		my.Pattern.prototype.makeDesign = function(entity, cell) {
			var temp,
				engine;
			cell = my.xtGet(cell, this.cell);
			engine = my.context[cell];
			if (my.xt(engine)) {
				switch (this.sourceType) {
					case 'video':
						if (scrawl.xt(my.asset[this.source])) {
							temp = my.video[this.source].api;
							if (temp.readyState > 1) {
								my.dsn[this.name] = engine.createPattern(my.asset[this.source], this.repeat);
							}
							else {
								my.dsn[this.name] = undefined;
							}
						}
						break;
					case 'cell':
						if (scrawl.xt(my.canvas[this.source])) {
							my.dsn[this.name] = engine.createPattern(my.canvas[this.source], this.repeat);
						}
						break;
					case 'image':
						if (scrawl.xt(my.asset[this.source])) {
							my.dsn[this.name] = engine.createPattern(my.asset[this.source], this.repeat);
						}
						break;
				}
			}
			return this;
		};
		/**
Remove this pattern from the scrawl-canvas library
@method remove
@return Always true
**/
		my.Pattern.prototype.remove = function() {
			delete my.dsn[this.name];
			delete my.design[this.name];
			my.removeItem(my.designnames, this.name);
			return true;
		};
		/**
Alias for Pattern.makeDesign()
@method update
@return This
@chainable
**/
		my.Pattern.prototype.update = function(entity, cell) {
			return this.makeDesign(entity, cell);
		};

		/**
# Picture

## Instantiation

* scrawl.makePicture()

## Purpose

* Defines rectangular image-based objects for displaying on a Cell's canvas
* Used to display both static and entity sheet image animations
* Links to details of an image's data; can use image data (rgba data) during collision detection
* Can handle video input (experimental)
* Performs 'rect' and 'drawImage' drawing operations on canvases

## Access

* scrawl.entity.PICTURENAME - for the Picture entity object

@class Picture
@constructor
@extends Entity
@uses AnimSheet
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Picture = function(items) {
			var temp,
				tempV,
				src,
				get = my.xtGet,
				xt = my.xt;
			if (my.isa(items, 'obj') && xt(items.url) && !xt(items.dynamic)) {
				items.dynamic = true;
				temp = my.makeImage(items);
				items.source = temp.name;
				return my.makePicture(items);
			}
			else {
				items = my.safeObject(items);
				if (xt(items.source)) {
					src = get(my.image[items.source], my.video[items.source], my.cell[items.source], false);
					my.Entity.call(this, items);
					tempV = my.safeObject(items.paste);
					this.start.x = get(items.pasteX, tempV.x, this.start.x);
					this.start.y = get(items.pasteY, tempV.y, this.start.y);
					this.copyWidth = my.xtGetTrue(items.copyWidth, src.actualWidth, src.width, '100%');
					this.copyHeight = my.xtGetTrue(items.copyHeight, src.actualHeight, src.height, '100%');
					this.width = get(items.pasteWidth, items.width, this.copyWidth);
					this.height = get(items.pasteHeight, items.height, this.copyHeight);
					my.Position.prototype.set.call(this, items);
					this.source = items.source;
					this.imageType = this.sourceImage();
					tempV = my.safeObject(items.copy);
					this.copy = my.makeVector({
						x: get(items.copyX, tempV.x, 0),
						y: get(items.copyY, tempV.y, 0),
						name: this.type + '.' + this.name + '.copy'
					});
					this.registerInLibrary();
					this.copyData = {};
					this.pasteData = {};
					this.setCopy();
					this.setPaste();
					return this;
				}
			}
			return false;
		};
		my.Picture.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Picture'
@final
**/
		my.Picture.prototype.type = 'Picture';
		my.Picture.prototype.classname = 'entitynames';
		my.work.d.Picture = {
			/**
IMAGENAME String - source image for this entity
@property source
@type String
@default ''
**/
			source: '',
			/**
IMAGEDATANAME String - name of the Image Data object

Calculated automatically by scrawl-canvas following a .getImageData() call
@property imageData
@type String
@default ''
**/
			imageData: '',
			/**
Collision attribute - name of channel to be checked against during collision detection

Permitted values: 'red', 'blue', 'green', 'alpha'
@property imageDataChannel
@type String
@default 'alpha'
**/
			imageDataChannel: 'alpha',
			/**
SPRITEANIMATIONNAME String - Entity sheet image linked to this entity
@property animSheet
@type String
@default ;;
**/
			animation: '',
			/**
Identifier String - permitted values include: 'animation', 'canvas', 'img'

Detected automatically by scrawl-canvas during entity construction
@property imageType
@type String
@default ''
@private
**/
			imageType: '',
			/**
Collision flag - when true, Picture entity will use imageData to determine whether a collision has occured; when false, a simpler box collision system is used
@property checkHitUsingImageData
@type Boolean
@default false
**/
			checkHitUsingImageData: false,
			/**
The coordinate Vector representing the Picture's copy source position on its source;

Picture supports the following 'virtual' attributes for this attribute:

* __copyX__ - (Number) the x coordinate on the source
* __copyY__ - (Number) the y coordinate on the sourcecopy

@property copy
@type Vector
**/
			copy: false,
			/**
Copy width, in pixels. Determines which portion of this Picture's source will be copied
@property copyWidth
@type Number
@default 300
**/
			copyWidth: 300,
			/**
Copy height, in pixels. Determines which portion of this Picture's source will be copied
@property copyHeight
@type Number
@default 150
**/
			copyHeight: 150,
			/**
Local source data
@property copyData
@type Object
@default false
@private
**/
			copyData: false,
			/**
Local target data
@property pasteData
@type Object
@default false
@private
**/
			pasteData: false,
			/**
Asynchronous loading of image file from the server - path/to/image file

Used only with __scrawl.makePicture()__ and __Picture.clone()__ operations. This attribute is not retained
@property url
@type String
@default ''
**/
			/**
Prevent a clone from reverting to copyWidth = copyHeight = 100%

By default a clone will copy all of the image, whether or not copyHeight or copyWidth have been set to values other than 100%; setting this attribute to true (default: false) ensures the clone's copy dimensions respect the attributes passed to it.

Used only with __Picture.clone()__ operations. This attribute is not retained
@property keepCopyDimensions
@type Boolean
@default false
**/

			/**
Asynchronous loading of image file from the server - function to run once image has successfully loaded

Used only with __scrawl.makePicture()__ and __Picture.clone()__ operations. This attribute is not retained
@property callback
@type Function
@default undefined
**/
			callback: false,
		};
		my.mergeInto(my.work.d.Picture, my.work.d.Entity);
		/**
Augments Entity.get()
@method get
@param {String} item Attribute to be retrieved
@return Attribute value
**/
		my.Picture.prototype.get = function(item) {
			if (my.contains(my.work.animKeys, item)) {
				return my.spriteanimation[this.animation].get(item);
			}
			else if (item === 'width') {
				return this.pasteData.w;
			}
			else if (item === 'height') {
				return this.pasteData.h;
			}
			else {
				return my.Entity.prototype.get.call(this, item);
			}
		};
		/**
Augments Entity.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Picture.prototype.set = function(items) {
			var temp,
				xt = my.xt,
				xto = my.xto,
				get = my.xtGet;
			my.Entity.prototype.set.call(this, items);
			if (xto(items.paste, items.pasteX, items.pasteY)) {
				temp = my.safeObject(items.paste);
				this.start.x = get(items.pasteX, temp.x, this.start.x);
				this.start.y = get(items.pasteY, temp.y, this.start.y);
			}
			if (xto(items.pasteWidth, items.width)) {
				this.width = get(items.pasteWidth, items.width, this.width);
			}
			if (xto(items.pasteHeight, items.height)) {
				this.height = get(items.pasteHeight, items.height, this.height);
			}
			if (xto(items.copy, items.copyX, items.copyY)) {
				temp = my.safeObject(items.copy);
				this.copy.x = get(items.copyX, temp.x, this.copy.x);
				this.copy.y = get(items.copyY, temp.y, this.copy.y);
			}
			if (xt(items.copyWidth)) {
				this.copyWidth = get(items.copyWidth, this.copyWidth);
			}
			if (xt(items.copyHeight)) {
				this.copyHeight = get(items.copyHeight, this.copyHeight);
			}
			if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY)) {
				this.currentStart.flag = false;
			}
			if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
				this.setPaste();
			}
			if (xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height)) {
				this.setCopy();
			}
			if (xt(this.animation)) {
				my.spriteanimation[this.animation].set(items);
			}
			return this;
		};
		/**
Augments Entity.setDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Picture.prototype.setDelta = function(items) {
			var temp,
				x,
				y,
				w,
				h,
				perc = my.addPercentages,
				start = this.start,
				copy = this.copy,
				xto = my.xto,
				get = my.xtGet,
				so = my.safeObject;
			my.Entity.prototype.setDelta.call(this, items);
			items = so(items);
			if (xto(items.paste, items.pasteX, items.pasteY)) {
				temp = so(items.paste);
				x = get(items.pasteX, temp.x, 0);
				y = get(items.pasteY, temp.y, 0);
				start.x = (start.x.toFixed) ? start.x + x : perc(start.x, x);
				start.y = (start.y.toFixed) ? start.y + y : perc(start.y, y);
			}
			if (xto(items.pasteWidth, items.width)) {
				w = get(items.pasteWidth, items.width, 0);
				this.width = (this.width.toFixed) ? this.width + w : perc(this.width, w);
			}
			if (xto(items.pasteHeight, items.height)) {
				h = get(items.pasteHeight, items.height, 0);
				this.height = (this.height.toFixed) ? this.height + h : perc(this.height, h);
			}
			if (xto(items.copy, items.copyX, items.copyY)) {
				temp = so(items.copy);
				x = get(items.copyX, temp.x, 0);
				y = get(items.copyY, temp.y, 0);
				copy.x = (copy.x.toFixed) ? copy.x + x : perc(copy.x, x);
				copy.y = (copy.y.toFixed) ? copy.y + y : perc(copy.y, y);
			}
			if (xto(items.copyWidth, items.width)) {
				w = get(items.copyWidth, items.width);
				this.copyWidth = (this.copyWidth.toFixed) ? this.copyWidth + w : perc(this.copyWidth, w);
			}
			if (xto(items.copyHeight, items.height)) {
				h = get(items.copyHeight, items.height);
				this.copyHeight = (this.copyHeight.toFixed) ? this.copyHeight + h : perc(this.copyHeight, h);
			}
			if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY)) {
				this.currentStart.flag = false;
			}
			if (xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
				this.setPaste();
			}
			if (xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height)) {
				this.setCopy();
			}
			return this;
		};
		/**
Picture.setCopy update copyData object values
@method setCopy
@chainable
@private
**/
		my.Picture.prototype.setCopy = function() {
			var w,
				h,
				perc = this.numberConvert,
				src = this.source,
				copy = this.copy,
				copyData = this.copyData,
				between = my.isBetween;
			switch (this.imageType) {
				case 'video':
					w = my.video[src].width;
					h = my.video[src].height;
					break;
				case 'img':
					w = my.image[src].width;
					h = my.image[src].height;
					break;
				case 'canvas':
					w = my.cell[src].actualWidth;
					h = my.cell[src].actualHeight;
					break;
				default:
					//do nothing for animations
			}
			if (this.imageType !== 'animation') {
				copyData.x = (copy.x.substring) ? perc(copy.x, w) : copy.x;
				copyData.y = (copy.y.substring) ? perc(copy.y, h) : copy.y;
				if (!between(copyData.x, 0, w - 1, true)) {
					copyData.x = (copyData.x < 0) ? 0 : w - 1;
				}
				if (!between(copyData.y, 0, h - 1, true)) {
					copyData.y = (copyData.y < 0) ? 0 : h - 1;
				}
				copyData.w = (this.copyWidth.substring) ? perc(this.copyWidth, w) : this.copyWidth;
				copyData.h = (this.copyHeight.substring) ? perc(this.copyHeight, h) : this.copyHeight;
				if (!between(copyData.w, 1, w, true)) {
					copyData.w = (copyData.w < 1) ? 1 : w;
				}
				if (!between(copyData.h, 1, h, true)) {
					copyData.h = (copyData.h < 1) ? 1 : h;
				}
				if (copyData.x + copyData.w > w) {
					copyData.x = w - copyData.w;
				}
				if (copyData.y + copyData.h > h) {
					copyData.y = h - copyData.h;
				}
			}
			this.imageData = false;
			return this;
		};
		/**
Picture.setPaste update pasteData object values
@method setPaste
@chainable
@private
**/
		my.Picture.prototype.setPaste = function() {
			var cell = my.cell[my.group[this.group].cell],
				perc = this.numberConvert,
				start,
				pasteData = this.pasteData;
			start = this.currentStart;
			if (!start.flag) {
				this.updateCurrentStart(cell);
			}
			pasteData.x = start.x;
			pasteData.y = start.y;
			pasteData.w = (this.width.substring) ? perc(this.width, cell.actualWidth) : this.width;
			pasteData.h = (this.height.substring) ? perc(this.height, cell.actualHeight) : this.height;
			pasteData.w *= this.scale;
			pasteData.h *= this.scale;
			if (pasteData.w < 1) {
				pasteData.w = 1;
			}
			if (pasteData.h < 1) {
				pasteData.h = 1;
			}
			return this;
		};
		/**
Augments Entity.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
		my.Picture.prototype.clone = function(items) {
			var a = my.Entity.prototype.clone.call(this, items);
			items = my.safeObject(items);
			if (!items.keepCopyDimensions) {
				a.fitToImageSize();
			}
			return a;
		};
		/**
Clone helper function
@method fitToImageSize
@return This
@chainable
@private
**/
		my.Picture.prototype.fitToImageSize = function() {
			var img;
			if (this.imageType === 'img') {
				img = my.image[this.source];
				this.set({
					copyWidth: img.get('width'),
					copyHeight: img.get('height'),
					copyX: 0,
					copyY: 0,
				});
			}
			return this;
		};
		/**
Constructor and clone helper function
@method sourceImage
@return Correct imageType attribute value for this entity
@private
**/
		my.Picture.prototype.sourceImage = function() {
			var cont = my.contains;
			if (cont(my.videonames, this.source)) {
				return 'video';
			}
			if (cont(my.imagenames, this.source)) {
				if (cont(my.spriteanimationnames, this.animation)) {
					return 'animation';
				}
				return 'img';
			}
			if (cont(my.cellnames, this.source)) {
				return 'canvas';
			}
			return false;
		};
		/**
Stamp helper function - update source and copy (for dynamically loading images)
@method checkSource
@return This
@chainable
@private
**/
		my.Picture.prototype.checkSource = function() {
			if (!this.imageType) {
				this.imageType = this.sourceImage();
				this.setCopy();
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.clip = function(ctx, cellname, cell) {
			var here = this.currentHandle,
				pasteData = this.pasteData;
			if (this.currentStart.flag) {
				this.checkSource();
				this.rotateCell(ctx, cell);
				ctx.beginPath();
				ctx.rect(here.x, here.y, pasteData.w, pasteData.h);
				ctx.clip();
			}
			return this;
		};
		/**
Stamp helper function - perform a 'none' method draw
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.none = function(ctx, cellname, cell) {
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.clear = function(ctx, cellname, cell) {
			var here = this.currentHandle,
				pasteData = this.pasteData;
			if (this.currentStart.flag) {
				this.rotateCell(ctx, cell);
				ctx.clearRect(here.x, here.y, pasteData.w, pasteData.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.clearWithBackground = function(ctx, cellname, cell) {
			var here = this.currentHandle,
				pasteData = this.pasteData,
				myctx = my.ctx[cellname];
			if (this.currentStart.flag) {
				this.rotateCell(ctx, cell);
				ctx.fillStyle = cell.backgroundColor;
				ctx.strokeStyle = cell.backgroundColor;
				ctx.globalAlpha = 1;
				ctx.strokeRect(here.x, here.y, pasteData.w, pasteData.h);
				ctx.fillRect(here.x, here.y, pasteData.w, pasteData.h);
				ctx.fillStyle = myctx.fillStyle;
				ctx.strokeStyle = myctx.strokeStyle;
				ctx.globalAlpha = myctx.globalAlpha;
			}
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.draw = function(ctx, cellname, cell) {
			var here = this.currentHandle,
				pasteData = this.pasteData;
			if (this.currentStart.flag) {
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.strokeRect(here.x, here.y, pasteData.w, pasteData.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.fill = function(ctx, cellname, cell) {
			var here, data, cd, pd;
			data = this.getImage();
			cd = this.copyData;
			pd = this.pasteData;
			if (this.currentStart.flag && data) {
				here = this.currentHandle;
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.drawImage(data, cd.x, cd.y, cd.w, cd.h, here.x, here.y, pd.w, pd.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.drawFill = function(ctx, cellname, cell) {
			var here, data, cd, pd;
			data = this.getImage();
			cd = this.copyData;
			pd = this.pasteData;
			if (this.currentStart.flag && data) {
				here = this.currentHandle;
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.strokeRect(here.x, here.y, pd.w, pd.h);
				this.clearShadow(ctx, cell);
				ctx.drawImage(data, cd.x, cd.y, cd.w, cd.h, here.x, here.y, pd.w, pd.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.fillDraw = function(ctx, cellname, cell) {
			var here, data, cd, pd;
			data = this.getImage();
			cd = this.copyData;
			pd = this.pasteData;
			if (this.currentStart.flag && data) {
				here = this.currentHandle;
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.drawImage(data, cd.x, cd.y, cd.w, cd.h, here.x, here.y, pd.w, pd.h);
				this.clearShadow(ctx, cell);
				ctx.strokeRect(here.x, here.y, pd.w, pd.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.sinkInto = function(ctx, cellname, cell) {
			var here, data, cd, pd;
			data = this.getImage();
			cd = this.copyData;
			pd = this.pasteData;
			if (this.currentStart.flag && data) {
				here = this.currentHandle;
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.drawImage(data, cd.x, cd.y, cd.w, cd.h, here.x, here.y, pd.w, pd.h);
				ctx.strokeRect(here.x, here.y, pd.w, pd.h);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Picture.prototype.floatOver = function(ctx, cellname, cell) {
			var here, data, cd, pd;
			data = this.getImage();
			cd = this.copyData;
			pd = this.pasteData;
			if (this.currentStart.flag && data) {
				here = this.currentHandle;
				this.rotateCell(ctx, cell);
				cell.setEngine(this);
				ctx.strokeRect(here.x, here.y, pd.w, pd.h);
				ctx.drawImage(data, cd.x, cd.y, cd.w, cd.h, here.x, here.y, pd.w, pd.h);
			}
			return this;
		};

		/**
Display helper function - retrieve copy attributes for Image object, taking into account the current frame for entity sheet images

Also generates new filtered images, when necessary
@method getImage
@return Image Object
@private
**/
		my.Picture.prototype.getImage = function() {
			var type;
			this.checkSource();
			type = (my.contains(['img', 'animation', 'canvas', 'video'], this.imageType)) ? this.imageType : 'none';
			return this.getImageActions[type](this.source, this.animation, this.copyData);
		};
		/**
getImage helper object
@method getImageActions
@private
**/
		my.Picture.prototype.getImageActions = {
			img: function(src) {
				var a = my.asset[src],
					img = my.image[src];
				if (img.width < 2 && img.height < 2) {
					img.checkNaturalDimensions();
				}
				return a;
			},
			animation: function(src, animation, copyData) {
				var anim = my.spriteanimation[animation].getData(),
					img = my.image[src],
					perc = my.Picture.prototype.numberConvert;
				if (img.width < 2 && img.height < 2) {
					img.checkNaturalDimensions();
				}
				copyData.x = (anim.x.substring) ? perc(anim.x, img.width) : anim.x;
				copyData.y = (anim.y.substring) ? perc(anim.y, img.height) : anim.y;
				copyData.w = (anim.w.substring) ? perc(anim.w, img.width) : anim.w;
				copyData.h = (anim.h.substring) ? perc(anim.h, img.height) : anim.h;
				return my.asset[src];
			},
			canvas: function(src) {
				return my.canvas[src];
			},
			video: function(src) {
				return my.asset[src];
			},
			none: function(src) {
				return false;
			}
		};
		/**
Load the Picture entity's image data (via JavaScript getImageData() function) into the scrawl-canvas library
@method getImageData
@param {String} [label] IMAGEDATANAME - default: PICTURENAME_data
@return This
@chainable
**/
		my.Picture.prototype.getImageData = function(label) {
			var data,
				ic = my.work.imageCanvas,
				cvx = my.work.imageCvx,
				cd;
			this.checkSource();
			cd = this.copyData;
			label = (my.xt(label)) ? label : 'data';
			data = this.getImage();
			if (data) {
				ic.width = cd.w;
				ic.height = cd.h;
				cvx.drawImage(data, cd.x, cd.y, cd.w, cd.h, 0, 0, cd.w, cd.h);
				this.imageData = this.name + '_' + label;
				my.imageData[this.imageData] = cvx.getImageData(0, 0, cd.w, cd.h);
			}
			return this;
		};
		/**
Get the pixel color or channel data from Picture object's image at given coordinate

Argument needs to have __x__ and __y__ data (pixel coordinates) and, optionally, a __channel__ string - 'red', 'blue', 'green', 'alpha' (default), 'color'
@method getImageDataValue
@param {Object} items Coordinate Vector or Object
@return Color value at coordinate; false if no color found
**/
		my.Picture.prototype.getImageDataValue = function(items) {
			var data,
				array,
				index,
				cd,
				pd = this.pasteData,
				v1 = my.work.workimg.v1,
				between = my.isBetween,
				channel;
			items = my.safeObject(items);
			this.checkSource();
			cd = this.copyData;
			v1.x = items.x || 0;
			v1.y = items.y || 0;
			v1.vectorSubtract(pd).rotate(-this.roll);
			v1.x = (this.flipReverse) ? -v1.x : v1.x;
			v1.y = (this.flipUpend) ? -v1.y : v1.y;
			v1.vectorSubtract(this.currentHandle);
			v1.x = Math.round(v1.x * (cd.w / pd.w));
			v1.y = Math.round(v1.y * (cd.h / pd.h));
			if (!this.imageData) {
				this.getImageData();
			}
			data = my.imageData[this.imageData];
			index = ((v1.y * data.width) + v1.x) * 4;
			if (between(v1.x, 0, data.width - 1, true) && between(v1.y, 0, data.height - 1, true)) {
				array = data.data;
				channel = items.channel || this.get('imageDataChannel');
				channel = (my.contains(['red', 'green', 'blue', 'color', 'alpha'], channel)) ? channel : 'alpha';
				return this.getImageDataValueActions[channel](array, index);
			}
			return false;
		};
		/**
getImageDataValue helper object
@method getImageDataValueActions
**/
		my.Picture.prototype.getImageDataValueActions = {
			red: function(array, index) {
				return (my.xt(array[index])) ? array[index] : false;
			},
			green: function(array, index) {
				return (my.xt(array[index + 1])) ? array[index + 1] : false;
			},
			blue: function(array, index) {
				return (my.xt(array[index + 2])) ? array[index + 2] : false;
			},
			color: function(array, index) {
				return (my.xta([array[index], array[index + 1], array[index + 2], array[index + 3]])) ? 'rgba(' + array[index] + ',' + array[index + 1] + ',' + array[index + 2] + ',' + array[index + 3] + ')' : false;
			},
			alpha: function(array, index) {
				return (my.xt(array[index + 3])) ? array[index + 3] : false;
			}
		};
		/**
Check Cell coordinates to see if any of them fall within this entity's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the entity's path; false if none fall within the path
**/
		my.Picture.prototype.checkHit = function(items) {
			var tests = [],
				hit = [],
				testBar,
				colorResult,
				result,
				i,
				iz,
				arg = {
					tests: []
				};
			items = my.safeObject(items);
			if (my.xt(items.tests)) {
				tests = items.tests;
			}
			else {
				tests.length = 0;
				tests.push(items.x || 0);
				tests.push(items.y || 0);
			}
			testBar = (my.isa(items.test, 'num')) ? items.test : 0;
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = null;
				arg.tests.length = 0;
				arg.tests.push(tests[i]);
				arg.tests.push(tests[i + 1]);
				hit = my.Entity.prototype.checkHit.call(this, arg);
				if (this.checkHitUsingImageData) {
					if (hit) {
						hit.x = Math.floor(hit.x);
						hit.y = Math.floor(hit.y);
						if (this.animation) {
							this.imageData = false;
						}
						colorResult = this.getImageDataValue(hit);
						if (this.get('imageDataChannel') === 'color') {
							result = (colorResult === 'rgba(0,0,0,0)') ? false : hit;
						}
						else {
							result = (colorResult > testBar) ? hit : false;
						}
					}
				}
				else {
					result = hit;
				}
				if (result) {
					break;
				}
			}
			return (result) ? result : false;
		};
		/**
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
		my.Picture.prototype.dropEntity = function(item) {
			my.Entity.prototype.dropEntity.call(this, item);
			this.currentStart.flag = false;
			return this;
		};
		/**
Calculate the box position of the entity

Returns an object with the following attributes:

* __left__ - x coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __top__ - y coordinate of top-left corner of the enclosing box relative to the current cell's top-left corner
* __bottom__ - x coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner
* __left__ - y coordinate of bottom-right corner of the enclosing box relative to the current cell's top-left corner

@method getMaxDimensions
@param {Object} cell object
@param {Object} entity object
@return dimensions object
@private
**/
		my.Picture.prototype.getMaxDimensions = function(cell) {
			var cw = cell.actualWidth,
				ch = cell.actualHeight,
				halfW = cw / 2,
				halfH = ch / 2,
				cx = this.currentStart.x,
				cy = this.currentStart.y,
				lw = this.pasteData.w,
				lh = this.pasteData.h,
				fr = this.flipReverse,
				fu = this.flipUpend,
				xtl, xtr, xbr, xbl, ytl, ytr, ybr, ybl,
				x = (fr) ? cw - cx : cx,
				y = (fu) ? ch - cy : cy,
				w = (fr) ? -lw : lw,
				h = (fu) ? -lh : lh,
				o = this.currentHandle,
				hx = (fr) ? -o.x : o.x,
				hy = (fu) ? -o.y : o.y,
				line = my.ctx[this.context].lineWidth || 0,
				max, min, ax, ay, ref,
				ceil = Math.ceil,
				floor = Math.floor,
				t, l, b, r,
				roll = this.roll,
				v = my.work.v,
				between = my.isBetween;
			l = (fr) ? x + hx + w : x + hx;
			r = (fr) ? x + hx : x + hx + w;
			t = (fu) ? y + hy + h : y + hy;
			b = (fu) ? y + hy : y + hy + h;
			if (roll) {
				min = Math.min;
				max = Math.max;
				ref = {
					x: x,
					y: y
				};
				v.set({
					x: l,
					y: t
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xtl = v.x;
				ytl = v.y;
				v.set({
					x: r,
					y: t
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xtr = v.x;
				ytr = v.y;
				v.set({
					x: r,
					y: b
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xbl = v.x;
				ybl = v.y;
				v.set({
					x: l,
					y: b
				}).vectorSubtract(ref).rotate(roll).vectorAdd(ref);
				xbr = v.x;
				ybr = v.y;
				ax = [xtl, xtr, xbr, xbl];
				ay = [ytl, ytr, ybr, ybl];
				t = min.apply(Math, ay);
				l = min.apply(Math, ax);
				b = max.apply(Math, ay);
				r = max.apply(Math, ax);
			}
			t = floor(t - line);
			l = floor(l - line);
			b = ceil(b + line);
			r = ceil(r + line);
			if (!between(t, 0, ch, true)) {
				t = (t > halfH) ? ch : 0;
			}
			if (!between(b, 0, ch, true)) {
				b = (b > halfH) ? ch : 0;
			}
			if (!between(l, 0, cw, true)) {
				l = (l > halfW) ? cw : 0;
			}
			if (!between(r, 0, cw, true)) {
				r = (r > halfW) ? cw : 0;
			}
			this.maxDimensions.top = t;
			this.maxDimensions.bottom = b;
			this.maxDimensions.left = l;
			this.maxDimensions.right = r;
			this.maxDimensions.flag = false;
			return this.maxDimensions;
		};

		return my;
	}(scrawl));
}
