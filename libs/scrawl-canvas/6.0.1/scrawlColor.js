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
# scrawlColor

## Purpose and features

The Color extension adds a controllable color object that can be used with entity fillStyle and strokeStyle attributes

@module scrawlColor
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'color')) {
	var scrawl = (function(my) {
		'use strict';

		/**
	# window.scrawl

	scrawlColor extension adaptions to the scrawl-canvas library object

	@class window.scrawl_Color
	**/

		/**
Alias for makeColor()
@method newColor
@deprecated
**/
		my.newColor = function(items) {
			return my.makeColor(items);
		};
		/**
A __factory__ function to generate new Color objects
@method makeColor
@param {Object} items Key:value Object argument for setting attributes
@return Color object
**/
		my.makeColor = function(items) {
			return new my.Color(items);
		};

		/**
# Color

## Instantiation

* scrawl.makeColor()

## Purpose

* Defines a color object
* Used with entity.strokeStyle and entity.fillStyle attributes

## Access

* scrawl.design.COLORNAME - for the Color design object

@class Color
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Color = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.set(items);
			if (my.xt(items.color)) {
				this.convert(items.color);
			}
			if (items.random) {
				this.generateRandomColor(items);
			}
			this.checkValues();
			my.design[this.name] = this;
			my.pushUnique(my.designnames, this.name);
			return this;
		};
		my.Color.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Color'
@final
**/
		my.Color.prototype.type = 'Color';
		my.Color.prototype.classname = 'designnames';
		my.work.d.Color = {
			/**
Red channel value: 0 - 255
@property r
@type Number
@default 0
**/
			r: 0,
			/**
Green channel value: 0 - 255
@property g
@type Number
@default 0
**/
			g: 0,
			/**
Blue channel value: 0 - 255
@property b
@type Number
@default 0
**/
			b: 0,
			/**
Alpha channel value: 0 - 1
@property a
@type Number
@default 1
**/
			a: 1,
			/**
Red channel delta value
@property rShift
@type Number
@default 0
**/
			rShift: 0,
			/**
Green channel delta value
@property gShift
@type Number
@default 0
**/
			gShift: 0,
			/**
Blue channel delta value
@property bShift
@type Number
@default 0
**/
			bShift: 0,
			/**
Alpha channel delta value
@property aShift
@type Number
@default 0
**/
			aShift: 0,
			/**
Red channel maximum permitted value: 0 - 255
@property rMax
@type Number
@default 255
**/
			rMax: 255,
			/**
Green channel maximum permitted value: 0 - 255
@property gMax
@type Number
@default 255
**/
			gMax: 255,
			/**
Blue channel maximum permitted value: 0 - 255
@property bMax
@type Number
@default 255
**/
			bMax: 255,
			/**
Alpha channel maximum permitted value: 0 - 1
@property aMax
@type Number
@default 1
**/
			aMax: 1,
			/**
Red channel minimum permitted value: 0 - 255
@property rMin
@type Number
@default 0
**/
			rMin: 0,
			/**
Green channel minimum permitted value: 0 - 255
@property gMin
@type Number
@default 0
**/
			gMin: 0,
			/**
Blue channel minimum permitted value: 0 - 255
@property bMin
@type Number
@default 0
**/
			bMin: 0,
			/**
Alpha channel minimum permitted value: 0 - 1
@property aMin
@type Number
@default 0
**/
			aMin: 0,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property rBounce
@type Boolean
@default false
**/
			rBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property gBounce
@type Boolean
@default false
**/
			gBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property bBounce
@type Boolean
@default false
**/
			bBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property aBounce
@type Boolean
@default false
**/
			aBounce: false,
			/**
Requires Color object to recalculate its attribute values before each display cycle commences
@property autoUpdate
@type Boolean
@default false
**/
			autoUpdate: false,
			/**
Generation flag - if true, Color object will set itself to a random color within minimum and maximum attributes

This attribute is not retained by the color object, and can only be used in the __scrawl.makeColor()__ and __Color.set()__ functions
@property random
@type Boolean
@default false
**/
		};
		my.mergeInto(my.work.d.Color, my.work.d.Base);
		/**
Augments Base.get()

* If called with no argument, will return the current color String
* if called with the String argument 'random', will generate a random color (within permitted limits) and return that
@method get
@param {String} item Attribute key String
@return Attribute value, or CSS color string
**/
		my.Color.prototype.get = function(item) {
			if (!my.xt(item)) {
				return 'rgba(' + (this.r || 0) + ', ' + (this.g || 0) + ', ' + (this.b || 0) + ', ' + my.xtGet(this.a, 1) + ')';
			}
			else if (item === 'random') {
				this.generateRandomColor();
				return this.get();
			}
			else {
				return my.Base.prototype.get.call(this, item);
			}
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Color object
**/
		my.Color.prototype.clone = function(items) {
			var a, b, c;
			items = my.safeObject(items);
			a = this.parse();
			b = my.mergeOver(a, items);
			c = my.makeColor(b);
			if (items.random) {
				delete c.r;
				delete c.g;
				delete c.b;
				delete c.a;
				c.generateRandomColor(items);
			}
			return c;
		};
		/**
Returns current color, or next color value in sequence if .autoUpdate is true
@method getData
@return CSS color String
@private
**/
		my.Color.prototype.getData = function() {
			if (this.get('autoUpdate')) {
				this.update();
			}
			this.checkValues();
			return this.get();
		};
		/**
Generates a random color

Argument can include preset color channel values (0-255, 0-1 for alpha): {r:Number, g:Number, b:Number, a:Number}
@method generateRandomColor
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Color.prototype.generateRandomColor = function(items) {
			var rMax, gMax, bMax, aMax, rMin, gMin, bMin, aMin,
				get = my.xtGet;
			items = my.safeObject(items);
			this.rMax = get(items.rMax, this.rMax, 255);
			this.gMax = get(items.gMax, this.gMax, 255);
			this.bMax = get(items.bMax, this.bMax, 255);
			this.aMax = get(items.aMax, this.aMax, 1);
			this.rMin = get(items.rMin, this.rMin, 0);
			this.gMin = get(items.gMin, this.gMin, 0);
			this.bMin = get(items.bMin, this.bMin, 0);
			this.aMin = get(items.aMin, this.aMin, 0);
			this.r = items.r || Math.round((Math.random() * (this.rMax - this.rMin)) + this.rMin);
			this.g = items.g || Math.round((Math.random() * (this.gMax - this.gMin)) + this.gMin);
			this.b = items.b || Math.round((Math.random() * (this.bMax - this.bMin)) + this.bMin);
			this.a = items.a || (Math.random() * (this.aMax - this.aMin)) + this.aMin;
			this.checkValues();
			return this;
		};
		/**
Checks that color channel values are of the permitted form (integer vs float) and within permitted ranges
@method checkValues
@return This
@chainable
@private
**/
		my.Color.prototype.checkValues = function() {
			var r = Math.floor(this.r) || 0,
				g = Math.floor(this.g) || 0,
				b = Math.floor(this.b) || 0,
				a = this.a || 1;
			this.r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
			this.g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
			this.b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
			this.a = (a > 1) ? 1 : ((a < 0) ? 0 : a);
			return this;
		};
		/**
Augments Base.set()

In addition to setting any native color object attribute, the .set() function also accepts the following keys:

* __random__ (boolean) - when set to true, a random color (within minimum and maximum bounds) will be generated
* __color__ (string) - any legitimate CSS color string (including color names as defined in the SVGTiny standard)

@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Color.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			items = my.safeObject(items);
			if (items.random) {
				this.generateRandomColor(items);
			}
			else if (items.color) {
				this.convert(items.color);
			}
			else {
				this.checkValues();
			}
			return this;
		};
		/**
Update the current color, taking into account shift and bounce attribute values
@method update
@return This
@chainable
**/
		my.Color.prototype.update = function() {
			var i,
				iz,
				list = ['r', 'g', 'b', 'a'],
				col,
				shift,
				min,
				max,
				bounce,
				between = my.isBetween;
			for (i = 0, iz = list.length; i < iz; i++) {
				col = this[list[i]];
				shift = this[list[i] + 'Shift'];
				min = this[list[i] + 'Min'];
				max = this[list[i] + 'Max'];
				bounce = this[list[i] + 'Bounce'];
				if (shift) {
					if (!between((col + shift), max, min, true)) {
						if (bounce) {
							shift = -shift;
						}
						else {
							col = (col > (max + min) / 2) ? max : min;
							shift = 0;
						}
					}
					this[list[i]] = col + shift;
					this[list[i] + 'Shift'] = shift;
				}
			}
			return this;
		};
		/**
Add values to Number attributes - limited to altering __r__, __g__, __b__ and __a__ attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Color.prototype.setDelta = function(items) {
			items = (my.isa(items, 'obj')) ? items : {};
			my.Base.prototype.set.call(this, {
				r: (this.r || 0) + (items.r || 0),
				g: (this.g || 0) + (items.g || 0),
				b: (this.b || 0) + (items.b || 0),
				a: (this.a || 1) + (items.a || 0),
			});
			this.checkValues();
			return this;
		};
		/**
Convert a CSS color string value into native attribute values. 

Converts: '#nnn', '#nnnnnn', 'rgb(n, n, n)', 'rgba(n, n, n, a), color keywords.

Does not convert hsl() or hsla() strings.

Color keywords harvested from https://developer.mozilla.org/en/docs/Web/CSS/color_value (13 Dec 2015).
@method convert
@param {String} items CSS color String 
@return This
@chainable
**/
		my.Color.prototype.convert = function(items) {
			var r,
				g,
				b,
				a,
				temp,
				internal = true;
			items = (my.isa(items, 'str')) ? items : '';
			if (items.length > 0) {
				items.toLowerCase();
				r = 0;
				g = 0;
				b = 0;
				a = 1;
				if (items[0] === '#') {
					if (items.length < 5) {
						r = this.toDecimal(items[1] + items[1]);
						g = this.toDecimal(items[2] + items[2]);
						b = this.toDecimal(items[3] + items[3]);
					}
					else if (items.length < 8) {
						r = this.toDecimal(items[1] + items[2]);
						g = this.toDecimal(items[3] + items[4]);
						b = this.toDecimal(items[5] + items[6]);
					}
				}
				else if (/rgb\(/.test(items)) {
					temp = items.match(/([0-9.]+\b)/g);
					if (/%/.test(items)) {
						r = Math.round((temp[0] / 100) * 255);
						g = Math.round((temp[1] / 100) * 255);
						b = Math.round((temp[2] / 100) * 255);
					}
					else {
						r = Math.round(temp[0]);
						g = Math.round(temp[1]);
						b = Math.round(temp[2]);
					}
				}
				else if (/rgba\(/.test(items)) {
					temp = items.match(/([0-9.]+\b)/g);
					r = temp[0];
					g = temp[1];
					b = temp[2];
					a = temp[3];
				}
				else {
					temp = this.colorLibrary[items];
					if (temp) {
						internal = false;
						temp.call(this);
					}
				}
				if (internal) {
					this.r = r;
					this.g = g;
					this.b = b;
					this.a = a;
				}
				this.checkValues();
			}
			return this;
		};
		my.Color.prototype.colorLibrary = {
			// color keywords harvested from https://developer.mozilla.org/en/docs/Web/CSS/color_value
			black: function() {
				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 1;
			}, // #000000 	 
			silver: function() {
				this.r = parseInt('c0', 16);
				this.g = parseInt('c0', 16);
				this.b = parseInt('c0', 16);
				this.a = 1;
			}, // #c0c0c0 	 
			gray: function() {
				this.r = 127;
				this.g = 127;
				this.b = 127;
				this.a = 1;
			}, // #808080 	 
			white: function() {
				this.r = 255;
				this.g = 255;
				this.b = 255;
				this.a = 1;
			}, // #ffffff 	 
			maroon: function() {
				this.r = 127;
				this.g = 0;
				this.b = 0;
				this.a = 1;
			}, // #800000 	 
			red: function() {
				this.r = 255;
				this.g = 0;
				this.b = 0;
				this.a = 1;
			}, // #ff0000 	 
			purple: function() {
				this.r = 127;
				this.g = 0;
				this.b = 127;
				this.a = 1;
			}, // #800080 	 
			fuchsia: function() {
				this.r = 255;
				this.g = 0;
				this.b = 255;
				this.a = 1;
			}, // #ff00ff 	 
			green: function() {
				this.r = 0;
				this.g = 127;
				this.b = 0;
				this.a = 1;
			}, // #008000 	 
			lime: function() {
				this.r = 0;
				this.g = 255;
				this.b = 0;
				this.a = 1;
			}, // #00ff00 	 
			olive: function() {
				this.r = 127;
				this.g = 127;
				this.b = 0;
				this.a = 1;
			}, // #808000 	 
			yellow: function() {
				this.r = 255;
				this.g = 255;
				this.b = 0;
				this.a = 1;
			}, // #ffff00 	 
			navy: function() {
				this.r = 0;
				this.g = 0;
				this.b = 127;
				this.a = 1;
			}, // #000080 	 
			blue: function() {
				this.r = 0;
				this.g = 0;
				this.b = 255;
				this.a = 1;
			}, // #0000ff 	 
			teal: function() {
				this.r = 0;
				this.g = 127;
				this.b = 127;
				this.a = 1;
			}, // #008080 	 
			aqua: function() {
				this.r = 0;
				this.g = 255;
				this.b = 255;
				this.a = 1;
			}, // #00ffff 	 
			orange: function() {
				this.r = 255;
				this.g = parseInt('a5', 16);
				this.b = 0;
				this.a = 1;
			}, // #ffa500 	 
			aliceblue: function() {
				this.r = parseInt('f0', 16);
				this.g = parseInt('f8', 16);
				this.b = 255;
				this.a = 1;
			}, // #f0f8ff 	 
			antiquewhite: function() {
				this.r = parseInt('fa', 16);
				this.g = parseInt('eb', 16);
				this.b = parseInt('d7', 16);
				this.a = 1;
			}, // #faebd7 	 
			aquamarine: function() {
				this.r = parseInt('7f', 16);
				this.g = 255;
				this.b = parseInt('d4', 16);
				this.a = 1;
			}, // #7fffd4 	 
			azure: function() {
				this.r = parseInt('f0', 16);
				this.g = 255;
				this.b = 255;
				this.a = 1;
			}, // #f0ffff 	 
			beige: function() {
				this.r = parseInt('f5', 16);
				this.g = parseInt('f5', 16);
				this.b = parseInt('dc', 16);
				this.a = 1;
			}, // #f5f5dc 	 
			bisque: function() {
				this.r = 255;
				this.g = parseInt('e4', 16);
				this.b = parseInt('c4', 16);
				this.a = 1;
			}, // #ffe4c4 	 
			blanchedalmond: function() {
				this.r = 255;
				this.g = parseInt('e4', 16);
				this.b = parseInt('c4', 16);
				this.a = 1;
			}, // #ffe4c4 	 
			blueviolet: function() {
				this.r = parseInt('8a', 16);
				this.g = parseInt('2b', 16);
				this.b = parseInt('e2', 16);
				this.a = 1;
			}, // #8a2be2 	 
			brown: function() {
				this.r = parseInt('a5', 16);
				this.g = parseInt('2a', 16);
				this.b = parseInt('2a', 16);
				this.a = 1;
			}, // #a52a2a 	 
			burlywood: function() {
				this.r = parseInt('de', 16);
				this.g = parseInt('b8', 16);
				this.b = parseInt('87', 16);
				this.a = 1;
			}, // #deb887 	 
			cadetblue: function() {
				this.r = parseInt('5f', 16);
				this.g = parseInt('9e', 16);
				this.b = parseInt('a0', 16);
				this.a = 1;
			}, // #5f9ea0 	 
			chartreuse: function() {
				this.r = parseInt('7f', 16);
				this.g = 255;
				this.b = 0;
				this.a = 1;
			}, // #7fff00 	 
			chocolate: function() {
				this.r = parseInt('d2', 16);
				this.g = parseInt('69', 16);
				this.b = parseInt('1e', 16);
				this.a = 1;
			}, // #d2691e 	 
			coral: function() {
				this.r = 255;
				this.g = parseInt('7f', 16);
				this.b = parseInt('50', 16);
				this.a = 1;
			}, // #ff7f50 	 
			cornflowerblue: function() {
				this.r = parseInt('64', 16);
				this.g = parseInt('95', 16);
				this.b = parseInt('ed', 16);
				this.a = 1;
			}, // #6495ed 	 
			cornsilk: function() {
				this.r = 255;
				this.g = parseInt('f8', 16);
				this.b = parseInt('dc', 16);
				this.a = 1;
			}, // #fff8dc 	 
			crimson: function() {
				this.r = parseInt('dc', 16);
				this.g = parseInt('14', 16);
				this.b = parseInt('3c', 16);
				this.a = 1;
			}, // #dc143c 	 
			darkblue: function() {
				this.r = 0;
				this.g = 0;
				this.b = parseInt('8b', 16);
				this.a = 1;
			}, // #00008b 	 
			darkcyan: function() {
				this.r = 0;
				this.g = parseInt('8b', 16);
				this.b = parseInt('8b', 16);
				this.a = 1;
			}, // #008b8b 	 
			darkgoldenrod: function() {
				this.r = parseInt('b8', 16);
				this.g = parseInt('86', 16);
				this.b = parseInt('0b', 16);
				this.a = 1;
			}, // #b8860b 	 
			darkgray: function() {
				this.r = parseInt('a9', 16);
				this.g = parseInt('a9', 16);
				this.b = parseInt('a9', 16);
				this.a = 1;
			}, // #a9a9a9 	 
			darkgreen: function() {
				this.r = 0;
				this.g = parseInt('64', 16);
				this.b = 0;
				this.a = 1;
			}, // #006400 	 
			darkgrey: function() {
				this.r = parseInt('a9', 16);
				this.g = parseInt('a9', 16);
				this.b = parseInt('a9', 16);
				this.a = 1;
			}, // #a9a9a9 	 
			darkkhaki: function() {
				this.r = parseInt('bd', 16);
				this.g = parseInt('b7', 16);
				this.b = parseInt('6b', 16);
				this.a = 1;
			}, // #bdb76b 	 
			darkmagenta: function() {
				this.r = parseInt('8b', 16);
				this.g = 0;
				this.b = parseInt('8b', 16);
				this.a = 1;
			}, // #8b008b 	 
			darkolivegreen: function() {
				this.r = parseInt('55', 16);
				this.g = parseInt('6b', 16);
				this.b = parseInt('2f', 16);
				this.a = 1;
			}, // #556b2f 	 
			darkorange: function() {
				this.r = 255;
				this.g = parseInt('8c', 16);
				this.b = 0;
				this.a = 1;
			}, // #ff8c00 	 
			darkorchid: function() {
				this.r = parseInt('99', 16);
				this.g = parseInt('32', 16);
				this.b = parseInt('cc', 16);
				this.a = 1;
			}, // #9932cc 	 
			darkred: function() {
				this.r = parseInt('8b', 16);
				this.g = 0;
				this.b = 0;
				this.a = 1;
			}, // #8b0000 	 
			darksalmon: function() {
				this.r = parseInt('e9', 16);
				this.g = parseInt('96', 16);
				this.b = parseInt('7a', 16);
				this.a = 1;
			}, // #e9967a 	 
			darkseagreen: function() {
				this.r = parseInt('8f', 16);
				this.g = parseInt('bc', 16);
				this.b = parseInt('8f', 16);
				this.a = 1;
			}, // #8fbc8f 	 
			darkslateblue: function() {
				this.r = parseInt('48', 16);
				this.g = parseInt('3d', 16);
				this.b = parseInt('8b', 16);
				this.a = 1;
			}, // #483d8b 	 
			darkslategray: function() {
				this.r = parseInt('2f', 16);
				this.g = parseInt('4f', 16);
				this.b = parseInt('4f', 16);
				this.a = 1;
			}, // #2f4f4f 	 
			darkslategrey: function() {
				this.r = parseInt('2f', 16);
				this.g = parseInt('4f', 16);
				this.b = parseInt('4f', 16);
				this.a = 1;
			}, // #2f4f4f 	 
			darkturquoise: function() {
				this.r = 0;
				this.g = parseInt('ce', 16);
				this.b = parseInt('d1', 16);
				this.a = 1;
			}, // #00ced1 	 
			darkviolet: function() {
				this.r = parseInt('94', 16);
				this.g = 0;
				this.b = parseInt('d3', 16);
				this.a = 1;
			}, // #9400d3 	 
			deeppink: function() {
				this.r = 255;
				this.g = parseInt('14', 16);
				this.b = parseInt('93', 16);
				this.a = 1;
			}, // #ff1493 	 
			deepskyblue: function() {
				this.r = 0;
				this.g = parseInt('bf', 16);
				this.b = 255;
				this.a = 1;
			}, // #00bfff 	 
			dimgray: function() {
				this.r = parseInt('69', 16);
				this.g = parseInt('69', 16);
				this.b = parseInt('69', 16);
				this.a = 1;
			}, // #696969 	 
			dimgrey: function() {
				this.r = parseInt('69', 16);
				this.g = parseInt('69', 16);
				this.b = parseInt('69', 16);
				this.a = 1;
			}, // #696969 	 
			dodgerblue: function() {
				this.r = parseInt('1e', 16);
				this.g = parseInt('90', 16);
				this.b = 255;
				this.a = 1;
			}, // #1e90ff 	 
			firebrick: function() {
				this.r = parseInt('b2', 16);
				this.g = parseInt('22', 16);
				this.b = parseInt('22', 16);
				this.a = 1;
			}, // #b22222 	 
			floralwhite: function() {
				this.r = 255;
				this.g = parseInt('fa', 16);
				this.b = parseInt('f0', 16);
				this.a = 1;
			}, // #fffaf0 	 
			forestgreen: function() {
				this.r = parseInt('22', 16);
				this.g = parseInt('8b', 16);
				this.b = parseInt('22', 16);
				this.a = 1;
			}, // #228b22 	 
			gainsboro: function() {
				this.r = parseInt('dc', 16);
				this.g = parseInt('dc', 16);
				this.b = parseInt('dc', 16);
				this.a = 1;
			}, // #dcdcdc 	 
			ghostwhite: function() {
				this.r = parseInt('f8', 16);
				this.g = parseInt('f8', 16);
				this.b = 255;
				this.a = 1;
			}, // #f8f8ff 	 
			gold: function() {
				this.r = 255;
				this.g = parseInt('d7', 16);
				this.b = 0;
				this.a = 1;
			}, // #ffd700 	 
			goldenrod: function() {
				this.r = parseInt('da', 16);
				this.g = parseInt('a5', 16);
				this.b = parseInt('20', 16);
				this.a = 1;
			}, // #daa520 	 
			greenyellow: function() {
				this.r = parseInt('ad', 16);
				this.g = 255;
				this.b = parseInt('2f', 16);
				this.a = 1;
			}, // #adff2f 	 
			grey: function() {
				this.r = 127;
				this.g = 127;
				this.b = 127;
				this.a = 1;
			}, // #808080 	 
			honeydew: function() {
				this.r = parseInt('f0', 16);
				this.g = 255;
				this.b = parseInt('f0', 16);
				this.a = 1;
			}, // #f0fff0 	 
			hotpink: function() {
				this.r = 255;
				this.g = parseInt('69', 16);
				this.b = parseInt('b4', 16);
				this.a = 1;
			}, // #ff69b4 	 
			indianred: function() {
				this.r = parseInt('cd', 16);
				this.g = parseInt('5c', 16);
				this.b = parseInt('5c', 16);
				this.a = 1;
			}, // #cd5c5c 	 
			indigo: function() {
				this.r = parseInt('4b', 16);
				this.g = 0;
				this.b = parseInt('82', 16);
				this.a = 1;
			}, // #4b0082 	 
			ivory: function() {
				this.r = 255;
				this.g = 255;
				this.b = parseInt('f0', 16);
				this.a = 1;
			}, // #fffff0 	 
			khaki: function() {
				this.r = parseInt('f0', 16);
				this.g = parseInt('e6', 16);
				this.b = parseInt('8c', 16);
				this.a = 1;
			}, // #f0e68c 	 
			lavender: function() {
				this.r = parseInt('e6', 16);
				this.g = parseInt('e6', 16);
				this.b = parseInt('fa', 16);
				this.a = 1;
			}, // #e6e6fa 	 
			lavenderblush: function() {
				this.r = 255;
				this.g = parseInt('f0', 16);
				this.b = parseInt('f5', 16);
				this.a = 1;
			}, // #fff0f5 	 
			lawngreen: function() {
				this.r = parseInt('7c', 16);
				this.g = parseInt('fc', 16);
				this.b = 0;
				this.a = 1;
			}, // #7cfc00 	 
			lemonchiffon: function() {
				this.r = 255;
				this.g = parseInt('fa', 16);
				this.b = parseInt('cd', 16);
				this.a = 1;
			}, // #fffacd 	 
			lightblue: function() {
				this.r = parseInt('ad', 16);
				this.g = parseInt('d8', 16);
				this.b = parseInt('e6', 16);
				this.a = 1;
			}, // #add8e6 	 
			lightcoral: function() {
				this.r = parseInt('f0', 16);
				this.g = 127;
				this.b = 127;
				this.a = 1;
			}, // #f08080 	 
			lightcyan: function() {
				this.r = parseInt('e0', 16);
				this.g = 255;
				this.b = 255;
				this.a = 1;
			}, // #e0ffff 	 
			lightgoldenrodyellow: function() {
				this.r = parseInt('fa', 16);
				this.g = parseInt('fa', 16);
				this.b = parseInt('d2', 16);
				this.a = 1;
			}, // #fafad2 	 
			lightgray: function() {
				this.r = parseInt('d3', 16);
				this.g = parseInt('d3', 16);
				this.b = parseInt('d3', 16);
				this.a = 1;
			}, // #d3d3d3 	 
			lightgreen: function() {
				this.r = parseInt('90', 16);
				this.g = parseInt('ee', 16);
				this.b = parseInt('90', 16);
				this.a = 1;
			}, // #90ee90 	 
			lightgrey: function() {
				this.r = parseInt('d3', 16);
				this.g = parseInt('d3', 16);
				this.b = parseInt('d3', 16);
				this.a = 1;
			}, // #d3d3d3 	 
			lightpink: function() {
				this.r = 255;
				this.g = parseInt('b6', 16);
				this.b = parseInt('c1', 16);
				this.a = 1;
			}, // #ffb6c1 	 
			lightsalmon: function() {
				this.r = 255;
				this.g = parseInt('a0', 16);
				this.b = parseInt('7a', 16);
				this.a = 1;
			}, // #ffa07a 	 
			lightseagreen: function() {
				this.r = parseInt('20', 16);
				this.g = parseInt('b2', 16);
				this.b = parseInt('aa', 16);
				this.a = 1;
			}, // #20b2aa 	 
			lightskyblue: function() {
				this.r = parseInt('87', 16);
				this.g = parseInt('ce', 16);
				this.b = parseInt('fa', 16);
				this.a = 1;
			}, // #87cefa 	 
			lightslategray: function() {
				this.r = parseInt('77', 16);
				this.g = parseInt('88', 16);
				this.b = parseInt('99', 16);
				this.a = 1;
			}, // #778899 	 
			lightslategrey: function() {
				this.r = parseInt('77', 16);
				this.g = parseInt('88', 16);
				this.b = parseInt('99', 16);
				this.a = 1;
			}, // #778899 	 
			lightsteelblue: function() {
				this.r = parseInt('b0', 16);
				this.g = parseInt('c4', 16);
				this.b = parseInt('de', 16);
				this.a = 1;
			}, // #b0c4de 	 
			lightyellow: function() {
				this.r = 255;
				this.g = 255;
				this.b = parseInt('e0', 16);
				this.a = 1;
			}, // #ffffe0 	 
			limegreen: function() {
				this.r = parseInt('32', 16);
				this.g = parseInt('cd', 16);
				this.b = parseInt('32', 16);
				this.a = 1;
			}, // #32cd32 	 
			linen: function() {
				this.r = parseInt('fa', 16);
				this.g = parseInt('f0', 16);
				this.b = parseInt('e6', 16);
				this.a = 1;
			}, // #faf0e6 	 
			mediumaquamarine: function() {
				this.r = parseInt('66', 16);
				this.g = parseInt('cd', 16);
				this.b = parseInt('aa', 16);
				this.a = 1;
			}, // #66cdaa 	 
			mediumblue: function() {
				this.r = 0;
				this.g = 0;
				this.b = parseInt('cd', 16);
				this.a = 1;
			}, // #0000cd 	 
			mediumorchid: function() {
				this.r = parseInt('ba', 16);
				this.g = parseInt('55', 16);
				this.b = parseInt('d3', 16);
				this.a = 1;
			}, // #ba55d3 	 
			mediumpurple: function() {
				this.r = parseInt('93', 16);
				this.g = parseInt('70', 16);
				this.b = parseInt('db', 16);
				this.a = 1;
			}, // #9370db 	 
			mediumseagreen: function() {
				this.r = parseInt('3c', 16);
				this.g = parseInt('b3', 16);
				this.b = parseInt('71', 16);
				this.a = 1;
			}, // #3cb371 	 
			mediumslateblue: function() {
				this.r = parseInt('7b', 16);
				this.g = parseInt('68', 16);
				this.b = parseInt('ee', 16);
				this.a = 1;
			}, // #7b68ee 	 
			mediumspringgreen: function() {
				this.r = 0;
				this.g = parseInt('fa', 16);
				this.b = parseInt('9a', 16);
				this.a = 1;
			}, // #00fa9a 	 
			mediumturquoise: function() {
				this.r = parseInt('48', 16);
				this.g = parseInt('d1', 16);
				this.b = parseInt('cc', 16);
				this.a = 1;
			}, // #48d1cc 	 
			mediumvioletred: function() {
				this.r = parseInt('c7', 16);
				this.g = parseInt('15', 16);
				this.b = parseInt('85', 16);
				this.a = 1;
			}, // #c71585 	 
			midnightblue: function() {
				this.r = parseInt('19', 16);
				this.g = parseInt('19', 16);
				this.b = parseInt('70', 16);
				this.a = 1;
			}, // #191970 	 
			mintcream: function() {
				this.r = parseInt('f5', 16);
				this.g = 255;
				this.b = parseInt('fa', 16);
				this.a = 1;
			}, // #f5fffa 	 
			mistyrose: function() {
				this.r = 255;
				this.g = parseInt('e4', 16);
				this.b = parseInt('e1', 16);
				this.a = 1;
			}, // #ffe4e1 	 
			moccasin: function() {
				this.r = 255;
				this.g = parseInt('e4', 16);
				this.b = parseInt('b5', 16);
				this.a = 1;
			}, // #ffe4b5 	 
			navajowhite: function() {
				this.r = 255;
				this.g = parseInt('de', 16);
				this.b = parseInt('ad', 16);
				this.a = 1;
			}, // #ffdead 	 
			oldlace: function() {
				this.r = parseInt('fd', 16);
				this.g = parseInt('f5', 16);
				this.b = parseInt('e6', 16);
				this.a = 1;
			}, // #fdf5e6 	 
			olivedrab: function() {
				this.r = parseInt('6b', 16);
				this.g = parseInt('8e', 16);
				this.b = parseInt('23', 16);
				this.a = 1;
			}, // #6b8e23 	 
			orangered: function() {
				this.r = 255;
				this.g = parseInt('45', 16);
				this.b = 0;
				this.a = 1;
			}, // #ff4500 	 
			orchid: function() {
				this.r = parseInt('da', 16);
				this.g = parseInt('70', 16);
				this.b = parseInt('d6', 16);
				this.a = 1;
			}, // #da70d6 	 
			palegoldenrod: function() {
				this.r = parseInt('ee', 16);
				this.g = parseInt('e8', 16);
				this.b = parseInt('aa', 16);
				this.a = 1;
			}, // #eee8aa 	 
			palegreen: function() {
				this.r = parseInt('98', 16);
				this.g = parseInt('fb', 16);
				this.b = parseInt('98', 16);
				this.a = 1;
			}, // #98fb98 	 
			paleturquoise: function() {
				this.r = parseInt('af', 16);
				this.g = parseInt('ee', 16);
				this.b = parseInt('ee', 16);
				this.a = 1;
			}, // #afeeee 	 
			palevioletred: function() {
				this.r = parseInt('db', 16);
				this.g = parseInt('70', 16);
				this.b = parseInt('93', 16);
				this.a = 1;
			}, // #db7093 	 
			papayawhip: function() {
				this.r = 255;
				this.g = parseInt('ef', 16);
				this.b = parseInt('d5', 16);
				this.a = 1;
			}, // #ffefd5 	 
			peachpuff: function() {
				this.r = 255;
				this.g = parseInt('da', 16);
				this.b = parseInt('b9', 16);
				this.a = 1;
			}, // #ffdab9 	 
			peru: function() {
				this.r = parseInt('cd', 16);
				this.g = parseInt('85', 16);
				this.b = parseInt('3f', 16);
				this.a = 1;
			}, // #cd853f 	 
			pink: function() {
				this.r = 255;
				this.g = parseInt('c0', 16);
				this.b = parseInt('cb', 16);
				this.a = 1;
			}, // #ffc0cb 	 
			plum: function() {
				this.r = parseInt('dd', 16);
				this.g = parseInt('a0', 16);
				this.b = parseInt('dd', 16);
				this.a = 1;
			}, // #dda0dd 	 
			powderblue: function() {
				this.r = parseInt('b0', 16);
				this.g = parseInt('e0', 16);
				this.b = parseInt('e6', 16);
				this.a = 1;
			}, // #b0e0e6 	 
			rosybrown: function() {
				this.r = parseInt('bc', 16);
				this.g = parseInt('8f', 16);
				this.b = parseInt('8f', 16);
				this.a = 1;
			}, // #bc8f8f 	 
			royalblue: function() {
				this.r = parseInt('41', 16);
				this.g = parseInt('69', 16);
				this.b = parseInt('e1', 16);
				this.a = 1;
			}, // #4169e1 	 
			saddlebrown: function() {
				this.r = parseInt('8b', 16);
				this.g = parseInt('45', 16);
				this.b = parseInt('13', 16);
				this.a = 1;
			}, // #8b4513 	 
			salmon: function() {
				this.r = parseInt('fa', 16);
				this.g = 127;
				this.b = parseInt('72', 16);
				this.a = 1;
			}, // #fa8072 	 
			sandybrown: function() {
				this.r = parseInt('f4', 16);
				this.g = parseInt('a4', 16);
				this.b = parseInt('60', 16);
				this.a = 1;
			}, // #f4a460 	 
			seagreen: function() {
				this.r = parseInt('2e', 16);
				this.g = parseInt('8b', 16);
				this.b = parseInt('57', 16);
				this.a = 1;
			}, // #2e8b57 	 
			seashell: function() {
				this.r = 255;
				this.g = parseInt('f5', 16);
				this.b = parseInt('ee', 16);
				this.a = 1;
			}, // #fff5ee 	 
			sienna: function() {
				this.r = parseInt('a0', 16);
				this.g = parseInt('52', 16);
				this.b = parseInt('2d', 16);
				this.a = 1;
			}, // #a0522d 	 
			skyblue: function() {
				this.r = parseInt('87', 16);
				this.g = parseInt('ce', 16);
				this.b = parseInt('eb', 16);
				this.a = 1;
			}, // #87ceeb 	 
			slateblue: function() {
				this.r = parseInt('6a', 16);
				this.g = parseInt('5a', 16);
				this.b = parseInt('cd', 16);
				this.a = 1;
			}, // #6a5acd 	 
			slategray: function() {
				this.r = parseInt('70', 16);
				this.g = 127;
				this.b = parseInt('90', 16);
				this.a = 1;
			}, // #708090 	 
			slategrey: function() {
				this.r = parseInt('70', 16);
				this.g = 127;
				this.b = parseInt('90', 16);
				this.a = 1;
			}, // #708090 	 
			snow: function() {
				this.r = 255;
				this.g = parseInt('fa', 16);
				this.b = parseInt('fa', 16);
				this.a = 1;
			}, // #fffafa 	 
			springgreen: function() {
				this.r = 0;
				this.g = 255;
				this.b = parseInt('7f', 16);
				this.a = 1;
			}, // #00ff7f 	 
			steelblue: function() {
				this.r = parseInt('46', 16);
				this.g = parseInt('82', 16);
				this.b = parseInt('b4', 16);
				this.a = 1;
			}, // #4682b4 	 
			tan: function() {
				this.r = parseInt('d2', 16);
				this.g = parseInt('b4', 16);
				this.b = parseInt('8c', 16);
				this.a = 1;
			}, // #d2b48c 	 
			thistle: function() {
				this.r = parseInt('d8', 16);
				this.g = parseInt('bf', 16);
				this.b = parseInt('d8', 16);
				this.a = 1;
			}, // #d8bfd8 	 
			tomato: function() {
				this.r = 255;
				this.g = parseInt('63', 16);
				this.b = parseInt('47', 16);
				this.a = 1;
			}, // #ff6347 
			transparent: function() {
				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 1;
			},
			turquoise: function() {
				this.r = parseInt('40', 16);
				this.g = parseInt('e0', 16);
				this.b = parseInt('d0', 16);
				this.a = 1;
			}, // #40e0d0 	 
			violet: function() {
				this.r = parseInt('ee', 16);
				this.g = parseInt('82', 16);
				this.b = parseInt('ee', 16);
				this.a = 1;
			}, // #ee82ee 	 
			wheat: function() {
				this.r = parseInt('f5', 16);
				this.g = parseInt('de', 16);
				this.b = parseInt('b3', 16);
				this.a = 1;
			}, // #f5deb3 	 
			whitesmoke: function() {
				this.r = parseInt('f5', 16);
				this.g = parseInt('f5', 16);
				this.b = parseInt('f5', 16);
				this.a = 1;
			}, // #f5f5f5 	 
			yellowgreen: function() {
				this.r = parseInt('9a', 16);
				this.g = parseInt('cd', 16);
				this.b = parseInt('32', 16);
				this.a = 1;
			}, // #9acd32 	 
			rebeccapurple: function() {
				this.r = parseInt('66', 16);
				this.g = parseInt('33', 16);
				this.b = parseInt('99', 16);
				this.a = 1;
			} // #663399			
		};
		/**
Convert a decimal Number to its hexidecimal String value
@method toHex
@param {Number} items decimal value
@return Hexidecimal String
**/
		my.Color.prototype.toHex = function(item) {
			return item.toString(16);
		};
		/**
Convert a hexidecimal String to its decimal Number value
@method toDecimal
@param {String} Hexidecimal String value
@return Decimal Number
**/
		my.Color.prototype.toDecimal = function(item) {
			return parseInt(item, 16);
		};
		/**
Delete this Color object from the scrawl-canvas library
@method remove
@return Always true
**/
		my.Color.prototype.remove = function() {
			delete my.dsn[this.name];
			delete my.design[this.name];
			my.removeItem(my.designnames, this.name);
			return true;
		};

		return my;
	}(scrawl));
}
