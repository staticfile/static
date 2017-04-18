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


if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'imageload')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlImages extension adaptions to the scrawl-canvas library object

* Defines the Image object, which wraps &lt;img&gt; elements
* Adds functionality to load images into the scrawl-canvas library dynamically (after the web page hads loaded)
* Defines the SpriteAnimation object, which in turn define and control action sequences from spritesheet images
* Defines the Video object, which wraps &lt;video&gt; elements

## New library sections

* scrawl.asset - linking to copies of DOM &lt;img&gt; and &lt;video&gt; elements
* scrawl.image - for Image objects
* scrawl.spriteanimation - for SpriteAnimation objects
* scrawl.video - for Video objects

@class window.scrawl_Images
**/

		/**
DOM document fragment
@property scrawl.work.imageFragment
@type {Object}
@private
**/
		my.work.imageFragment = document.createDocumentFragment();
		/**
Utility canvas - never displayed
@property scrawl.work.imageCanvas
@type {CasnvasObject}
@private
**/
		my.work.imageCanvas = document.createElement('canvas');
		my.work.imageCanvas.id = 'imageHiddenCanvasElement';
		my.work.imageFragment.appendChild(my.work.imageCanvas);
		/**
Utility canvas 2d context engine
@property scrawl.work.imageCvx
@type {CasnvasContextObject}
@private
**/
		my.work.imageCvx = my.work.imageCanvas.getContext('2d');
		/**
Alias for makeImage()
@method newImage
@deprecated
@private
**/
		my.newImage = function(items) {
			return my.makeImage(items);
		};
		/**
Alias for makeSpriteAnimation()
@method newSpriteAnimation
@deprecated
**/
		my.newSpriteAnimation = function(items) {
			return my.makeSpriteAnimation(items);
		};
		/**
Alias for makeVideo()
method newVideo
@deprecated
@private
**/
		my.newVideo = function(items) {
			return my.makeVideo(items);
		};
		/**
A __factory__ function to generate new Image objects
@method makeImage
@param {Object} items Key:value Object argument for setting attributes
@return Image object
@private
**/
		my.makeImage = function(items) {
			return new my.Image(items);
		};
		/**
A __factory__ function to generate new SpriteAnimation objects
@method makeSpriteAnimation
@param {Object} items Key:value Object argument for setting attributes
@return SpriteAnimation object
**/
		my.makeSpriteAnimation = function(items) {
			return new my.SpriteAnimation(items);
		};
		/**
A __factory__ function to generate new Video objects
@method makeVideo
@param {Object} items Key:value Object argument for setting attributes
@return Video object
@private
**/
		my.makeVideo = function(items) {
			return new my.Video(items);
		};
		/**
Work vector, for calculations
@property scrawl.work.workimg
@type {Vector}
@private
**/
		my.work.workimg = {
			v1: my.makeVector(),
		};
		my.pushUnique(my.work.sectionlist, 'image');
		my.pushUnique(my.work.nameslist, 'imagenames');
		my.pushUnique(my.work.sectionlist, 'video');
		my.pushUnique(my.work.nameslist, 'videonames');
		my.pushUnique(my.work.sectionlist, 'spriteanimation');
		my.pushUnique(my.work.nameslist, 'spriteanimationnames');
		my.pushUnique(my.work.sectionlist, 'asset');
		my.pushUnique(my.work.nameslist, 'assetnames');
		/**
A __general__ function to generate Image wrapper objects for &lt;img&gt;, &lt;video&gt; or &lt;svg&gt; elements identified by class string
@method getImagesByClass
@param {String} classtag Class string value of DOM objects to be imported into the scrawl-canvas library
@param {Boolean} [kill] when set to true, the &lt;img&gt; elements will be removed from the DOM when imported into the library
@return true if one or more images are identified; false otherwise
**/
		my.getImagesByClass = function(classtag, kill) {
			var s,
				i,
				mi = my.makeImage;
			kill = my.xtGet(kill, true);
			if (classtag) {
				s = document.getElementsByClassName(classtag);
				if (s.length > 0) {
					for (i = s.length; i > 0; i--) {
						if (s[i - 1].width && s[i - 1].height) {
							mi({
								element: s[i - 1],
								removeImageFromDOM: kill,
								crossOrigin: 'anonymous'
							});
						}
						else {
							mi({
								url: s[i - 1].src,
								name: s[i - 1].id,
								removeImageFromDOM: kill,
								crossOrigin: 'anonymous'
							});
						}
					}
					return true;
				}
			}
			return false;
		};
		/**
A __general__ function to generate a Image wrapper object for an &lt;img&gt; or &lt;svg&gt; element identified by an id string

Note: if an &lt;img&gt; (or &lt;picture&gt;) element uses the srcset attribute some browsers (eg chrome) will attempt to reload the image during browser resize. For this reason it is good policy to set this function's second argument (kill) to false, particularly if it is being used within an image load event listener. By default, the kill argument is set to true.

@method getImageById
@param {String} idtag Id string value of DOM object to be imported into the scrawl-canvas library
@param {Boolean} [kill] when set to true, the &lt;img&gt; element will be removed from the DOM when imported into the library
@return true if image is identified; false otherwise
**/
		my.getImageById = function(idtag, kill) {
			var myImg,
				mi = my.makeImage;
			kill = my.xtGet(kill, true);
			if (idtag) {
				myImg = document.getElementById(idtag);
				if (myImg && myImg.width && myImg.height) {
					mi({
						element: myImg,
						removeImageFromDOM: kill,
						crossOrigin: 'anonymous'
					});
				}
				else {
					mi({
						url: myImg.src,
						name: myImg.id,
						removeImageFromDOM: kill,
						crossOrigin: 'anonymous'
					});
				}
				return true;
			}
			return false;
		};
		/**
Helper function
@method getVideoCallback
@private
**/
		my.getVideoCallback = function() {
			my.makeVideo({
				element: this, //unrecorded flag for triggering Image stuff
				crossOrigin: 'anonymous'
			});
		};
		/**
A __general__ function to generate a Video wrapper object for a &lt;video&gt; element identified by an id string
@method getVideoById
@param {String} idtag Id string value of DOM object to be imported into the scrawl-canvas library
@param {Boolean} [stream] defaults to 'raw'
@return true if video is identified; false otherwise
**/
		my.getVideoById = function(idtag) {
			var myVideo;
			if (idtag) {
				myVideo = document.getElementById(idtag);
				myVideo.callback = 'anonymous';
				if (myVideo.readyState > 1) {
					my.makeVideo({
						element: myVideo, //unrecorded flag for triggering Image stuff
						crossOrigin: 'anonymous'
					});
				}
				else {
					myVideo.addEventListener('loadeddata', my.getVideoCallback, false);
				}
				return true;
			}
			return false;
		};

		/**
# Image

## Instantiation

* scrawl.getImagesByClass()

## Purpose

* Wraps DOM &lt;img&gt; elements imported into the scrawl-canvas library
* Used by __Picture__ entitys and __Pattern__ designs

## Access

* scrawl.image.IMAGENAME - for the Image object
* scrawl.asset.IMAGENAME - for a link to the original &lt;img&gt; element

@class Image
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Image = function(items) {
			var tempname,
				xt = my.xt,
				get = my.xtGet,
				updatesRequired = false;
			items = my.safeObject(items);
			this.width = 0;
			this.height = 0;
			if (my.xto(items.element, items.data, items.url)) {
				if (xt(items.element)) {
					items.name = get(items.name, items.element.getAttribute('id'), items.element.getAttribute('name'), '');
				}
				else if (xt(items.data)) {
					items.name = get(items.name, '');
				}
				else if (xt(items.url)) {
					tempname = items.url.substr(0, 128);
					items.name = get(items.name, tempname, '');
				}
				my.Base.call(this, items);
				if (xt(my.image[items.name])) {
					this.name = items.name;
					updatesRequired = true;
				}
				my.image[this.name] = this;
				my.pushUnique(my.imagenames, this.name);
				if (xt(items.element)) {
					this.addImageByElement(items);
				}
				else if (xt(items.data)) {
					this.addImageByData(items);
				}
				else if (xt(items.url)) {
					this.addImageByUrl(items);
				}
				if (updatesRequired) {
					this.updateDependentEntitys();
				}
				return this;
			}
			return false;
		};
		my.Image.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Image'
@final
**/
		my.Image.prototype.type = 'Image';
		my.Image.prototype.classname = 'imagenames';
		my.work.d.Image = {
			/**
DOM image actual width, in pixels
@property width
@type Number
@default 0
**/
			width: 0,
			/**
DOM image actual height, in pixels
@property height
@type Number
@default 0
**/
			height: 0
			/**
Constructor/clone flag - if set to true (default), will remove the &lt;img&gt; element from the web page DOM

_This attribute is not retained by the object_
@property removeImageFromDOM 
@type Boolean
@default true
**/
			/**
Constructor/clone function - some functions can call the Image constructor with a callback function

_This attribute is not retained by the object_
@property callback 
@type function
@default undefined - callback is always removed once run
**/
			/**
Constructor argument attribute - a DOM &lt;img&gt; element

_This attribute is not retained by the object_
@property element 
@type Object
@default undefined
**/
			/**
Constructor argument attribute - a canvas imageData object

_This attribute is not retained by the object_
@property data 
@type Object
@default undefined
**/
			/**
Constructor argument attribute - a String URL for dynamically loading an image

_This attribute is not retained by the object_
@property url 
@type Object
@default undefined
**/
		};
		my.mergeInto(my.work.d.Image, my.work.d.Base);
		/**
Adds a DOM &lt;img&gt; element to the library

* items.element MUST be a reference to the element, and the element MUST be present in the DOM

@method addImageByElement
@param {Object} [items] Key:value Object argument for setting attributes
@return always true
@private
**/
		my.Image.prototype.addImageByElement = function(items) {
			var el,
				kill = my.xtGet(items.removeImageFromDOM, true),
				getTrue = my.xtGetTrue;
			if (kill) {
				el = items.element;
			}
			else {
				el = items.element.cloneNode();
			}
			el.id = this.name;
			this.width = parseFloat(getTrue(el.offsetWidth, el.width, el.style.width, 1));
			this.height = parseFloat(getTrue(el.offsetHeight, el.height, el.style.height, 1));
			my.work.imageFragment.appendChild(el);
			my.asset[this.name] = el;
			my.pushUnique(my.assetnames, this.name);
			if (my.isa_fn(items.callback)) {
				items.callback();
			}
			return true;
		};
		/**
Import an image using the supplied url string

@method addImageByUrl
@param {Object} [items] Key:value Object argument for setting attributes
@return true; false on failure
@private
**/
		my.Image.prototype.addImageByUrl = function(items) {
			var el,
				that = this;
			if (items.url.substring) {
				el = document.createElement('img');
				el.id = this.name;
				el.onload = function() {
					var entity, design, i, iz, temp,
						d = my.design,
						dnames = my.designnames,
						e = my.entity,
						enames = my.entitynames;
					that.width = el.width;
					that.height = el.height;
					my.work.imageFragment.appendChild(el);
					temp = '#' + that.name;
					my.asset[that.name] = my.work.imageFragment.querySelector(temp);
					my.pushUnique(my.assetnames, that.name);
					for (i = 0, iz = enames.length; i < iz; i++) {
						entity = e[enames[i]];
						if (entity.type === 'Picture') {
							if (entity.source === that.name) {
								entity.setCopy();
							}
						}
					}
					for (i = 0, iz = dnames.length; i < iz; i++) {
						design = d[dnames[i]];
						if (design.type === 'Pattern') {
							if (design.source === that.name) {
								design.sourceType = 'image';
								design.makeDesign();
							}
						}
					}
					if (my.isa_fn(items.callback)) {
						items.callback();
					}
				};
				el.onerror = function(e) {};
				el.src = items.url;
				return true;
			}
			return false;
		};
		/**
Creates a new &lt;img&gt; element from a canvas ImageData object - uses Image.addImageByUrl() to achieve this

@method addImageByData
@param {Object} [items] Key:value Object argument for setting attributes
@return ImageDataUrl on success, false otherwise
@private
**/
		my.Image.prototype.addImageByData = function(items) {
			var data,
				canvas = my.work.imageCanvas,
				cvx = my.work.imageCvx;
			if (my.xt(items.data)) {
				data = items.data;
				canvas.width = data.width;
				canvas.height = data.height;
				cvx.putImageData(data, 0, 0);
				items.url = canvas.toDataURL('image/png');
				delete items.data;
				return this.addImageByUrl(items);
			}
			return false;
		};
		/**
Creates a new &lt;img&gt; element from an existing cell's current display - uses Image.addImageByUrl() to achieve this

@method createImageFromCell
@param {String} cell - name of Cell to use as the base for the new Image
@param {String} [name] - id attribute for the new Image
@return ImageDataUrl on success, false otherwise
**/
		my.Image.prototype.createImageFromCell = function(cell, name) {
			var data,
				canvas;
			if (cell.substring) {
				canvas = my.canvas[cell];
				cell = my.cell[cell];
				if (my.xt(canvas)) {
					data = canvas.toDataURL('image/png');
					if (my.xt(data)) {
						return this.addImageByUrl({
							url: data,
							name: my.xtGet(name, cell.name, 'cell-image'),
							width: cell.actualWidth,
							height: cell.actualHeight
						});
					}
				}
			}
			return false;
		};
		/**
Clone an Image object

@method clone
@param {Object} [items] Key:value Object argument for setting attributes
@return new Image object on success; false otherwise
**/
		my.Image.prototype.clone = function(items) {
			items.element = my.work.imageFragment.getElementById(this.name).cloneNode();
			return my.makeImage(items);
		};
		/**
Check whether image's natural dimensions have changed and, if they have, update any relevant Picture entity copy data

... [BUG] trying to integrate this function - not working; issues with correct scoping between the fragment img asset and the image object - 'this' currently refers to image object, but when assigned to a load listener 'this' probably refers to the fragment img asset. Particularly unhelpful if fragment asset is a clone of the DOM asset (working assumption for scrawl tour is that responsive img needs to remain in DOM if it is going to pick up chrome browser resize reloads)

Current work-round (for scrawl tour page, which loads DOM img assets dynamically once canvas capability is confirmed) is to add a load event to each dynamically created img tag which, when triggered, invokes scrawl.getImageById(), which correctly updates everything to use the new img src file

@example
var imageData = [
	{filename: 'seedhead', filesuffix: 'png', id: 'seedhead', panel: 0},
	{filename: 'seedhead-partial', filesuffix: 'png', id: 'seedheadPartial', panel: 0},
	{filename: 'whiteflower', filesuffix: 'png', id: 'whiteflower', panel: 1}
];
var iTemplate_src, iTemplate_srcset, iTemplate_sizes, iContainer;
var lazyImageAssetLoad = function(){
	var i, iz;
	iTemplate_src = 'assets/img/~~filename~~-1200.~~filesuffix~~';
	iTemplate_srcset = 'assets/img/~~filename~~-400.~~filesuffix~~ 400w, assets/img/~~filename~~-800.~~filesuffix~~ 800w, assets/img/~~filename~~-1200.~~filesuffix~~ 1200w, assets/img/~~filename~~-1600.~~filesuffix~~ 1600w, assets/img/~~filename~~-2400.~~filesuffix~~ 2400w, assets/img/~~filename~~-3600.~~filesuffix~~ 3600w';
	iTemplate_sizes='(min-width: 1024px) 800px, (min-width: 768px) 1200px, (min-width: 400px) 800px, (min-width: 320px) 400px, 100vw';
	iContainer = document.createElement('div');
	//set appropriate styles on iContainer to hide it; alternatively, add a css-defined classList String to it
	for(i = 0, iz = imageData.length; i < iz; i++){
		iContainer.appendChild(buildImage(imageData[i]));
	}
	document.body.appendChild(iContainer);
};
var buildImage = function(data){
	var img = document.createElement('img'),
		file = /~~filename~~/g,
		suffix = /~~filesuffix~~/g,
		src = iTemplate_src.replace(file, data.filename),
		srcset = iTemplate_srcset.replace(file, data.filename);
	src = src.replace(suffix, data.filesuffix);
	srcset = srcset.replace(suffix, data.filesuffix);
	img.id = data.id;
	img.src = src;
	img.srcset = srcset;
	img.sizes = iTemplate_sizes;
	img.addEventListener('load', function(){
		scrawl.getImageById(data.id, false); //not moving img out of DOM, instead cloning it into scrawl.work.imageFragment
	}, false);
	return img;
};
lazyImageAssetLoad();

@method checkNaturalDimensions
@return true if dimensions have changed; false otherwise
**/
		my.Image.prototype.checkNaturalDimensions = function() {
			var el = my.asset[this.name],
				getTrue = my.xtGetTrue,
				changed = false,
				w, h;
			if (el) {
				w = parseFloat(getTrue(el.offsetWidth, el.width, el.style.width, 1));
				h = parseFloat(getTrue(el.offsetHeight, el.height, el.style.height, 1));
				if (w !== this.width) {
					this.width = w;
					changed = true;
				}
				if (h !== this.height) {
					this.height = h;
					changed = true;
				}
			}
			if (changed) {
				this.updateDependentEntitys();
			}
			return changed;
		};
		/**
Update the copyData of entitys that use this image as their source

@method updateDependentEntitys
@return Always true
**/
		my.Image.prototype.updateDependentEntitys = function() {
			var e = scrawl.entity,
				ent,
				eNames = scrawl.entitynames,
				i, iz;
			for (i = 0, iz = eNames.length; i < iz; i++) {
				ent = e[eNames[i]];
				if (ent.type === 'Picture') {
					if (ent.source === this.name) {
						ent.setCopy();
					}
				}
			}
			return true;
		};

		/**
# SpriteAnimation

## Instantiation

* scrawl.makeSpriteAnimation()

## Purpose

* wraps a entity sheet image
* acts as the link between a Picture object and the entity images on the entity sheet
* holds data about cells in the entitysheet animation
* controls the animation playback

## Access

* scrawl.spriteanimation.SPRITEANIMATIONNAME
* scrawl.spriteanimation.[scrawl.entity.PICTURENAME.spriteAnimation]

SpriteAnimation attributes can also be set and retrieved directly using Picture.get() and Picture.set() functions, where a Picture entity is associated with the SpriteAnimation object via its .animSheet attribute

@class SpriteAnimation
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.SpriteAnimation = function(items) {
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.frames = (my.xt(items.frames)) ? [].concat(items.frames) : [];
			this.currentFrame = get(items.currentFrame, 0);
			this.speed = get(items.speed, 1);
			this.loop = get(items.loop, 'end');
			this.running = get(items.running, 'complete');
			this.lastCalled = get(items.lastCalled, Date.now());
			my.spriteanimation[this.name] = this;
			my.pushUnique(my.spriteanimationnames, this.name);
			return this;
		};
		my.SpriteAnimation.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'SpriteAnimation'
@final
**/
		my.SpriteAnimation.prototype.type = 'SpriteAnimation';
		my.SpriteAnimation.prototype.classname = 'spriteanimationnames';
		my.work.d.SpriteAnimation = {
			/**
An Array of animation frame data Objects, to be used for producing an animation sequence. Each Object in the Array has the following form:

* {x:Number, y:Number, w:Number, h:Number, d:Number}

... where:

* __x__ and __y__ represent the starting coordinates for the animation frame, in pixels, from the top left corner of the image
* __w__ and __h__ represent the dimensions of the animation frame, in pixels
* __d__ is the duration for each frame, in milliseconds

Animation frames are played in the order they are presented in this Array
@property frames
@type Array
@default []
**/
			frames: [],
			/**
The current frame of the animation, from frame 0
@property currentFrame
@type Number
@default 0
**/
			currentFrame: 0,
			/**
The speed at which the animation is to play. Values less than 1 will slow the animation, while values greater than one will speed it up. Setting the speed to 0 will pause the animation
@property speed
@type Number
@default 1
**/
			speed: 1,
			/**
Playback String; permitted values include:

* 'pause' - pause the animation on the current frame
* 'end' - play the animation once (default)
* 'loop' - play the animation continuously 
* 'reverse' - reverse the direction in which the animation runs
@property loop
@type String
@default 'end'
**/
			loop: 'end',
			/**
Animation running String: permitted values include:

* 'forward' - play the animation from the first frame towards the last frame
* 'backward' - play the animation from the last frame towards the first frame
* 'complete' - animation has reached the last (or first) frame and has completed
@property running
@type String
@default 'complete'
**/
			running: 'complete',
			/**
Datestamp when SpriteAnimation.getData() function was last called
@property lastCalled
@type Date
@default 0
@private
**/
			lastCalled: 0,
		};
		/**
Array of keys used with SpriteAnimation object
@property scrawl.work.animKeys
@type {Array}
@private
**/
		my.work.animKeys = Object.keys(my.work.d.SpriteAnimation);
		my.mergeInto(my.work.d.SpriteAnimation, my.work.d.Scrawl);
		/**
Set attribute values - will also set the __currentFrame__ attribute to the appropriate value when the running __attribute__ is changed

(Only used by SpriteAnimation objects)
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@private
**/
		my.SpriteAnimation.prototype.set = function(items) {
			var paused;
			items = my.safeObject(items);
			paused = (this.loop === 'pause') ? true : false;
			my.Base.prototype.set.call(this, items);
			if (my.xt(items.running)) {
				switch (items.running) {
					case 'forward':
						this.running = 'forward';
						if (!paused) {
							this.currentFrame = 0;
						}
						break;
					case 'backward':
						this.running = 'backward';
						if (!paused) {
							this.currentFrame = this.frames.length - 1;
						}
						break;
					default:
						this.running = 'complete';
						this.currentFrame = 0;
						break;
				}
			}
			return this;
		};
		/**
Returns an Object in the form {copyX:Number, copyY:Number, copyWidth:Number, copyHeight:Number}, representing the coordinates and dimensions of the current frame to be displayed by a Picture entity

(Only used by SpriteAnimation objects)
@method getData
@return Data object
@private
**/
		my.SpriteAnimation.prototype.getData = function() {
			var interval,
				changeFrame;
			if (this.speed > 0) {
				interval = this.frames[this.currentFrame].d / this.speed;
				changeFrame = (this.lastCalled + interval < Date.now()) ? true : false;
				switch (this.running) {
					case 'complete':
						this.lastCalled = Date.now();
						break;
					case 'forward':
						if (changeFrame) {
							this.getDataForward[this.loop](this);
							this.lastCalled = Date.now();
						}
						break;
					case 'backward':
						if (changeFrame) {
							this.getDataBackward[this.loop](this);
							this.lastCalled = Date.now();
						}
						break;
				}
			}
			return this.frames[this.currentFrame];
		};
		/**
getData helper object
@method getDataForward
@private
**/
		my.SpriteAnimation.prototype.getDataForward = {
			end: function(a) {
				a.running = (a.currentFrame + 1 >= a.frames.length) ? 'complete' : a.running;
				a.currentFrame = (a.currentFrame + 1 >= a.frames.length) ? a.currentFrame : a.currentFrame + 1;
			},
			loop: function(a) {
				a.currentFrame = (a.currentFrame + 1 >= a.frames.length) ? 0 : a.currentFrame + 1;
			},
			reverse: function(a) {
				a.running = (a.currentFrame + 1 >= a.frames.length) ? 'backward' : 'forward';
				a.currentFrame = (a.currentFrame + 1 >= a.frames.length) ? a.currentFrame : a.currentFrame + 1;
			},
			pause: function(a) {}
		};
		/**
getData helper object
@method getDataBackward
@private
**/
		my.SpriteAnimation.prototype.getDataBackward = {
			end: function(a) {
				a.running = (a.currentFrame - 1 <= 0) ? 'complete' : a.running;
				a.currentFrame = (a.currentFrame - 1 <= 0) ? a.currentFrame : a.currentFrame - 1;
			},
			loop: function(a) {
				a.currentFrame = (a.currentFrame - 1 <= 0) ? a.frames.length - 1 : a.currentFrame - 1;
			},
			reverse: function(a) {
				a.running = (a.currentFrame - 1 <= 0) ? 'forward' : 'backward';
				a.currentFrame = (a.currentFrame - 1 <= 0) ? a.currentFrame : a.currentFrame - 1;
			},
			pause: function(a) {}
		};

		/**
# Video

## Instantiation

* scrawl.getVideoById()
* scrawl.makeVideo()

## Purpose

* Wraps DOM &lt;video&gt; elements imported into the scrawl-canvas library
* Used by __Picture__ entitys and __Pattern__ designs

## Access

* scrawl.video.VIDEONAME - for the Video object
* scrawl.asset.IMAGENAME - for a link to the original &lt;video&gt; element

@class Video
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Video = function(items) {
			var tempname,
				xt = my.xt,
				get = my.xtGet;
			items = my.safeObject(items);
			this.width = 0;
			this.height = 0;
			if (xt(items.element)) {
				if (xt(items.element)) {
					items.name = get(items.name, items.element.getAttribute('id'), items.element.getAttribute('name'), '');
				}
				else if (xt(items.url)) {
					tempname = items.url.substr(0, 128);
					items.name = get(items.name, tempname, '');
				}
				my.Base.call(this, items);
				my.video[this.name] = this;
				my.pushUnique(my.videonames, this.name);
				this.addVideoByElement(items);
				return this;
			}
			return false;
		};
		my.Video.prototype = Object.create(my.Base.prototype);
		/**
    @property type
    @type String
    @default 'Video'
    @final
    **/
		my.Video.prototype.type = 'Video';
		my.Video.prototype.classname = 'videonames';
		my.work.d.Video = {
			/**
    DOM image actual width, in pixels
    @property width
    @type Number
    @default 0
    **/
			width: 0,
			/**
    DOM image actual height, in pixels
    @property height
    @type Number
    @default 0
    **/
			height: 0,
			/**
Constructor/clone function - some functions can call the Video constructor with a callback function

_This attribute is not retained by the object_
@property callback 
@type function
@default undefined - callback is always removed once run
**/
			/**
Constructor argument attribute - a DOM &lt;video&gt; element

_This attribute is not retained by the object_
@property element 
@type Object
@default undefined
**/
		};
		my.mergeInto(my.work.d.Video, my.work.d.Base);
		/**
Adds a DOM &lt;video&gt; element to the library

* items.element MUST be a reference to the element, and the element MUST be present in the DOM
* items.readyState is the readystate value (integer between 0 and 4) which must be reached before dimensions are set and any callback function triggered - default: 1 (HAVE_METADATA, loadedmetadata)

@method addVideoByElement
@param {Object} [items] Key:value Object argument for setting attributes
@return always true
@private
**/
		my.Video.prototype.addVideoByElement = function(items) {
			var el = items.element,
				listener = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'],
				readyState = my.xtGet(items.readyState, 1);
			if (my.xt(el)) {
				el.id = this.name;
				this.width = 1;
				this.height = 1;
				my.work.imageFragment.appendChild(el);
				my.asset[this.name] = my.work.imageFragment.querySelector('#' + this.name);
				my.pushUnique(my.assetnames, this.name);
				this.api = my.asset[this.name];
				if (this.api.readyState >= readyState) {
					this.setIntrinsicDimensions();
					if (my.isa_fn(items.callback)) {
						items.callback();
					}
				}
				else {
					this.api.addEventListener(listener[readyState], function() {
						this.setIntrinsicDimensions();
						if (my.isa_fn(items.callback)) {
							items.callback();
						}
					}, false);
				}
				return true;
			}
			return false;
		};
		/**
Video constructor helper function

@method setIntrinsicDimensions
@return always true
@private
**/
		my.Video.prototype.setIntrinsicDimensions = function() {
			var ent,
				api,
				wrapper,
				i,
				iz,
				e = my.entity,
				enames = my.entitynames;
			if (my.xt(this.api)) {
				//this = scrawl wrapper
				api = this.api;
				wrapper = this;
			}
			else {
				//this = dom video element
				api = this;
				wrapper = my.video[this.id];
			}
			wrapper.width = api.videoWidth;
			wrapper.height = api.videoHeight;
			for (i = 0, iz = enames.length; i < iz; i++) {
				ent = e[enames[i]];
				if (ent.type === 'Picture') {
					ent.setCopy();
				}
			}
			return true;
		};
		/**
Import a video using the supplied url string - not yet coded

@method addImageByUrl
@param {Object} [items] Key:value Object argument for setting attributes
@return true; false on failure
@private
**/
		my.Video.prototype.addVideoByUrl = function(items) {
			return false;
		};

		return my;
	}(scrawl));
}
