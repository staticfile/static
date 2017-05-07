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
# scrawlPhrase

## Purpose and features

The Phrase extension adds Phrase entitys - single and multi-line text objects - to the core module

* Defines text objects for displaying on a Cell's canvas
* Handles all related font functionality
* Performs text drawing operations on canvases

@module scrawlPhrase
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'phrase')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPhrase extension adaptions to the scrawl-canvas library object

## New library sections

* scrawl.text 

@class window.scrawl_Phrase
**/

		/**
Alias for makePhrase()
@method newPhrase
@deprecated
**/
		my.newPhrase = function(items) {
			return my.makePhrase(items);
		};
		/**
A __factory__ function to generate new Phrase entitys
@method makePhrase
@param {Object} items Key:value Object argument for setting attributes
@return Phrase object
@example
	scrawl.makePhrase({
		startX: 50,
		startY: 20,
		fillStyle: 'red',
		font: '20pt Arial, sans-serif',
		textAlign: 'center',
		text: 'Hello, world!\nHow are you today?',
		});
**/
		my.makePhrase = function(items) {
			return new my.Phrase(items);
		};
		my.pushUnique(my.work.sectionlist, 'text');
		my.pushUnique(my.work.nameslist, 'textnames');

		/**
# Phrase

## Instantiation

* scrawl.makePhrase()

## Purpose

* Defines text objects for displaying on a Cell's canvas
* Handles all related font functionality
* Performs text drawing operations on canvases

## Access

* scrawl.entity.PHRASENAME - for the Phrase entity object

@class Phrase
@constructor
@extends Entity
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Phrase = function Phrase(items) {
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.registerInLibrary();
			this.texts = [];
			this.lineHeight = my.xtGet(items.lineHeight, my.work.d.Phrase.lineHeight);
			if (items.font) {
				this.checkFont(items.font);
			}
			else {
				this.constructFont();
			}
			this.size = this.get('size');
			this.multiline();
			this.getMetrics();
			return this;
		};
		my.Phrase.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Phrase'
@final
**/
		my.Phrase.prototype.type = 'Phrase';
		my.Phrase.prototype.classname = 'entitynames';
		my.work.d.Phrase = {
			/**
Text string to be displayed - for multiline text, insert __\n__ where the text line breaks
@property text
@type String
@default ''
**/
			text: '',
			/**
Font style property - any permitted CSS style String (eg 'italic')
@property style
@type String
@default 'normal'
**/
			style: 'normal',
			/**
Font variant property - any permitted CSS variant String (eg 'small-caps')
@property variant
@type String
@default 'normal'
**/
			variant: 'normal',
			/**
Font weight property - any permitted CSS weight String or number (eg 'bold', 700)
@property weight
@type String
@default 'normal'
**/
			weight: 'normal',
			/**
Font size
@property size
@type Number
@default 12
**/
			size: 12,
			/**
Font metrics property - any permitted CSS metrics String (eg 'pt', 'px')
@property metrics
@type String
@default 'pt'
**/
			metrics: 'pt',
			/**
Font family property - any permitted CSS font family String

_Note: a font needs to be pre-loaded by the web page before the &lt;canvas&gt; element can successfully use it_
@property family
@type String
@default 'sans-serif'
**/
			family: 'sans-serif',
			/**
Multiline text - line height
@property lineHeight
@type Number
@default 1.5
**/
			lineHeight: 1.5,
			/**
Background color - any permitted CSS Color string
@property backgroundColor
@type String
@default ''
**/
			backgroundColor: '',
			/**
Background margin - additional padding around the text (in pixels), colored in by the background color
@property backgroundMargin
@type Number
@default 0
**/
			backgroundMargin: 0,
			/**
Text along path parameter - when placing text along a path, the text can be positioned in phrase blocks, word blocks or by individual letters. Permitted values: 'phrase', 'word', 'glyph' (for individual letters)

_Note: the __path__ module needs to be added to the core to use this functionality_
@property textAlongPath
@type String
@default 'phrase'
**/
			textAlongPath: 'phrase',
			/**
Fixed width attribute for text along path. When using fixed width (monospace) fonts, set this flag to true for faster rendering

_Note: the __path__ module needs to be added to the core to use this functionality_
@property fixedWidth
@type Boolean
@default false
**/
			fixedWidth: false,
			/**
Array of TEXTNANE strings

Users should never interfere with Text objects, as they are destroyed and recreated after every Phrase.set() and Phrase.setDelta() function call
@property texts
@type Array
@default []
@private
**/
			texts: [],
		};
		my.mergeInto(my.work.d.Phrase, my.work.d.Entity);
		/**
Augments Entity.set()

Allows users to:
* alter the font either by the font attribute, or by individual font content attributes
* update the text
* change other Entity and Phrase object attributes
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Phrase.prototype.set = function(items) {
			var xt = my.xt;
			my.Entity.prototype.set.call(this, items);
			items = my.safeObject(items);
			if (my.xto(items.text, items.size, items.scale, items.font, items.style, items.variant, items.metrics, items.family, items.lineHeight)) {
				this.currentHandle.flag = false;
				if (xt(items.lineHeight)) {
					this.lineHeight = items.lineHeight;
				}
				if (items.font) {
					this.checkFont(items.font);
				}
				else {
					this.constructFont();
				}
				if (xt(items.text)) {
					this.multiline(items.text);
				}
			}
			this.getMetrics();
			return this;
		};
		/**
Augments Entity.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Phrase.prototype.setDelta = function(items) {
			var xt = my.xt;
			my.Entity.prototype.setDelta.call(this, items);
			items = my.safeObject(items);
			if (my.xto(items.text, items.size, items.scale, items.font, items.style, items.variant, items.metrics, items.family, items.lineHeight)) {
				this.currentHandle.flag = false;
				if (xt(items.lineHeight)) {
					this.lineHeight += items.lineHeight;
				}
				if (items.font) {
					this.checkFont(items.font);
				}
				else {
					this.constructFont();
				}
				if (xt(items.text)) {
					this.multiline(items.text);
				}
			}
			this.getMetrics();
			return this;
		};
		/**
Augments Entity.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
		my.Phrase.prototype.clone = function(items) {
			items.texts = [];
			return my.Entity.prototype.clone.call(this, items);
		};
		/**
Helper function - creates Text objects for each line of text in a multiline Phrase
@method multiline
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.multiline = function(newtext) {
			var text,
				textArray,
				textnames = my.textnames,
				texts = this.texts,
				items = {},
				ri = my.removeItem,
				T = my.Text,
				i,
				iz,
				j,
				jz;
			text = '' + my.xtGet(newtext, this.text);
			textArray = text.split('\n');
			if (my.xt(texts)) {
				for (i = 0, iz = texts.length; i < iz; i++) {
					delete my.text[texts[i]];
					ri(textnames, texts[i]);
				}
			}
			texts.length = 0;
			items.phrase = this.name;
			for (j = 0, jz = textArray.length; j < jz; j++) {
				items.text = textArray[j];
				if (items.text.length > 0) {
					new T(items);
				}
			}
			this.text = text;
			return this;
		};
		/**
Helper function - checks to see if font needs to be (re)constructed from its parts
@method checkFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.checkFont = function(item) {
			if (my.xt(item)) {
				this.deconstructFont();
			}
			return this;
		};
		/**
Helper function - creates font-related attributes from entity's Context object's font attribute
@method deconstructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.deconstructFont = function() {
			var i,
				iz,
				myFont,
				res = [],
				exclude = [100, 200, 300, 400, 500, 600, 700, 800, 900, 'italic', 'oblique', 'small-caps', 'bold', 'bolder', 'lighter', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
				myFamily,
				myFontArray,
				style,
				variant,
				weight,
				size,
				metrics,
				family,
				d = my.work.d.Phrase,
				get = my.xtGet;
			myFont = my.ctx[this.context].font;
			style = get(this.style, d.style);
			variant = get(this.variant, d.variant);
			weight = get(this.weight, d.weight);
			size = get(this.size, d.size);
			metrics = get(this.metrics, d.metrics);
			family = get(this.family, d.family);
			if (/italic/i.test(myFont)) {
				style = 'italic';
			}
			else if (/oblique/i.test(myFont)) {
				style = 'oblique';
			}
			else {
				style = 'normal';
			}
			if (/small-caps/i.test(myFont)) {
				variant = 'small-caps';
			}
			else {
				variant = 'normal';
			}
			if (/bold/i.test(myFont)) {
				weight = 'bold';
			}
			else if (/bolder/i.test(myFont)) {
				weight = 'bolder';
			}
			else if (/lighter/i.test(myFont)) {
				weight = 'lighter';
			}
			else if (/([1-9]00)/i.test(myFont)) {
				res = myFont.match(/([1-9]00)/i);
				weight = res[1];
			}
			else {
				weight = 'normal';
			}
			res.length = 0;
			if (/(\d+)(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)?/i.test(myFont)) {
				res = myFont.match(/(\d+)(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)/i);
				size = parseFloat(res[1]);
				metrics = res[2];
			}
			else if (/xx-small/i.test(myFont)) {
				size = 3;
				metrics = 'pt';
			}
			else if (/x-small/i.test(myFont)) {
				size = 6;
				metrics = 'pt';
			}
			else if (/small/i.test(myFont)) {
				size = 9;
				metrics = 'pt';
			}
			else if (/medium/i.test(myFont)) {
				size = 12;
				metrics = 'pt';
			}
			else if (/large/i.test(myFont)) {
				size = 15;
				metrics = 'pt';
			}
			else if (/x-large/i.test(myFont)) {
				size = 18;
				metrics = 'pt';
			}
			else if (/xx-large/i.test(myFont)) {
				size = 21;
				metrics = 'pt';
			}
			else {
				size = 12;
				metrics = 'pt';
			}
			myFamily = '';
			myFontArray = myFont.split(' ');
			for (i = 0, iz = myFontArray.length; i < iz; i++) {
				if (!my.contains(exclude, myFontArray[i])) {
					if (!myFontArray[i].match(/[^\/](\d)+(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)?/i)) {
						myFamily += myFontArray[i] + ' ';
					}
				}
			}
			if (!myFamily) {
				myFamily = this.family;
			}
			this.family = myFamily;
			this.style = style;
			this.variant = variant;
			this.weight = weight;
			this.size = size;
			this.metrics = metrics;
			this.constructFont();
			return this;
		};
		/**
Helper function - creates entity's Context object's phrase attribute from other font-related attributes
@method constructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.constructFont = function() {
			var myFont,
				style,
				variant,
				weight,
				size,
				metrics,
				family,
				get = my.xtGet,
				d = my.work.d.Phrase;
			myFont = '';
			style = get(this.style, d.style);
			variant = get(this.variant, d.variant);
			weight = get(this.weight, d.weight);
			size = get(this.size, d.size);
			metrics = get(this.metrics, d.metrics);
			family = get(this.family, d.family);
			if (style !== 'normal') {
				myFont += style + ' ';
			}
			if (variant !== 'normal') {
				myFont += variant + ' ';
			}
			if (weight !== 'normal') {
				myFont += weight + ' ';
			}
			myFont += (size * this.scale) + metrics + ' ';
			myFont += family;
			my.ctx[this.context].font = myFont;
			return this;
		};
		/**
Augments Entity.stamp()
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable
**/
		my.Phrase.prototype.stamp = function(method, cellname, cell, mouse) {
			var test;
			if (this.visibility) {
				test = (my.entity[this.path] && my.entity[this.path].type === 'Path');
				if (this.pivot || !test || this.get('textAlongPath') === 'phrase') {
					my.Entity.prototype.stamp.call(this, method, cellname, cell, mouse);
				}
				else {
					my.text[this.texts[0]].stampAlongPath(this, method, cellname, cell);
					this.stampFilter(my.context[cellname], cellname, cell);
				}
			}
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
		my.Phrase.prototype.clear = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			ctx.globalCompositeOperation = 'destination-out';
			this.rotateCell(ctx, cell);
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].clear(ctx, cellname, cell, tX, tY);
			}
			ctx.globalCompositeOperation = my.ctx[cellname].get('globalCompositeOperation');
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
		my.Phrase.prototype.clearWithBackground = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].clearWithBackground(ctx, cellname, cell, tX, tY);
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
		my.Phrase.prototype.draw = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].draw(ctx, cellname, cell, tX, tY);
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
		my.Phrase.prototype.fill = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].fill(ctx, cellname, cell, tX, tY);
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
		my.Phrase.prototype.drawFill = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].drawFill(ctx, cellname, cell, tX, tY, this);
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
		my.Phrase.prototype.fillDraw = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].fillDraw(ctx, cellname, cell, tX, tY, this);
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
		my.Phrase.prototype.sinkInto = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].sinkInto(ctx, cellname, cell, tX, tY);
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
		my.Phrase.prototype.floatOver = function(ctx, cellname, cell) {
			var i, iz, tX, tY,
				o = this.getOffset(),
				here = this.currentHandle,
				textY = this.size * this.lineHeight * this.scale,
				t = my.text,
				ts = this.texts;
			cell.setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (i = 0, iz = ts.length; i < iz; i++) {
				tY = here.y + (textY * i) + o.y;
				t[ts[i]].floatOver(ctx, cellname, cell, tX, tY);
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
		my.Phrase.prototype.none = function(ctx, cellname, cell) {
			return this;
		};
		/**
Helper function - calculate entity's width and height attributes, taking into account font size, scaling, etc
@method getMetrics
@param {String} cellname CELLNAME String (any &lt;canvas&gt; will do for this function)
@return This
@chainable
@private
**/
		my.Phrase.prototype.getMetrics = function(cellname) {
			var i,
				iz,
				h,
				w,
				t = my.text,
				ts = this.texts,
				temp;
			h = 0;
			w = 0;
			for (i = 0, iz = ts.length; i < iz; i++) {
				temp = t[ts[i]];
				w = (temp.get('width') > w) ? temp.width : w;
				h += temp.get('height');
			}
			this.width = w;
			this.height = h;
			return this;
		};
		/**
Drawing function - stamps a background block onto the &lt;canvas&gt; element
@method addBackgroundColor
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {Vector} here Start coordinates for rectangle
@return This
@chainable
@private
**/
		my.Phrase.prototype.addBackgroundColor = function(ctx, here) {
			var h,
				w,
				margin,
				topX,
				topY;
			margin = this.get('backgroundMargin');
			topX = here.x - margin;
			topY = here.y - margin;
			w = (this.width * this.scale) + (margin * 2);
			h = (this.height * this.scale) + (margin * 2);
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(topX, topY, w, h);
			ctx.fillStyle = my.ctx[this.context].get('fillStyle');
			return this;
		};
		/**
Drawing function - get entity offset values

Returns an object with coordinates __x__ and __y__
@method getOffset
@return JavaScript object
@private
**/
		my.Phrase.prototype.getOffset = function() {
			var oX,
				oY,
				myContext,
				result = {
					x: 0,
					y: 0
				};
			myContext = my.ctx[this.context];
			oX = 0;
			oY = 0;
			switch (myContext.get('textAlign')) {
				case 'start':
				case 'left':
					oX = 0;
					break;
				case 'center':
					oX = (this.width / 2) * this.scale;
					break;
				case 'right':
				case 'end':
					oX = this.width * this.scale;
					break;
			}
			switch (myContext.get('textBaseline')) {
				case 'top':
					oY = 0;
					break;
				case 'hanging':
					oY = this.size * this.lineHeight * this.scale * 0.1;
					break;
				case 'middle':
					oY = this.size * this.lineHeight * this.scale * 0.5;
					break;
				case 'bottom':
					oY = this.size * this.lineHeight * this.scale;
					break;
				default:
					oY = this.size * this.lineHeight * this.scale * 0.85;
			}
			result.x = oX;
			result.y = oY;
			return result;
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
		my.Phrase.prototype.getMaxDimensions = function(cell) {
			this.maxDimensions.top = 0;
			this.maxDimensions.bottom = cell.actualHeight;
			this.maxDimensions.left = 0;
			this.maxDimensions.right = cell.actualWidth;
			this.maxDimensions.flag = false;
			return this.maxDimensions;
		};

		/**
# Text

## Instantiation

* This object should never be instantiated by users
* Objects created via Phrase object

## Purpose

* Display single lines of text within a Phrase, or along a Shape path
* Each time the Phrase object text changes, the associated Text objects are destroyed and regenerated from scratch

@class Text
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
@private
**/
		my.Text = function Text(items) {
			var get = my.xtGet,
			pu = my.pushUnique,
			d = my.work.d.Text,
			e;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.text = get(items.text, d.text);
			this.phrase = get(items.phrase, d.phrase);
			e = my.entity[this.phrase];
			this.context = e.context;
			this.fixedWidth = get(items.fixedWidth, d.fixedWidth);
			this.textAlongPath = get(items.textAlongPath, d.textAlongPath);
			this.glyphs = [];
			this.glyphWidths = [];
			my.text[this.name] = this;
			my.pushUnique(my.textnames, this.name);
			my.pushUnique(e.texts, this.name);
			this.getMetrics();
			return this;
		};
		my.Text.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Text'
@final
**/
		my.Text.prototype.type = 'Text';
		my.Text.prototype.classname = 'textnames';
		my.work.d.Text = {
			/**
Text to be displayed
@property text
@type String
@default ''
@private
**/
			text: '',
			/**
PHRASENAME String of parent Phrase object
@property phrase
@type String
@default ''
@private
**/
			phrase: '',
			/**
CTXNAME String of parent Phrase object's Context object
@property context
@type String
@default ''
@private
**/
			context: '',
			/**
fixedWidth value of parent Phrase object
@property fixedWidth
@type Boolean
@default false
@private
**/
			fixedWidth: false,
			/**
Text along path value of parent Phrase object
@property textAlongPath
@type String
@default 'phrase'
@private
**/
			textAlongPath: 'phrase',
			/**
Text line width, accounting for font, scale, etc
@property width
@type Number
@default 0
@private
**/
			width: 0,
			/**
Text line height, accounting for font, scale, lineHeight, etc
@property height
@type Number
@default 0
@private
**/
			height: 0,
			/**
Glyphs array
@property glyphs
@type Array
@default []
@private
**/
			glyphs: [],
			/**
Glyph widths array
@property glyphWidths
@type Array
@default []
@private
**/
			glyphWidths: [],
		};
		my.mergeInto(my.work.d.Text, my.work.d.Base);
		/**
Stamp function - stamp phrases, words or individual glyphs (letters and spaces) along a Shape entity path

Permitted methods include:

* 'draw' - stroke the entity's path with the entity's strokeStyle color, pattern or gradient
* 'fill' - fill the entity's path with the entity's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the entity's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the entity's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the entity's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the entity's path; shadow offset is added to both actions
* 'clear' - fill the entity's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the entity's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the entity's path (not tested)
* 'none' - perform all necessary updates, but do not draw the entity onto the canvas
@method stampAlongPath
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Text.prototype.stampAlongPath = function(p, method, cellname, cell) {
			var engine,
				here,
				pathLength,
				width,
				ratio,
				pos,
				nowPos,
				oldText,
				x,
				y,
				r,
				i,
				iz,
				g,
				gw,
				xt = my.xt,
				e = my.entity,
				between = my.isBetween,
				rad = my.work.radian;
			method = (method.substring) ? method : p.method;
			engine = my.context[cellname];
			pathLength = my.entity[p.path].getPerimeterLength();
			width = this.width * p.scale;
			ratio = width / pathLength;
			pos = p.pathPlace;
			oldText = this.text;
			if (this.glyphs.length === 0) {
				this.getMetrics();
			}
			cell.setEngine(p);
			g = this.glyphs;
			gw = this.glyphWidths;
			for (i = 0, iz = g.length; i < iz; i++) {
				if (xt(g[i])) {
					this.text = g[i];
					nowPos = pos + (((gw[i] / 2) / width) * ratio);
					if (!between(nowPos, 0, 1, true)) {
						nowPos += (nowPos > 0.5) ? -1 : 1;
					}
					here = e[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
					x = here.x;
					y = here.y;
					r = here.r * rad;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.translate(x, y);
					engine.rotate(r);
					engine.translate(-x, -y);
					this[method](engine, cellname, cell, x, y, p);
					pos += (gw[i] / width) * ratio;
					if (!between(pos, 0, 1, true)) {
						pos += (pos > 0.5) ? -1 : 1;
					}
				}
			}
			this.text = oldText;
			return this;
		};
		/**
Filter function - prepare the clip for the filter
@method clipAlongPath
@return This
@chainable
@private
**/
		my.Text.prototype.clipAlongPath = function(p) {
			var engine,
				here,
				pathLength,
				width,
				ratio,
				pos,
				nowPos,
				oldText,
				x,
				y,
				r,
				i,
				iz,
				g,
				gw,
				xt = my.xt,
				e = my.entity,
				between = my.isBetween,
				method = 'floatOver',
				rad = my.work.radian;
			engine = my.work.cvx;
			pathLength = my.entity[p.path].getPerimeterLength();
			width = this.width * p.scale;
			ratio = width / pathLength;
			pos = p.pathPlace;
			oldText = this.text;
			if (this.glyphs.length === 0) {
				this.getMetrics();
			}
			g = this.glyphs;
			gw = this.glyphWidths;
			for (i = 0, iz = g.length; i < iz; i++) {
				if (xt(g[i])) {
					this.text = g[i];
					nowPos = pos + (((gw[i] / 2) / width) * ratio);
					if (!between(nowPos, 0, 1, true)) {
						nowPos += (nowPos > 0.5) ? -1 : 1;
					}
					here = e[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
					x = here.x;
					y = here.y;
					r = here.r * rad;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.translate(x, y);
					engine.rotate(r);
					engine.translate(-x, -y);
					this[method](engine, null, null, x, y, p);
					pos += (gw[i] / width) * ratio;
					if (!between(pos, 0, 1, true)) {
						pos += (pos > 0.5) ? -1 : 1;
					}
				}
			}
			this.text = oldText;
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clear = function(ctx, cellname, cell, x, y) {
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clearWithBackground = function(ctx, cellname, cell, x, y) {
			var myctx = my.ctx[cellname];
			ctx.fillStyle = cell.backgroundColor;
			ctx.globalAlpha = 1;
			ctx.fillText(this.text, x, y);
			ctx.fillStyle = myctx.fillStyle;
			ctx.globalAlpha = myctx.globalAlpha;
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.draw = function(ctx, cellname, cell, x, y) {
			ctx.strokeText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.fill = function(ctx, cellname, cell, x, y) {
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase entity object
@return This
@chainable
@private
**/
		my.Text.prototype.drawFill = function(ctx, cellname, cell, x, y, p) {
			ctx.strokeText(this.text, x, y);
			p.clearShadow(ctx, cell);
			ctx.fillText(this.text, x, y);
			p.restoreShadow(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase entity object
@return This
@chainable
@private
**/
		my.Text.prototype.fillDraw = function(ctx, cellname, cell, x, y, p) {
			ctx.fillText(this.text, x, y);
			p.clearShadow(ctx, cell);
			ctx.strokeText(this.text, x, y);
			p.restoreShadow(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.sinkInto = function(ctx, cellname, cell, x, y) {
			ctx.fillText(this.text, x, y);
			ctx.strokeText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.floatOver = function(ctx, cellname, cell, x, y) {
			ctx.strokeText(this.text, x, y);
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clip = function(ctx, cellname, cell, x, y) {
			return this;
		};
		/**
Calculate metrics for each phrase, word or glyph in the glyphs array
@method getMetrics
@return This
@chainable
@private
**/
		my.Text.prototype.getMetrics = function() {
			var p,
				myContext,
				myEngine,
				tempFont,
				tempBaseline,
				tempAlign,
				myText,
				myTextWidth,
				tempText,
				i,
				iz,
				j,
				jz,
				k,
				kz;
			p = my.entity[this.phrase];
			myContext = my.work.cvx;
			myEngine = my.ctx[this.context];
			tempFont = myContext.font;
			tempBaseline = myContext.textBaseline;
			tempAlign = myContext.textAlign;
			myContext.font = myEngine.get('font');
			myContext.textBaseline = myEngine.get('textBaseline');
			myContext.textAlign = myEngine.get('textAlign');
			this.width = myContext.measureText(this.text).width / p.scale;
			this.height = p.size * p.lineHeight;
			if (p.path) {
				this.glyphs.length = 0;
				this.glyphWidths.length = 0;
				myText = this.text;
				if (this.textAlongPath === 'word') {
					tempText = this.text.split(' ');
					for (i = 0, iz = tempText.length; i < iz; i++) {
						this.glyphs.push(tempText[i]);
						this.glyphWidths.push(myContext.measureText(tempText[i]).width);
						if (my.xt(tempText[i + 1])) {
							this.glyphs.push(' ');
							this.glyphWidths.push(myContext.measureText(' ').width);
						}
					}
				}
				else {
					myTextWidth = myContext.measureText(myText).width;
					if (this.fixedWidth) {
						for (j = 0, jz = myText.length; j < jz; j++) {
							this.glyphs.push(myText[j]);
							this.glyphWidths.push(myTextWidth / jz);
						}
					}
					else {
						for (k = 1, kz = myText.length; k <= kz; k++) {
							this.glyphs.push(myText[k - 1]);
							tempText = myText.substr(0, k - 1) + myText.substr(k);
							this.glyphWidths.push((myTextWidth - myContext.measureText(tempText).width));
						}
					}
				}
			}
			myContext.font = tempFont;
			myContext.textBaseline = tempBaseline;
			myContext.textAlign = tempAlign;
			return this;
		};

		return my;
	}(scrawl));
}
